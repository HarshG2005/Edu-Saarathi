import { randomUUID } from "crypto";
import type {
  Document,
  MCQSet,
  FlashcardSet,
  Summary,
  Mindmap,
  Notes,
  QuizResult,
  ChatSession
} from "@shared/schema";

export interface IStorage {
  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  getDocuments(): Promise<Document[]>;
  createDocument(doc: Omit<Document, "id">): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;

  // MCQ Sets
  getMCQSet(id: string): Promise<MCQSet | undefined>;
  getMCQSets(): Promise<MCQSet[]>;
  createMCQSet(set: Omit<MCQSet, "id">): Promise<MCQSet>;

  // Flashcard Sets
  getFlashcardSet(id: string): Promise<FlashcardSet | undefined>;
  getFlashcardSets(): Promise<FlashcardSet[]>;
  createFlashcardSet(set: Omit<FlashcardSet, "id">): Promise<FlashcardSet>;
  updateFlashcardSet(id: string, set: Partial<FlashcardSet>): Promise<FlashcardSet | undefined>;

  // Summaries
  getSummary(id: string): Promise<Summary | undefined>;
  getSummaries(): Promise<Summary[]>;
  createSummary(summary: Omit<Summary, "id">): Promise<Summary>;

  // Mindmaps
  getMindmap(id: string): Promise<Mindmap | undefined>;
  getMindmaps(): Promise<Mindmap[]>;
  createMindmap(mindmap: Omit<Mindmap, "id">): Promise<Mindmap>;

  // Notes
  getNotes(id: string): Promise<Notes | undefined>;
  getAllNotes(): Promise<Notes[]>;
  createNotes(notes: Omit<Notes, "id">): Promise<Notes>;

  // Quiz Results
  getQuizResult(id: string): Promise<QuizResult | undefined>;
  getQuizResults(): Promise<QuizResult[]>;
  createQuizResult(result: Omit<QuizResult, "id">): Promise<QuizResult>;

  // Chat Sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessions(): Promise<ChatSession[]>;
  createChatSession(session: Omit<ChatSession, "id">): Promise<ChatSession>;
  updateChatSession(id: string, session: Partial<ChatSession>): Promise<ChatSession | undefined>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, Document>;
  private mcqSets: Map<string, MCQSet>;
  private flashcardSets: Map<string, FlashcardSet>;
  private summaries: Map<string, Summary>;
  private mindmaps: Map<string, Mindmap>;
  private notes: Map<string, Notes>;
  private quizResults: Map<string, QuizResult>;
  private chatSessions: Map<string, ChatSession>;

  constructor() {
    this.documents = new Map();
    this.mcqSets = new Map();
    this.flashcardSets = new Map();
    this.summaries = new Map();
    this.mindmaps = new Map();
    this.notes = new Map();
    this.quizResults = new Map();
    this.chatSessions = new Map();
  }

  // Documents
  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
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

  async getMCQSets(): Promise<MCQSet[]> {
    return Array.from(this.mcqSets.values());
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

  async getFlashcardSets(): Promise<FlashcardSet[]> {
    return Array.from(this.flashcardSets.values());
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

  async getSummaries(): Promise<Summary[]> {
    return Array.from(this.summaries.values());
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

  async getMindmaps(): Promise<Mindmap[]> {
    return Array.from(this.mindmaps.values());
  }

  async createMindmap(mindmap: Omit<Mindmap, "id">): Promise<Mindmap> {
    const id = randomUUID();
    const newMindmap: Mindmap = { ...mindmap, id };
    this.mindmaps.set(id, newMindmap);
    return newMindmap;
  }

  // Notes
  async getNotes(id: string): Promise<Notes | undefined> {
    return this.notes.get(id);
  }

  async getAllNotes(): Promise<Notes[]> {
    return Array.from(this.notes.values());
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

  async getQuizResults(): Promise<QuizResult[]> {
    return Array.from(this.quizResults.values());
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

  async getChatSessions(): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values());
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
}

import { JsonStorage } from "./storage-json";

export const storage = new JsonStorage();
