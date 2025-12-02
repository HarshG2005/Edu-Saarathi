"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tutorChatRequestSchema = exports.generateNotesRequestSchema = exports.generateMindmapRequestSchema = exports.generateSummaryRequestSchema = exports.generateFlashcardsRequestSchema = exports.generateMCQRequestSchema = exports.chatSessionSchema = exports.chatSessions = exports.quizResultSchema = exports.quizResults = exports.notesSchema = exports.notes = exports.mindmapSchema = exports.mindmaps = exports.summarySchema = exports.summaries = exports.flashcardSetSchema = exports.flashcardSets = exports.mcqSetSchema = exports.mcqSets = exports.documentSchema = exports.documents = exports.insertUserSchema = exports.users = exports.quizAnswerSchema = exports.chatMessageSchema = exports.mindmapEdgeSchema = exports.mindmapNodeSchema = exports.flashcardSchema = exports.mcqSchema = exports.mcqOptionSchema = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
// --- Types for JSON columns (Defined first) ---
exports.mcqOptionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    text: zod_1.z.string(),
    isCorrect: zod_1.z.boolean(),
});
exports.mcqSchema = zod_1.z.object({
    id: zod_1.z.string(),
    question: zod_1.z.string(),
    options: zod_1.z.array(exports.mcqOptionSchema),
    difficulty: zod_1.z.enum(["easy", "medium", "hard"]),
    explanation: zod_1.z.string().optional(),
});
exports.flashcardSchema = zod_1.z.object({
    id: zod_1.z.string(),
    front: zod_1.z.string(),
    back: zod_1.z.string(),
    mastered: zod_1.z.boolean(),
});
exports.mindmapNodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string().optional(),
    position: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
    }),
    data: zod_1.z.object({
        label: zod_1.z.string(),
    }),
});
exports.mindmapEdgeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    source: zod_1.z.string(),
    target: zod_1.z.string(),
    animated: zod_1.z.boolean().optional(),
});
exports.chatMessageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    role: zod_1.z.enum(["user", "assistant"]),
    content: zod_1.z.string(),
    timestamp: zod_1.z.string(),
});
exports.quizAnswerSchema = zod_1.z.object({
    mcqId: zod_1.z.string(),
    selectedOptionId: zod_1.z.string(),
    isCorrect: zod_1.z.boolean(),
    timeTaken: zod_1.z.number().optional(),
});
// --- Drizzle Tables ---
// Users
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({ id: true });
// Documents
exports.documents = (0, pg_core_1.pgTable)("documents", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    name: (0, pg_core_1.text)("name").notNull(),
    fileName: (0, pg_core_1.text)("file_name").notNull(),
    fileSize: (0, pg_core_1.integer)("file_size").notNull(),
    pageCount: (0, pg_core_1.integer)("page_count").notNull(),
    uploadedAt: (0, pg_core_1.timestamp)("uploaded_at").defaultNow().notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    chunks: (0, pg_core_1.jsonb)("chunks").notNull(),
});
exports.documentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documents);
// MCQ Sets
exports.mcqSets = (0, pg_core_1.pgTable)("mcq_sets", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    documentId: (0, pg_core_1.uuid)("document_id").references(function () { return exports.documents.id; }),
    topic: (0, pg_core_1.text)("topic").notNull(),
    mcqs: (0, pg_core_1.jsonb)("mcqs").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.mcqSetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mcqSets);
// Flashcard Sets
exports.flashcardSets = (0, pg_core_1.pgTable)("flashcard_sets", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    documentId: (0, pg_core_1.uuid)("document_id").references(function () { return exports.documents.id; }),
    topic: (0, pg_core_1.text)("topic").notNull(),
    flashcards: (0, pg_core_1.jsonb)("flashcards").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.flashcardSetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.flashcardSets);
// Summaries
exports.summaries = (0, pg_core_1.pgTable)("summaries", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    documentId: (0, pg_core_1.uuid)("document_id").references(function () { return exports.documents.id; }),
    topic: (0, pg_core_1.text)("topic").notNull(),
    mode: (0, pg_core_1.text)("mode").notNull(), // "short", "medium", "detailed"
    content: (0, pg_core_1.text)("content").notNull(),
    bulletPoints: (0, pg_core_1.jsonb)("bullet_points").default([]),
    keyTerms: (0, pg_core_1.jsonb)("key_terms").default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.summarySchema = (0, drizzle_zod_1.createInsertSchema)(exports.summaries);
// Mindmaps
exports.mindmaps = (0, pg_core_1.pgTable)("mindmaps", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    documentId: (0, pg_core_1.uuid)("document_id").references(function () { return exports.documents.id; }),
    topic: (0, pg_core_1.text)("topic").notNull(),
    nodes: (0, pg_core_1.jsonb)("nodes").notNull(),
    edges: (0, pg_core_1.jsonb)("edges").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.mindmapSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mindmaps);
// Notes
exports.notes = (0, pg_core_1.pgTable)("notes", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    documentId: (0, pg_core_1.uuid)("document_id").references(function () { return exports.documents.id; }),
    topic: (0, pg_core_1.text)("topic").notNull(),
    keyPoints: (0, pg_core_1.jsonb)("key_points").notNull(),
    definitions: (0, pg_core_1.jsonb)("definitions").notNull(),
    importantSentences: (0, pg_core_1.jsonb)("important_sentences").notNull(),
    formulas: (0, pg_core_1.jsonb)("formulas").default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.notesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.notes);
// Quiz Results
exports.quizResults = (0, pg_core_1.pgTable)("quiz_results", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    mcqSetId: (0, pg_core_1.uuid)("mcq_set_id").notNull(),
    topic: (0, pg_core_1.text)("topic").notNull(),
    answers: (0, pg_core_1.jsonb)("answers").notNull(),
    score: (0, pg_core_1.integer)("score").notNull(),
    totalQuestions: (0, pg_core_1.integer)("total_questions").notNull(),
    percentage: (0, pg_core_1.integer)("percentage").notNull(),
    timeTaken: (0, pg_core_1.integer)("time_taken"),
    completedAt: (0, pg_core_1.timestamp)("completed_at").defaultNow().notNull(),
});
exports.quizResultSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizResults);
// Chat Sessions
exports.chatSessions = (0, pg_core_1.pgTable)("chat_sessions", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    documentId: (0, pg_core_1.uuid)("document_id").references(function () { return exports.documents.id; }),
    messages: (0, pg_core_1.jsonb)("messages").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.chatSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.chatSessions);
// API request schemas
exports.generateMCQRequestSchema = zod_1.z.object({
    documentId: zod_1.z.string().optional(),
    topic: zod_1.z.string().optional(),
    count: zod_1.z.enum(["5", "10", "20"]),
    difficulty: zod_1.z.enum(["easy", "medium", "hard"]),
});
exports.generateFlashcardsRequestSchema = zod_1.z.object({
    documentId: zod_1.z.string().optional(),
    topic: zod_1.z.string().optional(),
    count: zod_1.z.number().min(5).max(50),
});
exports.generateSummaryRequestSchema = zod_1.z.object({
    documentId: zod_1.z.string().optional(),
    topic: zod_1.z.string().optional(),
    mode: zod_1.z.enum(["short", "medium", "detailed"]),
    bulletPoints: zod_1.z.boolean().optional(),
});
exports.generateMindmapRequestSchema = zod_1.z.object({
    documentId: zod_1.z.string().optional(),
    topic: zod_1.z.string().optional(),
});
exports.generateNotesRequestSchema = zod_1.z.object({
    documentId: zod_1.z.string().optional(),
    topic: zod_1.z.string().optional(),
});
exports.tutorChatRequestSchema = zod_1.z.object({
    sessionId: zod_1.z.string().optional(),
    documentId: zod_1.z.string().optional(),
    message: zod_1.z.string(),
});
