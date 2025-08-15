import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';

const ModernNavbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin');
  const location = useLocation();

  const openSignInModal = () => {
    setAuthModalTab('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUpModal = () => {
    setAuthModalTab('signup');
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav className="modern-navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <h2>College Football Predictions</h2>
          </Link>

          <div className="navbar-menu">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
            <Link to="/conferences" className={location.pathname === '/conferences' ? 'active' : ''}>
              Conferences
            </Link>
            <Link to="/predictions" className={location.pathname === '/predictions' ? 'active' : ''}>
              Predictions
            </Link>
          </div>

          <div className="navbar-auth">
            <button className="sign-in-btn" onClick={openSignInModal}>
              Sign In
            </button>
            <button className="sign-up-btn" onClick={openSignUpModal}>
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
};

export default ModernNavbar;