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
  InsertUser
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  updateFlashcardSet(id: string, set: Partial<FlashcardSet>): Promise<FlashcardSet | undefined>;

  // Summaries
  getSummary(id: string): Promise<Summary | undefined>;
  getSummaries(userId: string): Promise<Summary[]>;
  createSummary(summary: Omit<Summary, "id">): Promise<Summary>;

  // Mindmaps
  getMindmap(id: string): Promise<Mindmap | undefined>;
  getMindmaps(userId: string): Promise<Mindmap[]>;
  createMindmap(mindmap: Omit<Mindmap, "id">): Promise<Mindmap>;

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
  private users: Map<string, User>;

  constructor() {
    this.documents = new Map();
    this.mcqSets = new Map();
    this.flashcardSets = new Map();
    this.summaries = new Map();
    this.mindmaps = new Map();
    this.notes = new Map();
    this.quizResults = new Map();
    this.chatSessions = new Map();
    this.users = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
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
}

import { DbStorage } from "./storage-db";

export const storage = new DbStorage();
