const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/leaderboard', (req, res) => {
  fs.readFile('leaderboard.json', 'utf8', (err, data) => {
    if (err) throw err;
    res.send(JSON.parse(data));
  });
});

app.post('/leaderboard', (req, res) => {
  const newEntry = req.body;
  fs.readFile('leaderboard.json', 'utf8', (err, data) => {
    if (err) throw err;
    const leaderboard = JSON.parse(data);
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 10) {
      leaderboard.pop();
    }
    fs.writeFile('leaderboard.json', JSON.stringify(leaderboard), (err) => {
      if (err) throw err;
      res.send('Leaderboard updated');
    });
  });
});

// Add the code snippet here, just before the app.listen() call
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
