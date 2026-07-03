// One-shot script to run the init migration against the remote Supabase DB.
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = fs.readFileSync(
    path.join(__dirname, "..", "supabase", "migrations", "0001_init.sql"),
    "utf8"
  );

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected. Running migration...");

  try {
    await client.query(sql);
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
