import { Pool } from "pg";

export const pool = new Pool({
  host: "localhost",
  port: 5433,
  user: "postgres",
  password: "Sarera2005",
  database: "postgres",
});


(async () => {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL, server time is", rows[0].now);
  } catch (err: unknown) {
    console.error(
      "❌ Cannot connect to PostgreSQL:",
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  }
})();
