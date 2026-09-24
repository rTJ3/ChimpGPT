const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');
const MAX_ENTRIES = 10;
const MAX_NAME_LENGTH = 32;

app.disable('x-powered-by');

// Basic security headers
app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});

// Middleware
app.use(express.json({ limit: '1kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function readLeaderboard(callback) {
  fs.readFile(LEADERBOARD_FILE, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return callback(null, []);
      return callback(err);
    }
    try {
      const leaderboard = JSON.parse(data);
      callback(null, Array.isArray(leaderboard) ? leaderboard : []);
    } catch (parseErr) {
      callback(parseErr);
    }
  });
}

// Only keep the fields we expect, with sane types and sizes
function sanitizeEntry(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const { name, score } = body;
  if (typeof name !== 'string' || !Number.isSafeInteger(score) || score < 0) return null;
  const trimmedName = name.trim().slice(0, MAX_NAME_LENGTH);
  if (!trimmedName) return null;
  return { name: trimmedName, score };
}

// Routes
app.get('/leaderboard', (req, res, next) => {
  readLeaderboard((err, leaderboard) => {
    if (err) return next(err);
    res.json(leaderboard);
  });
});

// Serialize writes so concurrent requests can't clobber each other
let writeQueue = Promise.resolve();

app.post('/leaderboard', (req, res, next) => {
  const newEntry = sanitizeEntry(req.body);
  if (!newEntry) {
    return res.status(400).json({ error: 'Expected { name: string, score: non-negative integer }' });
  }

  writeQueue = writeQueue.then(() => new Promise((resolve) => {
    readLeaderboard((err, leaderboard) => {
      if (err) {
        next(err);
        return resolve();
      }
      leaderboard.push(newEntry);
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard.splice(MAX_ENTRIES);
      fs.writeFile(LEADERBOARD_FILE, JSON.stringify(leaderboard), (writeErr) => {
        if (writeErr) next(writeErr);
        else res.send('Leaderboard updated');
        resolve();
      });
    });
  }));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Log errors server-side without leaking details to the client
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.expose ? err.message : 'Internal server error' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
