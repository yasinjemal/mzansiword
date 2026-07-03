// Runs a migration file against the remote Supabase DB.
// Usage: node scripts/run-migration.cjs [0002_journey.sql]  (default: 0001_init.sql)
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const file = process.argv[2] || "0001_init.sql";
  const sql = fs.readFileSync(
    path.join(__dirname, "..", "supabase", "migrations", file),
    "utf8"
  );
  console.log(`Running ${file}...`);

  // db.<ref>.supabase.co is IPv6-only; on IPv4 networks fall back to the
  // session pooler (this project lives in aws-1-eu-central-1).
  let client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
  } catch (err) {
    console.log(`Direct connection failed (${err.code || err.message}); trying pooler...`);
    const u = new URL(url);
    const ref = u.hostname.split(".")[1];
    const pooler = `postgres://postgres.${ref}:${u.password}@aws-1-eu-central-1.pooler.supabase.com:5432/postgres`;
    client = new Client({ connectionString: pooler, ssl: { rejectUnauthorized: false } });
    await client.connect();
  }
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
