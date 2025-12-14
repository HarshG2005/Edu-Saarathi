import { useState } from "react";
import { Link } from "wouter";
import { StickyNote, Loader2, Download, Copy, BookOpen, Lightbulb, Quote, Calculator, Settings, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Section } from "@/components/ui/section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Notes } from "@shared/schema";
import { getStoredProvider } from "@/pages/settings";
import { formatDate, getGradient } from "@/lib/utils";

export function NotesPage() {
  const { documents, currentDocumentId, notes, addNotes } = useAppStore();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(currentDocumentId || "");
  const [activeTab, setActiveTab] = useState<"generate" | "view">("generate");

  const [currentNotes, setCurrentNotes] = useState<Notes | null>(null);

  const hasDocumentSelected = selectedDocId && selectedDocId !== "none";

  const generateMutation = useMutation({
    mutationFn: async (): Promise<Notes> => {
      const payload = {
        documentId: hasDocumentSelected ? selectedDocId : undefined,
        topic: topic || undefined,
        provider: getStoredProvider(),
      };
      const response = await apiRequest("POST", "/api/notes/generate", payload);
      return response.json();
    },
    onSuccess: (data) => {
      addNotes(data);
      setCurrentNotes(data);
      setActiveTab("view");
      toast({
        title: "Notes extracted",
        description: "Key information has been organized for you.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Extraction failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCopy = () => {
    if (!currentNotes) return;

    let content = `Notes: ${currentNotes.topic || "Extracted Notes"}\n\n`;

    content += "KEY POINTS:\n";
    (currentNotes.keyPoints as string[]).forEach((point, i) => {
      content += `${i + 1}. ${point}\n`;
    });

    content += "\nDEFINITIONS:\n";
    (currentNotes.definitions as { term: string; definition: string }[]).forEach((def) => {
      content += `• ${def.term}: ${def.definition}\n`;
    });

    content += "\nIMPORTANT SENTENCES:\n";
    (currentNotes.importantSentences as string[]).forEach((sentence) => {
      content += `"${sentence}"\n`;
    });

    if (currentNotes.formulas && (currentNotes.formulas as string[]).length > 0) {
      content += "\nFORMULAS:\n";
      (currentNotes.formulas as string[]).forEach((formula) => {
        content += `${formula}\n`;
      });
    }

    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Notes copied to clipboard.",
    });
  };

  const handleExport = () => {
    if (!currentNotes) return;

    let content = `Notes: ${currentNotes.topic || "Extracted Notes"}\n`;
    content += "=".repeat(50) + "\n\n";

    content += "KEY POINTS\n";
    content += "-".repeat(30) + "\n";
    (currentNotes.keyPoints as string[]).forEach((point, i) => {
      content += `${i + 1}. ${point}\n`;
    });

    content += "\nDEFINITIONS\n";
    content += "-".repeat(30) + "\n";
    (currentNotes.definitions as { term: string; definition: string }[]).forEach((def) => {
      content += `• ${def.term}\n  ${def.definition}\n\n`;
    });

    content += "IMPORTANT SENTENCES\n";
    content += "-".repeat(30) + "\n";
    (currentNotes.importantSentences as string[]).forEach((sentence) => {
      content += `"${sentence}"\n\n`;
    });

    if (currentNotes.formulas && (currentNotes.formulas as string[]).length > 0) {
      content += "FORMULAS\n";
      content += "-".repeat(30) + "\n";
      (currentNotes.formulas as string[]).forEach((formula) => {
        content += `${formula}\n`;
      });
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-${currentNotes.topic || "extracted"}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Notes have been exported as a text file.",
    });
  };

  return (
    <Section className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent" data-testid="text-page-title">Notes Extractor</h1>
          <p className="text-gray-400">
            Extract key points, definitions, and important information from your documents
          </p>
        </div>
        <Link href="/settings">
          <Button variant="outline" size="icon" className="border-border text-muted-foreground hover:bg-muted hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "view")}>
        <TabsList className="grid w-full grid-cols-2 bg-muted border border-border max-w-md">
          <TabsTrigger value="generate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground" data-testid="tab-generate">Extract</TabsTrigger>
          <TabsTrigger value="view" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground" data-testid="tab-view" disabled={!currentNotes}>
            View Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card className="max-w-xl mx-auto border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <StickyNote className="h-5 w-5 text-primary" />
                Extract Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document" className="text-foreground">Source Document (Optional)</Label>
                <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                  <SelectTrigger id="document" className="bg-muted border-border text-foreground" data-testid="select-document">
                    <SelectValue placeholder="Select a document or enter a topic" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="none" className="hover:bg-muted cursor-pointer">No document (use topic only)</SelectItem>
                    {[...documents]
                      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                      .map((doc) => (
                        <SelectItem key={doc.id} value={doc.id} className="hover:bg-muted cursor-pointer">
                          {doc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-foreground">Topic {!hasDocumentSelected && "(Required)"}</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Cell Biology, French Revolution, Quantum Physics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  data-testid="input-topic"
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  We'll extract key points, definitions, and important information
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground">What we'll extract:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Key points and main concepts
                  </li>
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Important definitions and terms
                  </li>
                  <li className="flex items-center gap-2">
                    <Quote className="h-4 w-4 text-primary" />
                    Critical sentences and statements
                  </li>
                  <li className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    Formulas and equations (if applicable)
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || (!hasDocumentSelected && !topic.trim())}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-extract-notes"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <StickyNote className="mr-2 h-4 w-4" />
                    Extract Notes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {notes.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Previous Notes</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.slice().reverse().slice(0, 5).map((noteSet, index) => (
                  <div
                    key={noteSet.id}
                    className="rounded-2xl overflow-hidden drop-shadow-lg transform transition-all duration-300 hover:scale-[1.025] group relative cursor-pointer"
                    onClick={() => {
                      setCurrentNotes(noteSet);
                      setActiveTab("view");
                    }}
                    data-testid={`card-notes-${noteSet.id}`}
                  >
                    {/* Gradient header */}
                    <div className={`p-5 bg-gradient-to-br ${getGradient(index)} relative`}>
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90">
                          <FileText className="w-6 h-6 opacity-90" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-lg leading-tight truncate" title={noteSet.topic || "Extracted Notes"}>
                            {noteSet.topic || "Extracted Notes"}
                          </h3>
                          <p className="text-white/80 text-sm mt-1 truncate">
                            {(noteSet.keyPoints as string[]).length} key points
                          </p>
                        </div>
                      </div>
                      {/* subtle glow */}
                      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10 blur-3xl bg-white"></div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="bg-card p-5 border border-border group-hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <p className="text-muted-foreground text-sm">
                            {(noteSet.definitions as any[]).length} definitions • {(noteSet.importantSentences as string[]).length} quotes
                          </p>
                          <p className="text-muted-foreground/80 text-xs mt-2 flex items-center gap-1">
                            {formatDate(noteSet.createdAt)}
                          </p>
                        </div>
                      </div>

                      <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                        View Notes &rarr;
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="view" className="mt-6">
          {currentNotes && (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    {currentNotes.topic || "Extracted Notes"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    data-testid="button-copy"
                    className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    data-testid="button-export"
                    className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <Accordion type="multiple" defaultValue={["key-points", "definitions"]} className="space-y-4">
                <AccordionItem value="key-points" className="rounded-lg border border-border px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline text-foreground">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Key Points</span>
                      <Badge variant="secondary" className="bg-muted text-foreground border border-border">{(currentNotes.keyPoints as string[]).length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pb-4">
                      {(currentNotes.keyPoints as string[]).map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5 text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="definitions" className="rounded-lg border border-border px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline text-foreground">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Definitions</span>
                      <Badge variant="secondary" className="bg-muted text-foreground border border-border">{(currentNotes.definitions as any[]).length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pb-4">
                      {(currentNotes.definitions as { term: string; definition: string }[]).map((def, idx) => (
                        <div key={idx} className="rounded-lg bg-muted/50 p-4 border border-border">
                          <p className="font-semibold text-primary">{def.term}</p>
                          <p className="mt-1 text-muted-foreground">{def.definition}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sentences" className="rounded-lg border border-border px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline text-foreground">
                    <div className="flex items-center gap-2">
                      <Quote className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Important Sentences</span>
                      <Badge variant="secondary" className="bg-muted text-foreground border border-border">{(currentNotes.importantSentences as string[]).length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-4">
                      {(currentNotes.importantSentences as string[]).map((sentence, idx) => (
                        <blockquote
                          key={idx}
                          className="border-l-2 border-primary pl-4 italic text-muted-foreground"
                        >
                          "{sentence}"
                        </blockquote>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {(currentNotes.formulas as string[])?.length > 0 && (
                  <AccordionItem value="formulas" className="rounded-lg border border-border px-4 bg-card">
                    <AccordionTrigger className="hover:no-underline text-foreground">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Formulas</span>
                        <Badge variant="secondary" className="bg-muted text-foreground border border-border">{(currentNotes.formulas as string[]).length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pb-4">
                        {(currentNotes.formulas as string[]).map((formula, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-muted/50 p-4 font-mono text-sm text-foreground border border-border"
                          >
                            {formula}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Section>
  );
}
