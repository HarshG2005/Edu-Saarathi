require("dotenv").config();
const { defineConfig } = require("drizzle-kit");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
}

module.exports = defineConfig({
    out: "./migrations",
    schema: "./dist-schema/schema.migration.js",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
