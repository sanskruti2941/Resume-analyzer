// ─── Predefined Skills ───────────────────────────────────────────────────────
const SKILLS_LIST = [
  'python', 'java', 'javascript', 'sql', 'react', 'node', 'nodejs',
  'machine learning', 'data analysis', 'html', 'css', 'typescript',
  'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'go', 'rust',
  'docker', 'kubernetes', 'aws', 'azure', 'git', 'linux',
  'mongodb', 'postgresql', 'mysql', 'redis',
  'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
  'express', 'django', 'flask', 'spring', 'angular', 'vue',
  'rest api', 'graphql', 'agile', 'scrum', 'devops', 'ci/cd'
];

// ─── Career Role Mapping ──────────────────────────────────────────────────────
const CAREER_ROLES = [
  {
    role: 'Data Scientist',
    requiredSkills: ['python', 'machine learning', 'data analysis', 'pandas', 'numpy', 'scikit-learn'],
    minMatch: 2
  },
  {
    role: 'Frontend Developer',
    requiredSkills: ['react', 'javascript', 'html', 'css', 'typescript', 'angular', 'vue'],
    minMatch: 2
  },
  {
    role: 'Backend Developer',
    requiredSkills: ['node', 'nodejs', 'express', 'python', 'java', 'sql', 'rest api'],
    minMatch: 2
  },
  {
    role: 'Full Stack Developer',
    requiredSkills: ['react', 'node', 'javascript', 'sql', 'html', 'css'],
    minMatch: 3
  },
  {
    role: 'DevOps Engineer',
    requiredSkills: ['docker', 'kubernetes', 'aws', 'linux', 'ci/cd', 'git', 'devops'],
    minMatch: 2
  },
  {
    role: 'Machine Learning Engineer',
    requiredSkills: ['python', 'machine learning', 'tensorflow', 'pytorch', 'numpy'],
    minMatch: 2
  },
  {
    role: 'Database Administrator',
    requiredSkills: ['sql', 'postgresql', 'mysql', 'mongodb', 'redis'],
    minMatch: 2
  },
  {
    role: 'Java Developer',
    requiredSkills: ['java', 'spring', 'sql', 'git'],
    minMatch: 2
  }
];

// ─── Learning Path Suggestions ────────────────────────────────────────────────
const LEARNING_PATHS = {
  'Data Scientist': ['python', 'machine learning', 'pandas', 'numpy', 'scikit-learn', 'sql'],
  'Frontend Developer': ['react', 'javascript', 'html', 'css', 'typescript'],
  'Backend Developer': ['nodejs', 'express', 'sql', 'rest api', 'docker'],
  'Full Stack Developer': ['react', 'node', 'javascript', 'sql', 'docker'],
  'DevOps Engineer': ['docker', 'kubernetes', 'aws', 'linux', 'ci/cd'],
  'Machine Learning Engineer': ['python', 'tensorflow', 'pytorch', 'machine learning', 'numpy'],
  'Database Administrator': ['sql', 'postgresql', 'mongodb', 'redis'],
  'Java Developer': ['java', 'spring', 'sql', 'docker']
};

// ─── Text Normalization ───────────────────────────────────────────────────────
function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s+#]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Skill Extraction ─────────────────────────────────────────────────────────
function extractSkills(text) {
  const normalized = normalizeText(text);
  const found = [];
  for (const skill of SKILLS_LIST) {
    // Use word boundary matching for single-word skills
    const pattern = skill.includes(' ')
      ? skill
      : `\\b${skill.replace('+', '\\+')}\\b`;
    const regex = new RegExp(pattern, 'i');
    if (regex.test(normalized)) {
      found.push(skill);
    }
  }
  return [...new Set(found)];
}

// ─── Resume Scoring ───────────────────────────────────────────────────────────
function scoreResume(skills, text) {
  const normalized = normalizeText(text);

  // Skill score: up to 60 points (each skill = 60/total_skills points, max 60)
  const skillScore = Math.min(60, Math.round((skills.length / SKILLS_LIST.length) * 300));

  // Keyword relevance: check for common resume sections (up to 25 points)
  const sections = ['experience', 'education', 'project', 'certification', 'summary', 'objective', 'achievement'];
  const sectionMatches = sections.filter(s => normalized.includes(s)).length;
  const sectionScore = Math.round((sectionMatches / sections.length) * 25);

  // Length/content score: up to 15 points
  const wordCount = normalized.split(' ').filter(Boolean).length;
  const lengthScore = Math.min(15, Math.round((wordCount / 300) * 15));

  const total = Math.min(100, skillScore + sectionScore + lengthScore);
  return {
    total,
    breakdown: {
      skillScore,
      sectionScore,
      lengthScore
    }
  };
}

// ─── TF-IDF + Cosine Similarity ───────────────────────────────────────────────
function tokenize(text) {
  return normalizeText(text).split(' ').filter(w => w.length > 2);
}

function buildTermFrequency(tokens) {
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  // Normalize by total tokens
  for (const key in tf) {
    tf[key] = tf[key] / tokens.length;
  }
  return tf;
}

function cosineSimilarity(vecA, vecB) {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;
  for (const key of allKeys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function matchJobDescription(resumeText, jobDescription) {
  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobDescription);

  const resumeTF = buildTermFrequency(resumeTokens);
  const jobTF = buildTermFrequency(jobTokens);

  const similarity = cosineSimilarity(resumeTF, jobTF);
  const matchPercent = Math.round(similarity * 100);

  // Also extract skills from job description to find gaps
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);
  const missingSkills = jobSkills.filter(s => !resumeSkills.includes(s));
  const matchingSkills = jobSkills.filter(s => resumeSkills.includes(s));

  return {
    matchPercent: Math.min(100, matchPercent),
    matchingSkills,
    missingSkills,
    jobSkillsRequired: jobSkills
  };
}

// ─── Career Recommendations ───────────────────────────────────────────────────
function getCareerRecommendations(skills) {
  const recommendations = [];
  for (const career of CAREER_ROLES) {
    const matched = career.requiredSkills.filter(s => skills.includes(s));
    if (matched.length >= career.minMatch) {
      recommendations.push({
        role: career.role,
        matchedSkills: matched,
        confidence: Math.round((matched.length / career.requiredSkills.length) * 100)
      });
    }
  }
  // Sort by confidence descending
  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

// ─── Learning Path ────────────────────────────────────────────────────────────
function getLearningPath(skills, recommendations) {
  if (recommendations.length === 0) {
    return {
      targetRole: 'General Developer',
      skillsToLearn: ['python', 'javascript', 'sql', 'git', 'html', 'css']
        .filter(s => !skills.includes(s))
    };
  }
  const topRole = recommendations[0].role;
  const required = LEARNING_PATHS[topRole] || [];
  return {
    targetRole: topRole,
    skillsToLearn: required.filter(s => !skills.includes(s))
  };
}

// ─── Resume Critique ──────────────────────────────────────────────────────────
function critiqueResume(text, skills) {
  const normalized = text.toLowerCase();
  const mistakes = [];
  const improvements = [];

  // ── Section checks ──
  const requiredSections = [
    { key: 'experience', label: 'Work Experience' },
    { key: 'education', label: 'Education' },
    { key: 'skill', label: 'Skills Section' },
    { key: 'project', label: 'Projects' },
    { key: 'contact', label: 'Contact Information' }
  ];
  for (const s of requiredSections) {
    if (!normalized.includes(s.key)) {
      mistakes.push({
        type: 'missing_section',
        severity: 'high',
        message: `Missing "${s.label}" section`,
        fix: `Add a clearly labeled "${s.label}" section to your resume.`
      });
    }
  }

  // ── Contact info checks ──
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(text);
  if (!hasEmail) {
    mistakes.push({
      type: 'missing_contact',
      severity: 'high',
      message: 'No email address found',
      fix: 'Add your professional email address at the top of the resume.'
    });
  }
  if (!hasPhone) {
    mistakes.push({
      type: 'missing_contact',
      severity: 'medium',
      message: 'No phone number found',
      fix: 'Include a phone number in your contact section.'
    });
  }

  // ── Length checks ──
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 150) {
    mistakes.push({
      type: 'too_short',
      severity: 'high',
      message: `Resume is too short (${wordCount} words)`,
      fix: 'A good resume should have 300–700 words. Expand your experience and project descriptions.'
    });
  } else if (wordCount > 1000) {
    mistakes.push({
      type: 'too_long',
      severity: 'medium',
      message: `Resume may be too long (${wordCount} words)`,
      fix: 'Try to keep your resume to 1–2 pages. Remove outdated or irrelevant information.'
    });
  }

  // ── Weak action verbs / passive language ──
  const weakPhrases = ['responsible for', 'worked on', 'helped with', 'assisted in', 'duties included'];
  for (const phrase of weakPhrases) {
    if (normalized.includes(phrase)) {
      mistakes.push({
        type: 'weak_language',
        severity: 'low',
        message: `Weak phrase detected: "${phrase}"`,
        fix: `Replace "${phrase}" with strong action verbs like "Led", "Built", "Developed", "Designed", "Implemented".`
      });
    }
  }

  // ── No quantifiable achievements ──
  const hasNumbers = /\d+%|\d+\s*(users|clients|projects|teams|members|hours|days|months|years|million|k\b)/i.test(text);
  if (!hasNumbers) {
    mistakes.push({
      type: 'no_metrics',
      severity: 'medium',
      message: 'No quantifiable achievements found',
      fix: 'Add numbers to your achievements. E.g. "Improved performance by 30%", "Managed a team of 5", "Served 10,000+ users".'
    });
  }

  // ── Skills count ──
  if (skills.length < 3) {
    mistakes.push({
      type: 'few_skills',
      severity: 'high',
      message: `Only ${skills.length} recognizable technical skill(s) detected`,
      fix: 'List your technical skills explicitly in a dedicated Skills section using standard names (e.g. Python, React, SQL).'
    });
  }

  // ── Summary/Objective ──
  if (!normalized.includes('summary') && !normalized.includes('objective') && !normalized.includes('profile')) {
    improvements.push({
      area: 'Professional Summary',
      suggestion: 'Add a 2–3 sentence professional summary at the top that highlights your experience, key skills, and career goal.'
    });
  }

  // ── LinkedIn / GitHub ──
  if (!normalized.includes('linkedin') && !normalized.includes('github')) {
    improvements.push({
      area: 'Online Presence',
      suggestion: 'Add your LinkedIn and/or GitHub profile links. Recruiters actively check these.'
    });
  }

  // ── Certifications ──
  if (!normalized.includes('certif')) {
    improvements.push({
      area: 'Certifications',
      suggestion: 'Consider adding relevant certifications (e.g. AWS, Google, Coursera) to strengthen your profile.'
    });
  }

  // ── Format suggestions ──
  improvements.push({
    area: 'Format & ATS',
    suggestion: 'Use a clean single-column layout. Avoid tables, graphics, and headers/footers — ATS systems often cannot parse them.'
  });

  improvements.push({
    area: 'Tailoring',
    suggestion: 'Customize your resume for each job application by mirroring keywords from the job description.'
  });

  return { mistakes, improvements, wordCount };
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────
function chatbotReply(message, context) {
  const msg = message.toLowerCase().trim();
  const skills = context.skills || [];
  const score = context.score || null;
  const careers = context.careers || [];
  const learningPath = context.learningPath || null;

  // Score questions
  if (msg.includes('score') || msg.includes('rating')) {
    if (score) return `Your resume scored ${score.total}/100. Breakdown: Skills (${score.breakdown.skillScore}/60), Sections (${score.breakdown.sectionScore}/25), Content length (${score.breakdown.lengthScore}/15). ${score.total < 50 ? 'There is a lot of room to improve — try adding more skills and resume sections.' : score.total < 75 ? 'Decent score! Adding more quantifiable achievements and skills will push it higher.' : 'Great score! Focus on tailoring it to specific job descriptions.'}`;
    return "Upload and analyze your resume first, then I can tell you about your score.";
  }

  // Skills questions
  if (msg.includes('skill') && (msg.includes('my') || msg.includes('have') || msg.includes('detected'))) {
    if (skills.length > 0) return `I detected these skills on your resume: ${skills.join(', ')}. ${skills.length < 5 ? 'You should add more technical skills to your resume.' : 'Good variety of skills!'}`;
    return "No skills detected yet. Upload your resume and click Analyze first.";
  }

  // Career questions
  if (msg.includes('career') || msg.includes('job') || msg.includes('role') || msg.includes('position')) {
    if (careers.length > 0) return `Based on your skills, you're best suited for: ${careers.slice(0, 3).map(c => `${c.role} (${c.confidence}% match)`).join(', ')}. Would you like tips on any of these roles?`;
    return "Analyze your resume first and I'll suggest career paths based on your skills.";
  }

  // Learning questions
  if (msg.includes('learn') || msg.includes('improve') || msg.includes('missing') || msg.includes('next')) {
    if (learningPath) return `To become a ${learningPath.targetRole}, you should learn: ${learningPath.skillsToLearn.length > 0 ? learningPath.skillsToLearn.join(', ') : 'nothing — you already have the key skills!'}. Focus on building projects with these technologies.`;
    return "Analyze your resume first and I'll tell you what to learn next.";
  }

  // Resume tips
  if (msg.includes('tip') || msg.includes('advice') || msg.includes('suggest') || msg.includes('help')) {
    return "Here are quick resume tips: 1) Use strong action verbs (Built, Led, Designed). 2) Add numbers to achievements (e.g. 'Improved speed by 40%'). 3) Keep it to 1 page if under 3 years experience. 4) Add LinkedIn and GitHub links. 5) Tailor it for each job application.";
  }

  // Format questions
  if (msg.includes('format') || msg.includes('layout') || msg.includes('design') || msg.includes('template')) {
    return "For format: Use a clean single-column layout. Avoid tables and graphics — ATS systems can't read them. Use standard fonts (Arial, Calibri). Keep margins at 0.5–1 inch. Use consistent date formats throughout.";
  }

  // ATS questions
  if (msg.includes('ats') || msg.includes('applicant tracking') || msg.includes('pass')) {
    return "To pass ATS (Applicant Tracking Systems): Use keywords from the job description, avoid images/tables/columns, use standard section headings (Experience, Education, Skills), and submit as PDF or DOCX.";
  }

  // Greeting
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hey! I'm your career advisor. Upload your resume and I can help you with your score, skills, career paths, what to learn next, or general resume tips. What would you like to know?";
  }

  // What can you do
  if (msg.includes('what can you') || msg.includes('what do you') || msg.includes('help me')) {
    return "I can help you with: your resume score, detected skills, career recommendations, what skills to learn next, resume formatting tips, ATS optimization, and general career advice. Just ask!";
  }

  // Default
  return "I can answer questions about your resume score, skills, career paths, learning suggestions, resume tips, and formatting. Try asking something like 'What are my skills?' or 'How can I improve my resume?'";
}

module.exports = {
  extractSkills,
  scoreResume,
  matchJobDescription,
  getCareerRecommendations,
  getLearningPath,
  critiqueResume,
  chatbotReply
};
