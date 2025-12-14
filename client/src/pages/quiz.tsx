import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { HelpCircle, Play, Clock, Check, X, Trophy, RotateCcw, ChevronRight, BarChart2, Loader2, Sparkles, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoredProvider } from "@/pages/settings";
import { formatDate, getGradient } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { MCQSet, QuizResult, QuizAnswer } from "@shared/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

type QuizState = "setup" | "active" | "results";

export function QuizPage() {
  const { mcqSets, addMCQSet, quizResults, addQuizResult, documents, currentDocumentId } = useAppStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [quizState, setQuizState] = useState<QuizState>("setup");
  const [selectedSetId, setSelectedSetId] = useState("");
  const [timedMode, setTimedMode] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(30);

  // MCQ generation states
  const [setupTab, setSetupTab] = useState<"existing" | "generate">("existing");
  const [genTopic, setGenTopic] = useState("");
  const [genCount, setGenCount] = useState<"5" | "10" | "20">("10");
  const [genDifficulty, setGenDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [genDocId, setGenDocId] = useState(currentDocumentId || "");

  const [currentMCQSet, setCurrentMCQSet] = useState<MCQSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "incorrect">("all");

  const hasDocumentSelected = genDocId && genDocId !== "none";

  // Fetch MCQ sets to keep store in sync
  const { data: serverMCQSets } = useQuery<MCQSet[]>({
    queryKey: ["/api/mcq"],
    queryFn: async () => {
      const res = await fetch("/api/mcq");
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      return res.json();
    },
  });

  // Use server data if available, otherwise store
  const displayMCQSets = serverMCQSets || mcqSets;

  // MCQ generation mutation
  const generateMCQsMutation = useMutation({
    mutationFn: async (): Promise<MCQSet> => {
      const payload = {
        documentId: hasDocumentSelected ? genDocId : undefined,
        topic: genTopic || undefined,
        count: genCount,
        difficulty: genDifficulty,
        provider: getStoredProvider(),
      };
      const response = await apiRequest("POST", "/api/mcq/generate", payload);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcq"] });
      addMCQSet(data);
      setCurrentMCQSet(data);
      setCurrentIndex(0);
      setAnswers([]);
      setStartTime(Date.now());
      setQuestionStartTime(Date.now());
      if (timedMode) {
        setTimeRemaining(timePerQuestion);
      }
      setQuizState("active");
      toast({
        title: "Quiz started!",
        description: `${(data.mcqs as any[]).length} questions generated. Good luck!`,
      });
    },
    onError: async (error: Error) => {
      // Attempt recovery: check if quiz was actually created despite timeout
      try {
        // Force fetch latest data
        const latestSets = await queryClient.fetchQuery<MCQSet[]>({
          queryKey: ["/api/mcq"],
          staleTime: 0,
        });

        // Find most recent set
        const recentSet = latestSets.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        // If created in last 2 minutes, assume it's ours
        if (recentSet && (Date.now() - new Date(recentSet.createdAt).getTime() < 120000)) {
          addMCQSet(recentSet);
          setCurrentMCQSet(recentSet);
          setCurrentIndex(0);
          setAnswers([]);
          setStartTime(Date.now());
          setQuestionStartTime(Date.now());
          if (timedMode) {
            setTimeRemaining(timePerQuestion);
          }
          setQuizState("active");
          toast({
            title: "Quiz Started",
            description: "Generation took a bit longer, but we found your quiz!",
          });
          return;
        }
      } catch (e) {
        console.error("Recovery failed", e);
      }

      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentMCQ = currentMCQSet?.mcqs[currentIndex];

  useEffect(() => {
    if (quizState === "results") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [quizState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (quizState === "active" && timedMode && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((t) => {
          if (t <= 1) {
            handleTimeUp();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [quizState, timedMode, timeRemaining]);

  const handleTimeUp = useCallback(() => {
    if (currentMCQ) {
      const answer: QuizAnswer = {
        mcqId: currentMCQ.id,
        selectedOptionId: "",
        isCorrect: false,
        timeTaken: timePerQuestion,
      };
      setAnswers((prev) => [...prev, answer]);

      if (currentMCQSet && currentIndex < (currentMCQSet.mcqs as any[]).length - 1) {
        setCurrentIndex((i) => i + 1);
        setTimeRemaining(timePerQuestion);
        setQuestionStartTime(Date.now());
      } else {
        finishQuiz([...answers, answer]);
      }
    }
  }, [currentMCQ, currentMCQSet, currentIndex, answers, timePerQuestion]);

  const startQuiz = () => {
    const mcqSet = displayMCQSets.find((s) => s.id === selectedSetId);
    if (!mcqSet) {
      toast({
        title: "No MCQ set selected",
        description: "Please select an MCQ set to start the quiz.",
        variant: "destructive",
      });
      return;
    }

    setCurrentMCQSet(mcqSet);
    setCurrentIndex(0);
    setAnswers([]);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    if (timedMode) {
      setTimeRemaining(timePerQuestion);
    }
    setQuizState("active");
  };

  const handleAnswer = (optionId: string) => {
    if (!currentMCQ || !currentMCQSet || isSubmitting) return;

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const correctOption = currentMCQ.options.find((o: any) => o.isCorrect);
    const isCorrect = optionId === correctOption?.id;

    const answer: QuizAnswer = {
      mcqId: currentMCQ.id,
      selectedOptionId: optionId,
      isCorrect,
      timeTaken,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentIndex < (currentMCQSet.mcqs as any[]).length - 1) {
      setCurrentIndex((i) => i + 1);
      setQuestionStartTime(Date.now());
      if (timedMode) {
        setTimeRemaining(timePerQuestion);
      }
    } else {
      // Finish quiz immediately after last answer
      finishQuiz(newAnswers);
    }
  };

  const handleSkip = () => {
    if (!currentMCQ || !currentMCQSet || isSubmitting) return;

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const answer: QuizAnswer = {
      mcqId: currentMCQ.id,
      selectedOptionId: "",
      isCorrect: false,
      timeTaken,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentIndex < (currentMCQSet.mcqs as any[]).length - 1) {
      setCurrentIndex((i) => i + 1);
      setQuestionStartTime(Date.now());
      if (timedMode) {
        setTimeRemaining(timePerQuestion);
      }
    } else {
      finishQuiz(newAnswers);
    }
  };

  const handleEarlySubmit = () => {
    finishQuiz(answers);
  };

  const finishQuiz = (finalAnswers: QuizAnswer[]) => {
    if (!currentMCQSet || isSubmitting) return;
    setIsSubmitting(true);

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const correct = finalAnswers.filter((a) => a.isCorrect).length;
    const total = (currentMCQSet.mcqs as any[]).length;
    const percentage = Math.round((correct / total) * 100);

    const resultData = {
      mcqSetId: currentMCQSet.id,
      topic: currentMCQSet.topic || "Quiz",
      answers: finalAnswers,
      score: correct,
      totalQuestions: total,
      percentage,
      timeTaken: totalTime,
      completedAt: new Date().toISOString(),
    };

    // Save to backend
    apiRequest("POST", "/api/quiz/results", resultData)
      .then(async (res) => {
        const savedResult = await res.json();
        addQuizResult(savedResult);
        setCurrentResult(savedResult);
        setQuizState("results");
        toast({
          title: "Quiz Completed!",
          description: `You scored ${percentage}%. Results saved.`,
        });
      })
      .catch((error) => {
        console.error("Failed to save quiz result:", error);
        // Still show results even if save fails, but warn user
        // We need to create a local result object with an ID for the store
        const localResult: QuizResult = {
          ...resultData,
          id: crypto.randomUUID(),
          userId: "local-user", // Placeholder, store might ignore or overwrite
          completedAt: new Date(resultData.completedAt)
        };
        addQuizResult(localResult);
        setCurrentResult(localResult);
        setQuizState("results");
        toast({
          title: "Saved Locally Only",
          description: "Failed to save to server. Progress may not update.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const resetQuiz = () => {
    setQuizState("setup");
    setCurrentMCQSet(null);
    setCurrentIndex(0);
    setAnswers([]);
    setCurrentResult(null);
    setIsSubmitting(false);
    setReviewFilter("all");
  };

  const handleViewResult = (result: QuizResult) => {
    const mcqSet = mcqSets.find(s => s.id === result.mcqSetId);
    if (mcqSet) {
      setCurrentMCQSet(mcqSet);
    }
    setCurrentResult(result);
    setQuizState("results");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")} `;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-400 bg-green-500/10 border-green-500/50";
    if (percentage >= 60) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/50";
    return "text-red-400 bg-red-500/10 border-red-500/50";
  };

  const getChartData = (result: QuizResult) => [
    { name: "Correct", value: result.score, color: "#4ade80" }, // Green 400
    { name: "Incorrect", value: result.totalQuestions - result.score, color: "#ef4444" },
  ];

  return (
    <Section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent" data-testid="text-page-title">Quiz Mode</h1>
        <p className="text-gray-400">
          Test your knowledge with timed or untimed quizzes
        </p>
      </div>
      <div className="flex justify-end">
        <Link href="/settings">
          <Button variant="outline" size="icon" className="border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {quizState === "setup" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <HelpCircle className="h-5 w-5 text-green-400" />
                Start a Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={setupTab} onValueChange={(v) => setSetupTab(v as "existing" | "generate")}>
                <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/5">
                  <TabsTrigger value="existing" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-400">Select Existing</TabsTrigger>
                  <TabsTrigger value="generate" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-400">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate New
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="mcq-set" className="text-white">Select MCQ Set</Label>
                    <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                      <SelectTrigger id="mcq-set" className="bg-white/5 border-white/10 text-white" data-testid="select-mcq-set">
                        <SelectValue placeholder="Choose an MCQ set to quiz on" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-white">
                        {displayMCQSets.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No MCQ sets available - generate some first!
                          </SelectItem>
                        ) : (
                          displayMCQSets
                            .slice()
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .slice(0, 5)
                            .map((set) => (
                              <SelectItem key={set.id} value={set.id} className="hover:bg-white/5 cursor-pointer">
                                {set.topic || "MCQ Set"} ({(set.mcqs as any[]).length} questions) - {formatDate(set.createdAt)}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={startQuiz}
                    disabled={!selectedSetId || displayMCQSets.length === 0}
                    className="w-full bg-green-600 hover:bg-green-500 text-white"
                    data-testid="button-start-quiz"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Quiz
                  </Button>
                </TabsContent>

                <TabsContent value="generate" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="gen-doc" className="text-white">Source Document (Optional)</Label>
                    <Select value={genDocId} onValueChange={setGenDocId}>
                      <SelectTrigger id="gen-doc" className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Or enter a topic below" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-white">
                        <SelectItem value="none" className="hover:bg-white/5 cursor-pointer">No document - use topic only</SelectItem>
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
                    <Label htmlFor="gen-topic" className="text-white">Topic</Label>
                    <Input
                      id="gen-topic"
                      placeholder="e.g., Machine Learning, Solar System, Web Development"
                      value={genTopic}
                      onChange={(e) => setGenTopic(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Question Count</Label>
                      <Select value={genCount} onValueChange={(v) => setGenCount(v as "5" | "10" | "20")}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-white">
                          <SelectItem value="5" className="hover:bg-white/5 cursor-pointer">5 questions</SelectItem>
                          <SelectItem value="10" className="hover:bg-white/5 cursor-pointer">10 questions</SelectItem>
                          <SelectItem value="20" className="hover:bg-white/5 cursor-pointer">20 questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Difficulty</Label>
                      <Select value={genDifficulty} onValueChange={(v) => setGenDifficulty(v as "easy" | "medium" | "hard")}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-white">
                          <SelectItem value="easy" className="hover:bg-white/5 cursor-pointer">Easy</SelectItem>
                          <SelectItem value="medium" className="hover:bg-white/5 cursor-pointer">Medium</SelectItem>
                          <SelectItem value="hard" className="hover:bg-white/5 cursor-pointer">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() => generateMCQsMutation.mutate()}
                    disabled={generateMCQsMutation.isPending || (!hasDocumentSelected && !genTopic)}
                    className="w-full bg-green-600 hover:bg-green-500 text-white"
                  >
                    {generateMCQsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate & Start Quiz
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <Label htmlFor="timed-mode" className="text-white">Timed Mode</Label>
                    <p className="text-xs text-gray-400">
                      Set a time limit per question
                    </p>
                  </div>
                </div>
                <Switch
                  id="timed-mode"
                  checked={timedMode}
                  onCheckedChange={setTimedMode}
                  data-testid="switch-timed-mode"
                  className="data-[state=checked]:bg-green-500"
                />
              </div>

              {timedMode && (
                <div className="space-y-2">
                  <Label className="text-white">Seconds per Question</Label>
                  <Select
                    value={timePerQuestion.toString()}
                    onValueChange={(v) => setTimePerQuestion(parseInt(v))}
                  >
                    <SelectTrigger data-testid="select-time" className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-white">
                      <SelectItem value="15" className="hover:bg-white/5 cursor-pointer">15 seconds</SelectItem>
                      <SelectItem value="30" className="hover:bg-white/5 cursor-pointer">30 seconds</SelectItem>
                      <SelectItem value="45" className="hover:bg-white/5 cursor-pointer">45 seconds</SelectItem>
                      <SelectItem value="60" className="hover:bg-white/5 cursor-pointer">60 seconds</SelectItem>
                      <SelectItem value="90" className="hover:bg-white/5 cursor-pointer">90 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {quizResults.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="h-5 w-5 text-green-400" />
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quizResults
                    .slice()
                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                    .slice(0, 5)
                    .map((result, index) => (
                      <div
                        key={result.id}
                        className="group relative overflow-hidden rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                        onClick={() => handleViewResult(result)}
                        data-testid={`result-${result.id}`}
                      >
                        {/* Gradient header/background */}
                        <div className={`p-4 bg-gradient-to-br ${getGradient(index)}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white">
                                <Trophy className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-white line-clamp-1">{result.topic}</p>
                                <p className="text-xs text-white/80">
                                  {formatDate(result.completedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold text-white shadow-sm">
                              {result.percentage}%
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="bg-neutral-900 p-4 border border-white/5 border-t-0 group-hover:border-white/10">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-gray-400">
                              <span>{result.score}/{result.totalQuestions} correct</span>
                              {result.timeTaken && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(result.timeTaken)}
                                </span>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-green-400 hover:text-green-300 hover:bg-transparent">
                              View Details &rarr;
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {quizState === "active" && currentMCQ && currentMCQSet && (
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <Badge variant="outline" className="text-white border-white/10 bg-white/5">
              Question {currentIndex + 1} of {(currentMCQSet.mcqs as any[]).length}
            </Badge>
            {timedMode && (
              <Badge
                variant={timeRemaining <= 10 ? "destructive" : "secondary"}
                className="text-lg"
              >
                <Clock className="mr-1 h-4 w-4" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>

          <Progress
            value={(currentIndex / (currentMCQSet.mcqs as any[]).length) * 100}
            className="mb-6 h-2 bg-white/10"
          />

          <Card className="mb-6 border-white/10 shadow-md bg-[#0b0f12]">
            <CardContent className="p-6">
              <p className="mb-6 text-lg leading-relaxed text-white font-medium" data-testid="text-question">
                {currentMCQ.question}
              </p>

              <div className="space-y-3">
                {currentMCQ.options.map((option: any, idx: number) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    disabled={isSubmitting}
                    className={`flex w-full items-center gap-3 rounded-lg border border-white/10 p-4 text-left transition-all hover:border-green-500 hover:bg-green-500/10 group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    data-testid={`button - option - ${option.id} `}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/10 text-sm font-medium text-gray-400 group-hover:border-green-500 group-hover:text-green-400">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1 text-white">{option.text}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-400" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {quizState === "results" && currentResult && (
        <div className="mx-auto w-full max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="h-full bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="relative h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getChartData(currentResult)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getChartData(currentResult).map((entry, index) => (
                          <Cell key={`cell - ${index} `} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center">
                    <p className="text-3xl font-bold text-white">{currentResult.percentage}%</p>
                    <p className="text-xs text-gray-400">Score</p>
                  </div>
                </div>

                <div className="mt-6 grid w-full grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-green-500/10 p-3 border border-green-500/20">
                    <p className="text-2xl font-bold text-green-400">{currentResult.score}</p>
                    <p className="text-xs text-gray-400">Correct</p>
                  </div>
                  <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                    <p className="text-2xl font-bold text-red-400">
                      {currentResult.totalQuestions - currentResult.score}
                    </p>
                    <p className="text-xs text-muted-foreground">Incorrect</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                    <p className="text-2xl font-bold text-white">
                      {currentResult.timeTaken ? formatTime(currentResult.timeTaken) : "--:--"}
                    </p>
                    <p className="text-xs text-gray-400">Time Taken</p>
                  </div>
                </div>

                <Button onClick={resetQuiz} className="mt-6 w-full border-white/10 text-white hover:bg-white/5" variant="outline" data-testid="button-try-again">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Take Another Quiz
                </Button>
                <Button onClick={() => setLocation("/progress")} className="mt-2 w-full text-gray-400 hover:text-white hover:bg-white/5" variant="ghost">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Go to Progress Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full overflow-hidden bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart2 className="h-5 w-5 text-green-400" />
                  Detailed Review
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="review-filter" className="text-sm text-gray-400">Show:</Label>
                  <Select value={reviewFilter} onValueChange={(v: "all" | "incorrect") => setReviewFilter(v)}>
                    <SelectTrigger id="review-filter" className="h-8 w-[120px] bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-white">
                      <SelectItem value="all" className="hover:bg-white/5 cursor-pointer">All Questions</SelectItem>
                      <SelectItem value="incorrect" className="hover:bg-white/5 cursor-pointer">Incorrect Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto pr-2">
                <div className="space-y-4">
                  {(() => {
                    // Robustly get the MCQ set for review
                    const reviewSet = currentMCQSet || mcqSets.find(s => s.id === currentResult.mcqSetId);
                    if (!reviewSet) return <p className="text-center text-muted-foreground">Original questions not found.</p>;

                    return (reviewSet.mcqs as any[])
                      .filter((_, idx) => {
                        if (reviewFilter === "all") return true;
                        const answer = (currentResult.answers as any[])[idx];
                        return !answer?.isCorrect;
                      })
                      .map((mcq: any, idx: number) => {
                        // Find original index for question numbering
                        const originalIdx = (reviewSet.mcqs as any[]).findIndex(m => m.id === mcq.id);
                        const answer = (currentResult.answers as any[])[originalIdx];
                        const correctOption = mcq.options.find((o: any) => o.isCorrect);
                        const selectedOption = mcq.options.find((o: any) => o.id === answer?.selectedOptionId);

                        return (
                          <div
                            key={mcq.id}
                            className={`rounded - lg border p - 4 transition - all ${answer?.isCorrect
                              ? "border-green-500/50 bg-green-500/10"
                              : "border-red-500/50 bg-red-500/10"
                              } `}
                            data-testid={`review - ${mcq.id} `}
                          >
                            <div className="mb-2 flex items-start gap-2">
                              {answer?.isCorrect ? (
                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                              ) : (
                                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                              )}
                              <p className="font-medium text-sm text-white">
                                <span className="mr-2 font-bold text-gray-400">Q{originalIdx + 1}</span>
                                {mcq.question}
                              </p>
                              <div className="ml-auto flex items-center gap-2">
                                {mcq.difficulty && (
                                  <Badge variant="outline" className="capitalize text-xs border-white/10 text-gray-400">
                                    {mcq.difficulty}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="ml-7 space-y-2 text-sm">
                              <div className="flex items-center gap-2 rounded bg-white/5 border border-green-500/20 px-2 py-1">
                                <Check className="h-3 w-3 text-green-400" />
                                <span className="font-medium text-green-400">
                                  Correct: {correctOption?.text}
                                </span>
                              </div>
                              {!answer?.isCorrect && selectedOption && (
                                <div className="flex items-center gap-2 rounded bg-white/5 border border-red-500/20 px-2 py-1">
                                  <X className="h-3 w-3 text-red-400" />
                                  <span className="font-medium text-red-400">
                                    Your Answer: {selectedOption.text}
                                  </span>
                                </div>
                              )}
                              {!answer?.selectedOptionId && (
                                <p className="text-gray-400 italic">Skipped / Time ran out</p>
                              )}
                              {mcq.explanation && (
                                <div className="mt-2 rounded bg-white/5 p-2 text-xs text-gray-400 border border-white/10">
                                  <span className="font-bold text-white">Explanation:</span> {mcq.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-[#0b0f12] p-8 shadow-xl border border-white/10">
            <Loader2 className="h-12 w-12 animate-spin text-green-500" />
            <p className="text-lg font-medium text-white">Submitting Quiz...</p>
          </div>
        </div>
      )}
    </Section>
  );
}
