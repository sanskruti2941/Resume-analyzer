const express = require('express');
const { extractSkills, scoreResume, getCareerRecommendations, getLearningPath } = require('../utils/nlp');
const supabase = require('../utils/supabase');

const router = express.Router();

// POST /analyze
router.post('/', async (req, res) => {
  try {
    const { text, resumeId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Resume text is required.' });
    }

    const skills = extractSkills(text);
    const score = scoreResume(skills, text);
    const careers = getCareerRecommendations(skills);
    const learningPath = getLearningPath(skills, careers);

    const result = {
      skills,
      score,
      careers,
      learningPath
    };

    // Save results to Supabase if available
    if (supabase && resumeId) {
      await supabase.from('results').insert([{
        resume_id: resumeId,
        skills: JSON.stringify(skills),
        score: score.total,
        score_breakdown: JSON.stringify(score.breakdown),
        careers: JSON.stringify(careers),
        learning_path: JSON.stringify(learningPath)
      }]);
    }

    return res.json({ success: true, ...result });

  } catch (err) {
    console.error('Analyze error:', err.message);
    return res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
});

module.exports = router;
