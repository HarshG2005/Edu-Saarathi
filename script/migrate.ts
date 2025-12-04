import "dotenv/config";
import { pool } from "../server/db";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        const migrationPath = path.join(__dirname, "../migrations/20250101_jwt_users_and_ownership.sql");
        console.log(`Reading migration file from: ${migrationPath}`);

        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Migration file not found at ${migrationPath}`);
        }

        const sql = fs.readFileSync(migrationPath, "utf-8");

        console.log("Running migration...");
        await pool.query(sql);
        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
