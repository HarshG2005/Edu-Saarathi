import { useState, useEffect } from "react";
import { Lightbulb, Loader2, Download, Shuffle, ChevronLeft, ChevronRight, Check, RotateCcw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FlashcardSet } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredProvider, AISettings } from "@/components/ai-settings";
import { formatDate } from "@/lib/utils";

export function FlashcardsPage() {
  const { documents, currentDocumentId, flashcardSets, addFlashcardSet, updateFlashcardMastery } = useAppStore();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [count, setCount] = useState([15]);
  const [selectedDocId, setSelectedDocId] = useState(currentDocumentId || "");
  const [activeTab, setActiveTab] = useState<"generate" | "study">("generate");

  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  const hasDocumentSelected = selectedDocId && selectedDocId !== "none";

  const generateMutation = useMutation({
    mutationFn: async (): Promise<FlashcardSet> => {
      const payload = {
        documentId: hasDocumentSelected ? selectedDocId : undefined,
        topic: topic || undefined,
        count: count[0],
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
      setShuffledIndices(data.flashcards.map((_, i) => i));
      setActiveTab("study");
      toast({
        title: "Flashcards created",
        description: `${data.flashcards.length} flashcards generated successfully.`,
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

  useEffect(() => {
    if (currentSet) {
      setShuffledIndices(currentSet.flashcards.map((_, i) => i));
    }
  }, [currentSet?.id]);

  const currentCardIndex = shuffledIndices[currentIndex] ?? currentIndex;
  const currentCard = currentSet?.flashcards[currentCardIndex];

  const handleShuffle = () => {
    if (!currentSet) return;

    if (isShuffled) {
      setShuffledIndices(currentSet.flashcards.map((_, i) => i));
      setIsShuffled(false);
    } else {
      const shuffled = [...shuffledIndices].sort(() => Math.random() - 0.5);
      setShuffledIndices(shuffled);
      setIsShuffled(true);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (currentSet && currentIndex < currentSet.flashcards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkMastered = () => {
    if (currentSet && currentCard) {
      updateFlashcardMastery(currentSet.id, currentCard.id, !currentCard.mastered);
    }
  };

  const getMasteryProgress = () => {
    if (!currentSet) return 0;
    const mastered = currentSet.flashcards.filter((c) => c.mastered).length;
    return Math.round((mastered / currentSet.flashcards.length) * 100);
  };

  const handleExport = () => {
    if (!currentSet) return;

    const content = currentSet.flashcards
      .map((card, i) => `Card ${i + 1}:\nFront: ${card.front}\nBack: ${card.back}\n`)
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flashcards-${currentSet.topic || "generated"}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Flashcards have been exported as a text file.",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Flashcards</h1>
          <p className="text-muted-foreground">
            Create and study flashcards from your documents or any topic
          </p>
        </div>
        <AISettings />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "study")}>
        <TabsList>
          <TabsTrigger value="generate" data-testid="tab-generate">Generate</TabsTrigger>
          <TabsTrigger value="study" data-testid="tab-study" disabled={!currentSet}>
            Study
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Generate Flashcards
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
                  placeholder="e.g., Photosynthesis, World War II, Calculus"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  data-testid="input-topic"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Number of Cards</Label>
                  <Badge variant="secondary">{count[0]} cards</Badge>
                </div>
                <Slider
                  value={count}
                  onValueChange={setCount}
                  min={5}
                  max={30}
                  step={1}
                  data-testid="slider-count"
                />
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
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Flashcards
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {flashcardSets.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold">Your Flashcard Sets</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {flashcardSets.slice().reverse().slice(0, 5).map((set) => {
                  const mastered = set.flashcards.filter((c) => c.mastered).length;
                  const progress = Math.round((mastered / set.flashcards.length) * 100);

                  return (
                    <Card
                      key={set.id}
                      className="cursor-pointer hover-elevate"
                      onClick={() => {
                        setCurrentSet(set);
                        setCurrentIndex(0);
                        setIsFlipped(false);
                        setShuffledIndices(set.flashcards.map((_, i) => i));
                        setActiveTab("study");
                      }}
                      data-testid={`card-flashcardset-${set.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{set.topic || "Flashcard Set"}</p>
                            <p className="text-sm text-muted-foreground">
                              {set.flashcards.length} cards • {mastered} mastered
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(set.createdAt)}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Progress value={progress} className="h-2" />
                          <p className="mt-1 text-xs text-muted-foreground">{progress}% complete</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="study" className="mt-6">
          {currentSet && currentCard && (
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    Card {currentIndex + 1} of {currentSet.flashcards.length}
                  </Badge>
                  {currentCard.mastered && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <Check className="mr-1 h-3 w-3" />
                      Mastered
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShuffle}
                    data-testid="button-shuffle"
                  >
                    <Shuffle className="mr-2 h-4 w-4" />
                    {isShuffled ? "Unshuffle" : "Shuffle"}
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

              <div className="mb-4">
                <Progress value={getMasteryProgress()} className="h-2" />
                <p className="mt-1 text-sm text-muted-foreground">
                  {getMasteryProgress()}% mastered
                </p>
              </div>

              <div
                className="perspective-1000 mb-6 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
                data-testid="flashcard-container"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentCardIndex}-${isFlipped}`}
                    initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`min-h-80 border-0 shadow-xl ${isFlipped
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                      : "bg-gradient-to-br from-blue-500 to-violet-600 text-white"
                      }`}>
                      <CardContent className="flex min-h-80 flex-col items-center justify-center p-12 text-center">
                        <p className="text-3xl font-bold leading-relaxed tracking-wide" data-testid="text-flashcard-content">
                          {isFlipped ? currentCard.back : currentCard.front}
                        </p>
                        <p className="mt-8 text-sm font-medium text-white/70">
                          Click to {isFlipped ? "see question" : "reveal answer"}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  data-testid="button-prev-card"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button
                  variant={currentCard.mastered ? "secondary" : "default"}
                  onClick={handleMarkMastered}
                  data-testid="button-mark-mastered"
                >
                  {currentCard.mastered ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Unmark Mastered
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Mastered
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentIndex === currentSet.flashcards.length - 1}
                  data-testid="button-next-card"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {currentSet.flashcards.map((card, idx) => {
                  const displayIdx = shuffledIndices.indexOf(idx);
                  const actualIdx = shuffledIndices[idx];
                  const cardAtIdx = currentSet.flashcards[actualIdx];

                  return (
                    <button
                      key={card.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsFlipped(false);
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${idx === currentIndex
                        ? "bg-primary text-primary-foreground"
                        : cardAtIdx?.mastered
                          ? "bg-green-500 text-white"
                          : "border hover:bg-muted"
                        }`}
                      data-testid={`button-card-nav-${idx}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
