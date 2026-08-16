const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ===== SETUP DATABASE =====
const db = new sqlite3.Database('./database.sqlite');

db.run(`
  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    user_agent TEXT,
    page TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ===== LOG ENDPOINT =====
app.post('/log', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const { page } = req.body;

  const stmt = db.prepare('INSERT INTO visits (ip, user_agent, page) VALUES (?, ?, ?)');
  stmt.run(ip, userAgent, page, function(err) {
    if (err) {
      console.error('Log error:', err);
      return res.status(500).json({ status: 'error' });
    }
    res.json({ status: 'logged', id: this.lastID });
  });
  stmt.finalize();
});

// ===== (OPTIONAL) VIEW LOGS =====
app.get('/logs', (req, res) => {
  db.all('SELECT * FROM visits ORDER BY timestamp DESC LIMIT 100', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ===== SERVE FRONTEND =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Logs available at http://localhost:${PORT}/logs`);
});