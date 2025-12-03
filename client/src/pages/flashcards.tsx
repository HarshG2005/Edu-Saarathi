import { useState, useEffect } from "react";
import { Lightbulb, Loader2, ChevronLeft, ChevronRight, RotateCw, CheckCircle2, XCircle, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Section } from "@/components/ui/section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FlashcardSet, Flashcard } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { AISettings, getStoredProvider } from "@/components/ai-settings";

export function FlashcardsPage() {
  const { documents, currentDocumentId, flashcardSets, addFlashcardSet } = useAppStore();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("10");
  const [selectedDocId, setSelectedDocId] = useState(currentDocumentId || "");
  const [activeTab, setActiveTab] = useState<"generate" | "study">("generate");

  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastery, setMastery] = useState<Record<number, boolean>>({});

  const hasDocumentSelected = selectedDocId && selectedDocId !== "none";

  const generateMutation = useMutation({
    mutationFn: async (): Promise<FlashcardSet> => {
      const payload = {
        documentId: hasDocumentSelected ? selectedDocId : undefined,
        topic: topic || undefined,
        count: parseInt(count),
        provider: getStoredProvider(),
      };
      const response = await apiRequest("POST", "/api/flashcards/generate", payload);
      return response.json();
    },
    onSuccess: (data) => {
      addFlashcardSet(data);
      setCurrentSet(data);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMastery({});
      setActiveTab("study");
      toast({
        title: "Flashcards generated",
        description: `Created ${(data.flashcards as Flashcard[]).length} cards for you to study.`,
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

  const handleNext = () => {
    if (!currentSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % (currentSet.flashcards as Flashcard[]).length);
    }, 150);
  };

  const handlePrev = () => {
    if (!currentSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + (currentSet.flashcards as Flashcard[]).length) % (currentSet.flashcards as Flashcard[]).length);
    }, 150);
  };

  const toggleMastery = () => {
    setMastery((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const masteryCount = Object.values(mastery).filter(Boolean).length;
  const progress = currentSet ? (masteryCount / (currentSet.flashcards as Flashcard[]).length) * 100 : 0;

  return (
    <Section className="flex flex-col gap-6">
      <div className="flex items-start justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-gfg-text dark:text-gfg-dark-text" data-testid="text-page-title">Flashcards</h1>
          <p className="text-gfg-text-light dark:text-gfg-dark-muted text-base">
            Master concepts through active recall and spaced repetition
          </p>
        </div>
        <AISettings />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "study")} className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-gfg-border dark:border-gfg-dark-border pb-2 shrink-0">
          <TabsList className="bg-gfg-bg-card dark:bg-gfg-dark-card p-1 h-9 border border-gfg-border dark:border-gfg-dark-border">
            <TabsTrigger value="generate" className="px-4 text-xs data-[state=active]:bg-gfg-green data-[state=active]:text-white dark:data-[state=active]:bg-gfg-green-cta" data-testid="tab-generate">Generate</TabsTrigger>
            <TabsTrigger value="study" className="px-4 text-xs data-[state=active]:bg-gfg-green data-[state=active]:text-white dark:data-[state=active]:bg-gfg-green-cta" data-testid="tab-study" disabled={!currentSet}>
              Study Mode
            </TabsTrigger>
          </TabsList>

          {activeTab === "study" && currentSet && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gfg-text dark:text-gfg-dark-text">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>Mastery: {masteryCount}/{(currentSet.flashcards as Flashcard[]).length}</span>
              </div>
              <Progress value={progress} className="w-32 h-2 bg-gray-200 dark:bg-gfg-dark-panel" />
            </div>
          )}
        </div>

        <TabsContent value="generate" className="mt-6">
          <Card className="max-w-xl mx-auto border-gfg-border dark:border-gfg-dark-border shadow-gfg-light dark:shadow-gfg-dark bg-gfg-bg-card dark:bg-gfg-dark-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gfg-text dark:text-gfg-dark-text">
                <Sparkles className="h-5 w-5 text-gfg-green dark:text-gfg-green-light" />
                Create New Deck
              </CardTitle>
              <CardDescription className="text-gfg-text-light dark:text-gfg-dark-muted">
                Generate flashcards from your documents or a specific topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="document" className="text-gfg-text dark:text-gfg-dark-text">Source Document (Optional)</Label>
                  <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                    <SelectTrigger id="document" className="bg-white dark:bg-gfg-dark-panel border-gfg-border dark:border-gfg-dark-border text-gfg-text dark:text-gfg-dark-text" data-testid="select-document">
                      <SelectValue placeholder="Select a document..." />
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
                  <Label htmlFor="count" className="text-gfg-text dark:text-gfg-dark-text">Number of Cards</Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger id="count" className="bg-white dark:bg-gfg-dark-panel border-gfg-border dark:border-gfg-dark-border text-gfg-text dark:text-gfg-dark-text" data-testid="select-count">
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent className="bg-gfg-bg-card dark:bg-gfg-dark-card border-gfg-border dark:border-gfg-dark-border">
                      <SelectItem value="5" className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel">5 Cards</SelectItem>
                      <SelectItem value="10" className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel">10 Cards</SelectItem>
                      <SelectItem value="15" className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel">15 Cards</SelectItem>
                      <SelectItem value="20" className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel">20 Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="topic" className="text-gfg-text dark:text-gfg-dark-text">Topic {!hasDocumentSelected && "(Required)"}</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Key Concepts of Biology, Historical Dates"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-white dark:bg-gfg-dark-panel border-gfg-border dark:border-gfg-dark-border focus-visible:ring-gfg-green text-gfg-text dark:text-gfg-dark-text"
                    data-testid="input-topic"
                  />
                </div>
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || (!hasDocumentSelected && !topic.trim())}
                className="w-full"
                variant="cta"
                data-testid="button-generate-flashcards"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Deck...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Generate Flashcards
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {flashcardSets.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold text-gfg-text dark:text-gfg-dark-text">Recent Decks</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {flashcardSets.slice().reverse().slice(0, 5).map((set) => (
                  <Card
                    key={set.id}
                    className="cursor-pointer border-gfg-border dark:border-gfg-dark-border bg-gfg-bg-card dark:bg-gfg-dark-card hover:border-gfg-green dark:hover:border-gfg-green-light transition-colors shadow-sm"
                    onClick={() => {
                      setCurrentSet(set);
                      setCurrentIndex(0);
                      setIsFlipped(false);
                      setMastery({});
                      setActiveTab("study");
                    }}
                    data-testid={`card-flashcard-set-${set.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="font-medium leading-none line-clamp-1 text-gfg-text dark:text-gfg-dark-text">{set.topic || "Untitled Deck"}</p>
                          <div className="flex items-center gap-2 text-xs text-gfg-text-light dark:text-gfg-dark-muted">
                            <span>{new Date(set.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{(set.flashcards as Flashcard[]).length} cards</span>
                          </div>
                        </div>
                        <Lightbulb className="h-4 w-4 text-gfg-green dark:text-gfg-green-light" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="study" className="mt-4 flex-1 flex flex-col items-center justify-center min-h-0">
          {currentSet && (
            <div className="w-full max-w-3xl flex flex-col gap-8 items-center">
              <div className="w-full flex justify-between items-center px-4">
                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-12 w-12 rounded-full hover:bg-gfg-green-50 dark:hover:bg-gfg-green/10 hover:text-gfg-green dark:hover:text-gfg-green-light text-gfg-text dark:text-gfg-dark-text">
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="perspective-1000 w-full max-w-xl aspect-[3/2] relative group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                  <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden">
                      <Card className="w-full h-full flex flex-col items-center justify-center p-8 text-center border-2 border-gfg-green dark:border-gfg-green-light bg-white dark:bg-gfg-dark-card shadow-lg">
                        <div className="absolute top-4 left-4 text-xs font-bold text-gfg-green dark:text-gfg-green-light uppercase tracking-wider">
                          Question
                        </div>
                        <p className="text-2xl font-medium leading-relaxed text-gfg-text dark:text-gfg-dark-text">
                          {(currentSet.flashcards as Flashcard[])[currentIndex].front}
                        </p>
                        <div className="absolute bottom-4 text-xs text-gfg-text-light dark:text-gfg-dark-muted flex items-center gap-2">
                          <RotateCw className="h-3 w-3" />
                          Click to flip
                        </div>
                      </Card>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                      <Card className="w-full h-full flex flex-col items-center justify-center p-8 text-center border-0 shadow-lg bg-gfg-green dark:bg-gfg-green-cta text-white">
                        <div className="absolute top-4 left-4 text-xs font-bold text-white/80 uppercase tracking-wider">
                          Answer
                        </div>
                        <p className="text-xl leading-relaxed text-white">
                          {(currentSet.flashcards as Flashcard[])[currentIndex].back}
                        </p>
                      </Card>
                    </div>
                  </motion.div>
                </div>

                <Button variant="ghost" size="icon" onClick={handleNext} className="h-12 w-12 rounded-full hover:bg-gfg-green-50 dark:hover:bg-gfg-green/10 hover:text-gfg-green dark:hover:text-gfg-green-light text-gfg-text dark:text-gfg-dark-text">
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <div className="flex items-center gap-4">
                  <Button
                    variant={mastery[currentIndex] ? "default" : "outline"}
                    size="lg"
                    onClick={toggleMastery}
                    className={`gap-2 min-w-[140px] transition-all ${mastery[currentIndex] ? "bg-gfg-green hover:bg-gfg-green-light border-gfg-green text-white" : "border-gfg-green text-gfg-green hover:bg-gfg-green-50 dark:border-gfg-green-light dark:text-gfg-green-light dark:hover:bg-gfg-green/10"}`}
                  >
                    {mastery[currentIndex] ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Mastered
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Mark Mastered
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {(currentSet.flashcards as Flashcard[]).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === currentIndex
                        ? "bg-gfg-green dark:bg-gfg-green-light w-6"
                        : mastery[idx]
                          ? "bg-gfg-green/50 dark:bg-gfg-green-light/50"
                          : "bg-gray-200 dark:bg-gfg-dark-panel"
                        }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-gfg-text-light dark:text-gfg-dark-muted">
                  Card {currentIndex + 1} of {(currentSet.flashcards as Flashcard[]).length}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Section>
  );
}
