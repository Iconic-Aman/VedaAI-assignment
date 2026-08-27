import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { UploadScreen } from './components/UploadScreen';
import { ExtractingScreen } from './components/ExtractingScreen';
import { QuestionList } from './components/QuestionList';
import { AnswerSheetViewer } from './components/AnswerSheetViewer';
import { DUMMY_QUESTIONS } from './data/dummyData';
import { uploadFiles, processSession, getSessionData } from './services/api';

// Reason: Root App component executing real backend extraction pipeline
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('upload'); // 'upload' | 'extracting' | 'results'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'answer'
  const [files, setFiles] = useState({ question: null, answer: null });
  const [questions, setQuestions] = useState(DUMMY_QUESTIONS);
  const [selectedQuestionId, setSelectedQuestionId] = useState(2);
  const [sessionData, setSessionData] = useState(null);

  const handleStartMapping = async (directFile = null) => {
    const qFile = directFile || files.question?.file;
    const aFile = files.answer?.file || null;

    setSidebarCollapsed(true);
    setMobileMenuOpen(false);
    setCurrentScreen('extracting');

    const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));

    if (!qFile) {
      await minDelay;
      setCurrentScreen('results');
      return;
    }

    try {
      console.log('[Frontend] Starting backend extraction pipeline...');
      const [uploadRes] = await Promise.all([
        uploadFiles(qFile, aFile),
        minDelay
      ]);

      if (uploadRes?.session_id) {
        console.log('[Frontend] Session created:', uploadRes.session_id);
        await processSession(uploadRes.session_id);
        const fullData = await getSessionData(uploadRes.session_id);
        console.log('[Frontend] Received data from backend:', fullData);

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
          console.log('[Frontend] Rendering real extracted questions:', mappedQs);
          setQuestions(mappedQs);
          setSessionData(fullData);
        }
      }
    } catch (err) {
      console.error('[Frontend] Backend extraction failed:', err);
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
              onDirectQuestionUpload={(f) => handleStartMapping(f)}
            />
          )}

          {currentScreen === 'extracting' && <ExtractingScreen />}

          {currentScreen === 'results' && (
            <div className="review-main-wrapper">
              {/* Mobile Tab Switcher */}
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
