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
  LogOut
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
} from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

const mainFeatures = [
  {
    title: "Document Library",
    id: "library",
    icon: BookOpen,
    description: "Upload & manage PDFs",
  },
  {
    title: "MCQ Generator",
    id: "mcq",
    icon: ListChecks,
    description: "Create multiple choice questions",
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
    title: "Progress",
    id: "progress",
    icon: LayoutDashboard,
    description: "Track your learning",
  },
];

import { useAuth } from "@/hooks/use-auth";

export function AppSidebar() {
  const { currentFeature, setCurrentFeature, documents, quizResults } = useAppStore();
  const { logoutMutation } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">EduQuest</h1>
            <p className="text-xs text-muted-foreground">AI Study Buddy</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Content Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainFeatures.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setCurrentFeature(item.id)}
                    data-active={currentFeature === item.id}
                    className="w-full justify-start gap-3 data-[active=true]:bg-sidebar-accent"
                    data-testid={`nav-${item.id}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    {item.id === "library" && documents.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {documents.length}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Study Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studyTools.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setCurrentFeature(item.id)}
                    data-active={currentFeature === item.id}
                    className="w-full justify-start gap-3 data-[active=true]:bg-sidebar-accent"
                    data-testid={`nav-${item.id}`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.id === "quiz" && quizResults.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
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
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-status-online" />
            <span>Local-first • Offline capable</span>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => logoutMutation.mutate()}
                className="text-muted-foreground hover:text-foreground"
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
