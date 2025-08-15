import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ModernNavbar from './Components/modern_navbar';
import ConferencePage from './Components/ConferencePage';
import TeamPage from './Components/TeamPage';
import PredictionsPage from './Components/PredictionsPage';
import AuthModal from './Components/AuthModal';
import { BroadcastBooth, TeamPage as VideoTeamPage } from './Components/VideoSystem/VideoComponents';
import './App.css';
import HomePage from './Components/HomePage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <ModernNavbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/conferences" element={<ConferencePage />} />
            <Route path="/team/:teamId" element={<TeamPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;