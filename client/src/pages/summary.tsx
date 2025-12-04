import { useState } from "react";
import { FileText, Loader2, Download, Copy, List, AlignLeft, BookOpen } from "lucide-react";
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
import { getStoredProvider, AISettings } from "@/components/ai-settings";
import { formatDate } from "@/lib/utils";

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
          <h1 className="text-3xl font-bold text-gfg-text" data-testid="text-page-title">Summary Generator</h1>
          <p className="text-gfg-text-light">
            Generate concise summaries from your documents or any topic
          </p>
        </div>
        <AISettings />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "view")}>
        <TabsList className="grid w-full grid-cols-2 bg-gfg-bg-card dark:bg-gfg-dark-bg border border-gfg-border-light dark:border-gfg-dark-border max-w-md">
          <TabsTrigger value="generate" className="data-[state=active]:bg-gfg-green data-[state=active]:text-white" data-testid="tab-generate">Generate</TabsTrigger>
          <TabsTrigger value="view" className="data-[state=active]:bg-gfg-green data-[state=active]:text-white" data-testid="tab-view" disabled={!currentSummary}>
            View Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card className="dark:bg-gfg-dark-card border-gfg-border-light dark:border-gfg-dark-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gfg-text">
                <FileText className="h-5 w-5 text-gfg-green" />
                Generate Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document" className="text-gfg-text">Source Document (Optional)</Label>
                <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                  <SelectTrigger id="document" className="bg-white dark:bg-gfg-dark-bg border-gfg-border-medium dark:border-gfg-dark-border dark:text-gfg-text-light" data-testid="select-document">
                    <SelectValue placeholder="Select a document or enter a topic" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gfg-dark-card border-gfg-border dark:border-gfg-dark-border">
                    <SelectItem value="none">No document (use topic only)</SelectItem>
                    {[...documents]
                      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                      .map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-gfg-text">Topic {!hasDocumentSelected && "(Required)"}</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Photosynthesis, Machine Learning basics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-white dark:bg-gfg-dark-bg border-gfg-border-medium dark:border-gfg-dark-border dark:text-gfg-text-light"
                  data-testid="input-topic"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-gfg-text">Summary Length</Label>
                <ToggleGroup
                  type="single"
                  value={mode}
                  onValueChange={(v) => v && setMode(v as "short" | "medium" | "detailed")}
                  className="justify-start"
                >
                  <ToggleGroupItem value="short" className="data-[state=on]:bg-gfg-green data-[state=on]:text-white border border-gfg-border-medium dark:border-gfg-dark-border dark:text-gfg-text-light" data-testid="toggle-short">
                    Short
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" className="data-[state=on]:bg-gfg-green data-[state=on]:text-white border border-gfg-border-medium dark:border-gfg-dark-border dark:text-gfg-text-light" data-testid="toggle-medium">
                    Medium
                  </ToggleGroupItem>
                  <ToggleGroupItem value="detailed" className="data-[state=on]:bg-gfg-green data-[state=on]:text-white border border-gfg-border-medium dark:border-gfg-dark-border dark:text-gfg-text-light" data-testid="toggle-detailed">
                    Detailed
                  </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-xs text-gfg-text-light">{getModeDescription(mode)}</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gfg-border-light dark:border-gfg-dark-border bg-gray-50 dark:bg-gfg-dark-bg p-4">
                <div className="flex items-center gap-3">
                  <List className="h-5 w-5 text-gfg-text-light" />
                  <div>
                    <Label htmlFor="bullet-points" className="text-gfg-text">Include Bullet Points</Label>
                    <p className="text-xs text-gfg-text-light">
                      Add key takeaways as bullet points
                    </p>
                  </div>
                </div>
                <Switch
                  id="bullet-points"
                  checked={includeBulletPoints}
                  onCheckedChange={setIncludeBulletPoints}
                  className="data-[state=checked]:bg-gfg-green"
                  data-testid="switch-bullet-points"
                />
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || (!hasDocumentSelected && !topic.trim())}
                className="w-full"
                variant="cta"
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
              <h3 className="mb-4 text-lg font-semibold text-gfg-text">Previous Summaries</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {summaries.slice().reverse().slice(0, 5).map((summary) => (
                  <Card
                    key={summary.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-gfg-border-light dark:border-gfg-dark-border hover:border-gfg-green dark:bg-gfg-dark-card"
                    onClick={() => {
                      setCurrentSummary(summary);
                      setActiveTab("view");
                    }}
                    data-testid={`card-summary-${summary.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1 break-words text-gfg-text" title={summary.topic || "Summary"}>
                            {summary.topic || "Summary"}
                          </p>
                          <p className="mt-1 text-sm text-gfg-text-light line-clamp-2 break-words">
                            {summary.content.slice(0, 100)}...
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="text-gfg-text border-gfg-border-medium dark:border-gfg-dark-border">{summary.mode}</Badge>
                          <span className="text-xs text-gfg-text-light">
                            {formatDate(summary.createdAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                  <h2 className="text-xl font-semibold text-gfg-text">
                    {currentSummary.topic || "Generated Summary"}
                  </h2>
                  <Badge variant="outline" className="text-gfg-text border-gfg-border-medium dark:border-gfg-dark-border">{currentSummary.mode}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-gfg-green text-gfg-green hover:bg-gfg-green-50"
                    data-testid="button-copy"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="border-gfg-green text-gfg-green hover:bg-gfg-green-50"
                    data-testid="button-export"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <Card className="mb-6 border-gfg-border-light dark:border-gfg-dark-border dark:bg-gfg-dark-card">
                <CardContent className="p-6">
                  <ScrollArea className="max-h-96">
                    <p
                      className="whitespace-pre-wrap text-base leading-relaxed text-gfg-text"
                      data-testid="text-summary-content"
                    >
                      {currentSummary.content}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>

              {(currentSummary.bulletPoints as string[])?.length > 0 && (
                <Card className="mb-6 border-gfg-border-light dark:border-gfg-dark-border dark:bg-gfg-dark-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-gfg-text">
                      <List className="h-5 w-5 text-gfg-green" />
                      Key Takeaways
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(currentSummary.bulletPoints as string[]).map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gfg-green" />
                          <span className="text-gfg-text">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {(currentSummary.keyTerms as string[])?.length > 0 && (
                <Card className="border-gfg-border-light dark:border-gfg-dark-border dark:bg-gfg-dark-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-gfg-text">
                      <BookOpen className="h-5 w-5 text-gfg-green" />
                      Key Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(currentSummary.keyTerms as string[]).map((term, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-gfg-bg-secondary dark:bg-gfg-dark-bg text-gfg-text border border-gfg-border-medium dark:border-gfg-dark-border">
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
