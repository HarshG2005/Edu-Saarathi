import { z } from "zod";

// Document schema
export const documentSchema = z.object({
  id: z.string(),
  name: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  pageCount: z.number(),
  uploadedAt: z.string(),
  content: z.string(),
  chunks: z.array(z.string()),
});

export type Document = z.infer<typeof documentSchema>;
export type InsertDocument = Omit<Document, "id">;

// MCQ schemas
export const mcqOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export const mcqSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(mcqOptionSchema),
  difficulty: z.enum(["easy", "medium", "hard"]),
  explanation: z.string().optional(),
});

export const mcqSetSchema = z.object({
  id: z.string(),
  documentId: z.string().optional(),
  topic: z.string(),
  mcqs: z.array(mcqSchema),
  createdAt: z.string(),
});

export type MCQOption = z.infer<typeof mcqOptionSchema>;
export type MCQ = z.infer<typeof mcqSchema>;
export type MCQSet = z.infer<typeof mcqSetSchema>;

// Flashcard schemas
export const flashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  mastered: z.boolean(),
});

export const flashcardSetSchema = z.object({
  id: z.string(),
  documentId: z.string().optional(),
  topic: z.string(),
  flashcards: z.array(flashcardSchema),
  createdAt: z.string(),
});

export type Flashcard = z.infer<typeof flashcardSchema>;
export type FlashcardSet = z.infer<typeof flashcardSetSchema>;

// Summary schemas
export const summarySchema = z.object({
  id: z.string(),
  documentId: z.string().optional(),
  topic: z.string(),
  mode: z.enum(["short", "medium", "detailed"]),
  content: z.string(),
  bulletPoints: z.array(z.string()).optional(),
  keyTerms: z.array(z.string()).optional(),
  createdAt: z.string(),
});

export type Summary = z.infer<typeof summarySchema>;

// Mindmap schemas
export const mindmapNodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z.string(),
  }),
});

export const mindmapEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  animated: z.boolean().optional(),
});

export const mindmapSchema = z.object({
  id: z.string(),
  documentId: z.string().optional(),
  topic: z.string(),
  nodes: z.array(mindmapNodeSchema),
  edges: z.array(mindmapEdgeSchema),
  createdAt: z.string(),
});

export type MindmapNode = z.infer<typeof mindmapNodeSchema>;
export type MindmapEdge = z.infer<typeof mindmapEdgeSchema>;
export type Mindmap = z.infer<typeof mindmapSchema>;

// Notes schemas
export const notesSchema = z.object({
  id: z.string(),
  documentId: z.string().optional(),
  topic: z.string(),
  keyPoints: z.array(z.string()),
  definitions: z.array(z.object({
    term: z.string(),
    definition: z.string(),
  })),
  importantSentences: z.array(z.string()),
  formulas: z.array(z.string()).optional(),
  createdAt: z.string(),
});

export type Notes = z.infer<typeof notesSchema>;

// Tutor chat schemas
export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
});

export const chatSessionSchema = z.object({
  id: z.string(),
  documentId: z.string().optional(),
  messages: z.array(chatMessageSchema),
  createdAt: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatSession = z.infer<typeof chatSessionSchema>;

// Quiz schemas
export const quizAnswerSchema = z.object({
  mcqId: z.string(),
  selectedOptionId: z.string(),
  isCorrect: z.boolean(),
  timeTaken: z.number().optional(),
});

export const quizResultSchema = z.object({
  id: z.string(),
  mcqSetId: z.string(),
  topic: z.string(),
  answers: z.array(quizAnswerSchema),
  score: z.number(),
  totalQuestions: z.number(),
  percentage: z.number(),
  timeTaken: z.number().optional(),
  completedAt: z.string(),
});

export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
export type QuizResult = z.infer<typeof quizResultSchema>;

// Progress schemas
export const progressSchema = z.object({
  totalDocuments: z.number(),
  totalQuizzes: z.number(),
  totalFlashcards: z.number(),
  averageScore: z.number(),
  masteredFlashcards: z.number(),
  topicAccuracy: z.array(z.object({
    topic: z.string(),
    accuracy: z.number(),
    attempts: z.number(),
  })),
  recentActivity: z.array(z.object({
    type: z.string(),
    description: z.string(),
    timestamp: z.string(),
  })),
});

export type Progress = z.infer<typeof progressSchema>;

// API request schemas
export const generateMCQRequestSchema = z.object({
  documentId: z.string().optional(),
  topic: z.string().optional(),
  count: z.enum(["5", "10", "20"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export const generateFlashcardsRequestSchema = z.object({
  documentId: z.string().optional(),
  topic: z.string().optional(),
  count: z.number().min(5).max(50),
});

export const generateSummaryRequestSchema = z.object({
  documentId: z.string().optional(),
  topic: z.string().optional(),
  mode: z.enum(["short", "medium", "detailed"]),
  bulletPoints: z.boolean().optional(),
});

export const generateMindmapRequestSchema = z.object({
  documentId: z.string().optional(),
  topic: z.string().optional(),
});

export const generateNotesRequestSchema = z.object({
  documentId: z.string().optional(),
  topic: z.string().optional(),
});

export const tutorChatRequestSchema = z.object({
  sessionId: z.string().optional(),
  documentId: z.string().optional(),
  message: z.string(),
});

export type GenerateMCQRequest = z.infer<typeof generateMCQRequestSchema>;
export type GenerateFlashcardsRequest = z.infer<typeof generateFlashcardsRequestSchema>;
export type GenerateSummaryRequest = z.infer<typeof generateSummaryRequestSchema>;
export type GenerateMindmapRequest = z.infer<typeof generateMindmapRequestSchema>;
export type GenerateNotesRequest = z.infer<typeof generateNotesRequestSchema>;
export type TutorChatRequest = z.infer<typeof tutorChatRequestSchema>;
