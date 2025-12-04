
import "dotenv/config";
import { storage } from "../server/storage";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

async function main() {
    console.log("Testing Minimal DB Insertion...");
    const userId = "1155b59f-d8d1-4b6d-ac54-04148dbca14d";
    const graph = { test: true };

    try {
        console.log("Attempt 6: Minimal Raw SQL Insert");
        await db.execute(sql`
            INSERT INTO mindmaps (user_id, name, graph)
            VALUES (${userId}, 'Minimal Test', ${graph})
        `);
        console.log("Success 6");
    } catch (e: any) {
        console.error("Fail 6:");
        console.error(e);
    }
    process.exit(0);
}


main();
