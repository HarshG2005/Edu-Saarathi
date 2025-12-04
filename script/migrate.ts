import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../server/db";

async function main() {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "migrations" });
    console.log("Migrations completed!");
    await pool.end();
}

main().catch((err) => {
    console.error("Migration failed!", err);
    process.exit(1);
});
