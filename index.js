import express from 'express';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize DB
mkdirSync(join(__dirname, 'data'), { recursive: true });
const db = new sqlite3.Database(join(__dirname, 'data', 'campaign.db'));

db.run(`
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
`, (err) => {
  if (err) console.error('DB init error:', err);
  else console.log('Database initialized');
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Routes
app.post('/api/volunteer', express.json(), (req, res) => {
  const { first_name, last_name, email, phone, zip_code, interests, message } = req.body;

  // Validation
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const interestsStr = Array.isArray(interests) ? interests.join(', ') : (interests || null);

  db.run(
    `INSERT INTO volunteers (first_name, last_name, email, phone, zip_code, interests, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name.trim(),
      last_name.trim(),
      email.trim().toLowerCase(),
      phone?.trim() || null,
      zip_code?.trim() || null,
      interestsStr,
      message?.trim() || null
    ],
    function(err) {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
      }
      res.json({ success: true, message: 'Thank you for signing up! We\'ll be in touch soon.' });
    }
  );
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/volunteer', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'volunteer.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Jay 2028 campaign site running on port ${port}`);
});
