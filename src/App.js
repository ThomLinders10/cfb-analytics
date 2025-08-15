import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ModernNavbar from './Components/modern_navbar';
import HomePage from './components/HomePage';
import ConferencePage from './components/ConferencePage';
import TeamPage from './components/TeamPage';
import PredictionsPage from './components/PredictionsPage';

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