import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import {
  generateMCQs,
  generateFlashcards,
  generateSummary,
  generateMindmap,
  generateNotes,
  tutorChat
} from "./openai";
import {
  generateMCQRequestSchema,
  generateFlashcardsRequestSchema,
  generateSummaryRequestSchema,
  generateMindmapRequestSchema,
  generateNotesRequestSchema,
  tutorChatRequestSchema,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { setupAuth } from "./auth";
import { toSafeISO } from "./date-utils";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Helper to extract text from PDF
async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  // Using pdf.js via dynamic import for text extraction
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  let fullText = "";
  const pageCount = pdf.numPages;

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n\n";
  }

  return { text: fullText.trim(), pageCount };
}

// Helper to chunk text
function chunkText(text: string, chunkSize: number = 500): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }

  return chunks;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).send("Unauthorized");
  };

  // Document Upload
  app.post("/api/documents/upload", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { text, pageCount } = await extractTextFromPDF(req.file.buffer);
      const chunks = chunkText(text);

      const userId = (req.user as any)?.id;
      if (!userId) {
        console.error("User ID missing in request:", req.user);
        return res.status(401).json({ message: "User not authenticated correctly" });
      }

      console.log("DEBUG: Creating doc for", userId);
      const document = await storage.createDocument({
        userId,
        name: req.file.originalname.replace(".pdf", ""),
        fileName: req.file.originalname,
        fileSize: req.file.size,
        pageCount,
        uploadedAt: new Date(),
        content: text,
        chunks,
      });

      res.json(document);
    } catch (error: any) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: error.message || "Failed to upload document" });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    console.log("DEBUG: Getting docs for", (req.user as any)?.id);
    try {
      const documents = await storage.getDocuments((req.user as any).id);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get documents" });
    }
  });

  // Get single document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      res.json(document);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteDocument(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete document" });
    }
  });

  // Generate MCQs
  app.post("/api/mcq/generate", async (req, res) => {
    try {
      const parsed = generateMCQRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.errors });
      }

      const { documentId, topic, count, difficulty } = parsed.data;

      let content = "";
      let finalTopic = topic || "";

      if (documentId) {
        const doc = await storage.getDocument(documentId);
        if (!doc) {
          return res.status(404).json({ message: "Document not found" });
        }
        content = doc.content;
        finalTopic = topic || doc.name;
      }

      if (!content && !topic) {
        return res.status(400).json({ message: "Either a document or topic is required" });
      }

      const provider = req.body.provider || "gemini";
      const result = await generateMCQs(content, finalTopic, parseInt(count), difficulty, provider);

      const mcqSet = await storage.createMCQSet({
        userId: (req.user as any).id,
        documentId,
        topic: finalTopic,
        mcqs: result.mcqs.map((mcq) => ({
          id: randomUUID(),
          question: mcq.question,
          options: mcq.options.map((opt) => ({
            id: randomUUID(),
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
          difficulty,
          explanation: mcq.explanation,
        })),
        createdAt: new Date(),
      });

      res.json(mcqSet);
    } catch (error: any) {
      console.error("Error generating MCQs:", error);
      res.status(500).json({ message: error.message || "Failed to generate MCQs" });
    }
  });

  // Generate Flashcards
  app.post("/api/flashcards/generate", async (req, res) => {
    try {
      const parsed = generateFlashcardsRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.errors });
      }

      const { documentId, topic, count } = parsed.data;

      let content = "";
      let finalTopic = topic || "";

      if (documentId) {
        const doc = await storage.getDocument(documentId);
        if (!doc) {
          return res.status(404).json({ message: "Document not found" });
        }
        content = doc.content;
        finalTopic = topic || doc.name;
      }

      if (!content && !topic) {
        return res.status(400).json({ message: "Either a document or topic is required" });
      }

      const provider = req.body.provider || "gemini";
      const result = await generateFlashcards(content, finalTopic, count, provider);

      const flashcardSet = await storage.createFlashcardSet({
        userId: (req.user as any).id,
        documentId,
        topic: finalTopic,
        flashcards: result.flashcards.map((fc) => ({
          id: randomUUID(),
          front: fc.front,
          back: fc.back,
          mastered: false,
        })),
        createdAt: new Date(),
      });

      res.json(flashcardSet);
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      res.status(500).json({ message: error.message || "Failed to generate flashcards" });
    }
  });

  // Generate Summary
  app.post("/api/summary/generate", async (req, res) => {
    try {
      const parsed = generateSummaryRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.errors });
      }

      const { documentId, topic, mode, bulletPoints } = parsed.data;

      let content = "";
      let finalTopic = topic || "";

      if (documentId) {
        const doc = await storage.getDocument(documentId);
        if (!doc) {
          return res.status(404).json({ message: "Document not found" });
        }
        content = doc.content;
        finalTopic = topic || doc.name;
      }

      if (!content && !topic) {
        return res.status(400).json({ message: "Either a document or topic is required" });
      }

      const provider = req.body.provider || "gemini";
      const result = await generateSummary(content, finalTopic, mode, bulletPoints || false, provider);

      const summary = await storage.createSummary({
        userId: (req.user as any).id,
        documentId,
        topic: finalTopic,
        mode,
        content: result.content,
        bulletPoints: result.bulletPoints,
        keyTerms: result.keyTerms,
        createdAt: new Date(),
      });

      res.json(summary);
    } catch (error: any) {
      console.error("Error generating summary:", error);
      res.status(500).json({ message: error.message || "Failed to generate summary" });
    }
  });

  // Generate Mindmap
  app.post("/api/mindmap/generate", async (req, res) => {
    try {
      const parsed = generateMindmapRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.errors });
      }

      const { documentId, topic } = parsed.data;

      let content = "";
      let finalTopic = topic || "";

      if (documentId) {
        const doc = await storage.getDocument(documentId);
        if (!doc) {
          return res.status(404).json({ message: "Document not found" });
        }
        content = doc.content;
        finalTopic = topic || doc.name;
      }

      if (!content && !topic) {
        return res.status(400).json({ message: "Either a document or topic is required" });
      }

      const provider = req.body.provider || "gemini";
      const result = await generateMindmap(content, finalTopic, provider);

      const mindmap = await storage.createMindmap({
        userId: (req.user as any).id,
        documentId,
        topic: finalTopic,
        nodes: result.nodes.map((node) => ({
          id: node.id,
          type: "default",
          position: { x: node.x, y: node.y },
          data: { label: node.label },
        })),
        edges: result.edges.map((edge) => ({
          id: randomUUID(),
          source: edge.source,
          target: edge.target,
          animated: true,
        })),
        createdAt: new Date(),
      });

      res.json(mindmap);
    } catch (error: any) {
      console.error("Error generating mindmap:", error);
      res.status(500).json({ message: error.message || "Failed to generate mindmap" });
    }
  });

  // Generate Notes
  app.post("/api/notes/generate", async (req, res) => {
    try {
      const parsed = generateNotesRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.errors });
      }

      const { documentId, topic } = parsed.data;

      let content = "";
      let finalTopic = topic || "";

      if (documentId) {
        const doc = await storage.getDocument(documentId);
        if (!doc) {
          return res.status(404).json({ message: "Document not found" });
        }
        content = doc.content;
        finalTopic = topic || doc.name;
      }

      if (!content && !topic) {
        return res.status(400).json({ message: "Either a document or topic is required" });
      }

      const provider = req.body.provider || "gemini";
      const result = await generateNotes(content, finalTopic, provider);

      const notes = await storage.createNotes({
        userId: (req.user as any).id,
        documentId,
        topic: finalTopic,
        keyPoints: result.keyPoints,
        definitions: result.definitions,
        importantSentences: result.importantSentences,
        formulas: result.formulas,
        createdAt: new Date(),
      });

      res.json(notes);
    } catch (error: any) {
      console.error("Error generating notes:", error);
      res.status(500).json({ message: error.message || "Failed to generate notes" });
    }
  });

  // Tutor Chat
  app.post("/api/tutor/chat", async (req, res) => {
    try {
      const parsed = tutorChatRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.errors });
      }

      const { sessionId, documentId, message } = parsed.data;

      let session = sessionId ? await storage.getChatSession(sessionId) : null;
      let documentContext = "";

      if (documentId) {
        const doc = await storage.getDocument(documentId);
        if (doc) {
          documentContext = doc.content;
        }
      }

      const conversationHistory = session?.messages || [];

      const provider = req.body.provider || "gemini";
      const response = await tutorChat(message, conversationHistory, documentContext, provider);

      const userMessage = {
        id: randomUUID(),
        role: "user" as const,
        content: message,
        timestamp: new Date(),
      };

      const assistantMessage = {
        id: randomUUID(),
        role: "assistant" as const,
        content: response,
        timestamp: new Date(),
      };

      if (session) {
        session = await storage.updateChatSession(session.id, {
          messages: [...session.messages, userMessage, assistantMessage],
        });
      } else {
        session = await storage.createChatSession({
          userId: (req.user as any).id,
          documentId,
          messages: [userMessage, assistantMessage],
          createdAt: new Date(),
        });
      }

      res.json({ session, response });
    } catch (error: any) {
      console.error("Error in tutor chat:", error);
      res.status(500).json({ message: error.message || "Failed to process chat message" });
    }
  });

  // Quiz Results
  app.post("/api/quiz/results", async (req, res) => {
    try {
      const result = await storage.createQuizResult({
        ...req.body,
        userId: (req.user as any).id,
      });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to save quiz result" });
    }
  });

  app.get("/api/quiz/results", async (req, res) => {
    try {
      const results = await storage.getQuizResults((req.user as any).id);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get quiz results" });
    }
  });

  // Stats Endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { documentId, range } = req.query;

      const [quizResults, mcqSets, flashcardSets] = await Promise.all([
        storage.getQuizResults(userId),
        storage.getMCQSets(userId),
        storage.getFlashcardSets(userId)
      ]);

      const mcqSetMap = new Map(mcqSets.map(s => [s.id, s]));

      // Filter by Document
      let filteredQuizResults = quizResults;
      let filteredFlashcardSets = flashcardSets;

      if (documentId && documentId !== "all") {
        filteredQuizResults = quizResults.filter(r => {
          const set = mcqSetMap.get(r.mcqSetId);
          return set?.documentId === documentId;
        });
        filteredFlashcardSets = flashcardSets.filter(s => s.documentId === documentId);
      }

      // Filter by Time Range (for trends/activity)
      const now = new Date();
      let startDate = new Date(0); // Default to all time

      if (range === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (range === "month") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const recentActivity = [
        ...filteredQuizResults.map(r => ({
          type: "quiz",
          topic: r.topic,
          date: toSafeISO(r.completedAt) || "",
          score: r.percentage
        })),
        ...filteredFlashcardSets.map(s => ({
          type: "flashcards",
          topic: s.topic,
          date: toSafeISO(s.createdAt) || "",
          score: undefined
        }))
      ]
        .filter(a => a.date && new Date(a.date) >= startDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      // Calculate Stats
      const totalQuizzes = filteredQuizResults.length;
      const averageScore = totalQuizzes > 0
        ? Math.round(filteredQuizResults.reduce((acc, r) => acc + r.percentage, 0) / totalQuizzes)
        : 0;

      const totalFlashcards = filteredFlashcardSets.reduce((acc, s) => acc + s.flashcards.length, 0);
      const totalFlashcardsMastered = filteredFlashcardSets.reduce((acc, s) =>
        acc + s.flashcards.filter(c => c.mastered).length, 0
      );

      const studyTime = filteredQuizResults.reduce((acc, r) => acc + (r.timeTaken || 0), 0) / 60; // Minutes

      // Quiz Scores Trend
      const quizScores = filteredQuizResults
        .filter(r => new Date(r.completedAt) >= startDate)
        .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
        .map(r => ({
          date: toSafeISO(r.completedAt) || "",
          score: r.percentage,
          topic: r.topic
        }))
        .filter(r => r.date); // Remove any with invalid dates

      // Topic Mastery (Average score per topic)
      const topicStats = new Map<string, { total: number; count: number }>();
      filteredQuizResults.forEach(r => {
        const current = topicStats.get(r.topic) || { total: 0, count: 0 };
        topicStats.set(r.topic, {
          total: current.total + r.percentage,
          count: current.count + 1
        });
      });

      const topicMastery = Array.from(topicStats.entries()).map(([name, stats]) => ({
        name,
        value: Math.round(stats.total / stats.count)
      }));

      res.json({
        totalQuizzes,
        averageScore,
        totalFlashcardsMastered,
        totalFlashcards,
        studyTime,
        quizScores,
        topicMastery,
        recentActivity
      });

    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: error.message || "Failed to fetch stats" });
    }
  });

  return httpServer;
}
