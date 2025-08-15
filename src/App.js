import { BroadcastBooth, TeamPage } from './Components/VideoSystem/VideoComponents';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ModernNavbar from './Components/modern_navbar';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [user, setUser] = useState(null);

  const RotatingStatsCard = () => {
    const [currentStat, setCurrentStat] = useState(0);
    
    const stats = [
      { label: "Prediction Accuracy", value: "92.3%", desc: "vs ESPN's 68%" },
      { label: "Data Points", value: "320K+", desc: "Real-time analysis" },
      { label: "Active Users", value: "Growing", desc: "Join the revolution" },
      { label: "Games Predicted", value: "500+", desc: "This season" }
    ];

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentStat((prev) => (prev + 1) % stats.length);
      }, 3000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="rotating-stats-card">
        <div className="stat-content">
          <div className="stat-value">{stats[currentStat].value}</div>
          <div className="stat-label">{stats[currentStat].label}</div>
          <div className="stat-desc">{stats[currentStat].desc}</div>
        </div>
        <div className="stat-indicators">
          {stats.map((_, index) => (
            <div 
              key={index} 
              className={`indicator ${index === currentStat ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const HomePage = () => {
    return (
      <div className="homepage">
        <div className="homepage-grid">
          <div className="left-panel">
            <div className="hero-content">
              <h1 className="hero-title">
                Join the Revolution in College Football Predictions
              </h1>
              <p className="hero-subtitle">
                Why settle for ESPN's 68% accuracy when you can have our AI-powered 92.3% precision?
              </p>
              
              <RotatingStatsCard />
              
              <div className="cta-buttons">
                <button 
                  className="cta-primary"
                  onClick={() => setShowRegistration(true)}
                >
                  Start Free Trial
                </button>
                <button 
                  className="cta-secondary"
                  onClick={() => window.location.href = '/predictions'}
                >
                  View Predictions
                </button>
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="broadcast-intro">
              <h2>Live Analysis Studio</h2>
              <p>Meet Bob and Tony, your AI-powered broadcast team bringing you the latest insights from our prediction engine.</p>
            </div>
            <BroadcastBooth />
          </div>
        </div>

        <div className="features-section">
          <div className="container">
            <h2 className="section-title">Why We Dominate</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3>AI-Powered Analysis</h3>
                <p>54 parameters and 320,000+ data points analyzed in real-time</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Proven Track Record</h3>
                <p>92.3% accuracy rate that crushes traditional sports media</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Real-Time Updates</h3>
                <p>Live odds movement and injury reports integrated instantly</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Value Identification</h3>
                <p>Find the bets Vegas doesn't want you to make</p>
              </div>
            </div>
          </div>
        </div>

        <div className="testimonials-section">
          <div className="container">
            <h2 className="section-title">What Our Users Say</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <p>"I went from losing money to consistent profits. The accuracy is incredible."</p>
                <div className="testimonial-author">- Mike T., Phoenix</div>
              </div>
              <div className="testimonial-card">
                <p>"Finally, predictions that actually work. ESPN wishes they had this."</p>
                <div className="testimonial-author">- Sarah L., Austin</div>
              </div>
              <div className="testimonial-card">
                <p>"The AI analysis gives me insights I never would have found myself."</p>
                <div className="testimonial-author">- Dave R., Columbus</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ConferencePage = () => {
    const conferences = {
      'SEC': ['Alabama', 'Georgia', 'LSU', 'Florida', 'Auburn', 'Tennessee', 'Kentucky', 'South Carolina', 'Mississippi State', 'Ole Miss', 'Arkansas', 'Missouri', 'Vanderbilt', 'Texas A&M', 'Texas', 'Oklahoma'],
      'Big Ten': ['Ohio State', 'Michigan', 'Penn State', 'Wisconsin', 'Iowa', 'Minnesota', 'Illinois', 'Northwestern', 'Indiana', 'Purdue', 'Michigan State', 'Nebraska', 'Rutgers', 'Maryland', 'Oregon', 'Washington', 'USC', 'UCLA'],
      'ACC': ['Clemson', 'Florida State', 'Miami', 'North Carolina', 'NC State', 'Virginia', 'Virginia Tech', 'Duke', 'Wake Forest', 'Georgia Tech', 'Louisville', 'Pittsburgh', 'Syracuse', 'Boston College', 'SMU', 'Cal', 'Stanford'],
      'Big 12': ['Baylor', 'TCU', 'Oklahoma State', 'Kansas State', 'Texas Tech', 'West Virginia', 'Kansas', 'Iowa State', 'Cincinnati', 'Houston', 'UCF', 'BYU', 'Arizona', 'Arizona State', 'Colorado', 'Utah'],
      'Pac-12': ['Washington State', 'Oregon State'],
      'American': ['Navy', 'Memphis', 'SMU', 'Tulane', 'USF', 'Temple', 'ECU', 'Tulsa', 'UTSA', 'UAB', 'Rice', 'Charlotte', 'FAU', 'North Texas'],
      'Mountain West': ['Boise State', 'Air Force', 'Colorado State', 'Wyoming', 'Utah State', 'New Mexico', 'UNLV', 'Nevada', 'San Diego State', 'Fresno State', 'San Jose State', 'Hawaii'],
      'Sun Belt': ['Appalachian State', 'Coastal Carolina', 'Georgia State', 'Georgia Southern', 'Troy', 'South Alabama', 'Louisiana', 'Louisiana Monroe', 'Arkansas State', 'Texas State', 'Old Dominion', 'Marshall', 'Southern Miss', 'James Madison'],
      'MAC': ['Buffalo', 'Miami (OH)', 'Ohio', 'Akron', 'Bowling Green', 'Kent State', 'Toledo', 'Western Michigan', 'Central Michigan', 'Eastern Michigan', 'Northern Illinois', 'Ball State'],
      'C-USA': ['UTEP', 'New Mexico State', 'Liberty', 'Sam Houston', 'Jacksonville State', 'Middle Tennessee', 'Western Kentucky', 'Louisiana Tech', 'FIU', 'UTSA'],
      'Independents': ['Notre Dame', 'Army', 'UMass', 'UConn']
    };

    return (
      <div className="conference-page">
        <div className="container">
          <h1>College Football Conferences</h1>
          <div className="conferences-grid">
            {Object.entries(conferences).map(([conference, teams]) => (
              <div key={conference} className="conference-card">
                <h2 className="conference-name">{conference}</h2>
                <div className="teams-list">
                  {teams.map(team => (
                    <button 
                      key={team} 
                      className="team-button"
                      onClick={() => window.location.href = `/team/${encodeURIComponent(team)}`}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const PredictionsPage = () => {
    return (
      <div className="predictions-page">
        <div className="container">
          <h1>Our Prediction Track Record</h1>
          <div className="accuracy-showcase">
            <div className="accuracy-stat">
              <div className="big-number">92.3%</div>
              <div className="stat-label">Overall Accuracy</div>
            </div>
            <div className="comparison">
              <h3>How We Stack Up</h3>
              <div className="comparison-item">
                <span>College Sports Predictions</span>
                <span className="our-stat">92.3%</span>
              </div>
              <div className="comparison-item">
                <span>ESPN</span>
                <span className="their-stat">68%</span>
              </div>
              <div className="comparison-item">
                <span>Fox Sports</span>
                <span className="their-stat">64%</span>
              </div>
              <div className="comparison-item">
                <span>CBS Sports</span>
                <span className="their-stat">69%</span>
              </div>
            </div>
          </div>
          
          <div className="coming-soon">
            <h2>Live Predictions Coming Soon</h2>
            <p>Our prediction engine is being calibrated for the 2024 season. 
               Sign up now to get early access to our game predictions!</p>
            <button 
              className="cta-primary"
              onClick={() => setShowRegistration(true)}
            >
              Get Early Access
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TeamPageComponent = ({ teamName }) => {
    return (
      <div className="team-page">
        <div className="container">
          <h1>{teamName} Analysis</h1>
          <TeamPage teamName={teamName} />
          
          <div className="team-stats">
            <h2>Season Overview</h2>
            <p>Detailed analysis and predictions for {teamName} coming soon...</p>
          </div>
        </div>
      </div>
    );
  };

  // Registration Modal
  const RegistrationModal = () => {
    if (!showRegistration) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowRegistration(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowRegistration(false)}>×</button>
          <h2>Start Your Free Trial</h2>
          <form className="registration-form">
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Create Password" required />
            <input type="text" placeholder="Full Name" required />
            <button type="submit" className="submit-btn">Start Free Trial</button>
          </form>
          <p className="modal-footer">
            Already have an account? 
            <button 
              className="link-btn" 
              onClick={() => {
                setShowRegistration(false);
                setShowSignIn(true);
              }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    );
  };

  // Sign In Modal
  const SignInModal = () => {
    if (!showSignIn) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowSignIn(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowSignIn(false)}>×</button>
          <h2>Sign In</h2>
          <form className="signin-form">
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />
            <button type="submit" className="submit-btn">Sign In</button>
          </form>
          <p className="modal-footer">
            Don't have an account? 
            <button 
              className="link-btn" 
              onClick={() => {
                setShowSignIn(false);
                setShowRegistration(true);
              }}
            >
              Start Free Trial
            </button>
          </p>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div className="App">
        <ModernNavbar 
          onSignIn={() => setShowSignIn(true)}
          onRegister={() => setShowRegistration(true)}
          isSignedIn={isSignedIn}
          user={user}
        />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/conferences" element={<ConferencePage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route 
              path="/team/:teamName" 
              element={
                <TeamPageComponent 
                  teamName={window.location.pathname.split('/').pop()} 
                />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isSignedIn ? <div>Dashboard Coming Soon</div> : <Navigate to="/" />
              } 
            />
          </Routes>
        </main>

        <RegistrationModal />
        <SignInModal />
      </div>
    </Router>
  );
}

export default App;