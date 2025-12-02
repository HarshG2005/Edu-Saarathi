import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppStore } from "@/lib/store";

import { LibraryPage } from "@/pages/library";
import { MCQGeneratorPage } from "@/pages/mcq-generator";
import { FlashcardsPage } from "@/pages/flashcards";
import { SummaryPage } from "@/pages/summary";
import { MindmapPage } from "@/pages/mindmap";
import { NotesPage } from "@/pages/notes";
import { TutorPage } from "@/pages/tutor";
import { QuizPage } from "@/pages/quiz";
import { ProgressPage } from "@/pages/progress";

function MainContent() {
  const { currentFeature } = useAppStore();

  const renderFeature = () => {
    switch (currentFeature) {
      case "library":
        return <LibraryPage />;
      case "mcq":
        return <MCQGeneratorPage />;
      case "flashcards":
        return <FlashcardsPage />;
      case "summary":
        return <SummaryPage />;
      case "mindmap":
        return <MindmapPage />;
      case "notes":
        return <NotesPage />;
      case "tutor":
        return <TutorPage />;
      case "quiz":
        return <QuizPage />;
      case "progress":
        return <ProgressPage />;
      default:
        return <LibraryPage />;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <ThemeToggle />
      </header>
      <main className="flex-1 overflow-auto">
        {renderFeature()}
      </main>
    </div>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <MainContent />
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
