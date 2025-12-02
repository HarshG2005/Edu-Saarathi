import {
  BookOpen,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Network,
  GraduationCap,
  StickyNote,
  LogOut,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

const mainFeatures = [
  {
    title: "Document Library",
    id: "library",
    icon: BookOpen,
    description: "Upload & manage PDFs",
  },
  {
    title: "Flashcards",
    id: "flashcards",
    icon: Lightbulb,
    description: "Study with flashcards",
  },
  {
    title: "Summaries",
    id: "summary",
    icon: FileText,
    description: "Generate text summaries",
  },
  {
    title: "Mindmaps",
    id: "mindmap",
    icon: Network,
    description: "Visual concept maps",
  },
  {
    title: "Notes",
    id: "notes",
    icon: StickyNote,
    description: "Extract key points",
  },
];

const studyTools = [
  {
    title: "AI Tutor",
    id: "tutor",
    icon: MessageSquare,
    description: "Ask questions",
  },
  {
    title: "Quiz Mode",
    id: "quiz",
    icon: HelpCircle,
    description: "Test your knowledge",
  },
  {
    title: "Study Guide",
    id: "study-guide",
    icon: BookOpen,
    description: "Review all materials",
  },
  {
    title: "Progress",
    id: "progress",
    icon: LayoutDashboard,
    description: "Track your learning",
  },
];

export function AppSidebar() {
  const { currentFeature, setCurrentFeature, documents, quizResults } = useAppStore();
  const { logoutMutation } = useAuth();

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground">EduQuest</h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AI Study Buddy</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Content Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainFeatures.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setCurrentFeature(item.id)}
                    data-active={currentFeature === item.id}
                    className="group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm"
                    data-testid={`nav-${item.id}`}
                  >
                    {/* Active State Accent Bar */}
                    {currentFeature === item.id && (
                      <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}

                    <item.icon className="h-4 w-4 transition-colors group-hover:text-foreground group-data-[active=true]:text-primary" />
                    <span className="flex-1">{item.title}</span>

                    {item.id === "library" && documents.length > 0 && (
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] font-normal">
                        {documents.length}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-2 px-2">
          <div className="h-px w-full bg-sidebar-border/50" />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Study Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studyTools.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setCurrentFeature(item.id)}
                    data-active={currentFeature === item.id}
                    className="group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm"
                    data-testid={`nav-${item.id}`}
                  >
                    {/* Active State Accent Bar */}
                    {currentFeature === item.id && (
                      <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}

                    <item.icon className="h-4 w-4 transition-colors group-hover:text-foreground group-data-[active=true]:text-primary" />
                    <span className="flex-1">{item.title}</span>

                    {item.id === "quiz" && quizResults.length > 0 && (
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] font-normal">
                        {quizResults.length}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-medium text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span>Online • v1.0.0</span>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => logoutMutation.mutate()}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
                <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
