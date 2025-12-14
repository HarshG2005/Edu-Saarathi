import { useState, useEffect } from "react";
import { Link } from "wouter";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FlashcardSet, Flashcard } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import { getStoredProvider } from "@/pages/settings";
import { getGradient } from "@/lib/utils";

export function FlashcardsPage() {
  const { documents, currentDocumentId, flashcardSets, addFlashcardSet } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("10");
  const [selectedDocId, setSelectedDocId] = useState(currentDocumentId || "");
  const [activeTab, setActiveTab] = useState<"generate" | "study">("generate");

  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastery, setMastery] = useState<Record<number, boolean>>({});

  const hasDocumentSelected = selectedDocId && selectedDocId !== "none";

  // Initialize mastery from currentSet
  useEffect(() => {
    if (currentSet) {
      const initialMastery: Record<number, boolean> = {};
      (currentSet.flashcards as Flashcard[]).forEach((card, idx) => {
        if (card.mastered) {
          initialMastery[idx] = true;
        }
      });
      setMastery(initialMastery);
    }
  }, [currentSet]);

  const updateSetMutation = useMutation({
    mutationFn: async (updatedSet: FlashcardSet) => {
      const res = await apiRequest("PUT", `/api/flashcards/${updatedSet.id}`, {
        flashcards: updatedSet.flashcards,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

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
    if (!currentSet) return;

    const newMastery = !mastery[currentIndex];

    // Optimistic update
    setMastery((prev) => ({
      ...prev,
      [currentIndex]: newMastery,
    }));

    // Update currentSet
    const updatedFlashcards = [...(currentSet.flashcards as Flashcard[])];
    updatedFlashcards[currentIndex] = {
      ...updatedFlashcards[currentIndex],
      mastered: newMastery
    };

    const updatedSet = { ...currentSet, flashcards: updatedFlashcards };
    setCurrentSet(updatedSet);

    // Persist
    updateSetMutation.mutate(updatedSet);
  };

  // Calculate stats
  const masteryCount = Object.values(mastery).filter(Boolean).length;
  const progress = currentSet ? (masteryCount / (currentSet.flashcards as Flashcard[]).length) * 100 : 0;

  // ... rest of component


  return (
    <Section className="flex flex-col gap-6">
      <div className="flex items-start justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" data-testid="text-page-title">Flashcards</h1>
          <p className="text-muted-foreground text-base">
            Master concepts through active recall and spaced repetition
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/flashcards/smart-review">
            <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
              <Sparkles className="h-4 w-4" />
              Try Smart Review Mode
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline" size="icon" className="border-border text-muted-foreground hover:bg-muted hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "study")} className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-border pb-2 shrink-0">
          <TabsList className="bg-muted p-1 h-9 border border-border">
            <TabsTrigger value="generate" className="px-4 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground" data-testid="tab-generate">Generate</TabsTrigger>
            <TabsTrigger value="study" className="px-4 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground" data-testid="tab-study" disabled={!currentSet}>
              Study Mode
            </TabsTrigger>
          </TabsList>

          {activeTab === "study" && currentSet && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>Mastery: {masteryCount}/{(currentSet.flashcards as Flashcard[]).length}</span>
              </div>
              <Progress value={progress} className="w-32 h-2 bg-muted" />
            </div>
          )}
        </div>

        <TabsContent value="generate" className="mt-6">
          <Card className="max-w-xl mx-auto border-border shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Deck
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Generate flashcards from your documents or a specific topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="document" className="text-foreground">Source Document (Optional)</Label>
                  <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                    <SelectTrigger id="document" className="bg-background border-border text-foreground" data-testid="select-document">
                      <SelectValue placeholder="Select a document..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="none" className="hover:bg-muted focus:bg-muted cursor-pointer">No document (use topic only)</SelectItem>
                      {[...documents]
                        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                        .map((doc) => (
                          <SelectItem key={doc.id} value={doc.id} className="hover:bg-muted focus:bg-muted cursor-pointer">
                            {doc.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="count" className="text-foreground">Number of Cards</Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger id="count" className="bg-background border-border text-foreground" data-testid="select-count">
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="5" className="hover:bg-muted focus:bg-muted cursor-pointer">5 Cards</SelectItem>
                      <SelectItem value="10" className="hover:bg-muted focus:bg-muted cursor-pointer">10 Cards</SelectItem>
                      <SelectItem value="15" className="hover:bg-muted focus:bg-muted cursor-pointer">15 Cards</SelectItem>
                      <SelectItem value="20" className="hover:bg-muted focus:bg-muted cursor-pointer">20 Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="topic" className="text-foreground">Topic {!hasDocumentSelected && "(Required)"}</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Key Concepts of Biology, Historical Dates"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-background border-border focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
                    data-testid="input-topic"
                  />
                </div>
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || (!hasDocumentSelected && !topic.trim())}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
              <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Decks</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {flashcardSets.slice().reverse().slice(0, 5).map((set, index) => (
                  <div
                    key={set.id}
                    className="group relative overflow-hidden rounded-xl transition-all hover:scale-[1.02] cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => {
                      setCurrentSet(set);
                      setCurrentIndex(0);
                      setIsFlipped(false);
                      setMastery({});
                      setActiveTab("study");
                    }}
                    data-testid={`card-flashcard-set-${set.id}`}
                  >
                    {/* Gradient header */}
                    <div className={`p-4 bg-gradient-to-br ${getGradient(index)}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white">
                            <Lightbulb className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-white line-clamp-1">{set.topic || "Untitled Deck"}</p>
                            <p className="text-xs text-white/80">
                              {new Date(set.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="bg-card p-4 border border-border border-t-0 group-hover:border-primary/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{(set.flashcards as Flashcard[]).length} cards</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-primary hover:text-primary/80 hover:bg-transparent">
                          Study Now &rarr;
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="study" className="mt-4 flex-1 flex flex-col items-center justify-center min-h-0">
          {currentSet && (
            <div className="w-full max-w-3xl flex flex-col gap-8 items-center">
              <div className="w-full flex justify-between items-center px-4">
                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-12 w-12 rounded-full hover:bg-muted hover:text-primary text-muted-foreground">
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="perspective-1000 w-full max-w-xl aspect-[3/2] relative group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                  <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden">
                      <Card className="w-full h-full flex flex-col items-center justify-center p-8 text-center border-0 bg-gradient-to-br from-primary to-orange-400 shadow-lg text-primary-foreground">
                        <div className="absolute top-4 left-4 text-xs font-bold opacity-80 uppercase tracking-wider">
                          Question
                        </div>
                        <p className="text-2xl font-medium leading-relaxed drop-shadow-sm">
                          {(currentSet.flashcards as Flashcard[])[currentIndex].front}
                        </p>
                        <div className="absolute bottom-4 text-xs opacity-80 flex items-center gap-2">
                          <RotateCw className="h-3 w-3" />
                          Click to flip
                        </div>
                      </Card>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                      <Card className="w-full h-full flex flex-col items-center justify-center p-8 text-center border-0 shadow-lg bg-card text-card-foreground border-border">
                        <div className="absolute top-4 left-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Answer
                        </div>
                        <p className="text-xl leading-relaxed text-foreground drop-shadow-sm">
                          {(currentSet.flashcards as Flashcard[])[currentIndex].back}
                        </p>
                      </Card>
                    </div>
                  </motion.div>
                </div>

                <Button variant="ghost" size="icon" onClick={handleNext} className="h-12 w-12 rounded-full hover:bg-muted hover:text-primary text-muted-foreground">
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <div className="flex items-center gap-4">
                  <Button
                    variant={mastery[currentIndex] ? "default" : "outline"}
                    size="lg"
                    onClick={toggleMastery}
                    className={`gap-2 min-w-[140px] transition-all ${mastery[currentIndex] ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary" : "border-primary text-primary hover:bg-primary/10"}`}
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
                        ? "bg-primary w-6"
                        : mastery[idx]
                          ? "bg-primary/50"
                          : "bg-muted"
                        }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">
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
