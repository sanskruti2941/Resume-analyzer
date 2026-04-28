require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const uploadRoute = require('./routes/upload');
const analyzeRoute = require('./routes/analyze');
const matchRoute = require('./routes/match');
const critiqueRoute = require('./routes/critique');
const chatRoute = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/upload', uploadRoute);
app.use('/analyze', analyzeRoute);
app.use('/match', matchRoute);
app.use('/critique', critiqueRoute);
app.use('/chat', chatRoute);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'Resume Advisor API is running', version: '1.0.0' });
});

// ─── Serve Static Frontend Files ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'build')));

// ─── Catch-all Route for React SPA ────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
