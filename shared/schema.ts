import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Types for JSON columns (Defined first) ---

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

export type MCQOption = z.infer<typeof mcqOptionSchema>;
export type MCQ = z.infer<typeof mcqSchema>;

export const flashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  mastered: z.boolean(),
});

export type Flashcard = z.infer<typeof flashcardSchema>;

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

export type MindmapNode = z.infer<typeof mindmapNodeSchema>;
export type MindmapEdge = z.infer<typeof mindmapEdgeSchema>;

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const quizAnswerSchema = z.object({
  mcqId: z.string(),
  selectedOptionId: z.string(),
  isCorrect: z.boolean(),
  timeTaken: z.number().optional(),
});

export type QuizAnswer = z.infer<typeof quizAnswerSchema>;

// --- Drizzle Tables ---

// Users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Documents
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  pageCount: integer("page_count").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  content: text("content").notNull(),
  pdfData: text("pdf_data"), // Base64 encoded PDF
  chunks: jsonb("chunks").notNull(),
});

export const documentSchema = createInsertSchema(documents);
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof documentSchema>;

// MCQ Sets
export const mcqSets = pgTable("mcq_sets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  documentId: uuid("document_id").references(() => documents.id),
  topic: text("topic").notNull(),
  mcqs: jsonb("mcqs").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mcqSetSchema = createInsertSchema(mcqSets);
export type MCQSet = typeof mcqSets.$inferSelect;

// Flashcard Sets
export const flashcardSets = pgTable("flashcard_sets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  documentId: uuid("document_id").references(() => documents.id),
  topic: text("topic").notNull(),
  flashcards: jsonb("flashcards").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const flashcardSetSchema = createInsertSchema(flashcardSets);
export type FlashcardSet = typeof flashcardSets.$inferSelect;

// Summaries
export const summaries = pgTable("summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  documentId: uuid("document_id").references(() => documents.id),
  topic: text("topic").notNull(),
  mode: text("mode").notNull(), // "short", "medium", "detailed"
  content: text("content").notNull(),
  bulletPoints: jsonb("bullet_points").default([]),
  keyTerms: jsonb("key_terms").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const summarySchema = createInsertSchema(summaries);
export type Summary = typeof summaries.$inferSelect;

// Mindmaps
// Mindmaps
export const mindmaps = pgTable("mindmaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  documentId: uuid("document_id").references(() => documents.id),
  name: text("name").notNull().default("Untitled Mindmap"),
  graph: jsonb("graph").notNull(), // Contains nodes, edges, viewport
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mindmapSchema = createInsertSchema(mindmaps);
export type Mindmap = typeof mindmaps.$inferSelect;

// Mindmap Snapshots
export const mindmapSnapshots = pgTable("mindmap_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  mindmapId: uuid("mindmap_id").notNull().references(() => mindmaps.id, { onDelete: "cascade" }),
  graph: jsonb("graph").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mindmapSnapshotSchema = createInsertSchema(mindmapSnapshots);
export type MindmapSnapshot = typeof mindmapSnapshots.$inferSelect;

// Notes
export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  documentId: uuid("document_id").references(() => documents.id),
  topic: text("topic").notNull(),
  keyPoints: jsonb("key_points").notNull(),
  definitions: jsonb("definitions").notNull(),
  importantSentences: jsonb("important_sentences").notNull(),
  formulas: jsonb("formulas").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notesSchema = createInsertSchema(notes);
export type Notes = typeof notes.$inferSelect;

// Quiz Results
export const quizResults = pgTable("quiz_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  mcqSetId: uuid("mcq_set_id").notNull(),
  topic: text("topic").notNull(),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  percentage: integer("percentage").notNull(),
  timeTaken: integer("time_taken"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const quizResultSchema = createInsertSchema(quizResults);
export type QuizResult = typeof quizResults.$inferSelect;

// Chat Sessions
export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  documentId: uuid("document_id").references(() => documents.id),
  messages: jsonb("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatSessionSchema = createInsertSchema(chatSessions);
export type ChatSession = typeof chatSessions.$inferSelect;


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

// --- User Generated Content ---

// Highlights
export const highlights = pgTable("highlights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  documentId: uuid("document_id").notNull().references(() => documents.id),
  page: integer("page").notNull(),
  text: text("text").notNull(),
  color: text("color").notNull().default("yellow"),
  bbox: jsonb("bbox").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const highlightSchema = createInsertSchema(highlights);
export type Highlight = typeof highlights.$inferSelect;
export type InsertHighlight = z.infer<typeof highlightSchema>;

// User Notes (attached to highlights)
export const userNotes = pgTable("user_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  documentId: uuid("document_id").notNull().references(() => documents.id),
  highlightId: uuid("highlight_id").notNull().references(() => highlights.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userNoteSchema = createInsertSchema(userNotes);
export type UserNote = typeof userNotes.$inferSelect;
export type InsertUserNote = z.infer<typeof userNoteSchema>;

// User Flashcards (individual cards from highlights)
export const userFlashcards = pgTable("user_flashcards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  documentId: uuid("document_id").notNull().references(() => documents.id),
  highlightId: uuid("highlight_id").references(() => highlights.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  tags: jsonb("tags").default([]),
  difficulty: integer("difficulty").default(0), // 0-5
  interval: integer("interval").default(0),
  ease: integer("ease").default(250), // Scaled by 100 (2.5 -> 250)
  repetition: integer("repetition").default(0),
  nextReview: timestamp("next_review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userFlashcardSchema = createInsertSchema(userFlashcards);
export type UserFlashcard = typeof userFlashcards.$inferSelect;
export type InsertUserFlashcard = z.infer<typeof userFlashcardSchema>;
