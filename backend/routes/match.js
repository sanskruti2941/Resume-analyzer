const express = require('express');
const { matchJobDescription } = require('../utils/nlp');
const supabase = require('../utils/supabase');

const router = express.Router();

// POST /match
router.post('/', async (req, res) => {
  try {
    const { resumeText, jobDescription, resumeId } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ error: 'Resume text is required.' });
    }
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: 'Job description is required.' });
    }

    const matchResult = matchJobDescription(resumeText, jobDescription);

    // Optionally persist match result
    if (supabase && resumeId) {
      await supabase.from('results').upsert([{
        resume_id: resumeId,
        match_percent: matchResult.matchPercent,
        matching_skills: JSON.stringify(matchResult.matchingSkills),
        missing_skills: JSON.stringify(matchResult.missingSkills)
      }]);
    }

    return res.json({ success: true, ...matchResult });

  } catch (err) {
    console.error('Match error:', err.message);
    return res.status(500).json({ error: 'Job matching failed: ' + err.message });
  }
});

module.exports = router;
