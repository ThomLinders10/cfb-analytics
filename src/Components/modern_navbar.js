import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './modern_navbar.css';

const Navbar = ({ user, onShowRegistration, onShowSubscription, onShowSignIn }) => {
  const [showConferenceDropdown, setShowConferenceDropdown] = useState(false);
  const navigate = useNavigate();

  const conferences = {
    'Power 4': ['SEC', 'Big Ten', 'Big 12', 'ACC'],
    'Group of 5': ['American', 'Mountain West', 'MAC', 'Sun Belt', 'Conference USA'],
    'FCS': ['Big Sky', 'CAA', 'MVFC', 'Southern', 'Southland']
  };

  const handleStartTrial = () => {
    if (onShowRegistration) {
      onShowRegistration();
    }
  };

  const handleSignIn = () => {
    if (onShowSignIn) {
      onShowSignIn();
    }
  };

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Left: Brand */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <div className="brand-logo">
              <span className="logo-csp">CSP</span>
              <div className="logo-sports">
                <span className="sport-icon">ðŸˆ</span>
                <span className="sport-icon">ðŸ€</span>
              </div>
            </div>
            <div className="brand-text-container">
              <span className="brand-text">CollegeSportsPredictions</span>
              <span className="brand-tagline">Powered by AI</span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="navbar-nav">
          <Link to="/" className="nav-link">Home</Link>
          
          <div 
            className="nav-dropdown"
            onMouseEnter={() => setShowConferenceDropdown(true)}
            onMouseLeave={() => setShowConferenceDropdown(false)}
          >
            <span className="nav-link dropdown-trigger">
              Conferences <span className="dropdown-arrow">â–¼</span>
            </span>
            {showConferenceDropdown && (
              <div className="dropdown-menu">
                {Object.entries(conferences).map(([division, confList]) => (
                  <div key={division} className="dropdown-section">
                    <div className="dropdown-header">{division}</div>
                    {confList.map(conf => (
                      <Link 
                        key={conf}
                        to={`/conference/${conf.toLowerCase().replace(' ', '-')}`}
                        className="dropdown-item"
                        onClick={() => setShowConferenceDropdown(false)}
                      >
                        {conf}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/community" className="nav-link">Community</Link>
          <Link to="/trivia" className="nav-link">Trivia</Link>
          <Link to="/predictions" className="nav-link">Predictions</Link>
        </div>

        {/* Right: User Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-welcome">Welcome, {user.name || user.email}</span>
              <button className="btn-primary" onClick={() => onShowSubscription && onShowSubscription()}>
                My Account
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-secondary" onClick={handleSignIn}>
                Sign In
              </button>
              <button className="btn-primary" onClick={handleStartTrial}>
                Start Free Trial
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Accuracy Banner */}
      <div className="accuracy-banner">
        <div className="banner-content">
          <span className="banner-text">
            ðŸŽ¯ <strong>Live-tracked Accuracy • BUILD 7fbfb741 - 2025-08-16 07:39:47</strong> â€¢ Football & Basketball â€¢ Better than ESPN, CBS, and Vegas â€¢ 
            <span className="banner-highlight">30-Day Free Trial</span>
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

