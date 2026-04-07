const express = require('express');
const { extractSkills, critiqueResume } = require('../utils/nlp');

const router = express.Router();

// POST /critique
router.post('/', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Resume text is required.' });
    }
    const skills = extractSkills(text);
    const critique = critiqueResume(text, skills);
    return res.json({ success: true, ...critique });
  } catch (err) {
    console.error('Critique error:', err.message);
    return res.status(500).json({ error: 'Critique failed: ' + err.message });
  }
});

module.exports = router;
