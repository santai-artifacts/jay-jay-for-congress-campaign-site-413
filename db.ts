import Database from "bun:sqlite";
import { mkdirSync } from "fs";

mkdirSync("./data", { recursive: true });

const db = new Database(process.env.DATABASE_URL || "./data/campaign.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS volunteers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    zip_code TEXT,
    interests TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
