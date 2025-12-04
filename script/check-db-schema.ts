
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Checking mindmaps table schema...");
    try {
        const result = await db.execute(sql`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'mindmaps';
        `);
        console.log(result.rows);
    } catch (error) {
        console.error("Failed to check schema:", error);
    }
    process.exit(0);
}

main();
