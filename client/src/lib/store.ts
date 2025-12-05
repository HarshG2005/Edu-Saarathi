import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Document, MCQSet, FlashcardSet, Summary, Mindmap, Notes, QuizResult, ChatSession } from "@shared/schema";

interface AppState {
  currentDocumentId: string | null;
  currentFeature: string;
  theme: "light" | "dark";
  documents: Document[];
  mcqSets: MCQSet[];
  flashcardSets: FlashcardSet[];
  summaries: Summary[];
  mindmaps: Mindmap[];
  notes: Notes[];
  quizResults: QuizResult[];
  chatSessions: ChatSession[];

  setCurrentDocumentId: (id: string | null) => void;
  setCurrentFeature: (feature: string) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;

  addMCQSet: (set: MCQSet) => void;
  addFlashcardSet: (set: FlashcardSet) => void;
  addSummary: (summary: Summary) => void;
  addMindmap: (mindmap: Mindmap) => void;
  addNotes: (notes: Notes) => void;
  addQuizResult: (result: QuizResult) => void;
  addChatSession: (session: ChatSession) => void;
  updateChatSession: (id: string, session: Partial<ChatSession>) => void;

  hasStarted: boolean;
  setHasStarted: (started: boolean) => void;

  updateFlashcardMastery: (setId: string, cardId: string, mastered: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentDocumentId: null,
      currentFeature: "library",
      theme: "light",
      hasStarted: false,
      documents: [],
      mcqSets: [],
      flashcardSets: [],
      summaries: [],
      mindmaps: [],
      notes: [],
      quizResults: [],
      chatSessions: [],

      setCurrentDocumentId: (id) => set({ currentDocumentId: id }),
      setCurrentFeature: (feature) => set({ currentFeature: feature }),
      setHasStarted: (started) => set({ hasStarted: started }),
      setTheme: (theme) => {
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ theme });
      },
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === "light" ? "dark" : "light";
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        return { theme: newTheme };
      }),

      addDocument: (doc) => set((state) => ({
        documents: [...state.documents, doc]
      })),
      removeDocument: (id) => set((state) => ({
        documents: state.documents.filter((d) => d.id !== id)
      })),

      addMCQSet: (mcqSet) => set((state) => ({
        mcqSets: [...state.mcqSets, mcqSet]
      })),
      addFlashcardSet: (flashcardSet) => set((state) => ({
        flashcardSets: [...state.flashcardSets, flashcardSet]
      })),
      addSummary: (summary) => set((state) => ({
        summaries: [...state.summaries, summary]
      })),
      addMindmap: (mindmap) => set((state) => ({
        mindmaps: [...state.mindmaps, mindmap]
      })),
      addNotes: (notes) => set((state) => ({
        notes: [...state.notes, notes]
      })),
      addQuizResult: (result) => set((state) => ({
        quizResults: [...state.quizResults, result]
      })),
      addChatSession: (session) => set((state) => ({
        chatSessions: [...state.chatSessions, session]
      })),
      updateChatSession: (id, updates) => set((state) => ({
        chatSessions: state.chatSessions.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      })),

      updateFlashcardMastery: (setId, cardId, mastered) => set((state) => ({
        flashcardSets: state.flashcardSets.map((set) =>
          set.id === setId
            ? {
              ...set,
              flashcards: (set.flashcards as any[]).map((card) =>
                card.id === cardId ? { ...card, mastered } : card
              ),
            }
            : set
        ),
      })),

      reset: () => set((state) => ({
        currentDocumentId: null,
        currentFeature: "library",
        hasStarted: false,
        documents: [],
        mcqSets: [],
        flashcardSets: [],
        summaries: [],
        mindmaps: [],
        notes: [],
        quizResults: [],
        chatSessions: [],
        // Keep theme
        theme: state.theme
      })),
    }),
    {
      name: "eduquest-storage",
      partialize: (state) => ({
        theme: state.theme,
        hasStarted: state.hasStarted,
        documents: state.documents,
        mcqSets: state.mcqSets,
        flashcardSets: state.flashcardSets,
        summaries: state.summaries,
        mindmaps: state.mindmaps,
        notes: state.notes,
        quizResults: state.quizResults,
        chatSessions: state.chatSessions,
      }),
    }
  )
);
