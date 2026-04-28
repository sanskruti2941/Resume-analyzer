import React, { useState, useRef } from 'react';

function UploadSection({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // { type: 'error'|'success'|'loading', msg }
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected) validateAndSet(selected);
  }

  function validateAndSet(selected) {
    if (selected.type !== 'application/pdf') {
      setStatus({ type: 'error', msg: 'Only PDF files are supported.' });
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', msg: 'File size must be under 5MB.' });
      return;
    }
    setFile(selected);
    setStatus(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  }

  async function handleUpload() {
    if (!file) {
      setStatus({ type: 'error', msg: 'Please select a PDF file first.' });
      return;
    }
    setStatus({ type: 'loading', msg: 'Uploading and extracting text...' });

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus({ type: 'error', msg: data.error || 'Upload failed.' });
        return;
      }

      setStatus({ type: 'success', msg: `Extracted ${data.charCount} characters from "${data.filename}"` });
      onUploadSuccess(data);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error. Is the backend running?' });
    }
  }

  return (
    <div className="card">
      <h2>📄 Upload Resume</h2>

      <label
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <div className="upload-icon">📁</div>
        <p>Drag & drop your PDF here, or click to browse</p>
        {file && <p className="file-name">✓ {file.name}</p>}
      </label>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={handleUpload} disabled={!file || status?.type === 'loading'}>
          {status?.type === 'loading' ? '⏳ Processing...' : '🚀 Upload & Extract'}
        </button>
      </div>

      {status && (
        <div className={`status-msg status-${status.type}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}

export default UploadSection;
