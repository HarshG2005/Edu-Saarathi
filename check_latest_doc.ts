
import { db } from "./server/db";
import { documents } from "@shared/schema";
import { desc } from "drizzle-orm";

async function checkLatestDoc() {
    try {
        console.log("Checking latest document...");
        const docs = await db.select().from(documents).orderBy(desc(documents.uploadedAt)).limit(1);

        if (docs.length === 0) {
            console.log("No documents found.");
            return;
        }

        const doc = docs[0];
        console.log("Latest Document:", doc.name);
        console.log("ID:", doc.id);
        console.log("Uploaded At:", doc.uploadedAt);
        console.log("File Size:", doc.fileSize);

        if (doc.pdfData) {
            console.log("SUCCESS: pdfData is present.");
            console.log("pdfData Length:", doc.pdfData.length);
            console.log("pdfData Start:", doc.pdfData.substring(0, 50));
        } else {
            console.error("FAILED: pdfData is MISSING or null/undefined.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit(0);
    }
}

checkLatestDoc();
