import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { UploadScreen } from './components/UploadScreen';
import { ExtractingScreen } from './components/ExtractingScreen';
import { QuestionList } from './components/QuestionList';
import { AnswerSheetViewer } from './components/AnswerSheetViewer';
import { uploadFiles, processSession, getSessionData } from './services/api';

// Reason: Root App with empty initial state and real backend extraction
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('upload'); // 'upload' | 'extracting' | 'results'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'answer'
  const [files, setFiles] = useState({ question: null, answer: null });
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  const handleStartMapping = async (directFile = null) => {
    const qFile = directFile || files.question?.file;
    const aFile = files.answer?.file || null;

    if (!qFile && !aFile) {
      console.warn('[App] No files selected for mapping!');
      return;
    }

    setSidebarCollapsed(true);
    setMobileMenuOpen(false);
    setCurrentScreen('extracting');

    const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      console.log('[App] Starting upload & processing pipeline...');
      const [uploadRes] = await Promise.all([
        uploadFiles(qFile, aFile),
        minDelay
      ]);

      if (uploadRes?.session_id) {
        console.log(`[App] Session created: ${uploadRes.session_id}`);
        await processSession(uploadRes.session_id);
        const fullData = await getSessionData(uploadRes.session_id);
        console.log('[App] Session data received:', fullData);

        if (fullData?.questions && fullData.questions.length > 0) {
          const mappedQs = fullData.questions.map((q, idx) => {
            const grade = fullData.grading?.[q.id] || {
              score: q.max_score || 5,
              total: q.max_score || 5,
              feedback: 'Extracted from question paper.'
            };
            return {
              n: idx + 1,
              id: q.id,
              text: q.text,
              score: grade.score,
              total: grade.total,
              feedback: grade.feedback,
              full_label: q.full_label || String(idx + 1)
            };
          });
          setQuestions(mappedQs);
          if (mappedQs.length > 0) {
            setSelectedQuestionId(mappedQs[0].id);
          }
        }
        setSessionData(fullData);
      }
    } catch (err) {
      console.error('[App] Pipeline fatal error:', err);
    } finally {
      setCurrentScreen('results');
    }
  };

  const handleBack = () => {
    setCurrentScreen('upload');
    setSidebarCollapsed(false);
  };

  return (
    <div className="app">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        active="Exams"
      />

      <main className="main-panel">
        <TopBar
          onBack={handleBack}
          canGoBack={currentScreen !== 'upload'}
          onToggleSidebar={() => setMobileMenuOpen((prev) => !prev)}
        />

        <div className="main-content">
          {currentScreen === 'upload' && (
            <UploadScreen
              files={files}
              setFiles={setFiles}
              onStartMapping={() => handleStartMapping()}
            />
          )}

          {currentScreen === 'extracting' && <ExtractingScreen />}

          {currentScreen === 'results' && (
            <div className="review-main-wrapper">
              <div className="mobile-tab-bar">
                <div className="mobile-tab-pill-grid">
                  <button
                    type="button"
                    onClick={() => setActiveTab('questions')}
                    className={`mobile-tab-btn ${activeTab === 'questions' ? 'active-tab' : ''}`}
                  >
                    Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('answer')}
                    className={`mobile-tab-btn ${activeTab === 'answer' ? 'active-tab' : ''}`}
                  >
                    Answer Sheet
                  </button>
                </div>
              </div>

              <div className="screen-results">
                <div className={`tab-pane-wrap ${activeTab === 'questions' ? 'mobile-visible' : 'mobile-hidden'}`}>
                  <QuestionList
                    questions={questions}
                    selectedId={selectedQuestionId}
                    onSelectQuestion={(id) => setSelectedQuestionId(id)}
                  />
                </div>
                <div className={`tab-pane-wrap ${activeTab === 'answer' ? 'mobile-visible' : 'mobile-hidden'}`}>
                  <AnswerSheetViewer
                    selectedQuestionId={selectedQuestionId}
                    onSelectQuestion={(id) => setSelectedQuestionId(id)}
                    sessionData={sessionData}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
