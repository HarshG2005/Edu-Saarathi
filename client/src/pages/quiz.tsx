import { useState, useEffect, useCallback } from "react";
import { HelpCircle, Play, Clock, Check, X, Trophy, RotateCcw, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { MCQSet, QuizResult, QuizAnswer } from "@shared/schema";

type QuizState = "setup" | "active" | "results";

export function QuizPage() {
  const { mcqSets, quizResults, addQuizResult } = useAppStore();
  const { toast } = useToast();

  const [quizState, setQuizState] = useState<QuizState>("setup");
  const [selectedSetId, setSelectedSetId] = useState("");
  const [timedMode, setTimedMode] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(30);

  const [currentMCQSet, setCurrentMCQSet] = useState<MCQSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);

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
      completedAt: new Date().toISOString(),
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
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

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
                      mcqSets.map((set) => (
                        <SelectItem key={set.id} value={set.id}>
                          {set.topic || "MCQ Set"} ({set.mcqs.length} questions)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

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

              <Button
                onClick={startQuiz}
                disabled={!selectedSetId || mcqSets.length === 0}
                className="w-full"
                data-testid="button-start-quiz"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Quiz
              </Button>
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
                  {quizResults.slice(-5).reverse().map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                      data-testid={`result-${result.id}`}
                    >
                      <div>
                        <p className="font-medium">{result.topic}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.score}/{result.totalQuestions} correct
                          {result.timeTaken && ` • ${formatTime(result.timeTaken)}`}
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
                    data-testid={`button-option-${option.id}`}
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
        <div className="mx-auto w-full max-w-2xl">
          <Card className="mb-6 text-center">
            <CardContent className="p-8">
              <div className="mb-6 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="mb-2 text-2xl font-bold">Quiz Complete!</h2>
              <p className="mb-6 text-muted-foreground">{currentResult.topic}</p>

              <div className="mb-6 flex justify-center gap-8">
                <div className="text-center">
                  <p
                    className={`text-5xl font-bold ${getScoreColor(currentResult.percentage)}`}
                    data-testid="text-score"
                  >
                    {currentResult.percentage}%
                  </p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-bold">
                    {currentResult.score}/{currentResult.totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                {currentResult.timeTaken && (
                  <div className="text-center">
                    <p className="text-5xl font-bold">
                      {formatTime(currentResult.timeTaken)}
                    </p>
                    <p className="text-sm text-muted-foreground">Time</p>
                  </div>
                )}
              </div>

              <Button onClick={resetQuiz} data-testid="button-try-again">
                <RotateCcw className="mr-2 h-4 w-4" />
                Take Another Quiz
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Answer Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentMCQSet.mcqs.map((mcq, idx) => {
                const answer = currentResult.answers[idx];
                const correctOption = mcq.options.find((o) => o.isCorrect);
                const selectedOption = mcq.options.find((o) => o.id === answer?.selectedOptionId);

                return (
                  <div
                    key={mcq.id}
                    className={`rounded-lg border p-4 ${
                      answer?.isCorrect
                        ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                        : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
                    }`}
                    data-testid={`review-${mcq.id}`}
                  >
                    <div className="mb-2 flex items-start gap-2">
                      {answer?.isCorrect ? (
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      ) : (
                        <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                      )}
                      <p className="font-medium">
                        Q{idx + 1}. {mcq.question}
                      </p>
                    </div>
                    <div className="ml-7 space-y-1 text-sm">
                      <p className="text-green-700 dark:text-green-400">
                        Correct: {correctOption?.text}
                      </p>
                      {!answer?.isCorrect && selectedOption && (
                        <p className="text-red-700 dark:text-red-400">
                          Your answer: {selectedOption.text}
                        </p>
                      )}
                      {!answer?.selectedOptionId && (
                        <p className="text-muted-foreground">Not answered (time ran out)</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
