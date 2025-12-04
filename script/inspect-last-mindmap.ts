
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Fetching last mindmap...");
    try {
        const result = await db.execute(sql`
            SELECT id, name, graph
            FROM mindmaps
            ORDER BY created_at DESC
            LIMIT 1;
        `);
        if (result.rows.length > 0) {
            console.log("Last Mindmap:", JSON.stringify(result.rows[0], null, 2));
        } else {
            console.log("No mindmaps found.");
        }
    } catch (error) {
        console.error("Failed to fetch mindmap:", error);
    }
    process.exit(0);
}

main();
