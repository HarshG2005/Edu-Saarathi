import { IStorage } from "./storage";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
    users, documents, mcqSets, flashcardSets, summaries, mindmaps, notes, quizResults, chatSessions, highlights, userNotes, userFlashcards,
    type User, type InsertUser, type Document, type MCQSet, type FlashcardSet, type Summary, type Mindmap, type Notes, type QuizResult, type ChatSession,
    type Highlight, type UserNote, type UserFlashcard
} from "@shared/schema";

export class DbStorage implements IStorage {
    // Users
    async getUser(id: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user;
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
    }

    // Documents
    async getDocument(id: string): Promise<Document | undefined> {
        const [doc] = await db.select().from(documents).where(eq(documents.id, id));
        return doc;
    }

    async getDocuments(userId: string): Promise<Document[]> {
        return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.uploadedAt));
    }

    async createDocument(doc: Omit<Document, "id">): Promise<Document> {
        const [newDoc] = await db.insert(documents).values(doc).returning();
        return newDoc;
    }

    async deleteDocument(id: string): Promise<boolean> {
        const [deleted] = await db.delete(documents).where(eq(documents.id, id)).returning();
        return !!deleted;
    }

    // MCQ Sets
    async getMCQSet(id: string): Promise<MCQSet | undefined> {
        const [set] = await db.select().from(mcqSets).where(eq(mcqSets.id, id));
        return set;
    }

    async getMCQSets(userId: string): Promise<MCQSet[]> {
        return db.select().from(mcqSets).where(eq(mcqSets.userId, userId)).orderBy(desc(mcqSets.createdAt));
    }

    async createMCQSet(set: Omit<MCQSet, "id">): Promise<MCQSet> {
        const [newSet] = await db.insert(mcqSets).values(set).returning();
        return newSet;
    }

    // Flashcard Sets
    async getFlashcardSet(id: string): Promise<FlashcardSet | undefined> {
        const [set] = await db.select().from(flashcardSets).where(eq(flashcardSets.id, id));
        return set;
    }

    async getFlashcardSets(userId: string): Promise<FlashcardSet[]> {
        return db.select().from(flashcardSets).where(eq(flashcardSets.userId, userId)).orderBy(desc(flashcardSets.createdAt));
    }

    async createFlashcardSet(set: Omit<FlashcardSet, "id">): Promise<FlashcardSet> {
        const [newSet] = await db.insert(flashcardSets).values(set).returning();
        return newSet;
    }

    async updateFlashcardSet(id: string, updates: Partial<FlashcardSet>): Promise<FlashcardSet | undefined> {
        const [updated] = await db.update(flashcardSets).set(updates).where(eq(flashcardSets.id, id)).returning();
        return updated;
    }

    // Summaries
    async getSummary(id: string): Promise<Summary | undefined> {
        const [summary] = await db.select().from(summaries).where(eq(summaries.id, id));
        return summary;
    }

    async getSummaries(userId: string): Promise<Summary[]> {
        return db.select().from(summaries).where(eq(summaries.userId, userId)).orderBy(desc(summaries.createdAt));
    }

    async createSummary(summary: Omit<Summary, "id">): Promise<Summary> {
        const [newSummary] = await db.insert(summaries).values(summary).returning();
        return newSummary;
    }

    // Mindmaps
    async getMindmap(id: string): Promise<Mindmap | undefined> {
        const [mindmap] = await db.select().from(mindmaps).where(eq(mindmaps.id, id));
        return mindmap;
    }

    async getMindmaps(userId: string): Promise<Mindmap[]> {
        return db.select().from(mindmaps).where(eq(mindmaps.userId, userId)).orderBy(desc(mindmaps.createdAt));
    }

    async createMindmap(mindmap: Omit<Mindmap, "id">): Promise<Mindmap> {
        const [newMindmap] = await db.insert(mindmaps).values(mindmap).returning();
        return newMindmap;
    }

    // Notes
    async getNotes(id: string): Promise<Notes | undefined> {
        const [note] = await db.select().from(notes).where(eq(notes.id, id));
        return note;
    }

    async getAllNotes(userId: string): Promise<Notes[]> {
        return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt));
    }

    async createNotes(note: Omit<Notes, "id">): Promise<Notes> {
        const [newNote] = await db.insert(notes).values(note).returning();
        return newNote;
    }

    // Quiz Results
    async getQuizResult(id: string): Promise<QuizResult | undefined> {
        const [result] = await db.select().from(quizResults).where(eq(quizResults.id, id));
        return result;
    }

    async getQuizResults(userId: string): Promise<QuizResult[]> {
        return db.select().from(quizResults).where(eq(quizResults.userId, userId)).orderBy(desc(quizResults.completedAt));
    }

    async createQuizResult(result: Omit<QuizResult, "id">): Promise<QuizResult> {
        const [newResult] = await db.insert(quizResults).values(result).returning();
        return newResult;
    }

    // Chat Sessions
    async getChatSession(id: string): Promise<ChatSession | undefined> {
        const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
        return session;
    }

    async getChatSessions(userId: string): Promise<ChatSession[]> {
        return db.select().from(chatSessions).where(eq(chatSessions.userId, userId)).orderBy(desc(chatSessions.createdAt));
    }

    async createChatSession(session: Omit<ChatSession, "id">): Promise<ChatSession> {
        const [newSession] = await db.insert(chatSessions).values(session).returning();
        return newSession;
    }

    async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
        const [updated] = await db.update(chatSessions).set(updates).where(eq(chatSessions.id, id)).returning();
        return updated;
    }

    // Highlights
    async getHighlights(documentId: string): Promise<Highlight[]> {
        return db.select().from(highlights).where(eq(highlights.documentId, documentId)).orderBy(desc(highlights.createdAt));
    }

    async createHighlight(highlight: Omit<Highlight, "id">): Promise<Highlight> {
        const [newHighlight] = await db.insert(highlights).values(highlight).returning();
        return newHighlight;
    }

    async deleteHighlight(id: string): Promise<boolean> {
        const [deleted] = await db.delete(highlights).where(eq(highlights.id, id)).returning();
        return !!deleted;
    }

    // User Notes
    async getUserNotes(documentId: string): Promise<UserNote[]> {
        return db.select().from(userNotes).where(eq(userNotes.documentId, documentId)).orderBy(desc(userNotes.createdAt));
    }

    async createUserNote(note: Omit<UserNote, "id">): Promise<UserNote> {
        const [newNote] = await db.insert(userNotes).values(note).returning();
        return newNote;
    }

    // User Flashcards
    async getUserFlashcards(documentId: string): Promise<UserFlashcard[]> {
        return db.select().from(userFlashcards).where(eq(userFlashcards.documentId, documentId)).orderBy(desc(userFlashcards.createdAt));
    }

    async createUserFlashcard(flashcard: Omit<UserFlashcard, "id">): Promise<UserFlashcard> {
        const [newFlashcard] = await db.insert(userFlashcards).values(flashcard).returning();
        return newFlashcard;
    }
}
