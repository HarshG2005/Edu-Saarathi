import { useState } from "react";
import { Link } from "wouter";
import { ListChecks, Loader2, Download, RefreshCw, ChevronLeft, ChevronRight, Check, X, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import type { MCQSet, MCQ } from "@shared/schema";
import { getStoredProvider } from "@/pages/settings";

export function MCQGeneratorPage() {
  const { documents, currentDocumentId, mcqSets, addMCQSet } = useAppStore();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [count, setCount] = useState<"5" | "10" | "20">("10");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [selectedDocId, setSelectedDocId] = useState(currentDocumentId || "");
  const [activeTab, setActiveTab] = useState<"generate" | "view">("generate");

  const [currentMCQSet, setCurrentMCQSet] = useState<MCQSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const hasDocumentSelected = selectedDocId && selectedDocId !== "none";

  const generateMutation = useMutation({
    mutationFn: async (): Promise<MCQSet> => {
      const payload = {
        documentId: hasDocumentSelected ? selectedDocId : undefined,
        topic: topic || undefined,
        count,
        difficulty,
        provider: getStoredProvider(),
      };
      const response = await apiRequest("POST", "/api/mcq/generate", payload);
      return response.json();
    },
    onSuccess: (data) => {
      addMCQSet(data);
      setCurrentMCQSet(data);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setActiveTab("view");
      toast({
        title: "MCQs generated",
        description: `${data.mcqs.length} questions created successfully.`,
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

  const currentDocument = documents.find((d) => d.id === selectedDocId);
  const currentMCQ = currentMCQSet?.mcqs[currentIndex];

  const handleAnswerSelect = (mcqId: string, optionId: string) => {
    if (!showResults) {
      setSelectedAnswers((prev) => ({ ...prev, [mcqId]: optionId }));
    }
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  const getScore = () => {
    if (!currentMCQSet) return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    currentMCQSet.mcqs.forEach((mcq) => {
      const selected = selectedAnswers[mcq.id];
      const correctOption = mcq.options.find((o) => o.isCorrect);
      if (selected === correctOption?.id) correct++;
    });

    return {
      correct,
      total: currentMCQSet.mcqs.length,
      percentage: Math.round((correct / currentMCQSet.mcqs.length) * 100),
    };
  };

  const handleExport = () => {
    if (!currentMCQSet) return;

    const content = currentMCQSet.mcqs
      .map((mcq, i) => {
        const options = mcq.options
          .map((o, j) => `  ${String.fromCharCode(65 + j)}. ${o.text}${o.isCorrect ? " (Correct)" : ""}`)
          .join("\n");
        return `Q${i + 1}. ${mcq.question}\n${options}\n`;
      })
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mcqs-${currentMCQSet.topic || "generated"}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "MCQs have been exported as a text file.",
    });
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">MCQ Generator</h1>
          <p className="text-muted-foreground">
            Generate multiple choice questions from your documents or any topic
          </p>
        </div>
        <Link href="/settings">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "view")}>
        <TabsList>
          <TabsTrigger value="generate" data-testid="tab-generate">Generate</TabsTrigger>
          <TabsTrigger value="view" data-testid="tab-view" disabled={!currentMCQSet}>
            View MCQs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Generate MCQs
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
                <p className="text-xs text-muted-foreground">
                  Leave empty to generate from the entire document
                </p>
              </div>

              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <RadioGroup
                  value={count}
                  onValueChange={(v) => setCount(v as "5" | "10" | "20")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="count-5" />
                    <Label htmlFor="count-5">5</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10" id="count-10" />
                    <Label htmlFor="count-10">10</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="20" id="count-20" />
                    <Label htmlFor="count-20">20</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <RadioGroup
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as "easy" | "medium" | "hard")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="easy" id="diff-easy" />
                    <Label htmlFor="diff-easy">Easy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="diff-medium" />
                    <Label htmlFor="diff-medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hard" id="diff-hard" />
                    <Label htmlFor="diff-hard">Hard</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || (!hasDocumentSelected && !topic.trim())}
                className="w-full"
                data-testid="button-generate-mcq"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ListChecks className="mr-2 h-4 w-4" />
                    Generate MCQs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {mcqSets.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold">Previously Generated</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mcqSets.slice().reverse().map((set) => (
                  <Card
                    key={set.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => {
                      setCurrentMCQSet(set);
                      setCurrentIndex(0);
                      setSelectedAnswers({});
                      setShowResults(false);
                      setActiveTab("view");
                    }}
                    data-testid={`card-mcqset-${set.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{set.topic || "Generated MCQs"}</p>
                          <p className="text-sm text-muted-foreground">
                            {set.mcqs.length} questions
                          </p>
                        </div>
                        <Badge className={getDifficultyColor(set.mcqs[0]?.difficulty || "medium")}>
                          {set.mcqs[0]?.difficulty || "medium"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="view" className="mt-6">
          {currentMCQSet && currentMCQ && (
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    Question {currentIndex + 1} of {currentMCQSet.mcqs.length}
                  </Badge>
                  <Badge className={getDifficultyColor(currentMCQ.difficulty)}>
                    {currentMCQ.difficulty}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentMCQSet(null);
                      setActiveTab("generate");
                    }}
                    data-testid="button-regenerate"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New Set
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    data-testid="button-export-mcq"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <Card className="mb-6">
                <CardContent className="p-6">
                  <p className="mb-6 text-lg leading-relaxed" data-testid="text-question">
                    {currentMCQ.question}
                  </p>

                  <div className="space-y-3">
                    {currentMCQ.options.map((option, idx) => {
                      const isSelected = selectedAnswers[currentMCQ.id] === option.id;
                      const showCorrect = showResults && option.isCorrect;
                      const showIncorrect = showResults && isSelected && !option.isCorrect;

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleAnswerSelect(currentMCQ.id, option.id)}
                          disabled={showResults}
                          className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${showCorrect
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : showIncorrect
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : isSelected
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50 hover:bg-muted/50"
                            }`}
                          data-testid={`button-option-${option.id}`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium ${showCorrect
                              ? "border-green-500 bg-green-500 text-white"
                              : showIncorrect
                                ? "border-red-500 bg-red-500 text-white"
                                : isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/30"
                              }`}
                          >
                            {showCorrect ? (
                              <Check className="h-4 w-4" />
                            ) : showIncorrect ? (
                              <X className="h-4 w-4" />
                            ) : (
                              String.fromCharCode(65 + idx)
                            )}
                          </div>
                          <span className="flex-1">{option.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {showResults && currentMCQ.explanation && (
                    <div className="mt-4 rounded-lg bg-muted/50 p-4">
                      <p className="text-sm font-medium">Explanation:</p>
                      <p className="text-sm text-muted-foreground">{currentMCQ.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  data-testid="button-prev-question"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {!showResults &&
                  Object.keys(selectedAnswers).length === currentMCQSet.mcqs.length && (
                    <Button onClick={handleShowResults} data-testid="button-show-results">
                      Show Results
                    </Button>
                  )}

                {showResults && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {getScore().correct}/{getScore().total}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getScore().percentage}% correct
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(currentMCQSet.mcqs.length - 1, i + 1))
                  }
                  disabled={currentIndex === currentMCQSet.mcqs.length - 1}
                  data-testid="button-next-question"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {currentMCQSet.mcqs.map((mcq, idx) => {
                  const answered = selectedAnswers[mcq.id];
                  const isCorrect =
                    showResults && answered === mcq.options.find((o) => o.isCorrect)?.id;
                  const isIncorrect = showResults && answered && !isCorrect;

                  return (
                    <button
                      key={mcq.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${idx === currentIndex
                        ? "bg-primary text-primary-foreground"
                        : isCorrect
                          ? "bg-green-500 text-white"
                          : isIncorrect
                            ? "bg-red-500 text-white"
                            : answered
                              ? "bg-muted"
                              : "border hover:bg-muted"
                        }`}
                      data-testid={`button-question-nav-${idx}`}
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
