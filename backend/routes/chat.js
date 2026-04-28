const express = require('express');
const { chatbotReply } = require('../utils/nlp');

const router = express.Router();

// POST /chat
router.post('/', (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    const reply = chatbotReply(message, context || {});
    return res.json({ success: true, reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    return res.status(500).json({ error: 'Chat failed: ' + err.message });
  }
});

module.exports = router;
