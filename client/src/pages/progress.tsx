import { LayoutDashboard, TrendingUp, BookOpen, Brain, Target, Clock, Trophy, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export function ProgressPage() {
  const { documents, quizResults, flashcardSets, mcqSets, summaries, mindmaps, notes } =
    useAppStore();

  const totalFlashcards = flashcardSets.reduce((sum, set) => sum + set.flashcards.length, 0);
  const masteredFlashcards = flashcardSets.reduce(
    (sum, set) => sum + set.flashcards.filter((c) => c.mastered).length,
    0
  );
  const flashcardProgress = totalFlashcards > 0 ? Math.round((masteredFlashcards / totalFlashcards) * 100) : 0;

  const averageQuizScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length
        )
      : 0;

  const topicPerformance = quizResults.reduce((acc: Record<string, { total: number; correct: number; attempts: number }>, result) => {
    if (!acc[result.topic]) {
      acc[result.topic] = { total: 0, correct: 0, attempts: 0 };
    }
    acc[result.topic].total += result.totalQuestions;
    acc[result.topic].correct += result.score;
    acc[result.topic].attempts += 1;
    return acc;
  }, {});

  const topicData = Object.entries(topicPerformance).map(([topic, data]) => ({
    topic: topic.length > 15 ? topic.slice(0, 15) + "..." : topic,
    accuracy: Math.round((data.correct / data.total) * 100),
    attempts: data.attempts,
  }));

  const quizTrendData = quizResults.slice(-10).map((result, idx) => ({
    quiz: idx + 1,
    score: result.percentage,
  }));

  const contentDistribution = [
    { name: "MCQs", value: mcqSets.reduce((sum, s) => sum + s.mcqs.length, 0), color: "hsl(var(--chart-1))" },
    { name: "Flashcards", value: totalFlashcards, color: "hsl(var(--chart-2))" },
    { name: "Summaries", value: summaries.length, color: "hsl(var(--chart-3))" },
    { name: "Mindmaps", value: mindmaps.length, color: "hsl(var(--chart-4))" },
    { name: "Notes", value: notes.length, color: "hsl(var(--chart-5))" },
  ].filter((item) => item.value > 0);

  const recentActivity = [
    ...quizResults.slice(-3).map((r) => ({
      type: "quiz",
      description: `Completed quiz on ${r.topic} - ${r.percentage}%`,
      timestamp: r.completedAt,
    })),
    ...mcqSets.slice(-3).map((s) => ({
      type: "mcq",
      description: `Generated ${s.mcqs.length} MCQs on ${s.topic || "a topic"}`,
      timestamp: s.createdAt,
    })),
    ...flashcardSets.slice(-3).map((s) => ({
      type: "flashcard",
      description: `Created ${s.flashcards.length} flashcards on ${s.topic || "a topic"}`,
      timestamp: s.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <Trophy className="h-4 w-4" />;
      case "mcq":
        return <Target className="h-4 w-4" />;
      case "flashcard":
        return <Brain className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const statCards = [
    {
      title: "Documents",
      value: documents.length,
      icon: FileText,
      description: "Uploaded PDFs",
    },
    {
      title: "Quizzes Taken",
      value: quizResults.length,
      icon: Target,
      description: `Avg: ${averageQuizScore}%`,
    },
    {
      title: "Flashcard Mastery",
      value: `${flashcardProgress}%`,
      icon: Brain,
      description: `${masteredFlashcards}/${totalFlashcards} cards`,
    },
    {
      title: "Study Materials",
      value: mcqSets.length + summaries.length + mindmaps.length + notes.length,
      icon: BookOpen,
      description: "Generated content",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Progress Dashboard</h1>
        <p className="text-muted-foreground">
          Track your learning journey and study performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(" ", "-")}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {quizTrendData.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quiz Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quizTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="quiz"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {topicData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Topic Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="topic"
                      width={100}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {contentDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Content Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contentDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {contentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                    data-testid={`activity-${idx}`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-2 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No activity yet. Start studying to see your progress!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {totalFlashcards > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Flashcard Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flashcardSets.map((set) => {
                const mastered = set.flashcards.filter((c) => c.mastered).length;
                const progress = Math.round((mastered / set.flashcards.length) * 100);

                return (
                  <div key={set.id} className="space-y-2" data-testid={`flashcard-progress-${set.id}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{set.topic || "Flashcard Set"}</span>
                      <Badge variant="secondary">
                        {mastered}/{set.flashcards.length} mastered
                      </Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
