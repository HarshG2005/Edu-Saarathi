import { useState } from "react";
import { StickyNote, Loader2, Download, Copy, BookOpen, Lightbulb, Quote, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    currentNotes.keyPoints.forEach((point, i) => {
      content += `${i + 1}. ${point}\n`;
    });
    
    content += "\nDEFINITIONS:\n";
    currentNotes.definitions.forEach((def) => {
      content += `• ${def.term}: ${def.definition}\n`;
    });
    
    content += "\nIMPORTANT SENTENCES:\n";
    currentNotes.importantSentences.forEach((sentence) => {
      content += `"${sentence}"\n`;
    });
    
    if (currentNotes.formulas?.length) {
      content += "\nFORMULAS:\n";
      currentNotes.formulas.forEach((formula) => {
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
    currentNotes.keyPoints.forEach((point, i) => {
      content += `${i + 1}. ${point}\n`;
    });
    
    content += "\nDEFINITIONS\n";
    content += "-".repeat(30) + "\n";
    currentNotes.definitions.forEach((def) => {
      content += `• ${def.term}\n  ${def.definition}\n\n`;
    });
    
    content += "IMPORTANT SENTENCES\n";
    content += "-".repeat(30) + "\n";
    currentNotes.importantSentences.forEach((sentence) => {
      content += `"${sentence}"\n\n`;
    });
    
    if (currentNotes.formulas?.length) {
      content += "FORMULAS\n";
      content += "-".repeat(30) + "\n";
      currentNotes.formulas.forEach((formula) => {
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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Notes Extractor</h1>
        <p className="text-muted-foreground">
          Extract key points, definitions, and important information from your documents
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "view")}>
        <TabsList>
          <TabsTrigger value="generate" data-testid="tab-generate">Extract</TabsTrigger>
          <TabsTrigger value="view" data-testid="tab-view" disabled={!currentNotes}>
            View Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Extract Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document">Source Document (Optional)</Label>
                <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                  <SelectTrigger id="document" data-testid="select-document">
                    <SelectValue placeholder="Select a document or enter a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No document (use topic only)</SelectItem>
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic {!hasDocumentSelected && "(Required)"}</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Cell Biology, French Revolution, Quantum Physics"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  data-testid="input-topic"
                />
                <p className="text-xs text-muted-foreground">
                  We'll extract key points, definitions, and important information
                </p>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium">What we'll extract:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Key points and main concepts
                  </li>
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Important definitions and terms
                  </li>
                  <li className="flex items-center gap-2">
                    <Quote className="h-4 w-4" />
                    Critical sentences and statements
                  </li>
                  <li className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Formulas and equations (if applicable)
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || (!hasDocumentSelected && !topic.trim())}
                className="w-full"
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
              <h3 className="mb-4 text-lg font-semibold">Previous Notes</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.slice().reverse().map((noteSet) => (
                  <Card
                    key={noteSet.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => {
                      setCurrentNotes(noteSet);
                      setActiveTab("view");
                    }}
                    data-testid={`card-notes-${noteSet.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{noteSet.topic || "Extracted Notes"}</p>
                          <p className="text-sm text-muted-foreground">
                            {noteSet.keyPoints.length} key points • {noteSet.definitions.length} definitions
                          </p>
                        </div>
                        <StickyNote className="h-5 w-5 text-muted-foreground" />
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
                  <h2 className="text-xl font-semibold">
                    {currentNotes.topic || "Extracted Notes"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    data-testid="button-copy"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    data-testid="button-export"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <Accordion type="multiple" defaultValue={["key-points", "definitions"]} className="space-y-4">
                <AccordionItem value="key-points" className="rounded-lg border px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Key Points</span>
                      <Badge variant="secondary">{currentNotes.keyPoints.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 pb-4">
                      {currentNotes.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="definitions" className="rounded-lg border px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Definitions</span>
                      <Badge variant="secondary">{currentNotes.definitions.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pb-4">
                      {currentNotes.definitions.map((def, idx) => (
                        <div key={idx} className="rounded-lg bg-muted/50 p-4">
                          <p className="font-semibold text-primary">{def.term}</p>
                          <p className="mt-1 text-muted-foreground">{def.definition}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="sentences" className="rounded-lg border px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Quote className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Important Sentences</span>
                      <Badge variant="secondary">{currentNotes.importantSentences.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-4">
                      {currentNotes.importantSentences.map((sentence, idx) => (
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

                {currentNotes.formulas && currentNotes.formulas.length > 0 && (
                  <AccordionItem value="formulas" className="rounded-lg border px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Formulas</span>
                        <Badge variant="secondary">{currentNotes.formulas.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pb-4">
                        {currentNotes.formulas.map((formula, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-muted p-4 font-mono text-sm"
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
    </div>
  );
}
