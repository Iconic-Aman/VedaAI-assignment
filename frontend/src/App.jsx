import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { UploadScreen } from './components/UploadScreen';
import { ExtractingScreen } from './components/ExtractingScreen';
import { QuestionList } from './components/QuestionList';
import { AnswerSheetViewer } from './components/AnswerSheetViewer';
import { DUMMY_QUESTIONS } from './data/dummyData';

// Reason: Root App component orchestrating screens and state
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('upload'); // 'upload' | 'extracting' | 'results'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [files, setFiles] = useState({ question: null, answer: null });
  const [questions, setQuestions] = useState(DUMMY_QUESTIONS);
  const [selectedQuestionId, setSelectedQuestionId] = useState(2);

  const handleStartMapping = () => {
    setCurrentScreen('extracting');
    setSidebarCollapsed(true);
    setTimeout(() => {
      setCurrentScreen('results');
    }, 2200);
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
      />

      <div className="main">
        <TopBar
          onBack={handleBack}
          canGoBack={currentScreen !== 'upload'}
        />

        <section className="content">
          {currentScreen === 'upload' && (
            <UploadScreen
              files={files}
              setFiles={setFiles}
              onStartMapping={handleStartMapping}
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
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
