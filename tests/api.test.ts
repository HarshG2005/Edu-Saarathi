import "dotenv/config";
import { storage } from "../server/storage";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { UserFlashcard } from "@shared/schema";

async function testFlashcards() {
    try {
        console.log("Starting Flashcard Storage Test...");

        // Apply migration if needed
        await db.execute(sql`
            ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS difficulty INTEGER DEFAULT 0;
            ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS interval INTEGER DEFAULT 0;
            ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS ease INTEGER DEFAULT 250;
            ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS repetition INTEGER DEFAULT 0;
            ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS next_review TIMESTAMP;
            ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW() NOT NULL;
        `);
        console.log("Applied migration (if needed)");

        // Check columns
        const columns = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_flashcards'
        `);
        console.log("Table columns:", columns.rows);

        // 1. Get or Create User
        const users = await db.execute(sql`SELECT id FROM users LIMIT 1`);
        let userId = users.rows[0]?.id;

        if (!userId) {
            console.log("No users found, creating one...");
            const newUser = await db.execute(sql`INSERT INTO users (username, password, email) VALUES ('testuser', 'password', 'test@example.com') RETURNING id`);
            userId = newUser.rows[0].id;
        }
        console.log("Using User ID:", userId);

        // 2. Create Document
        const doc = await storage.createDocument({
            userId: userId as string,
            name: "Test Doc for Flashcards",
            fileName: "test_flashcards.pdf",
            fileSize: 100,
            pageCount: 1,
            uploadedAt: new Date(),
            content: "Content",
            pdfData: "dummy",
            chunks: ["Content"],
        });
        console.log("Created Document ID:", doc.id);

        // 3. Create Flashcard
        const flashcardData = {
            userId: userId as string,
            documentId: doc.id,
            highlightId: null,
            question: "What is the capital of France?",
            answer: "Paris",
            tags: ["geography"],
            difficulty: 0,
            interval: 0,
            ease: 250,
            repetition: 0,
            nextReview: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const flashcard = await storage.createUserFlashcard(flashcardData);
        console.log("Created Flashcard ID:", flashcard.id);

        if (flashcard.question !== "What is the capital of France?") {
            throw new Error("Flashcard content mismatch");
        }

        // 4. Get Flashcards
        const docFlashcards = await storage.getUserFlashcards(doc.id);
        console.log(`Found ${docFlashcards.length} flashcards for document`);
        if (docFlashcards.length !== 1) throw new Error("Expected 1 flashcard for document");

        const dueFlashcards = await storage.getDueUserFlashcards(userId as string);
        console.log(`Found ${dueFlashcards.length} due flashcards`);
        // Should be 1 because nextReview is null (treated as due or new)
        const isDue = dueFlashcards.find(f => f.id === flashcard.id);
        if (!isDue) throw new Error("Flashcard should be due");

        // 5. Update Flashcard (Simulate Review - Good)
        // SM-2: quality 4, rep 0 -> rep 1, interval 1, ease 250
        const updateData: Partial<UserFlashcard> = {
            difficulty: 4,
            interval: 1,
            repetition: 1,
            ease: 250,
            nextReview: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // +1 day
        };

        const updated = await storage.updateUserFlashcard(flashcard.id, updateData);
        console.log("Updated Flashcard:", updated?.id);

        if (updated?.repetition !== 1) throw new Error("Update failed: repetition mismatch");

        // 6. Verify Not Due
        const dueAfterUpdate = await storage.getDueUserFlashcards(userId as string);
        const isStillDue = dueAfterUpdate.find(f => f.id === flashcard.id);
        if (isStillDue) throw new Error("Flashcard should NOT be due after review");
        console.log("Flashcard correctly rescheduled (not due)");

        // 7. Delete Flashcard
        await storage.deleteUserFlashcard(flashcard.id);
        console.log("Deleted Flashcard");

        const finalCheck = await storage.getUserFlashcards(doc.id);
        if (finalCheck.length !== 0) throw new Error("Flashcard deletion failed");

        // Clean up doc
        await storage.deleteDocument(doc.id);
        console.log("Cleaned up document");

        console.log("SUCCESS: All flashcard tests passed!");

    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

testFlashcards();
