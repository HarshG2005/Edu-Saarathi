
import { storage } from "./server/storage";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function testPdfFlow() {
    try {
        console.log("Starting PDF flow test...");

        // 1. Create a dummy user if needed (or use existing)
        // For simplicity, we'll just mock a user ID or fetch one
        const users = await db.execute(sql`SELECT id FROM users LIMIT 1`);
        let userId = users.rows[0]?.id;

        if (!userId) {
            console.log("No users found, creating one...");
            // This part depends on your user creation logic, skipping for now assuming a user exists
            // or we can just insert one via raw SQL
            const newUser = await db.execute(sql`INSERT INTO users (username, password) VALUES ('testuser', 'password') RETURNING id`);
            userId = newUser.rows[0].id;
        }
        console.log("Using User ID:", userId);

        // 2. Create a dummy PDF document
        const pdfContent = "Dummy PDF Content";
        const pdfBase64 = Buffer.from(pdfContent).toString("base64");

        console.log("Creating document with PDF data length:", pdfBase64.length);

        const doc = await storage.createDocument({
            userId: userId as string,
            name: "Test PDF",
            fileName: "test.pdf",
            fileSize: pdfContent.length,
            pageCount: 1,
            uploadedAt: new Date(),
            content: "Extracted text",
            pdfData: pdfBase64,
            chunks: ["Extracted", "text"],
        });

        console.log("Document created with ID:", doc.id);

        // 3. Retrieve the document
        console.log("Retrieving document...");
        const retrievedDoc = await storage.getDocument(doc.id);

        if (!retrievedDoc) {
            console.error("FAILED: Document not found after creation");
            return;
        }

        if (!retrievedDoc.pdfData) {
            console.error("FAILED: pdfData is missing in retrieved document");
        } else {
            console.log("SUCCESS: pdfData found, length:", retrievedDoc.pdfData.length);
            if (retrievedDoc.pdfData === pdfBase64) {
                console.log("SUCCESS: pdfData matches original");
            } else {
                console.error("FAILED: pdfData does not match original");
            }
        }

        // Clean up
        await storage.deleteDocument(doc.id);
        console.log("Cleaned up test document");

    } catch (error) {
        console.error("Test failed with error:", error);
    } finally {
        process.exit(0);
    }
}

testPdfFlow();
