import React, { useState } from 'react';
import './App.css';
import UploadSection from './components/UploadSection';
import ResultsPanel from './components/ResultsPanel';
import ResumeCritique from './components/ResumeCritique';
import JobMatcher from './components/JobMatcher';
import Chatbot from './components/Chatbot';

function App() {
  const [resumeData, setResumeData] = useState(null);
  // analysisContext is passed to chatbot so it can answer context-aware questions
  const [analysisContext, setAnalysisContext] = useState({});

  function handleAnalyze(data) {
    setAnalysisContext({
      skills: data.skills,
      score: data.score,
      careers: data.careers,
      learningPath: data.learningPath
    });
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🎓 Intelligent Resume & Career Advisor</h1>
        <p>Upload your resume to get AI-powered skill analysis, critique, career recommendations, and job matching</p>
      </div>

      <UploadSection onUploadSuccess={setResumeData} />
      <ResumeCritique resumeData={resumeData} />
      <ResultsPanel resumeData={resumeData} onAnalyze={handleAnalyze} />
      <JobMatcher resumeData={resumeData} />

      <Chatbot analysisContext={analysisContext} />
    </div>
  );
}

export default App;
