import React, { useState } from 'react';

// Circular score ring using SVG
function ScoreRing({ score }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="score-ring">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="#334155" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={radius}
          fill="none"
          stroke="url(#grad)"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="score-text">
        <div className="score-number">{score}</div>
        <div className="score-label">/ 100</div>
      </div>
    </div>
  );
}

function ResultsPanel({ resumeData, onAnalyze }) {
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState(null);

  async function handleAnalyze() {
    if (!resumeData?.text) return;
    setStatus({ type: 'loading', msg: 'Analyzing resume...' });

    try {
      const res = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: resumeData.text, resumeId: resumeData.resumeId })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus({ type: 'error', msg: data.error || 'Analysis failed.' });
        return;
      }

      setAnalysis(data);
      setStatus(null);
      if (onAnalyze) onAnalyze(data);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error. Is the backend running?' });
    }
  }

  if (!resumeData) {
    return (
      <div className="card">
        <h2>🔍 Resume Analysis</h2>
        <p className="empty-state">Upload a resume first to see analysis.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>🔍 Resume Analysis</h2>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleAnalyze} disabled={status?.type === 'loading'}>
          {status?.type === 'loading' ? '⏳ Analyzing...' : '🧠 Analyze Resume'}
        </button>
      </div>

      {status && <div className={`status-msg status-${status.type}`}>{status.msg}</div>}

      {analysis && (
        <>
          {/* Score */}
          <hr className="divider" />
          <div className="section-label">Resume Score</div>
          <div className="score-section">
            <ScoreRing score={analysis.score.total} />
            <div className="score-breakdown">
              {[
                { label: 'Skill Coverage', value: analysis.score.breakdown.skillScore, max: 60 },
                { label: 'Section Quality', value: analysis.score.breakdown.sectionScore, max: 25 },
                { label: 'Content Length', value: analysis.score.breakdown.lengthScore, max: 15 }
              ].map(item => (
                <div key={item.label} className="breakdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span className="breakdown-label">{item.label}</span>
                    <span className="breakdown-label">{item.value}/{item.max}</span>
                  </div>
                  <div className="progress-bar" style={{ width: '100%' }}>
                    <div className="progress-fill" style={{ width: `${(item.value / item.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <hr className="divider" />
          <div className="section-label">Detected Skills ({analysis.skills.length})</div>
          {analysis.skills.length > 0 ? (
            <div className="tags">
              {analysis.skills.map(s => <span key={s} className="tag tag-skill">{s}</span>)}
            </div>
          ) : (
            <p className="empty-state">No skills detected. Try a more detailed resume.</p>
          )}

          {/* Career Recommendations */}
          <hr className="divider" />
          <div className="section-label">Career Recommendations</div>
          {analysis.careers.length > 0 ? (
            <div className="career-grid">
              {analysis.careers.map(c => (
                <div key={c.role} className="career-card">
                  <div className="role-name">{c.role}</div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${c.confidence}%` }} />
                  </div>
                  <div className="confidence-text">{c.confidence}% match</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No strong career matches found. Add more skills to your resume.</p>
          )}

          {/* Learning Path */}
          <hr className="divider" />
          <div className="section-label">
            Learning Path → {analysis.learningPath.targetRole}
          </div>
          {analysis.learningPath.skillsToLearn.length > 0 ? (
            <div className="tags">
              {analysis.learningPath.skillsToLearn.map(s => (
                <span key={s} className="tag tag-learn">+ {s}</span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#4ade80', fontSize: '0.9rem' }}>
              You already have all the key skills for {analysis.learningPath.targetRole}!
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default ResultsPanel;
