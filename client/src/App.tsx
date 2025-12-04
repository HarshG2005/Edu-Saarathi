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
import { FlashcardsPage as SmartReviewPage } from "@/pages/flashcards/dashboard";
import { FlashcardReviewPage } from "@/pages/flashcards/review";
import SettingsPage from "@/pages/settings";
import { SummaryPage } from "@/pages/summary";
import { MindmapPage } from "@/pages/mindmap";
import { NotesPage } from "@/pages/notes";
import { TutorPage } from "@/pages/tutor";
import { QuizPage } from "@/pages/quiz";
import { ProgressPage } from "@/pages/progress";
import StudyGuidePage from "@/pages/study-guide";
import { LandingPage } from "@/pages/landing";

import { Navbar } from "@/components/ui/navbar";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import { Switch, Route } from "wouter";
import { DocumentViewerPage } from "@/pages/document-viewer";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
        <ErrorBoundary>
          {renderFeature()}
        </ErrorBoundary>
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
  const { user, isLoading } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gfg-bg dark:bg-gfg-dark-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gfg-green border-t-transparent dark:border-gfg-green-light dark:border-t-transparent" />
          <p className="text-gfg-text-light dark:text-gfg-dark-muted animate-pulse">Loading Edu Saarathi...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/documents/:id" component={() => (
        <ErrorBoundary>
          <DocumentViewerPage />
        </ErrorBoundary>
      )} />
      <ProtectedRoute path="/flashcards/review" component={() => (
        <ErrorBoundary>
          <FlashcardReviewPage />
        </ErrorBoundary>
      )} />
      <ProtectedRoute path="/flashcards/smart-review" component={() => (
        <ErrorBoundary>
          <SmartReviewPage />
        </ErrorBoundary>
      )} />
      <ProtectedRoute path="/settings" component={() => (
        <ErrorBoundary>
          <SettingsPage />
        </ErrorBoundary>
      )} />
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
