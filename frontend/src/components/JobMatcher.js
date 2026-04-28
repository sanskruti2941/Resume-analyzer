import React, { useState } from 'react';

function JobMatcher({ resumeData }) {
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);

  async function handleMatch() {
    if (!resumeData?.text) {
      setStatus({ type: 'error', msg: 'Please upload and extract a resume first.' });
      return;
    }
    if (!jobDesc.trim()) {
      setStatus({ type: 'error', msg: 'Please enter a job description.' });
      return;
    }

    setStatus({ type: 'loading', msg: 'Calculating match...' });

    try {
      const res = await fetch('/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeData.text,
          jobDescription: jobDesc,
          resumeId: resumeData.resumeId
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus({ type: 'error', msg: data.error || 'Matching failed.' });
        return;
      }

      setResult(data);
      setStatus(null);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error. Is the backend running?' });
    }
  }

  function getMatchColor(pct) {
    if (pct >= 70) return '#4ade80';
    if (pct >= 40) return '#facc15';
    return '#f87171';
  }

  return (
    <div className="card">
      <h2>💼 Job Description Matcher</h2>

      <textarea
        placeholder="Paste the job description here..."
        value={jobDesc}
        onChange={e => setJobDesc(e.target.value)}
        rows={6}
      />

      <div className="btn-row">
        <button
          className="btn btn-secondary"
          onClick={handleMatch}
          disabled={status?.type === 'loading'}
        >
          {status?.type === 'loading' ? '⏳ Matching...' : '🎯 Match Job'}
        </button>
      </div>

      {status && <div className={`status-msg status-${status.type}`}>{status.msg}</div>}

      {result && (
        <>
          <hr className="divider" />

          {/* Match percentage */}
          <div className="section-label">Match Score</div>
          <div className="match-meter">
            <div className="match-percent-display" style={{ color: getMatchColor(result.matchPercent) }}>
              {result.matchPercent}%
            </div>
            <div className="match-bar">
              <div className="match-fill" style={{ width: `${result.matchPercent}%` }} />
            </div>
          </div>

          {/* Matching skills */}
          {result.matchingSkills.length > 0 && (
            <>
              <div className="section-label">Skills You Have ✓</div>
              <div className="tags">
                {result.matchingSkills.map(s => (
                  <span key={s} className="tag tag-matching">{s}</span>
                ))}
              </div>
            </>
          )}

          {/* Missing skills */}
          {result.missingSkills.length > 0 && (
            <>
              <div className="section-label">Skills to Acquire</div>
              <div className="tags">
                {result.missingSkills.map(s => (
                  <span key={s} className="tag tag-missing">✗ {s}</span>
                ))}
              </div>
            </>
          )}

          {result.missingSkills.length === 0 && result.matchingSkills.length > 0 && (
            <p style={{ color: '#4ade80', fontSize: '0.9rem', marginTop: '12px' }}>
              You have all the required skills for this job!
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default JobMatcher;
