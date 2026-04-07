import React, { useState, useRef, useEffect } from 'react';

function Chatbot({ analysisContext }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm your career advisor. Upload your resume and ask me anything — scores, skills, career paths, or resume tips!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function sendMessage() {
    const msg = input.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context: analysisContext || {} })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { from: 'bot', text: data.reply || 'Sorry, I could not process that.' }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: 'Network error. Make sure the backend is running.' }]);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          border: 'none', cursor: 'pointer', fontSize: '1.5rem',
          boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title="Career Advisor Chat"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28,
          width: 340, height: 480,
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: 16, display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)', zIndex: 999,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: '1.2rem' }}>🤖</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Career Advisor</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>Ask me anything about your resume</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '9px 13px',
                  borderRadius: m.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.from === 'user' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#0f172a',
                  border: m.from === 'bot' ? '1px solid #334155' : 'none',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  lineHeight: 1.5
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '9px 13px', borderRadius: '14px 14px 14px 4px',
                  background: '#0f172a', border: '1px solid #334155',
                  color: '#64748b', fontSize: '0.85rem'
                }}>
                  typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #334155', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your resume..."
              style={{
                flex: 1, background: '#0f172a', border: '1px solid #334155',
                borderRadius: 8, color: '#e2e8f0', padding: '8px 12px',
                fontSize: '0.85rem', outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                border: 'none', borderRadius: 8, color: '#fff',
                padding: '8px 14px', cursor: 'pointer', fontSize: '1rem',
                opacity: (!input.trim() || loading) ? 0.5 : 1
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
