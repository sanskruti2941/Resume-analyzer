const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const supabase = require('../utils/supabase');

const router = express.Router();

// Store file in memory (no disk writes needed)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// POST /upload
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF.' });
    }

    // Extract text from PDF buffer
    const data = await pdfParse(req.file.buffer);
    const extractedText = data.text || '';

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from PDF. Make sure it is not a scanned image.' });
    }

    // Optionally save to Supabase
    let resumeId = null;
    if (supabase) {
      const { data: inserted, error } = await supabase
        .from('resumes')
        .insert([{ filename: req.file.originalname, text: extractedText }])
        .select('id')
        .single();

      if (!error && inserted) {
        resumeId = inserted.id;
      }
    }

    return res.json({
      success: true,
      resumeId,
      text: extractedText,
      filename: req.file.originalname,
      charCount: extractedText.length
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: 'Failed to process PDF: ' + err.message });
  }
});

module.exports = router;
