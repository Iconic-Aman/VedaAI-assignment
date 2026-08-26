import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { UploadScreen } from './components/UploadScreen';
import { ExtractingScreen } from './components/ExtractingScreen';
import { QuestionList } from './components/QuestionList';
import { AnswerSheetViewer } from './components/AnswerSheetViewer';
import { DUMMY_QUESTIONS } from './data/dummyData';
import { uploadFiles, processSession, getSessionData } from './services/api';

// Reason: Root App component matching Pixel Perfect UI workflow and timed transitions
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('upload'); // 'upload' | 'extracting' | 'results'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [files, setFiles] = useState({ question: null, answer: null });
  const [questions, setQuestions] = useState(DUMMY_QUESTIONS);
  const [selectedQuestionId, setSelectedQuestionId] = useState(2);
  const [sessionData, setSessionData] = useState(null);

  const handleStartMapping = async (directFile = null) => {
    const qFile = directFile || files.question?.file;
    const aFile = files.answer?.file || null;

    setSidebarCollapsed(true);
    setCurrentScreen('extracting');

    const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      if (qFile) {
        const uploadPromise = (async () => {
          const uploadRes = await uploadFiles(qFile, aFile);
          if (uploadRes?.session_id) {
            await processSession(uploadRes.session_id);
            const fullData = await getSessionData(uploadRes.session_id);
            if (fullData?.questions?.length) {
              const mappedQs = fullData.questions.map((q, idx) => {
                const grade = fullData.grading?.[q.id] || {
                  score: q.max_score,
                  total: q.max_score,
                  feedback: 'Extracted from question paper.'
                };
                return {
                  n: idx + 1,
                  id: q.id,
                  text: q.text,
                  score: grade.score,
                  total: grade.total,
                  feedback: grade.feedback,
                  full_label: q.full_label
                };
              });
              setQuestions(mappedQs);
              setSessionData(fullData);
            }
          }
        })();

        await Promise.all([minDelay, uploadPromise]);
      } else {
        await minDelay;
      }
    } catch (err) {
      console.warn('Backend unavailable, using preview questions:', err);
      await minDelay;
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
        active="Exams"
      />

      <main className="main-panel">
        <TopBar
          onBack={handleBack}
          canGoBack={currentScreen !== 'upload'}
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
            <div className="screen screen-results">
              <QuestionList
                questions={questions}
                selectedId={selectedQuestionId}
                onSelectQuestion={(id) => setSelectedQuestionId(id)}
              />
              <AnswerSheetViewer
                selectedQuestionId={selectedQuestionId}
                sessionData={sessionData}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
