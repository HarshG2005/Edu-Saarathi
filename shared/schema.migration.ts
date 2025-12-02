import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";

// Users
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});

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
    chunks: jsonb("chunks").notNull(),
});

// MCQ Sets
export const mcqSets = pgTable("mcq_sets", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    documentId: uuid("document_id").references(() => documents.id),
    topic: text("topic").notNull(),
    mcqs: jsonb("mcqs").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Flashcard Sets
export const flashcardSets = pgTable("flashcard_sets", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    documentId: uuid("document_id").references(() => documents.id),
    topic: text("topic").notNull(),
    flashcards: jsonb("flashcards").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Summaries
export const summaries = pgTable("summaries", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    documentId: uuid("document_id").references(() => documents.id),
    topic: text("topic").notNull(),
    mode: text("mode").notNull(),
    content: text("content").notNull(),
    bulletPoints: jsonb("bullet_points").default([]),
    keyTerms: jsonb("key_terms").default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mindmaps
export const mindmaps = pgTable("mindmaps", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    documentId: uuid("document_id").references(() => documents.id),
    topic: text("topic").notNull(),
    nodes: jsonb("nodes").notNull(),
    edges: jsonb("edges").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// Chat Sessions
export const chatSessions = pgTable("chat_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    documentId: uuid("document_id").references(() => documents.id),
    messages: jsonb("messages").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
