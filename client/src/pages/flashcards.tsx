import { useState, useEffect } from "react";
import { Lightbulb, Loader2, ChevronLeft, ChevronRight, RotateCw, CheckCircle2, XCircle, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        description: `Created ${data.flashcards.length} cards for you to study.`,
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
      setCurrentIndex((prev) => (prev + 1) % currentSet.flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    if (!currentSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + currentSet.flashcards.length) % currentSet.flashcards.length);
    }, 150);
  };

  const toggleMastery = () => {
    setMastery((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const masteryCount = Object.values(mastery).filter(Boolean).length;
  const progress = currentSet ? (masteryCount / currentSet.flashcards.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">Flashcards</h1>
          <p className="text-muted-foreground text-base">
            Master concepts through active recall and spaced repetition
          </p>
        </div>
        <AISettings />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "study")} className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b pb-2 shrink-0">
          <TabsList className="bg-muted/50 p-1 h-9">
            <TabsTrigger value="generate" className="px-4 text-xs" data-testid="tab-generate">Generate</TabsTrigger>
            <TabsTrigger value="study" className="px-4 text-xs" data-testid="tab-study" disabled={!currentSet}>
              Study Mode
            </TabsTrigger>
          </TabsList>

          {activeTab === "study" && currentSet && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>Mastery: {masteryCount}/{currentSet.flashcards.length}</span>
              </div>
              <Progress value={progress} className="w-32 h-2" />
            </div>
          )}
        </div>

        <TabsContent value="generate" className="mt-6">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Deck
              </CardTitle>
              <CardDescription>
                Generate flashcards from your documents or a specific topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="document">Source Document (Optional)</Label>
                  <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                    <SelectTrigger id="document" data-testid="select-document">
                      <SelectValue placeholder="Select a document..." />
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
                  <Label htmlFor="count">Number of Cards</Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger id="count" data-testid="select-count">
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Cards</SelectItem>
                      <SelectItem value="10">10 Cards</SelectItem>
                      <SelectItem value="15">15 Cards</SelectItem>
                      <SelectItem value="20">20 Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="topic">Topic {!hasDocumentSelected && "(Required)"}</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Key Concepts of Biology, Historical Dates"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    data-testid="input-topic"
                  />
                </div>
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || (!hasDocumentSelected && !topic.trim())}
                className="w-full"
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
              <h3 className="mb-4 text-lg font-semibold">Recent Decks</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {flashcardSets.slice().reverse().slice(0, 5).map((set) => (
                  <Card
                    key={set.id}
                    className="cursor-pointer hover-elevate"
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
                          <p className="font-medium leading-none line-clamp-1">{set.topic || "Untitled Deck"}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(set.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{set.flashcards.length} cards</span>
                          </div>
                        </div>
                        <Lightbulb className="h-4 w-4 text-muted-foreground/50" />
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
                <Button variant="ghost" size="icon" onClick={handlePrev} className="h-12 w-12 rounded-full hover:bg-muted">
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
                      <Card className="w-full h-full flex flex-col items-center justify-center p-8 text-center border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                        <div className="absolute top-4 left-4 text-xs font-medium text-blue-100 uppercase tracking-wider">
                          Question
                        </div>
                        <p className="text-2xl font-medium leading-relaxed">
                          {currentSet.flashcards[currentIndex].front}
                        </p>
                        <div className="absolute bottom-4 text-xs text-blue-100 flex items-center gap-2">
                          <RotateCw className="h-3 w-3" />
                          Click to flip
                        </div>
                      </Card>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                      <Card className="w-full h-full flex flex-col items-center justify-center p-8 text-center border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <div className="absolute top-4 left-4 text-xs font-medium text-emerald-100 uppercase tracking-wider">
                          Answer
                        </div>
                        <p className="text-xl leading-relaxed">
                          {currentSet.flashcards[currentIndex].back}
                        </p>
                      </Card>
                    </div>
                  </motion.div>
                </div>

                <Button variant="ghost" size="icon" onClick={handleNext} className="h-12 w-12 rounded-full hover:bg-muted">
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <div className="flex items-center gap-4">
                  <Button
                    variant={mastery[currentIndex] ? "default" : "outline"}
                    size="lg"
                    onClick={toggleMastery}
                    className={`gap-2 min-w-[140px] transition-all ${mastery[currentIndex] ? "bg-green-600 hover:bg-green-700 border-green-600" : ""}`}
                  >
                    {mastery[currentIndex] ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Mastered
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                        Mark Mastered
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {currentSet.flashcards.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === currentIndex
                        ? "bg-primary w-6"
                        : mastery[idx]
                          ? "bg-green-500/50"
                          : "bg-muted"
                        }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">
                  Card {currentIndex + 1} of {currentSet.flashcards.length}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div >
  );
}
