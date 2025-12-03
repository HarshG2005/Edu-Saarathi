import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppStore } from "@/lib/store";
import { ThemeProvider } from "@/components/theme-provider";

import { LibraryPage } from "@/pages/library";
import { FlashcardsPage } from "@/pages/flashcards";
import { SummaryPage } from "@/pages/summary";
import { MindmapPage } from "@/pages/mindmap";
import { NotesPage } from "@/pages/notes";
import { TutorPage } from "@/pages/tutor";
import { QuizPage } from "@/pages/quiz";
import { ProgressPage } from "@/pages/progress";
import { StudyGuidePage } from "@/pages/study-guide";
import { LandingPage } from "@/pages/landing";

import { Navbar } from "@/components/ui/navbar";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import { Switch, Route } from "wouter";
import { DocumentViewerPage } from "@/pages/document-viewer";

function MainContent() {
  const { currentFeature } = useAppStore();

  const renderFeature = () => {
    switch (currentFeature) {
      case "library":
        return <LibraryPage />;
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
      case "study-guide":
        return <StudyGuidePage />;
      default:
        return <LibraryPage />;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-gfg-bg">
      <Navbar />
      <main className="flex-1 overflow-auto p-4 md:p-6">
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
      <ThemeProvider defaultTheme="system" storageKey="eduquest-theme">
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { user } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/documents/:id" component={() => <DocumentViewerPage />} />
      <Route path="/">
        {user ? (
          <ProtectedRoute
            path="/"
            component={() => (
              <SidebarProvider style={style as React.CSSProperties}>
                <div className="flex h-screen w-full">
                  <AppSidebar />
                  <MainContent />
                </div>
                <Toaster />
              </SidebarProvider>
            )}
          />
        ) : (
          <LandingPage />
        )}
      </Route>
      <Route>
        <LandingPage />
      </Route>
    </Switch>
  );
}

export default App;
