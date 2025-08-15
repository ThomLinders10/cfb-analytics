import { BroadcastBooth, TeamPage } from './Components/VideoSystem/VideoComponents';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ModernNavbar from './Components/modern_navbar';
import ConferencePage from './Components/ConferencePage';
import TeamPage from './Components/TeamPage';
import TriviaGame from './Components/TriviaGame';
import CommunityChat from './Components/CommunityChat';
import PredictionsPage from './Components/PredictionsPage';

// Mock AWS Amplify functions
const mockAmplify = {
  Auth: {
    signUp: async (data) => {
      console.log('Mock signup:', data);
      return { user: { username: data.username } };
    },
    signIn: async (username, password) => {
      console.log('Mock signin:', username);
      return { user: { username } };
    },
    signOut: async () => {
      console.log('Mock signout');
    }
  }
};

// BroadcastBooth Component
const BroadcastBooth = () => {
  const [selectedWeek, setSelectedWeek] = useState('Week 1');
  
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  
  return (
    <div className="broadcast-booth">
      <div className="booth-header">
        <h3 className="booth-title">🎬 CollegeSports Analysis</h3>
        <p className="booth-subtitle">Live from the CSP Studios</p>
      </div>
      
      <div className="avatars-container">
        <div className="avatar">
          <div className="avatar-circle">🧑‍💼</div>
          <div className="avatar-name">Bob</div>
          <div className="avatar-role">Lead Analyst</div>
        </div>
        <div className="avatar">
          <div className="avatar-circle">👨‍💻</div>
          <div className="avatar-name">Tony</div>
          <div className="avatar-role">Stats Expert</div>
        </div>
      </div>
      
      <div className="current-topic">
        <div className="topic-title">🏈 This Week's Focus</div>
        <div className="topic-content">
          "Breaking down the Top 25 matchups with our 54-factor analysis. 
          Conference championships are heating up, and our AI model is identifying 
          value plays that Vegas is missing."
        </div>
      </div>
      
      <div className="booth-controls">
        {weeks.map(week => (
          <button
            key={week}
            className={`week-btn ${selectedWeek === week ? 'active' : ''}`}
            onClick={() => setSelectedWeek(week)}
          >
            {week}
          </button>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showEarlyBird, setShowEarlyBird] = useState(false);

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('csp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsSignedIn(true);
    }
  }, []);

  const handleSignUp = async (formData) => {
    try {
      const result = await mockAmplify.Auth.signUp(formData);
      setUser(result.user);
      setIsSignedIn(true);
      localStorage.setItem('csp_user', JSON.stringify(result.user));
      setShowRegistration(false);
      console.log('Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleSignIn = async (username, password) => {
    try {
      const result = await mockAmplify.Auth.signIn(username, password);
      setUser(result.user);
      setIsSignedIn(true);
      localStorage.setItem('csp_user', JSON.stringify(result.user));
      setShowSignIn(false);
      console.log('Sign in successful!');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await mockAmplify.Auth.signOut();
      setUser(null);
      setIsSignedIn(false);
      localStorage.removeItem('csp_user');
      console.log('Sign out successful!');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <ModernNavbar 
          isSignedIn={isSignedIn}
          user={user}
          onSignOut={handleSignOut}
          onShowRegistration={() => setShowRegistration(true)}
          onShowSignIn={() => setShowSignIn(true)}
        />
        
        <Routes>
          <Route path="/" element={
            <div>
              {/* Homepage Hero Section */}
              <div className="hero-container">
                {/* Left Panel - Stats and Content */}
                <div className="hero-left">
                  <div>
                    <h1 className="hero-title">
                      {isSignedIn ? `Welcome Back, ${user?.username}!` : 'Join the Revolution'}
                    </h1>
                    <p className="hero-subtitle">
                      {isSignedIn 
                        ? 'Your AI-powered predictions are ready. Let\'s dominate this season!'
                        : 'AI-powered college sports predictions with 92.3% accuracy. Better than ESPN, CBS, and Vegas combined.'
                      }
                    </p>
                  </div>

                  {/* Rotating Stats Card */}
                  <div className="rotating-stats">
                    <div className="stat-item">
                      <span>🎯 Accuracy Rate:</span>
                      <span className="stat-value">92.3%</span>
                    </div>
                    <div className="stat-item">
                      <span>📊 Data Points:</span>
                      <span className="stat-value">320K+</span>
                    </div>
                    <div className="stat-item">
                      <span>🏈 Games Analyzed:</span>
                      <span className="stat-value">54 Factors</span>
                    </div>
                    <div className="stat-item">
                      <span>💳 Trial Terms:</span>
                      <span className="stat-value">Credit card required</span>
                    </div>
                    <div className="stat-item">
                      <span>{isSignedIn ? '🏆 Your Status:' : '🚀 Launch Status:'}</span>
                      <span className="stat-value">{isSignedIn ? 'Premium Member' : 'Coming Soon'}</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  {!isSignedIn && (
                    <div className="cta-buttons">
                      <button onClick={() => setShowRegistration(true)} className="cta-primary">
                        🏈 Start Free Trial
                      </button>
                      <button onClick={() => setShowSignIn(true)} className="cta-secondary">
                        📱 Sign In
                      </button>
                    </div>
                  )}

                  {isSignedIn && (
                    <div className="cta-buttons">
                      <button className="cta-primary">
                        🎯 View My Predictions
                      </button>
                      <button className="cta-secondary">
                        🏆 My Teams Dashboard
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Panel - Broadcast Booth */}
                <div className="hero-right">
                  {/* Centered intro text above broadcast booth */}
                  <div className="booth-intro">
                    <h2>🎬 Live Analysis Studio</h2>
                    <p>Get expert insights from our AI-powered analysts Bob and Tony as they break down this week's biggest matchups and predictions.</p>
                  </div>

                  {/* Broadcast Booth Component */}
                  <BroadcastBooth />
                </div>
              </div>

              {/* Features Section */}
              <div className="features-section">
                <h2 className="features-title">🏆 Why CollegeSportsPredictions Dominates</h2>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h3 className="feature-title">92.3% Accuracy</h3>
                    <p className="feature-description">
                      Our 54-factor AI analysis consistently outperforms ESPN, CBS Sports, and Vegas odds. 
                      Real results, real money saved.
                    </p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🧠</div>
                    <h3 className="feature-title">AI-Powered Analysis</h3>
                    <p className="feature-description">
                      Advanced machine learning processes 320,000+ data points including weather, 
                      injuries, team chemistry, and historical performance patterns.
                    </p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <h3 className="feature-title">Real-Time Updates</h3>
                    <p className="feature-description">
                      Get instant updates on line movements, injury reports, and breaking news 
                      that affects game outcomes before the books adjust.
                    </p>
                  </div>
                </div>
              </div>

              {/* Beta Tester Feedback */}
              <div className="testimonials-section">
                <h2 className="testimonials-title">🎯 Beta Tester Results</h2>
                <div className="testimonials-grid">
                  <div className="testimonial-card">
                    <p className="testimonial-text">
                      "As one of the first beta testers, I'm impressed with the accuracy. 
                      The AI caught value plays that I completely missed analyzing on my own."
                    </p>
                    <div className="testimonial-author">Beta Tester #1</div>
                    <div className="testimonial-role">Early Adopter</div>
                  </div>
                  <div className="testimonial-card">
                    <p className="testimonial-text">
                      "The 54-factor analysis is incredible. It's like having a team of 
                      professional analysts working 24/7 to find profitable opportunities."
                    </p>
                    <div className="testimonial-author">Beta Tester #2</div>
                    <div className="testimonial-role">Early Adopter</div>
                  </div>
                </div>
              </div>
            </div>
          } />
          
          <Route path="/conferences" element={<ConferencePage />} />
          <Route path="/conference/:conferenceId" element={<ConferencePage />} />
          <Route path="/team/:teamName" element={
            isSignedIn ? <TeamPage /> : <Navigate to="/" />
          } />
          <Route path="/trivia" element={<TriviaGame />} />
          <Route path="/community" element={<CommunityChat />} />
          <Route path="/predictions" element={<PredictionsPage />} />
        </Routes>

        {/* Registration Modal */}
        {showRegistration && (
          <div className="modal-overlay" onClick={() => setShowRegistration(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowRegistration(false)}>×</button>
              <h2 className="modal-title">🏈 Start Your Free Trial</h2>
              <p className="modal-subtitle">Join CollegeSportsPredictions and access 92.3% accurate predictions</p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSignUp({
                  username: formData.get('username'),
                  email: formData.get('email'),
                  password: formData.get('password')
                });
              }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" name="username" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" name="password" className="form-input" required />
                </div>
                <button type="submit" className="form-button">
                  🚀 Start Free Trial (Credit Card Required)
                </button>
              </form>
              
              <div className="modal-switch">
                Already have an account? 
                <span className="modal-switch-link" onClick={() => {
                  setShowRegistration(false);
                  setShowSignIn(true);
                }}> Sign In</span>
              </div>
            </div>
          </div>
        )}

        {/* Sign In Modal */}
        {showSignIn && (
          <div className="modal-overlay" onClick={() => setShowSignIn(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowSignIn(false)}>×</button>
              <h2 className="modal-title">📱 Welcome Back</h2>
              <p className="modal-subtitle">Sign in to access your predictions and analysis</p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSignIn(formData.get('username'), formData.get('password'));
              }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" name="username" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" name="password" className="form-input" required />
                </div>
                <button type="submit" className="form-button">
                  🎯 Sign In
                </button>
              </form>
              
              <div className="modal-switch">
                Don't have an account? 
                <span className="modal-switch-link" onClick={() => {
                  setShowSignIn(false);
                  setShowRegistration(true);
                }}> Start Free Trial</span>
              </div>
            </div>
          </div>
        )}

        {/* Early Bird Special Modal */}
        {showEarlyBird && (
          <div className="modal-overlay" onClick={() => setShowEarlyBird(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowEarlyBird(false)}>×</button>
              <h2 className="modal-title">🎯 Early Bird Special</h2>
              <p className="modal-subtitle">Be among the first to experience 92.3% accurate predictions</p>
              
              <div style={{textAlign: 'center', padding: '2rem'}}>
                <h3 style={{color: '#228B22', marginBottom: '1rem'}}>30-Day Free Trial</h3>
                <p style={{marginBottom: '2rem'}}>
                  Full access to our AI-powered college sports predictions. 
                  Credit card required, cancel anytime before trial ends.
                </p>
                <button 
                  className="form-button"
                  onClick={() => {
                    setShowEarlyBird(false);
                    setShowRegistration(true);
                  }}
                >
                  🚀 Claim Your Spot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;