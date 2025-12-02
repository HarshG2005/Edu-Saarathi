import { useState, useEffect, useCallback } from "react";
import { HelpCircle, Play, Clock, Check, X, Trophy, RotateCcw, ChevronRight, BarChart2, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoredProvider, AISettings } from "@/components/ai-settings";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
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
import type { MCQSet, QuizResult, QuizAnswer } from "@shared/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

type QuizState = "setup" | "active" | "results";

export function QuizPage() {
  const { mcqSets, quizResults, addQuizResult, documents, currentDocumentId, addMCQSet } = useAppStore();
  const { toast } = useToast();

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

  const hasDocumentSelected = genDocId && genDocId !== "none";

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
        description: `${data.mcqs.length} questions generated. Good luck!`,
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

  const currentMCQ = currentMCQSet?.mcqs[currentIndex];

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

      if (currentMCQSet && currentIndex < currentMCQSet.mcqs.length - 1) {
        setCurrentIndex((i) => i + 1);
        setTimeRemaining(timePerQuestion);
        setQuestionStartTime(Date.now());
      } else {
        finishQuiz([...answers, answer]);
      }
    }
  }, [currentMCQ, currentMCQSet, currentIndex, answers, timePerQuestion]);

  const startQuiz = () => {
    const mcqSet = mcqSets.find((s) => s.id === selectedSetId);
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
    if (!currentMCQ || !currentMCQSet) return;

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const correctOption = currentMCQ.options.find((o) => o.isCorrect);
    const isCorrect = optionId === correctOption?.id;

    const answer: QuizAnswer = {
      mcqId: currentMCQ.id,
      selectedOptionId: optionId,
      isCorrect,
      timeTaken,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentIndex < currentMCQSet.mcqs.length - 1) {
      setCurrentIndex((i) => i + 1);
      setQuestionStartTime(Date.now());
      if (timedMode) {
        setTimeRemaining(timePerQuestion);
      }
    } else {
      finishQuiz(newAnswers);
    }
  };

  const handleSkip = () => {
    if (!currentMCQ || !currentMCQSet) return;

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const answer: QuizAnswer = {
      mcqId: currentMCQ.id,
      selectedOptionId: "",
      isCorrect: false,
      timeTaken,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentIndex < currentMCQSet.mcqs.length - 1) {
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
    if (!currentMCQSet) return;

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const correct = finalAnswers.filter((a) => a.isCorrect).length;
    const total = currentMCQSet.mcqs.length;
    const percentage = Math.round((correct / total) * 100);

    const result: QuizResult = {
      id: crypto.randomUUID(),
      mcqSetId: currentMCQSet.id,
      topic: currentMCQSet.topic || "Quiz",
      answers: finalAnswers,
      score: correct,
      totalQuestions: total,
      percentage,
      timeTaken: totalTime,
      completedAt: new Date(),
    };

    addQuizResult(result);
    setCurrentResult(result);
    setQuizState("results");
  };

  const resetQuiz = () => {
    setQuizState("setup");
    setCurrentMCQSet(null);
    setCurrentIndex(0);
    setAnswers([]);
    setCurrentResult(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")} `;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getChartData = (result: QuizResult) => [
    { name: "Correct", value: result.score, color: "#22c55e" },
    { name: "Incorrect", value: result.totalQuestions - result.score, color: "#ef4444" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Quiz Mode</h1>
        <p className="text-muted-foreground">
          Test your knowledge with timed or untimed quizzes
        </p>
      </div>

      {quizState === "setup" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Start a Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={setupTab} onValueChange={(v) => setSetupTab(v as "existing" | "generate")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing">Select Existing</TabsTrigger>
                  <TabsTrigger value="generate">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate New
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="mcq-set">Select MCQ Set</Label>
                    <Select value={selectedSetId} onValueChange={setSelectedSetId}>
                      <SelectTrigger id="mcq-set" data-testid="select-mcq-set">
                        <SelectValue placeholder="Choose an MCQ set to quiz on" />
                      </SelectTrigger>
                      <SelectContent>
                        {mcqSets.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No MCQ sets available - generate some first!
                          </SelectItem>
                        ) : (
                          mcqSets.slice().reverse().slice(0, 5).map((set) => (
                            <SelectItem key={set.id} value={set.id}>
                              {set.topic || "MCQ Set"} ({set.mcqs.length} questions) - {formatDate(set.createdAt)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={startQuiz}
                    disabled={!selectedSetId || mcqSets.length === 0}
                    className="w-full"
                    data-testid="button-start-quiz"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Quiz
                  </Button>
                </TabsContent>

                <TabsContent value="generate" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="gen-doc">Source Document (Optional)</Label>
                    <Select value={genDocId} onValueChange={setGenDocId}>
                      <SelectTrigger id="gen-doc">
                        <SelectValue placeholder="Or enter a topic below" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No document - use topic only</SelectItem>
                        {documents.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gen-topic">Topic</Label>
                    <Input
                      id="gen-topic"
                      placeholder="e.g., Machine Learning, Solar System, Web Development"
                      value={genTopic}
                      onChange={(e) => setGenTopic(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question Count</Label>
                      <Select value={genCount} onValueChange={(v) => setGenCount(v as "5" | "10" | "20")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 questions</SelectItem>
                          <SelectItem value="10">10 questions</SelectItem>
                          <SelectItem value="20">20 questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select value={genDifficulty} onValueChange={(v) => setGenDifficulty(v as "easy" | "medium" | "hard")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() => generateMCQsMutation.mutate()}
                    disabled={generateMCQsMutation.isPending || (!hasDocumentSelected && !genTopic)}
                    className="w-full"
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

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="timed-mode">Timed Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Set a time limit per question
                    </p>
                  </div>
                </div>
                <Switch
                  id="timed-mode"
                  checked={timedMode}
                  onCheckedChange={setTimedMode}
                  data-testid="switch-timed-mode"
                />
              </div>

              {timedMode && (
                <div className="space-y-2">
                  <Label>Seconds per Question</Label>
                  <Select
                    value={timePerQuestion.toString()}
                    onValueChange={(v) => setTimePerQuestion(parseInt(v))}
                  >
                    <SelectTrigger data-testid="select-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="45">45 seconds</SelectItem>
                      <SelectItem value="60">60 seconds</SelectItem>
                      <SelectItem value="90">90 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {quizResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quizResults
                    .slice()
                    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                    .slice(0, 5)
                    .map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                        data-testid={`result - ${result.id} `}
                      >
                        <div>
                          <p className="font-medium">{result.topic}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.score}/{result.totalQuestions} correct
                            {result.timeTaken && ` • ${formatTime(result.timeTaken)} `}
                          </p>
                        </div>
                        <Badge className={getScoreColor(result.percentage)}>
                          {result.percentage}%
                        </Badge>
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
            <Badge variant="outline">
              Question {currentIndex + 1} of {currentMCQSet.mcqs.length}
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
            value={(currentIndex / currentMCQSet.mcqs.length) * 100}
            className="mb-6 h-2"
          />

          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="mb-6 text-lg leading-relaxed" data-testid="text-question">
                {currentMCQ.question}
              </p>

              <div className="space-y-3">
                {currentMCQ.options.map((option, idx) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-muted/50"
                    data-testid={`button - option - ${option.id} `}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1">{option.text}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {quizState === "results" && currentResult && currentMCQSet && (
        <div className="mx-auto w-full max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                    <p className="text-3xl font-bold">{currentResult.percentage}%</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>

                <div className="mt-6 grid w-full grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-2xl font-bold text-green-600">{currentResult.score}</p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-2xl font-bold text-red-600">
                      {currentResult.totalQuestions - currentResult.score}
                    </p>
                    <p className="text-xs text-muted-foreground">Incorrect</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-2xl font-bold">
                      {currentResult.timeTaken ? formatTime(currentResult.timeTaken) : "--:--"}
                    </p>
                    <p className="text-xs text-muted-foreground">Time Taken</p>
                  </div>
                </div>

                <Button onClick={resetQuiz} className="mt-6 w-full" data-testid="button-try-again">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Take Another Quiz
                </Button>
              </CardContent>
            </Card>

            <Card className="h-full overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Detailed Review
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto pr-2">
                <div className="space-y-4">
                  {currentMCQSet.mcqs.map((mcq, idx) => {
                    const answer = currentResult.answers[idx];
                    const correctOption = mcq.options.find((o) => o.isCorrect);
                    const selectedOption = mcq.options.find((o) => o.id === answer?.selectedOptionId);

                    return (
                      <div
                        key={mcq.id}
                        className={`rounded - lg border p - 4 transition - all ${answer?.isCorrect
                          ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10"
                          : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-900/10"
                          } `}
                        data-testid={`review - ${mcq.id} `}
                      >
                        <div className="mb-2 flex items-start gap-2">
                          {answer?.isCorrect ? (
                            <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                          ) : (
                            <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                          )}
                          <p className="font-medium text-sm">
                            <span className="mr-2 font-bold text-muted-foreground">Q{idx + 1}</span>
                            {mcq.question}
                          </p>
                        </div>
                        <div className="ml-7 space-y-2 text-sm">
                          <div className="flex items-center gap-2 rounded bg-green-100/50 px-2 py-1 dark:bg-green-900/30">
                            <Check className="h-3 w-3 text-green-600" />
                            <span className="font-medium text-green-700 dark:text-green-400">
                              Correct: {correctOption?.text}
                            </span>
                          </div>
                          {!answer?.isCorrect && selectedOption && (
                            <div className="flex items-center gap-2 rounded bg-red-100/50 px-2 py-1 dark:bg-red-900/30">
                              <X className="h-3 w-3 text-red-600" />
                              <span className="font-medium text-red-700 dark:text-red-400">
                                Your Answer: {selectedOption.text}
                              </span>
                            </div>
                          )}
                          {!answer?.selectedOptionId && (
                            <p className="text-muted-foreground italic">Skipped / Time ran out</p>
                          )}
                          {mcq.explanation && (
                            <div className="mt-2 rounded bg-muted p-2 text-xs text-muted-foreground">
                              <span className="font-bold">Explanation:</span> {mcq.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
