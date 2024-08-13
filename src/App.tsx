import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Notes from './pages/Notes';
import MediaGallery from './pages/MediaGallery';
import Profile from './pages/Profile';
import useLocalStorage from './hooks/useLocalStorage';
import { lightTheme, darkTheme, ThemeType } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';

const AppWrapper = styled.div`
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  min-height: 100vh;
  padding-top: 60px; // Add this line to push all content below the navbar
  transition: all 0.3s linear;
`;

const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const themeMode = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={themeMode}>
      <GlobalStyles />
      <AppWrapper>
        <Router>
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/media" element={<MediaGallery />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </AppWrapper>
    </ThemeProvider>
  );
};

export default App;