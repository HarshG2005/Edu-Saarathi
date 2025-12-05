import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "@shared/schema";
import "dotenv/config";

async function runMigrate() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL must be set");
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool, { schema });

    console.log("Running migrations...");

    try {
        // This will run migrations from the migrations folder
        // When run from dist, the migrations folder should be adjacent
        await migrate(db, { migrationsFolder: "dist/migrations" });
        console.log("Migrations completed successfully");
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrate().catch((err) => {
    console.error("Migration script error:", err);
    process.exit(1);
});
