import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function clearCorruptedData() {
    const client = await pool.connect();

    try {
        console.log('Starting cleanup of corrupted data...');

        // Delete from all tables that might have corrupted dates
        const tables = [
            'flashcard_sets',
            'mindmaps',
            'summaries',
            'notes',
            'quiz_results',
            'chat_sessions'
        ];

        for (const table of tables) {
            const result = await client.query(`DELETE FROM ${table}`);
            console.log(`✓ Cleared ${result.rowCount} records from ${table}`);
        }

        console.log('\n✅ Database cleanup complete!');
        console.log('You can now generate flashcards/mindmaps without errors.');

    } catch (error) {
        console.error('Error during cleanup:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

clearCorruptedData()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
