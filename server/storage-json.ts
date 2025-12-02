import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";
import type {
    Document,
    MCQSet,
    FlashcardSet,
    Summary,
    Mindmap,
    Notes,
    QuizResult,
    ChatSession,
} from "@shared/schema";

export class JsonStorage implements IStorage {
    private dataDir: string;

    constructor(dataDir: string = "data") {
        this.dataDir = path.resolve(process.cwd(), dataDir);
        this.init();
    }

    private async init() {
        const dirs = [
            "documents",
            "mcqs",
            "flashcards",
            "summaries",
            "mindmaps",
            "notes",
            "results",
            "chats",
        ];

        for (const dir of dirs) {
            await fs.mkdir(path.join(this.dataDir, dir), { recursive: true });
        }
    }

    private async writeJson<T>(subdir: string, id: string, data: T): Promise<T> {
        const filePath = path.join(this.dataDir, subdir, `${id}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return data;
    }

    private async readJson<T>(subdir: string, id: string): Promise<T | undefined> {
        try {
            const filePath = path.join(this.dataDir, subdir, `${id}.json`);
            const content = await fs.readFile(filePath, "utf-8");
            return JSON.parse(content) as T;
        } catch (error) {
            return undefined;
        }
    }

    private async listJson<T>(subdir: string): Promise<T[]> {
        try {
            const dirPath = path.join(this.dataDir, subdir);
            const files = await fs.readdir(dirPath);
            const items: T[] = [];

            for (const file of files) {
                if (file.endsWith(".json")) {
                    const content = await fs.readFile(path.join(dirPath, file), "utf-8");
                    try {
                        items.push(JSON.parse(content));
                    } catch (e) {
                        console.error(`Error parsing ${file}:`, e);
                    }
                }
            }
            return items;
        } catch (error) {
            return [];
        }
    }

    // Documents
    async getDocument(id: string): Promise<Document | undefined> {
        return this.readJson<Document>("documents", id);
    }

    async getDocuments(): Promise<Document[]> {
        return this.listJson<Document>("documents");
    }

    async createDocument(doc: Omit<Document, "id">): Promise<Document> {
        const id = randomUUID();
        const document: Document = { ...doc, id };
        return this.writeJson("documents", id, document);
    }

    async deleteDocument(id: string): Promise<boolean> {
        try {
            await fs.unlink(path.join(this.dataDir, "documents", `${id}.json`));
            return true;
        } catch {
            return false;
        }
    }

    // MCQ Sets
    async getMCQSet(id: string): Promise<MCQSet | undefined> {
        return this.readJson<MCQSet>("mcqs", id);
    }

    async getMCQSets(): Promise<MCQSet[]> {
        return this.listJson<MCQSet>("mcqs");
    }

    async createMCQSet(set: Omit<MCQSet, "id">): Promise<MCQSet> {
        const id = randomUUID();
        const mcqSet: MCQSet = { ...set, id };
        return this.writeJson("mcqs", id, mcqSet);
    }

    // Flashcard Sets
    async getFlashcardSet(id: string): Promise<FlashcardSet | undefined> {
        return this.readJson<FlashcardSet>("flashcards", id);
    }

    async getFlashcardSets(): Promise<FlashcardSet[]> {
        return this.listJson<FlashcardSet>("flashcards");
    }

    async createFlashcardSet(set: Omit<FlashcardSet, "id">): Promise<FlashcardSet> {
        const id = randomUUID();
        const flashcardSet: FlashcardSet = { ...set, id };
        return this.writeJson("flashcards", id, flashcardSet);
    }

    async updateFlashcardSet(id: string, updates: Partial<FlashcardSet>): Promise<FlashcardSet | undefined> {
        const existing = await this.getFlashcardSet(id);
        if (!existing) return undefined;
        const updated = { ...existing, ...updates };
        return this.writeJson("flashcards", id, updated);
    }

    // Summaries
    async getSummary(id: string): Promise<Summary | undefined> {
        return this.readJson<Summary>("summaries", id);
    }

    async getSummaries(): Promise<Summary[]> {
        return this.listJson<Summary>("summaries");
    }

    async createSummary(summary: Omit<Summary, "id">): Promise<Summary> {
        const id = randomUUID();
        const newSummary: Summary = { ...summary, id };
        return this.writeJson("summaries", id, newSummary);
    }

    // Mindmaps
    async getMindmap(id: string): Promise<Mindmap | undefined> {
        return this.readJson<Mindmap>("mindmaps", id);
    }

    async getMindmaps(): Promise<Mindmap[]> {
        return this.listJson<Mindmap>("mindmaps");
    }

    async createMindmap(mindmap: Omit<Mindmap, "id">): Promise<Mindmap> {
        const id = randomUUID();
        const newMindmap: Mindmap = { ...mindmap, id };
        return this.writeJson("mindmaps", id, newMindmap);
    }

    // Notes
    async getNotes(id: string): Promise<Notes | undefined> {
        return this.readJson<Notes>("notes", id);
    }

    async getAllNotes(): Promise<Notes[]> {
        return this.listJson<Notes>("notes");
    }

    async createNotes(notes: Omit<Notes, "id">): Promise<Notes> {
        const id = randomUUID();
        const newNotes: Notes = { ...notes, id };
        return this.writeJson("notes", id, newNotes);
    }

    // Quiz Results
    async getQuizResult(id: string): Promise<QuizResult | undefined> {
        return this.readJson<QuizResult>("results", id);
    }

    async getQuizResults(): Promise<QuizResult[]> {
        return this.listJson<QuizResult>("results");
    }

    async createQuizResult(result: Omit<QuizResult, "id">): Promise<QuizResult> {
        const id = randomUUID();
        const quizResult: QuizResult = { ...result, id };
        return this.writeJson("results", id, quizResult);
    }

    // Chat Sessions
    async getChatSession(id: string): Promise<ChatSession | undefined> {
        return this.readJson<ChatSession>("chats", id);
    }

    async getChatSessions(): Promise<ChatSession[]> {
        return this.listJson<ChatSession>("chats");
    }

    async createChatSession(session: Omit<ChatSession, "id">): Promise<ChatSession> {
        const id = randomUUID();
        const chatSession: ChatSession = { ...session, id };
        return this.writeJson("chats", id, chatSession);
    }

    async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
        const existing = await this.getChatSession(id);
        if (!existing) return undefined;
        const updated = { ...existing, ...updates };
        return this.writeJson("chats", id, updated);
    }
}
