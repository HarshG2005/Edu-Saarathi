
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function main() {
    console.log("Forcing reset of mindmaps table...");
    const migrationPath = path.join(process.cwd(), "migrations", "20250102_mindmaps.sql");
    const sqlContent = fs.readFileSync(migrationPath, "utf-8");

    try {
        // Split by semicolon to execute statements individually if needed, 
        // but db.execute(sql.raw(content)) might work for multiple statements depending on driver.
        // Drizzle sql.raw might treat it as one query. Postgres usually supports multiple statements in one query string.
        await db.execute(sql.raw(sqlContent));
        console.log("Successfully reset mindmaps table.");
    } catch (error) {
        console.error("Failed to reset table:", error);
    }
    process.exit(0);
}

main();
