import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { Loader2, TrendingUp, BookOpen, Brain, Target, Award, Clock, Flame, Trophy } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Section } from "@/components/ui/section";

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
        <Loader2 className="h-8 w-8 animate-spin text-gfg-green" />
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
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gfg-text dark:text-gfg-dark-text">Progress Dashboard</h1>
        <p className="text-gfg-text-light dark:text-gfg-dark-muted">Track your learning journey and improvements</p>
      </div>

      {/* New Student Progress Bar */}
      <Card className="bg-white dark:bg-gfg-dark-card border-gfg-border dark:border-gfg-dark-border overflow-hidden shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gfg-green/10 dark:bg-gfg-green/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-gfg-green dark:text-gfg-green-light" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gfg-text dark:text-gfg-dark-text">Your Momentum</h3>
                <p className="text-sm text-gfg-text-light dark:text-gfg-dark-muted">Keep pushing forward!</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-12 w-full md:w-auto">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-gfg-text-light dark:text-gfg-dark-muted text-xs font-medium uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5" />
                  Study Time
                </div>
                <p className="text-xl md:text-2xl font-bold text-gfg-text dark:text-gfg-dark-text">
                  {formatStudyTime(stats?.studyTime || 0)}
                </p>
                <span className="text-xs text-gfg-green dark:text-gfg-green-light font-medium">this week</span>
              </div>

              <div className="text-center border-l border-r border-gfg-border dark:border-gfg-dark-border px-4">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-gfg-text-light dark:text-gfg-dark-muted text-xs font-medium uppercase tracking-wider">
                  <BookOpen className="h-3.5 w-3.5" />
                  Mastered
                </div>
                <p className="text-xl md:text-2xl font-bold text-gfg-text dark:text-gfg-dark-text">
                  {stats?.totalFlashcardsMastered || 0}
                </p>
                <span className="text-xs text-gfg-text-light dark:text-gfg-dark-muted">topics</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-gfg-text-light dark:text-gfg-dark-muted text-xs font-medium uppercase tracking-wider">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  Streak
                </div>
                <p className="text-xl md:text-2xl font-bold text-gfg-text dark:text-gfg-dark-text">
                  {stats?.streak || 0}
                </p>
                <span className="text-xs text-gfg-text-light dark:text-gfg-dark-muted">days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedDocId} onValueChange={setSelectedDocId}>
            <SelectTrigger className="w-[250px] bg-white dark:bg-gfg-dark-card border-gfg-border-medium dark:border-gfg-dark-border text-gfg-text dark:text-gfg-dark-text">
              <SelectValue placeholder="Filter by Document" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gfg-dark-card border-gfg-border dark:border-gfg-dark-border">
              <SelectItem value="all">All Documents</SelectItem>
              {[...documents]
                .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                .map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-[150px] bg-white dark:bg-gfg-dark-card border-gfg-border-medium dark:border-gfg-dark-border text-gfg-text dark:text-gfg-dark-text">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gfg-dark-card border-gfg-border dark:border-gfg-dark-border">
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gfg-border-light dark:border-gfg-dark-border shadow-sm bg-white dark:bg-gfg-dark-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gfg-text dark:text-gfg-dark-text">Average Score</CardTitle>
            <Target className="h-4 w-4 text-gfg-text-light dark:text-gfg-dark-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gfg-green dark:text-gfg-green-light">{stats?.averageScore || 0}%</div>
            <p className="text-xs text-gfg-text-light dark:text-gfg-dark-muted">Across all quizzes</p>
          </CardContent>
        </Card>
        <Card className="border-gfg-border-light dark:border-gfg-dark-border shadow-sm bg-white dark:bg-gfg-dark-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gfg-text dark:text-gfg-dark-text">Quizzes Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-gfg-text-light dark:text-gfg-dark-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gfg-text dark:text-gfg-dark-text">{stats?.totalQuizzes || 0}</div>
            <p className="text-xs text-gfg-text-light dark:text-gfg-dark-muted">Total quizzes completed</p>
          </CardContent>
        </Card>
        <Card className="border-gfg-border-light dark:border-gfg-dark-border shadow-sm bg-white dark:bg-gfg-dark-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gfg-text dark:text-gfg-dark-text">Flashcards Mastered</CardTitle>
            <Brain className="h-4 w-4 text-gfg-text-light dark:text-gfg-dark-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gfg-text dark:text-gfg-dark-text">
              {stats?.totalFlashcardsMastered || 0} <span className="text-gfg-text-light dark:text-gfg-dark-muted text-sm font-normal">/ {stats?.totalFlashcards || 0}</span>
            </div>
            <p className="text-xs text-gfg-text-light dark:text-gfg-dark-muted">Cards marked as mastered</p>
          </CardContent>
        </Card>
        <Card className="border-gfg-border-light dark:border-gfg-dark-border shadow-sm bg-white dark:bg-gfg-dark-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gfg-text dark:text-gfg-dark-text">Study Guide</CardTitle>
            <BookOpen className="h-4 w-4 text-gfg-text-light dark:text-gfg-dark-muted" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-gfg-text-light dark:text-gfg-dark-muted">Highlights:</span>
                <span className="font-bold text-gfg-text dark:text-gfg-dark-text">{stats?.studyGuideStats?.highlights || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gfg-text-light dark:text-gfg-dark-muted">Notes:</span>
                <span className="font-bold text-gfg-text dark:text-gfg-dark-text">{stats?.studyGuideStats?.notes || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gfg-text-light dark:text-gfg-dark-muted">Cards:</span>
                <span className="font-bold text-gfg-text dark:text-gfg-dark-text">{stats?.studyGuideStats?.flashcards || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border-gfg-border-light dark:border-gfg-dark-border shadow-sm bg-white dark:bg-gfg-dark-card">
          <CardHeader>
            <CardTitle className="text-gfg-text dark:text-gfg-dark-text">Score Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.quizScores || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  itemStyle={{ color: "#1f2937" }}
                />
                <Line type="monotone" dataKey="score" stroke="#2F8D46" strokeWidth={2} dot={{ r: 4, fill: "#2F8D46" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-gfg-border-light dark:border-gfg-dark-border shadow-sm bg-white dark:bg-gfg-dark-card">
          <CardHeader>
            <CardTitle className="text-gfg-text dark:text-gfg-dark-text">Topic Mastery</CardTitle>
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
                  contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  itemStyle={{ color: "#1f2937" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gfg-border-light dark:border-gfg-dark-border shadow-sm bg-white dark:bg-gfg-dark-card">
        <CardHeader>
          <CardTitle className="text-gfg-text dark:text-gfg-dark-text">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity?.map((activity, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gfg-border-light dark:border-gfg-dark-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-gfg-green/10 dark:bg-gfg-green/20 p-2 text-gfg-green dark:text-gfg-green-light">
                    {activity.type === "quiz" ? <Award className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gfg-text dark:text-gfg-dark-text">{activity.topic}</p>
                    <p className="text-sm text-gfg-text-light dark:text-gfg-dark-muted">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {activity.score !== undefined && (
                  <div className="text-right">
                    <p className="font-bold text-gfg-text dark:text-gfg-dark-text">{activity.score}%</p>
                    <p className="text-xs text-gfg-text-light dark:text-gfg-dark-muted">Score</p>
                  </div>
                )}
              </div>
            ))}
            {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
              <p className="text-center text-gfg-text-light dark:text-gfg-dark-muted">No recent activity found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}
