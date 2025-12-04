import { useState } from "react";
import { Link } from "wouter";
import { FileText, Loader2, Download, Copy, List, AlignLeft, BookOpen, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Section } from "@/components/ui/section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Summary } from "@shared/schema";
import { getStoredProvider } from "@/pages/settings";
import { formatDate, getGradient } from "@/lib/utils";

export function SummaryPage() {
  const { documents, currentDocumentId, summaries, addSummary } = useAppStore();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(currentDocumentId || "");
  const [mode, setMode] = useState<"short" | "medium" | "detailed">("medium");
  const [includeBulletPoints, setIncludeBulletPoints] = useState(true);
  const [activeTab, setActiveTab] = useState<"generate" | "view">("generate");

  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);

  const hasDocumentSelected = selectedDocId && selectedDocId !== "none";

  const generateMutation = useMutation({
    mutationFn: async (): Promise<Summary> => {
      const payload = {
        documentId: hasDocumentSelected ? selectedDocId : undefined,
        topic: topic || undefined,
        mode,
        bulletPoints: includeBulletPoints,
        provider: getStoredProvider(),
      };
      const response = await apiRequest("POST", "/api/summary/generate", payload);
      return response.json();
    },
    onSuccess: (data) => {
      addSummary(data);
      setCurrentSummary(data);
      setActiveTab("view");
      toast({
        title: "Summary generated",
        description: "Your summary is ready to view.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopy = () => {
    if (!currentSummary) return;

    let content = currentSummary.content;
    const bulletPoints = currentSummary.bulletPoints as string[];
    if (bulletPoints?.length) {
      content += "\n\nKey Points:\n" + bulletPoints.map((p) => `• ${p}`).join("\n");
    }

    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Summary copied to clipboard.",
    });
  };

  const handleExport = () => {
    if (!currentSummary) return;

    let content = `Summary: ${currentSummary.topic || "Generated Summary"}\n`;
    content += `Mode: ${currentSummary.mode}\n\n`;
    content += currentSummary.content;

    const bulletPoints = currentSummary.bulletPoints as string[];
    if (bulletPoints?.length) {
      content += "\n\nKey Points:\n" + bulletPoints.map((p) => `• ${p}`).join("\n");
    }

    const keyTerms = currentSummary.keyTerms as string[];
    if (keyTerms?.length) {
      content += "\n\nKey Terms: " + keyTerms.join(", ");
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${currentSummary.topic || "generated"}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Summary has been exported as a text file.",
    });
  };

  const getModeDescription = (m: string) => {
    switch (m) {
      case "short":
        return "50-100 words, quick overview";
      case "medium":
        return "150-200 words, balanced detail";
      case "detailed":
        return "300+ words, comprehensive";
      default:
        return "";
    }
  };

  return (
    <Section className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent" data-testid="text-page-title">Summary Generator</h1>
          <p className="text-gray-400">
            Generate concise summaries from your documents or any topic
          </p>
        </div>
        <Link href="/settings">
          <Button variant="outline" size="icon" className="border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "view")}>
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/5 max-w-md">
          <TabsTrigger value="generate" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-400" data-testid="tab-generate">Generate</TabsTrigger>
          <TabsTrigger value="view" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-400" data-testid="tab-view" disabled={!currentSummary}>
            View Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card className="bg-[#0b0f12] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-green-400" />
                Generate Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document" className="text-white">Source Document (Optional)</Label>
                <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                  <SelectTrigger id="document" className="bg-white/5 border-white/10 text-white" data-testid="select-document">
                    <SelectValue placeholder="Select a document or enter a topic" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b0f12] border-white/10 text-white">
                    <SelectItem value="none" className="hover:bg-white/5 cursor-pointer">No document (use topic only)</SelectItem>
                    {[...documents]
                      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                      .map((doc) => (
                        <SelectItem key={doc.id} value={doc.id} className="hover:bg-white/5 cursor-pointer">
                          {doc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-white">Topic {!hasDocumentSelected && "(Required)"}</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Photosynthesis, Machine Learning basics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  data-testid="input-topic"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white">Summary Length</Label>
                <ToggleGroup
                  type="single"
                  value={mode}
                  onValueChange={(v) => v && setMode(v as "short" | "medium" | "detailed")}
                  className="justify-start"
                >
                  <ToggleGroupItem value="short" className="data-[state=on]:bg-green-600 data-[state=on]:text-white border border-white/10 text-gray-400 hover:bg-white/5" data-testid="toggle-short">
                    Short
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" className="data-[state=on]:bg-green-600 data-[state=on]:text-white border border-white/10 text-gray-400 hover:bg-white/5" data-testid="toggle-medium">
                    Medium
                  </ToggleGroupItem>
                  <ToggleGroupItem value="detailed" className="data-[state=on]:bg-green-600 data-[state=on]:text-white border border-white/10 text-gray-400 hover:bg-white/5" data-testid="toggle-detailed">
                    Detailed
                  </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-xs text-gray-400">{getModeDescription(mode)}</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <List className="h-5 w-5 text-gray-400" />
                  <div>
                    <Label htmlFor="bullet-points" className="text-white">Include Bullet Points</Label>
                    <p className="text-xs text-gray-400">
                      Add key takeaways as bullet points
                    </p>
                  </div>
                </div>
                <Switch
                  id="bullet-points"
                  checked={includeBulletPoints}
                  onCheckedChange={setIncludeBulletPoints}
                  className="data-[state=checked]:bg-green-500"
                  data-testid="switch-bullet-points"
                />
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || (!hasDocumentSelected && !topic.trim())}
                className="w-full bg-green-600 hover:bg-green-500 text-white"
                data-testid="button-generate-summary"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <AlignLeft className="mr-2 h-4 w-4" />
                    Generate Summary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {summaries.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold text-white">Previous Summaries</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {summaries.slice().reverse().slice(0, 5).map((summary, index) => (
                  <div
                    key={summary.id}
                    className="rounded-2xl overflow-hidden drop-shadow-lg transform transition-all duration-300 hover:scale-[1.025] group relative cursor-pointer"
                    onClick={() => {
                      setCurrentSummary(summary);
                      setActiveTab("view");
                    }}
                    data-testid={`card-summary-${summary.id}`}
                  >
                    {/* Gradient header */}
                    <div className={`p-5 bg-gradient-to-br ${getGradient(index)} relative`}>
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90">
                          <FileText className="w-6 h-6 opacity-90" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg leading-tight truncate" title={summary.topic || "Summary"}>
                            {summary.topic || "Summary"}
                          </h3>
                          <p className="text-white/80 text-sm mt-1 truncate">
                            {summary.mode.charAt(0).toUpperCase() + summary.mode.slice(1)} Summary
                          </p>
                        </div>
                      </div>
                      {/* subtle glow */}
                      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10 blur-3xl bg-white"></div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="bg-neutral-900 p-5 border border-white/5 group-hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <p className="text-gray-400 text-sm line-clamp-2 break-words">
                            {summary.content.slice(0, 100)}...
                          </p>
                          <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                            {formatDate(summary.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Button variant="link" className="p-0 h-auto text-green-400 hover:text-green-300">
                        View Summary &rarr;
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="view" className="mt-6">
          {currentSummary && (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-white">
                    {currentSummary.topic || "Generated Summary"}
                  </h2>
                  <Badge variant="outline" className="text-gray-400 border-white/10">{currentSummary.mode}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                    data-testid="button-copy"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                    data-testid="button-export"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <Card className="mb-6 border-white/10 bg-[#0b0f12]">
                <CardContent className="p-6">
                  <ScrollArea className="max-h-96">
                    <p
                      className="whitespace-pre-wrap text-base leading-relaxed text-white"
                      data-testid="text-summary-content"
                    >
                      {currentSummary.content}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>

              {(currentSummary.bulletPoints as string[])?.length > 0 && (
                <Card className="mb-6 border-white/10 bg-[#0b0f12]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                      <List className="h-5 w-5 text-green-400" />
                      Key Takeaways
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(currentSummary.bulletPoints as string[]).map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                          <span className="text-white">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {(currentSummary.keyTerms as string[])?.length > 0 && (
                <Card className="border-white/10 bg-[#0b0f12]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                      <BookOpen className="h-5 w-5 text-green-400" />
                      Key Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(currentSummary.keyTerms as string[]).map((term, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-white/5 text-white border border-white/10">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Section>
  );
}
