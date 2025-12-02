"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSessions = exports.quizResults = exports.notes = exports.mindmaps = exports.summaries = exports.flashcardSets = exports.mcqSets = exports.documents = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// Users
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
});
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
// MCQ Sets
exports.mcqSets = (0, pg_core_1.pgTable)("mcq_sets", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    documentId: (0, pg_core_1.uuid)("document_id").references(function () { return exports.documents.id; }),
    topic: (0, pg_core_1.text)("topic").notNull(),
    mcqs: (0, pg_core_1.jsonb)("mcqs").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Flashcard Sets
exports.flashcardSets = (0, pg_core_1.pgTable)("flashcard_sets", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    documentId: (0, pg_core_1.uuid)("document_id").references(function () { return exports.documents.id; }),
    topic: (0, pg_core_1.text)("topic").notNull(),
    flashcards: (0, pg_core_1.jsonb)("flashcards").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Summaries
exports.summaries = (0, pg_core_1.pgTable)("summaries", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    documentId: (0, pg_core_1.uuid)("document_id").references(function () { return exports.documents.id; }),
    topic: (0, pg_core_1.text)("topic").notNull(),
    mode: (0, pg_core_1.text)("mode").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    bulletPoints: (0, pg_core_1.jsonb)("bullet_points").default([]),
    keyTerms: (0, pg_core_1.jsonb)("key_terms").default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
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
// Chat Sessions
exports.chatSessions = (0, pg_core_1.pgTable)("chat_sessions", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }),
    documentId: (0, pg_core_1.uuid)("document_id").references(function () { return exports.documents.id; }),
    messages: (0, pg_core_1.jsonb)("messages").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
