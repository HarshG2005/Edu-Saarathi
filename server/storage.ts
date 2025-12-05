import { randomUUID } from "crypto";
import type {
  Document,
  MCQSet,
  FlashcardSet,
  Summary,
  Mindmap,
  Notes,
  QuizResult,
  ChatSession,
  User,
  InsertUser,
  Highlight,
  UserNote,
  UserFlashcard,
  InsertUserFlashcard,
  MindmapSnapshot
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;

  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  getDocuments(userId: string): Promise<Document[]>;
  createDocument(doc: Omit<Document, "id">): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;

  // MCQ Sets
  getMCQSet(id: string): Promise<MCQSet | undefined>;
  getMCQSets(userId: string): Promise<MCQSet[]>;
  createMCQSet(set: Omit<MCQSet, "id">): Promise<MCQSet>;

  // Flashcard Sets
  getFlashcardSet(id: string): Promise<FlashcardSet | undefined>;
  getFlashcardSets(userId: string): Promise<FlashcardSet[]>;
  createFlashcardSet(set: Omit<FlashcardSet, "id">): Promise<FlashcardSet>;
  updateFlashcardSet(id: string, updates: Partial<FlashcardSet>): Promise<FlashcardSet | undefined>;

  // Summaries
  getSummary(id: string): Promise<Summary | undefined>;
  getSummaries(userId: string): Promise<Summary[]>;
  createSummary(summary: Omit<Summary, "id">): Promise<Summary>;

  // Mindmaps
  getMindmap(id: string): Promise<Mindmap | undefined>;
  getMindmaps(userId: string): Promise<Mindmap[]>;
  createMindmap(mindmap: Omit<Mindmap, "id" | "createdAt" | "updatedAt">): Promise<Mindmap>;
  updateMindmap(id: string, mindmap: Partial<Mindmap>): Promise<Mindmap | undefined>;
  deleteMindmap(id: string): Promise<boolean>;

  // Mindmap Snapshots
  createMindmapSnapshot(snapshot: Omit<MindmapSnapshot, "id" | "createdAt">): Promise<MindmapSnapshot>;
  getMindmapSnapshots(mindmapId: string): Promise<MindmapSnapshot[]>;

  // Notes
  getNotes(id: string): Promise<Notes | undefined>;
  getAllNotes(userId: string): Promise<Notes[]>;
  createNotes(notes: Omit<Notes, "id">): Promise<Notes>;

  // Quiz Results
  getQuizResult(id: string): Promise<QuizResult | undefined>;
  getQuizResults(userId: string): Promise<QuizResult[]>;
  createQuizResult(result: Omit<QuizResult, "id">): Promise<QuizResult>;

  // Chat Sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessions(userId: string): Promise<ChatSession[]>;
  createChatSession(session: Omit<ChatSession, "id">): Promise<ChatSession>;
  updateChatSession(id: string, session: Partial<ChatSession>): Promise<ChatSession | undefined>;
  // Highlights
  getHighlights(documentId: string): Promise<Highlight[]>;
  getAllHighlights(userId: string): Promise<Highlight[]>;
  createHighlight(highlight: Omit<Highlight, "id">): Promise<Highlight>;
  deleteHighlight(id: string): Promise<boolean>;

  // User Notes
  getUserNotes(documentId: string): Promise<UserNote[]>;
  getAllUserNotes(userId: string): Promise<UserNote[]>;
  createUserNote(note: Omit<UserNote, "id">): Promise<UserNote>;

  // User Flashcards
  getUserFlashcards(documentId: string): Promise<UserFlashcard[]>;
  getDueUserFlashcards(userId: string): Promise<UserFlashcard[]>;
  getAllUserFlashcards(userId: string): Promise<UserFlashcard[]>;
  createUserFlashcard(flashcard: InsertUserFlashcard): Promise<UserFlashcard>;
  updateUserFlashcard(id: string, updates: Partial<UserFlashcard>): Promise<UserFlashcard | undefined>;
  deleteUserFlashcard(id: string): Promise<boolean>;
}



export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private mcqSets: Map<string, MCQSet>;
  private flashcardSets: Map<string, FlashcardSet>;
  private summaries: Map<string, Summary>;
  private mindmaps: Map<string, Mindmap>;
  private mindmapSnapshots: Map<string, MindmapSnapshot>;
  private notes: Map<string, Notes>;
  private quizResults: Map<string, QuizResult>;
  private chatSessions: Map<string, ChatSession>;
  private users: Map<string, User>;
  private highlights: Map<string, Highlight>;
  private userNotes: Map<string, UserNote>;
  private userFlashcards: Map<string, UserFlashcard>;

  constructor() {
    this.documents = new Map();
    this.mcqSets = new Map();
    this.flashcardSets = new Map();
    this.summaries = new Map();
    this.mindmaps = new Map();
    this.mindmapSnapshots = new Map();
    this.notes = new Map();
    this.quizResults = new Map();
    this.chatSessions = new Map();
    this.users = new Map();
    this.highlights = new Map();
    this.userNotes = new Map();
    this.userFlashcards = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }



  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date(), displayName: insertUser.displayName || null };
    this.users.set(id, user);
    return user;
  }

  // Documents
  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocuments(userId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.userId === userId);
  }

  async createDocument(doc: Omit<Document, "id">): Promise<Document> {
    const id = randomUUID();
    const document: Document = { ...doc, id };
    this.documents.set(id, document);
    return document;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  // MCQ Sets
  async getMCQSet(id: string): Promise<MCQSet | undefined> {
    return this.mcqSets.get(id);
  }

  async getMCQSets(userId: string): Promise<MCQSet[]> {
    return Array.from(this.mcqSets.values()).filter(set => set.userId === userId);
  }

  async createMCQSet(set: Omit<MCQSet, "id">): Promise<MCQSet> {
    const id = randomUUID();
    const mcqSet: MCQSet = { ...set, id };
    this.mcqSets.set(id, mcqSet);
    return mcqSet;
  }

  // Flashcard Sets
  async getFlashcardSet(id: string): Promise<FlashcardSet | undefined> {
    return this.flashcardSets.get(id);
  }

  async getFlashcardSets(userId: string): Promise<FlashcardSet[]> {
    return Array.from(this.flashcardSets.values()).filter(set => set.userId === userId);
  }

  async createFlashcardSet(set: Omit<FlashcardSet, "id">): Promise<FlashcardSet> {
    const id = randomUUID();
    const flashcardSet: FlashcardSet = { ...set, id };
    this.flashcardSets.set(id, flashcardSet);
    return flashcardSet;
  }

  async updateFlashcardSet(id: string, updates: Partial<FlashcardSet>): Promise<FlashcardSet | undefined> {
    const existing = this.flashcardSets.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.flashcardSets.set(id, updated);
    return updated;
  }



  // Summaries
  async getSummary(id: string): Promise<Summary | undefined> {
    return this.summaries.get(id);
  }

  async getSummaries(userId: string): Promise<Summary[]> {
    return Array.from(this.summaries.values()).filter(s => s.userId === userId);
  }

  async createSummary(summary: Omit<Summary, "id">): Promise<Summary> {
    const id = randomUUID();
    const newSummary: Summary = { ...summary, id };
    this.summaries.set(id, newSummary);
    return newSummary;
  }

  // Mindmaps
  async getMindmap(id: string): Promise<Mindmap | undefined> {
    return this.mindmaps.get(id);
  }

  async getMindmaps(userId: string): Promise<Mindmap[]> {
    return Array.from(this.mindmaps.values()).filter(m => m.userId === userId);
  }

  async createMindmap(mindmap: Omit<Mindmap, "id" | "createdAt" | "updatedAt">): Promise<Mindmap> {
    const id = randomUUID();
    const now = new Date();
    const newMindmap: Mindmap = { ...mindmap, id, createdAt: now, updatedAt: now };
    this.mindmaps.set(id, newMindmap);
    return newMindmap;
  }

  async updateMindmap(id: string, updates: Partial<Mindmap>): Promise<Mindmap | undefined> {
    const existing = this.mindmaps.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.mindmaps.set(id, updated);
    return updated;
  }

  async deleteMindmap(id: string): Promise<boolean> {
    return this.mindmaps.delete(id);
  }

  // Mindmap Snapshots
  async createMindmapSnapshot(snapshot: Omit<MindmapSnapshot, "id" | "createdAt">): Promise<MindmapSnapshot> {
    const id = randomUUID();
    const newSnapshot: MindmapSnapshot = { ...snapshot, id, createdAt: new Date() };
    this.mindmapSnapshots.set(id, newSnapshot);
    return newSnapshot;
  }

  async getMindmapSnapshots(mindmapId: string): Promise<MindmapSnapshot[]> {
    return Array.from(this.mindmapSnapshots.values())
      .filter(s => s.mindmapId === mindmapId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Notes
  async getNotes(id: string): Promise<Notes | undefined> {
    return this.notes.get(id);
  }

  async getAllNotes(userId: string): Promise<Notes[]> {
    return Array.from(this.notes.values()).filter(n => n.userId === userId);
  }

  async createNotes(notes: Omit<Notes, "id">): Promise<Notes> {
    const id = randomUUID();
    const newNotes: Notes = { ...notes, id };
    this.notes.set(id, newNotes);
    return newNotes;
  }

  // Quiz Results
  async getQuizResult(id: string): Promise<QuizResult | undefined> {
    return this.quizResults.get(id);
  }

  async getQuizResults(userId: string): Promise<QuizResult[]> {
    return Array.from(this.quizResults.values()).filter(r => r.userId === userId);
  }

  async createQuizResult(result: Omit<QuizResult, "id">): Promise<QuizResult> {
    const id = randomUUID();
    const quizResult: QuizResult = { ...result, id };
    this.quizResults.set(id, quizResult);
    return quizResult;
  }

  // Chat Sessions
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getChatSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(s => s.userId === userId);
  }

  async createChatSession(session: Omit<ChatSession, "id">): Promise<ChatSession> {
    const id = randomUUID();
    const chatSession: ChatSession = { ...session, id };
    this.chatSessions.set(id, chatSession);
    return chatSession;
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const existing = this.chatSessions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.chatSessions.set(id, updated);
    return updated;
  }

  // Highlights
  async getHighlights(documentId: string): Promise<Highlight[]> {
    return Array.from(this.highlights.values()).filter(h => h.documentId === documentId);
  }

  async getAllHighlights(userId: string): Promise<Highlight[]> {
    return Array.from(this.highlights.values()).filter(h => h.userId === userId);
  }

  async createHighlight(highlight: Omit<Highlight, "id">): Promise<Highlight> {
    const id = randomUUID();
    const newHighlight: Highlight = { ...highlight, id };
    this.highlights.set(id, newHighlight);
    return newHighlight;
  }

  async deleteHighlight(id: string): Promise<boolean> {
    return this.highlights.delete(id);
  }

  // User Notes
  async getUserNotes(documentId: string): Promise<UserNote[]> {
    return Array.from(this.userNotes.values()).filter(n => n.documentId === documentId);
  }

  async getAllUserNotes(userId: string): Promise<UserNote[]> {
    return Array.from(this.userNotes.values()).filter(n => n.userId === userId);
  }

  async createUserNote(note: Omit<UserNote, "id">): Promise<UserNote> {
    const id = randomUUID();
    const newNote: UserNote = { ...note, id };
    this.userNotes.set(id, newNote);
    return newNote;
  }

  // User Flashcards
  async getUserFlashcards(documentId: string): Promise<UserFlashcard[]> {
    return Array.from(this.userFlashcards.values()).filter(f => f.documentId === documentId);
  }

  async getDueUserFlashcards(userId: string): Promise<UserFlashcard[]> {
    const now = new Date();
    return Array.from(this.userFlashcards.values()).filter(
      (f) => f.userId === userId && (!f.nextReview || f.nextReview <= now)
    );
  }

  async getAllUserFlashcards(userId: string): Promise<UserFlashcard[]> {
    return Array.from(this.userFlashcards.values()).filter(f => f.userId === userId);
  }

  async createUserFlashcard(flashcard: InsertUserFlashcard): Promise<UserFlashcard> {
    const id = randomUUID();
    const newFlashcard: UserFlashcard = {
      ...flashcard,
      id,
      highlightId: flashcard.highlightId ?? null,
      difficulty: flashcard.difficulty ?? 0,
      tags: flashcard.tags ?? [],
      interval: flashcard.interval ?? 0,
      repetition: flashcard.repetition ?? 0,
      ease: flashcard.ease ?? 250,
      nextReview: flashcard.nextReview ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Handle missing required fields if any (but InsertUserFlashcard should have them)
      // Actually InsertUserFlashcard makes default fields optional.
      // We need to ensure all UserFlashcard fields are present.
    } as UserFlashcard;
    this.userFlashcards.set(id, newFlashcard);
    return newFlashcard;
  }

  async updateUserFlashcard(id: string, updates: Partial<UserFlashcard>): Promise<UserFlashcard | undefined> {
    const existing = this.userFlashcards.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.userFlashcards.set(id, updated);
    return updated;
  }

  async deleteUserFlashcard(id: string): Promise<boolean> {
    return this.userFlashcards.delete(id);
  }
}

import { JsonStorage } from "./storage-json";

export const storage = new JsonStorage();
