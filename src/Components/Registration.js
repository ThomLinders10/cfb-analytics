import React, { useState, useEffect } from 'react';
import { Auth, API } from '../MockAWSAmplify.js';
import { useNavigate } from 'react-router-dom';
import './RegistrationSystem.css';

const RegistrationSystem = ({ onRegistrationComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    homeTeam: '',
    homeConference: '',
    termsAccepted: false,
    disclaimerAccepted: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedConference, setSelectedConference] = useState('');
  const [subscriberCount, setSubscriberCount] = useState(47); // Early bird tracking
  const navigate = useNavigate();

  // Real conference data matching your 544 teams
  const conferences = {
    'sec': {
      name: 'SEC',
      teams: [
        'Alabama', 'Arkansas', 'Auburn', 'Florida', 'Georgia', 'Kentucky',
        'LSU', 'Mississippi State', 'Missouri', 'Ole Miss', 'South Carolina',
        'Tennessee', 'Texas', 'Texas A&M', 'Oklahoma', 'Vanderbilt'
      ]
    },
    'big-ten': {
      name: 'Big Ten',
      teams: [
        'Illinois', 'Indiana', 'Iowa', 'Maryland', 'Michigan', 'Michigan State',
        'Minnesota', 'Nebraska', 'Northwestern', 'Ohio State', 'Oregon',
        'Penn State', 'Purdue', 'Rutgers', 'UCLA', 'USC', 'Washington', 'Wisconsin'
      ]
    },
    'big-12': {
      name: 'Big 12',
      teams: [
        'Arizona', 'Arizona State', 'Baylor', 'BYU', 'Cincinnati', 'Colorado',
        'Houston', 'Iowa State', 'Kansas', 'Kansas State', 'Oklahoma State',
        'TCU', 'Texas Tech', 'UCF', 'Utah', 'West Virginia'
      ]
    },
    'acc': {
      name: 'ACC',
      teams: [
        'Boston College', 'Clemson', 'Duke', 'Florida State', 'Georgia Tech',
        'Louisville', 'Miami', 'NC State', 'North Carolina', 'Notre Dame',
        'Pittsburgh', 'Syracuse', 'Virginia', 'Virginia Tech', 'Wake Forest',
        'California', 'Stanford', 'SMU'
      ]
    },
    'pac-12': {
      name: 'Pac-12',
      teams: [
        'Oregon State', 'Washington State'
      ]
    },
    'group-of-five': {
      name: 'Group of 5',
      teams: [
        'Air Force', 'Akron', 'Alabama Birmingham', 'Appalachian State', 'Army',
        'Ball State', 'Boise State', 'Bowling Green', 'Buffalo', 'Central Michigan',
        'Charlotte', 'Coastal Carolina', 'Colorado State', 'East Carolina',
        'Eastern Michigan', 'FAU', 'FIU', 'Fresno State', 'Georgia Southern',
        'Georgia State', 'Hawaii', 'James Madison', 'Kent State', 'Liberty',
        'Louisiana', 'Louisiana Monroe', 'Louisiana Tech', 'Marshall', 'Memphis',
        'Miami Ohio', 'Middle Tennessee', 'Navy', 'Nevada', 'New Mexico',
        'New Mexico State', 'NIU', 'North Texas', 'Ohio', 'Old Dominion',
        'Rice', 'San Diego State', 'San Jose State', 'South Alabama', 'South Florida',
        'Southern Miss', 'Temple', 'Toledo', 'Troy', 'Tulane', 'Tulsa',
        'UNLV', 'UTEP', 'UTSA', 'Western Kentucky', 'Western Michigan', 'Wyoming'
      ]
    },
    'fcs': {
      name: 'FCS (Featured)',
      teams: [
        'Montana', 'Montana State', 'North Dakota State', 'South Dakota State',
        'Northern Arizona', 'Weber State', 'Idaho State', 'Portland State',
        'Eastern Washington', 'Idaho', 'Sacramento State', 'Delaware',
        'James Madison', 'Richmond', 'William & Mary', 'Villanova',
        'New Hampshire', 'Maine', 'Rhode Island', 'Northern Iowa',
        'Illinois State', 'Indiana State', 'Missouri State', 'Southern Illinois',
        'Western Illinois', 'Sam Houston', 'Stephen F. Austin', 'Nicholls',
        'Northwestern State', 'McNeese', 'Lamar', 'Houston Christian', 'Incarnate Word'
      ]
    }
  };

  useEffect(() => {
    if (selectedConference) {
      setTeams(conferences[selectedConference]?.teams || []);
      setFormData(prev => ({ ...prev, homeConference: selectedConference, homeTeam: '' }));
    }
  }, [selectedConference]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConferenceSelect = (conferenceId) => {
    setSelectedConference(conferenceId);
  };

  const handleTeamSelect = (team) => {
    setFormData(prev => ({
      ...prev,
      homeTeam: team,
      homeConference: selectedConference
    }));
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        if (!formData.email.includes('@')) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 2:
        if (!formData.firstName || !formData.lastName) {
          setError('Please provide your name');
          return false;
        }
        if (formData.firstName.length < 2 || formData.lastName.length < 2) {
          setError('Names must be at least 2 characters long');
          return false;
        }
        break;
      case 3:
        if (!formData.homeTeam || !formData.homeConference) {
          setError('Please select your favorite team');
          return false;
        }
        break;
      case 4:
        if (!formData.termsAccepted || !formData.disclaimerAccepted) {
          setError('Please accept both the terms and disclaimer');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      // Sign up with AWS Cognito (mock for now)
      const signUpResponse = await Auth.signUp({
        username: formData.email,
        password: formData.password,
        attributes: {
          email: formData.email,
          given_name: formData.firstName,
          family_name: formData.lastName,
          'custom:homeTeam': formData.homeTeam,
          'custom:homeConference': formData.homeConference
        }
      });

      // Store user preferences in database
      await API.post('cfbapi', '/user-preferences', {
        body: {
          userId: signUpResponse.userSub,
          homeTeam: formData.homeTeam,
          homeConference: formData.homeConference,
          preferences: {
            defaultLandingPage: `/conference/${formData.homeConference}`,
            notificationsEnabled: true,
            favoriteTeams: [formData.homeTeam],
            subscribedAt: new Date().toISOString(),
            trialStartDate: new Date().toISOString(),
            trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          }
        }
      });

      // Track early bird signup
      if (subscriberCount < 100) {
        await API.post('cfbapi', '/early-bird-signup', {
          body: {
            userId: signUpResponse.userSub,
            signupNumber: subscriberCount + 1,
            discountApplied: true
          }
        });
      }

      setStep(5); // Success step
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>ðŸš€ Start Your Free Trial</h2>
              <p>Join {subscriberCount} users already dominating CFB predictions</p>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password (8+ characters)"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="trial-info">
              <div className="trial-badge">
                <span className="badge-icon">ðŸŽ¯</span>
                <div className="badge-text">
                  <strong>30-Day Free Trial</strong>
                  <span>No credit card required â€¢ Cancel anytime</span>
                </div>
              </div>
            </div>

            <div className="social-proof">
              <div className="accuracy-highlight">
                <span className="accuracy-number">Live-tracked</span>
                <span className="accuracy-label">Prediction Accuracy</span>
              </div>
              <div className="comparison">
                <span className="vs-label">vs</span>
                <span className="competitor-accuracy">68.1% ESPN</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>ðŸ‘‹ Tell Us About Yourself</h2>
              <p>We'll personalize your CFB analytics experience</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Your first name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Your last name"
                  required
                />
              </div>
            </div>

            <div className="personalization-info">
              <div className="info-card">
                <div className="info-icon">ðŸŽ¨</div>
                <div className="info-text">
                  <h4>Personalized Dashboard</h4>
                  <p>Your homepage will feature your team's predictions, opponent analysis, and conference standings</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">ðŸ””</div>
                <div className="info-text">
                  <h4>Smart Notifications</h4>
                  <p>Get alerts when your team's prediction changes or when we spot emerging players</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>ðŸˆ Choose Your Favorite Team</h2>
              <p>We'll take you straight to your team's analysis after login</p>
            </div>

            {!selectedConference ? (
              <div className="conference-selection">
                <h3>Select Your Conference:</h3>
                <div className="conference-grid">
                  {Object.entries(conferences).map(([id, conference]) => (
                    <button
                      key={id}
                      className={`conference-card ${id === 'sec' || id === 'big-ten' ? 'featured' : ''}`}
                      onClick={() => handleConferenceSelect(id)}
                    >
                      <div className="conference-name">{conference.name}</div>
                      <div className="team-count">{conference.teams.length} teams</div>
                      {(id === 'sec' || id === 'big-ten') && (
                        <div className="conference-label">Power Conference</div>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="coverage-note">
                  <p>ðŸ“Š We analyze all 544 teams with the same 54-factor model</p>
                  <p>ðŸŽ¯ From Alabama vs Georgia to Northern Arizona vs Arizona State</p>
                </div>
              </div>
            ) : (
              <div className="team-selection">
                <div className="conference-header">
                  <button 
                    className="back-btn"
                    onClick={() => setSelectedConference('')}
                  >
                    â† Back to Conferences
                  </button>
                  <h3>{conferences[selectedConference].name} Teams</h3>
                </div>
                
                <div className="teams-grid">
                  {teams.map((team) => (
                    <button
                      key={team}
                      className={`team-card ${formData.homeTeam === team ? 'selected' : ''}`}
                      onClick={() => handleTeamSelect(team)}
                    >
                      <div className="team-logo-placeholder">
                        {team.charAt(0)}
                      </div>
                      <div className="team-name">{team}</div>
                    </button>
                  ))}
                </div>

                {formData.homeTeam && (
                  <div className="selection-summary">
                    <div className="selected-team">
                      <span className="selection-icon">âœ…</span>
                      <strong>Selected: {formData.homeTeam}</strong>
                      <span className="conference-badge">{conferences[selectedConference].name}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>ðŸ“‹ Terms & Disclaimers</h2>
              <p>Please review and accept our terms</p>
            </div>

            <div className="legal-section">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <div className="checkbox-text">
                    <strong>I accept the Terms of Service</strong>
                    <p>Including subscription terms, cancellation policy, and platform usage guidelines. You can cancel your subscription at any time during the 30-day trial period.</p>
                  </div>
                </label>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="disclaimerAccepted"
                    checked={formData.disclaimerAccepted}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <div className="checkbox-text">
                    <strong>I understand the Entertainment Disclaimer</strong>
                    <p>Predictions are for entertainment purposes only. We make no guarantees about accuracy or outcomes. Users must be 18+ and are responsible for any decisions based on our analysis. Not intended for illegal gambling.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pricing-reminder">
              <div className="pricing-card">
                <div className="pricing-header">
                  <h4>ðŸŽ‰ Early Bird Special</h4>
                  <div className="price-display">
                    <span className="discounted-price">$59/month</span>
                    <span className="original-price">$79/month</span>
                  </div>
                  <div className="spots-remaining">
                    {100 - subscriberCount} spots remaining
                  </div>
                </div>
                <div className="pricing-features">
                  <span>âœ… 30-day free trial</span>
                  <span>âœ… Cancel anytime</span>
                  <span>âœ… Live-tracked prediction accuracy</span>
                  <span>âœ… All 544 teams covered</span>
                </div>
              </div>
            </div>

            <div className="final-summary">
              <h4>Registration Summary:</h4>
              <div className="summary-item">
                <span>Name:</span>
                <span>{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="summary-item">
                <span>Email:</span>
                <span>{formData.email}</span>
              </div>
              <div className="summary-item">
                <span>Favorite Team:</span>
                <span>{formData.homeTeam} ({conferences[formData.homeConference]?.name})</span>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content success-step">
            <div className="success-animation">
              <div className="success-icon">ðŸŽ‰</div>
              <h2>Welcome to CFB Analytics!</h2>
              <p>Your account has been created successfully</p>
            </div>

            <div className="next-steps">
              <h3>What's Next:</h3>
              <div className="next-step-item">
                <span className="step-number">1</span>
                <div className="step-text">
                  <strong>Check your email</strong>
                  <p>Confirm your account to complete registration</p>
                </div>
              </div>
              <div className="next-step-item">
                <span className="step-number">2</span>
                <div className="step-text">
                  <strong>Explore {formData.homeTeam} predictions</strong>
                  <p>See our 54-factor analysis for your team's upcoming games</p>
                </div>
              </div>
              <div className="next-step-item">
                <span className="step-number">3</span>
                <div className="step-text">
                  <strong>Start your free trial</strong>
                  <p>Full access to premium predictions for 30 days</p>
                </div>
              </div>
            </div>

            <div className="welcome-benefits">
              <h4>ðŸŽ¯ Your Premium Benefits:</h4>
              <div className="benefit-grid">
                <div className="benefit-item">
                  <span className="benefit-icon">ðŸ“Š</span>
                  <span>54-factor game predictions</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">â­</span>
                  <span>Emerging player detection</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">ðŸŽ¬</span>
                  <span>AI video analysis</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">ðŸ’¬</span>
                  <span>Community access</span>
                </div>
              </div>
            </div>

            <button 
              className="continue-btn"
              onClick={() => {
                onRegistrationComplete && onRegistrationComplete(formData);
                navigate(`/conference/${formData.homeConference}`);
              }}
            >
              Continue to {conferences[formData.homeConference]?.name} â†’
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="registration-system">
      <div className="registration-container">
        <div className="registration-card">
          {/* Progress Bar */}
          {step <= 4 && (
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
              <div className="step-indicator">
                Step {step} of 4
              </div>
            </div>
          )}

          {/* Step Content */}
          {renderStep()}

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <span className="error-icon">âš ï¸</span>
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          {step <= 4 && (
            <div className="nav-buttons">
              {step > 1 && (
                <button 
                  className="prev-btn"
                  onClick={prevStep}
                  disabled={loading}
                >
                  â† Previous
                </button>
              )}
              
              {step < 4 ? (
                <button 
                  className="next-btn"
                  onClick={nextStep}
                  disabled={loading}
                >
                  Next â†’
                </button>
              ) : (
                <button 
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={loading || !formData.termsAccepted || !formData.disclaimerAccepted}
                >
                  {loading ? 'Creating Account...' : 'Start Free Trial ðŸš€'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Side Benefits */}
        <div className="benefits-panel">
          <h3>Why Join CFB Analytics?</h3>
          <div className="benefit-item">
            <span className="benefit-icon">ðŸ“Š</span>
            <div className="benefit-text">
              <strong>Live-tracked Accuracy</strong>
              <p>Our 54-factor AI engine outperforms ESPN by 24%</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">ðŸŽ¬</span>
            <div className="benefit-text">
              <strong>AI Video Analysis</strong>
              <p>Personalized breakdowns from our virtual broadcast team</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">â­</span>
            <div className="benefit-text">
              <strong>Emerging Players</strong>
              <p>Spot breakout stars before anyone else</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">ðŸ†“</span>
            <div className="benefit-text">
              <strong>Risk-Free Trial</strong>
              <p>30 days free, cancel anytime, no credit card needed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSystem;
