import "dotenv/config";
import { pool } from "../server/db";

async function checkDb() {
    try {
        console.log("Checking database connection...");
        const client = await pool.connect();
        console.log("Connected successfully.");

        console.log("Checking users table columns...");
        const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);

        console.log("Columns found:");
        columns.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

        client.release();
        process.exit(0);
    } catch (error) {
        console.error("Database check failed:", error);
        process.exit(1);
    }
}

checkDb();
