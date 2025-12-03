import { useState } from "react";
import { StickyNote, Loader2, Download, Copy, BookOpen, Lightbulb, Quote, Calculator } from "lucide-react";
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
import { getStoredProvider, AISettings } from "@/components/ai-settings";
import { formatDate } from "@/lib/utils";

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
          <h1 className="text-3xl font-bold text-gfg-text dark:text-gfg-dark-text" data-testid="text-page-title">Notes Extractor</h1>
          <p className="text-gfg-text-light dark:text-gfg-dark-muted">
            Extract key points, definitions, and important information from your documents
          </p>
        </div>
        <AISettings />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "view")}>
        <TabsList className="bg-gfg-bg-card dark:bg-gfg-dark-card border border-gfg-border dark:border-gfg-dark-border">
          <TabsTrigger value="generate" className="data-[state=active]:bg-gfg-green data-[state=active]:text-white dark:data-[state=active]:bg-gfg-green-cta" data-testid="tab-generate">Extract</TabsTrigger>
          <TabsTrigger value="view" className="data-[state=active]:bg-gfg-green data-[state=active]:text-white dark:data-[state=active]:bg-gfg-green-cta" data-testid="tab-view" disabled={!currentNotes}>
            View Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card className="max-w-xl mx-auto border-gfg-border dark:border-gfg-dark-border bg-gfg-bg-card dark:bg-gfg-dark-card shadow-gfg-light dark:shadow-gfg-dark">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gfg-text dark:text-gfg-dark-text">
                <StickyNote className="h-5 w-5 text-gfg-green dark:text-gfg-green-light" />
                Extract Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document" className="text-gfg-text dark:text-gfg-dark-text">Source Document (Optional)</Label>
                <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                  <SelectTrigger id="document" className="bg-white dark:bg-gfg-dark-panel border-gfg-border dark:border-gfg-dark-border text-gfg-text dark:text-gfg-dark-text" data-testid="select-document">
                    <SelectValue placeholder="Select a document or enter a topic" />
                  </SelectTrigger>
                  <SelectContent className="bg-gfg-bg-card dark:bg-gfg-dark-card border-gfg-border dark:border-gfg-dark-border">
                    <SelectItem value="none" className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel">No document (use topic only)</SelectItem>
                    {[...documents]
                      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                      .map((doc) => (
                        <SelectItem key={doc.id} value={doc.id} className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel">
                          {doc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic" className="text-gfg-text dark:text-gfg-dark-text">Topic {!hasDocumentSelected && "(Required)"}</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Cell Biology, French Revolution, Quantum Physics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  data-testid="input-topic"
                  className="bg-white dark:bg-gfg-dark-panel border-gfg-border dark:border-gfg-dark-border text-gfg-text dark:text-gfg-dark-text"
                />
                <p className="text-xs text-gfg-text-light dark:text-gfg-dark-muted">
                  We'll extract key points, definitions, and important information
                </p>
              </div>

              <div className="rounded-lg border border-gfg-border dark:border-gfg-dark-border bg-gray-50 dark:bg-gfg-dark-panel p-4">
                <p className="text-sm font-medium text-gfg-text dark:text-gfg-dark-text">What we'll extract:</p>
                <ul className="mt-2 space-y-1 text-sm text-gfg-text-light dark:text-gfg-dark-muted">
                  <li className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-gfg-green dark:text-gfg-green-light" />
                    Key points and main concepts
                  </li>
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gfg-green dark:text-gfg-green-light" />
                    Important definitions and terms
                  </li>
                  <li className="flex items-center gap-2">
                    <Quote className="h-4 w-4 text-gfg-green dark:text-gfg-green-light" />
                    Critical sentences and statements
                  </li>
                  <li className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-gfg-green dark:text-gfg-green-light" />
                    Formulas and equations (if applicable)
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || (!hasDocumentSelected && !topic.trim())}
                className="w-full"
                variant="cta"
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
              <h3 className="mb-4 text-lg font-semibold text-gfg-text dark:text-gfg-dark-text">Previous Notes</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.slice().reverse().slice(0, 5).map((noteSet) => (
                  <Card
                    key={noteSet.id}
                    className="cursor-pointer border-gfg-border dark:border-gfg-dark-border bg-gfg-bg-card dark:bg-gfg-dark-card hover:border-gfg-green dark:hover:border-gfg-green-light transition-colors"
                    onClick={() => {
                      setCurrentNotes(noteSet);
                      setActiveTab("view");
                    }}
                    data-testid={`card-notes-${noteSet.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gfg-text dark:text-gfg-dark-text">{noteSet.topic || "Extracted Notes"}</p>
                          <p className="text-sm text-gfg-text-light dark:text-gfg-dark-muted">
                            {(noteSet.keyPoints as string[]).length} key points • {(noteSet.definitions as any[]).length} definitions
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StickyNote className="h-5 w-5 text-gfg-green dark:text-gfg-green-light" />
                          <span className="text-xs text-gfg-text-light dark:text-gfg-dark-muted">
                            {formatDate(noteSet.createdAt)}
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
          {currentNotes && (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gfg-text dark:text-gfg-dark-text">
                    {currentNotes.topic || "Extracted Notes"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    data-testid="button-copy"
                    className="border-gfg-border dark:border-gfg-dark-border text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    data-testid="button-export"
                    className="border-gfg-border dark:border-gfg-dark-border text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <Accordion type="multiple" defaultValue={["key-points", "definitions"]} className="space-y-4">
                <AccordionItem value="key-points" className="rounded-lg border border-gfg-border dark:border-gfg-dark-border px-4 bg-white dark:bg-gfg-dark-card">
                  <AccordionTrigger className="hover:no-underline text-gfg-text dark:text-gfg-dark-text">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-gfg-green dark:text-gfg-green-light" />
                      <span className="font-semibold">Key Points</span>
                      <Badge variant="secondary" className="bg-gray-100 dark:bg-gfg-dark-panel text-gfg-text dark:text-gfg-dark-text">{(currentNotes.keyPoints as string[]).length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pb-4">
                      {(currentNotes.keyPoints as string[]).map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gfg-green/10 dark:bg-gfg-green/20 text-sm font-medium text-gfg-green dark:text-gfg-green-light">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5 text-gfg-text dark:text-gfg-dark-text">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="definitions" className="rounded-lg border border-gfg-border dark:border-gfg-dark-border px-4 bg-white dark:bg-gfg-dark-card">
                  <AccordionTrigger className="hover:no-underline text-gfg-text dark:text-gfg-dark-text">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-gfg-green dark:text-gfg-green-light" />
                      <span className="font-semibold">Definitions</span>
                      <Badge variant="secondary" className="bg-gray-100 dark:bg-gfg-dark-panel text-gfg-text dark:text-gfg-dark-text">{(currentNotes.definitions as any[]).length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pb-4">
                      {(currentNotes.definitions as { term: string; definition: string }[]).map((def, idx) => (
                        <div key={idx} className="rounded-lg bg-gray-50 dark:bg-gfg-dark-panel p-4 border border-gfg-border dark:border-gfg-dark-border">
                          <p className="font-semibold text-gfg-green dark:text-gfg-green-light">{def.term}</p>
                          <p className="mt-1 text-gfg-text dark:text-gfg-dark-text">{def.definition}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sentences" className="rounded-lg border border-gfg-border dark:border-gfg-dark-border px-4 bg-white dark:bg-gfg-dark-card">
                  <AccordionTrigger className="hover:no-underline text-gfg-text dark:text-gfg-dark-text">
                    <div className="flex items-center gap-2">
                      <Quote className="h-5 w-5 text-gfg-green dark:text-gfg-green-light" />
                      <span className="font-semibold">Important Sentences</span>
                      <Badge variant="secondary" className="bg-gray-100 dark:bg-gfg-dark-panel text-gfg-text dark:text-gfg-dark-text">{(currentNotes.importantSentences as string[]).length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-4">
                      {(currentNotes.importantSentences as string[]).map((sentence, idx) => (
                        <blockquote
                          key={idx}
                          className="border-l-2 border-gfg-green dark:border-gfg-green-light pl-4 italic text-gfg-text-light dark:text-gfg-dark-muted"
                        >
                          "{sentence}"
                        </blockquote>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {(currentNotes.formulas as string[])?.length > 0 && (
                  <AccordionItem value="formulas" className="rounded-lg border border-gfg-border dark:border-gfg-dark-border px-4 bg-white dark:bg-gfg-dark-card">
                    <AccordionTrigger className="hover:no-underline text-gfg-text dark:text-gfg-dark-text">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-gfg-green dark:text-gfg-green-light" />
                        <span className="font-semibold">Formulas</span>
                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gfg-dark-panel text-gfg-text dark:text-gfg-dark-text">{(currentNotes.formulas as string[]).length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pb-4">
                        {(currentNotes.formulas as string[]).map((formula, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-gray-50 dark:bg-gfg-dark-panel p-4 font-mono text-sm text-gfg-text dark:text-gfg-dark-text border border-gfg-border dark:border-gfg-dark-border"
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
