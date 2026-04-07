import React, { useState } from 'react';

const SEVERITY_COLOR = {
  high: { bg: '#3b1f1f', color: '#f87171', border: '#ef444444', icon: '🔴' },
  medium: { bg: '#2d1f0a', color: '#fb923c', border: '#f9731644', icon: '🟠' },
  low: { bg: '#1f2a1f', color: '#facc15', border: '#eab30844', icon: '🟡' }
};

function MistakeCard({ mistake }) {
  const style = SEVERITY_COLOR[mistake.severity] || SEVERITY_COLOR.low;
  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: 8,
      padding: '12px 16px',
      marginBottom: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span>{style.icon}</span>
        <span style={{ color: style.color, fontWeight: 600, fontSize: '0.9rem' }}>{mistake.message}</span>
      </div>
      <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
        💡 <strong style={{ color: '#cbd5e1' }}>Fix:</strong> {mistake.fix}
      </div>
    </div>
  );
}

function ResumeCritique({ resumeData }) {
  const [critique, setCritique] = useState(null);
  const [status, setStatus] = useState(null);

  async function handleCritique() {
    if (!resumeData?.text) return;
    setStatus({ type: 'loading', msg: 'Analyzing your resume for issues...' });
    try {
      const res = await fetch('/critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: resumeData.text })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatus({ type: 'error', msg: data.error || 'Critique failed.' });
        return;
      }
      setCritique(data);
      setStatus(null);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error. Is the backend running?' });
    }
  }

  if (!resumeData) {
    return (
      <div className="card">
        <h2>🩺 Resume Critique</h2>
        <p className="empty-state">Upload a resume first to get a detailed critique.</p>
      </div>
    );
  }

  const highCount = critique?.mistakes.filter(m => m.severity === 'high').length || 0;
  const medCount = critique?.mistakes.filter(m => m.severity === 'medium').length || 0;
  const lowCount = critique?.mistakes.filter(m => m.severity === 'low').length || 0;

  return (
    <div className="card">
      <h2>🩺 Resume Critique</h2>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleCritique} disabled={status?.type === 'loading'}>
          {status?.type === 'loading' ? '⏳ Checking...' : '🔎 Find Mistakes & Improvements'}
        </button>
      </div>

      {status && <div className={`status-msg status-${status.type}`}>{status.msg}</div>}

      {critique && (
        <>
          {/* Summary bar */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ background: '#3b1f1f', border: '1px solid #ef444444', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ color: '#f87171', fontSize: '1.4rem', fontWeight: 700 }}>{highCount}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Critical</div>
            </div>
            <div style={{ background: '#2d1f0a', border: '1px solid #f9731644', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ color: '#fb923c', fontSize: '1.4rem', fontWeight: 700 }}>{medCount}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Warnings</div>
            </div>
            <div style={{ background: '#1f2a1f', border: '1px solid #eab30844', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ color: '#facc15', fontSize: '1.4rem', fontWeight: 700 }}>{lowCount}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Minor</div>
            </div>
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '1.4rem', fontWeight: 700 }}>{critique.wordCount}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Words</div>
            </div>
          </div>

          {/* Mistakes */}
          {critique.mistakes.length > 0 ? (
            <>
              <div className="section-label" style={{ marginTop: 20 }}>Issues Found ({critique.mistakes.length})</div>
              {critique.mistakes.map((m, i) => <MistakeCard key={i} mistake={m} />)}
            </>
          ) : (
            <div className="status-msg status-success" style={{ marginTop: 16 }}>
              No major issues found. Your resume looks solid!
            </div>
          )}

          {/* Improvements */}
          {critique.improvements.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: 20 }}>Improvement Suggestions</div>
              {critique.improvements.map((imp, i) => (
                <div key={i} style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 10
                }}>
                  <div style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
                    ✨ {imp.area}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{imp.suggestion}</div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ResumeCritique;
