import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { Loader2, TrendingUp, BookOpen, Brain, Target, Award, Clock, Flame, Trophy, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Section } from "@/components/ui/section";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type StatsData = {
  totalQuizzes: number;
  averageScore: number;
  totalFlashcardsMastered: number;
  totalFlashcards: number;
  studyTime: number; // in minutes
  streak: number;
  quizScores: { date: string; score: number; topic: string }[];
  topicMastery: { name: string; value: number }[];
  recentActivity: { type: string; topic: string; date: string; score?: number }[];
  studyGuideStats: {
    highlights: number;
    notes: number;
    flashcards: number;
  };
};

export function ProgressPage() {
  const { documents } = useAppStore();
  const [selectedDocId, setSelectedDocId] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats", selectedDocId, timeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDocId !== "all") params.append("documentId", selectedDocId);
      params.append("range", timeRange);
      const res = await fetch(`/api/stats?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    );
  }

  // Helper to format minutes into hours and minutes
  const formatStudyTime = (minutes: number) => {
    if (!minutes) return "0m";
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  // GFG Color Palette for Charts
  const COLORS = ["#2F8D46", "#66C27C", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <Section className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent">Progress Dashboard</h1>
          <p className="text-gray-400">Track your learning journey and improvements</p>
        </div>
        <Link href="/settings">
          <Button variant="outline" size="icon" className="border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Card className="bg-card border-border overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Your Momentum</h3>
                <p className="text-sm text-muted-foreground">Keep pushing forward!</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-12 w-full md:w-auto">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5" />
                  Study Time
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground">
                  {formatStudyTime(stats?.studyTime || 0)}
                </p>
                <span className="text-xs text-primary font-medium">this week</span>
              </div>

              <div className="text-center border-l border-r border-border px-4">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  <BookOpen className="h-3.5 w-3.5" />
                  Mastered
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground">
                  {stats?.totalFlashcardsMastered || 0}
                </p>
                <span className="text-xs text-muted-foreground">topics</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  Streak
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground">
                  {stats?.streak || 0}
                </p>
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedDocId} onValueChange={setSelectedDocId}>
            <SelectTrigger className="w-[250px] bg-muted border-border text-foreground">
              <SelectValue placeholder="Filter by Document" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="all" className="hover:bg-muted cursor-pointer">All Documents</SelectItem>
              {[...documents]
                .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                .map((doc) => (
                  <SelectItem key={doc.id} value={doc.id} className="hover:bg-muted cursor-pointer">
                    {doc.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-[150px] bg-muted border-border text-foreground">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="week" className="hover:bg-muted cursor-pointer">Last 7 Days</SelectItem>
              <SelectItem value="month" className="hover:bg-muted cursor-pointer">Last 30 Days</SelectItem>
              <SelectItem value="all" className="hover:bg-muted cursor-pointer">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.averageScore || 0}%</div>
            <p className="text-xs text-muted-foreground">Across all quizzes</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Quizzes Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalQuizzes || 0}</div>
            <p className="text-xs text-muted-foreground">Total quizzes completed</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Flashcards Mastered</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalFlashcardsMastered || 0} <span className="text-muted-foreground text-sm font-normal">/ {stats?.totalFlashcards || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Cards marked as mastered</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Study Guide</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Highlights:</span>
                <span className="font-bold text-foreground">{stats?.studyGuideStats?.highlights || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Notes:</span>
                <span className="font-bold text-foreground">{stats?.studyGuideStats?.notes || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cards:</span>
                <span className="font-bold text-foreground">{stats?.studyGuideStats?.flashcards || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Score Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.quizScores || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border-subtle)", boxShadow: "0 4px 6px -1px var(--shadow-card)", color: "var(--text-primary)" }}
                  itemStyle={{ color: "var(--text-primary)" }}
                  labelStyle={{ color: "var(--text-secondary)" }}
                />
                <Line type="monotone" dataKey="score" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 4, fill: "var(--brand-primary)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Topic Mastery</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.topicMastery || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.topicMastery || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border-subtle)", boxShadow: "0 4px 6px -1px var(--shadow-card)", color: "var(--text-primary)" }}
                  itemStyle={{ color: "var(--text-primary)" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/20 p-2 text-primary">
                    {activity.type === "quiz" ? <Award className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{activity.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {activity.score !== undefined && (
                  <div className="text-right">
                    <p className="font-bold text-foreground">{activity.score}%</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                )}
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-center text-muted-foreground">No recent activity found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}
