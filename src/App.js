import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { DictionaryProvider } from './context/DictionaryContext';
import { UserProgressProvider } from './context/UserProgressContext';
import { AudioProvider } from './context/AudioContext';
import { UserProvider } from './context/UserContext';
import { FontSizeProvider } from './context/FontSizeContext';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import WordTrainingPage from './pages/WordTrainingPage';
import WordDetailPage from './pages/WordDetailPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ErrorBoundary from './components/ui/ErrorBoundary';
import AuthGuard from './components/auth/AuthGuard';
import theme from './theme/theme';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FontSizeProvider>
          <UserProvider>
            <DictionaryProvider>
              <UserProgressProvider>
                <AudioProvider>
                  <Router>
                    <AuthGuard>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<DashboardPage />} />
                          <Route path="/training" element={<WordTrainingPage />} />
                          <Route path="/training/:word" element={<WordDetailPage />} />
                          <Route path="/flashcards" element={<FlashcardsPage />} />
                          <Route path="/quiz" element={<QuizPage />} />
                          <Route path="/leaderboard" element={<LeaderboardPage />} />
                        </Routes>
                      </Layout>
                    </AuthGuard>
                  </Router>
                </AudioProvider>
              </UserProgressProvider>
            </DictionaryProvider>
          </UserProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
