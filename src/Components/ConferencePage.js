import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ConferencePage.css';

const ConferencePage = ({ user, onShowRegistration, onShowSignIn }) => {
  const { conference } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConference, setSelectedConference] = useState(conference);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');

  // Real College Football Conference Data - NO FAKE PREDICTIONS
  const conferenceData = {
    'sec': {
      name: 'SEC',
      fullName: 'Southeastern Conference',
      teams: [
        { name: 'Alabama', city: 'Tuscaloosa, AL', established: 1831 },
        { name: 'Georgia', city: 'Athens, GA', established: 1785 },
        { name: 'Texas', city: 'Austin, TX', established: 1883 },
        { name: 'Tennessee', city: 'Knoxville, TN', established: 1794 },
        { name: 'Ole Miss', city: 'Oxford, MS', established: 1848 },
        { name: 'South Carolina', city: 'Columbia, SC', established: 1801 },
        { name: 'LSU', city: 'Baton Rouge, LA', established: 1860 },
        { name: 'Missouri', city: 'Columbia, MO', established: 1839 },
        { name: 'Florida', city: 'Gainesville, FL', established: 1853 },
        { name: 'Arkansas', city: 'Fayetteville, AR', established: 1871 },
        { name: 'Kentucky', city: 'Lexington, KY', established: 1865 },
        { name: 'Auburn', city: 'Auburn, AL', established: 1856 },
        { name: 'Texas A&M', city: 'College Station, TX', established: 1876 },
        { name: 'Mississippi State', city: 'Starkville, MS', established: 1878 },
        { name: 'Vanderbilt', city: 'Nashville, TN', established: 1873 },
        { name: 'Oklahoma', city: 'Norman, OK', established: 1890 }
      ]
    },
    'big-ten': {
      name: 'Big Ten',
      fullName: 'Big Ten Conference',
      teams: [
        { name: 'Oregon', city: 'Eugene, OR', established: 1876 },
        { name: 'Penn State', city: 'University Park, PA', established: 1855 },
        { name: 'Indiana', city: 'Bloomington, IN', established: 1820 },
        { name: 'Ohio State', city: 'Columbus, OH', established: 1870 },
        { name: 'Michigan', city: 'Ann Arbor, MI', established: 1817 },
        { name: 'Iowa', city: 'Iowa City, IA', established: 1847 },
        { name: 'Illinois', city: 'Champaign, IL', established: 1867 },
        { name: 'Wisconsin', city: 'Madison, WI', established: 1848 },
        { name: 'Minnesota', city: 'Minneapolis, MN', established: 1851 },
        { name: 'Nebraska', city: 'Lincoln, NE', established: 1869 },
        { name: 'Rutgers', city: 'Piscataway, NJ', established: 1766 },
        { name: 'Maryland', city: 'College Park, MD', established: 1856 },
        { name: 'Michigan State', city: 'East Lansing, MI', established: 1855 },
        { name: 'Northwestern', city: 'Evanston, IL', established: 1851 },
        { name: 'Purdue', city: 'West Lafayette, IN', established: 1869 },
        { name: 'UCLA', city: 'Los Angeles, CA', established: 1919 },
        { name: 'USC', city: 'Los Angeles, CA', established: 1880 },
        { name: 'Washington', city: 'Seattle, WA', established: 1861 }
      ]
    },
    'big-12': {
      name: 'Big 12',
      fullName: 'Big 12 Conference',
      teams: [
        { name: 'Arizona State', city: 'Tempe, AZ', established: 1885 },
        { name: 'Iowa State', city: 'Ames, IA', established: 1858 },
        { name: 'BYU', city: 'Provo, UT', established: 1875 },
        { name: 'Colorado', city: 'Boulder, CO', established: 1876 },
        { name: 'Kansas State', city: 'Manhattan, KS', established: 1863 },
        { name: 'Arizona', city: 'Tucson, AZ', established: 1885 },
        { name: 'TCU', city: 'Fort Worth, TX', established: 1873 },
        { name: 'Texas Tech', city: 'Lubbock, TX', established: 1923 },
        { name: 'West Virginia', city: 'Morgantown, WV', established: 1867 },
        { name: 'Cincinnati', city: 'Cincinnati, OH', established: 1819 },
        { name: 'Baylor', city: 'Waco, TX', established: 1845 },
        { name: 'Houston', city: 'Houston, TX', established: 1927 },
        { name: 'Kansas', city: 'Lawrence, KS', established: 1865 },
        { name: 'Oklahoma State', city: 'Stillwater, OK', established: 1890 },
        { name: 'UCF', city: 'Orlando, FL', established: 1963 },
        { name: 'Utah', city: 'Salt Lake City, UT', established: 1850 }
      ]
    },
    'acc': {
      name: 'ACC',
      fullName: 'Atlantic Coast Conference',
      teams: [
        { name: 'SMU', city: 'Dallas, TX', established: 1911 },
        { name: 'Clemson', city: 'Clemson, SC', established: 1889 },
        { name: 'Miami', city: 'Miami, FL', established: 1925 },
        { name: 'Louisville', city: 'Louisville, KY', established: 1798 },
        { name: 'Duke', city: 'Durham, NC', established: 1838 },
        { name: 'Virginia Tech', city: 'Blacksburg, VA', established: 1872 },
        { name: 'Syracuse', city: 'Syracuse, NY', established: 1870 },
        { name: 'Pittsburgh', city: 'Pittsburgh, PA', established: 1787 },
        { name: 'North Carolina', city: 'Chapel Hill, NC', established: 1789 },
        { name: 'NC State', city: 'Raleigh, NC', established: 1887 },
        { name: 'Virginia', city: 'Charlottesville, VA', established: 1819 },
        { name: 'Wake Forest', city: 'Winston-Salem, NC', established: 1834 },
        { name: 'Georgia Tech', city: 'Atlanta, GA', established: 1885 },
        { name: 'Florida State', city: 'Tallahassee, FL', established: 1851 },
        { name: 'Boston College', city: 'Chestnut Hill, MA', established: 1863 },
        { name: 'California', city: 'Berkeley, CA', established: 1868 },
        { name: 'Stanford', city: 'Stanford, CA', established: 1885 }
      ]
    }
  };

  const currentConference = conferenceData[selectedConference] || conferenceData[conference];

  const handleTeamClick = (teamName) => {
    if (!user) {
      setSelectedTeam(teamName);
      setShowAccessModal(true);
    } else {
      // Navigate to team page
      const teamSlug = teamName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      navigate(`/team/${teamSlug}`);
    }
  };

  const filteredTeams = currentConference?.teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!currentConference) {
    return (
      <div className="conference-page">
        <div className="conference-header">
          <h1>Conference Not Found</h1>
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="conference-page">
      {/* Conference Header */}
      <div className="conference-header">
        <div className="header-content">
          <div className="conference-info">
            <Link to="/" className="back-link">← All Conferences</Link>
            <h1>{currentConference.fullName}</h1>
            <p className="conference-description">
              Explore all {currentConference.name} teams and get detailed analytics when you sign up
            </p>
          </div>
          
          {/* Conference Switcher */}
          <div className="conference-switcher">
            <label>Switch Conference:</label>
            <select 
              value={selectedConference} 
              onChange={(e) => {
                setSelectedConference(e.target.value);
                navigate(`/conference/${e.target.value}`);
              }}
            >
              <option value="sec">SEC</option>
              <option value="big-ten">Big Ten</option>
              <option value="big-12">Big 12</option>
              <option value="acc">ACC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder={`Search ${currentConference.name} teams...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="teams-section">
        <div className="teams-grid">
          {filteredTeams.map((team, index) => (
            <div 
              key={team.name} 
              className="team-card"
              onClick={() => handleTeamClick(team.name)}
            >
              <div className="team-header">
                <h3 className="team-name">{team.name}</h3>
                <span className="team-info">Est. {team.established}</span>
              </div>
              
              <div className="team-details">
                <div className="team-location">
                  <span className="label">Location:</span>
                  <span className="value">{team.city}</span>
                </div>
                
                <div className="team-conference">
                  <span className="label">Conference:</span>
                  <span className="value">{currentConference.name}</span>
                </div>
              </div>

              <div className="team-actions">
                {user ? (
                  <div className="prediction-preview">
                    <span className="prediction-label">Click for Analysis</span>
                    <button className="view-analysis-btn">
                      View Team Analysis
                    </button>
                  </div>
                ) : (
                  <div className="access-required">
                    <span className="access-label">Analysis Available</span>
                    <button className="access-btn">
                      Sign In for Team Analysis
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Modal */}
      {showAccessModal && (
        <div className="access-modal-overlay" onClick={() => setShowAccessModal(false)}>
          <div className="access-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAccessModal(false)}>×</button>
            <h3>🏈 Access {selectedTeam} Analysis</h3>
            <p>Sign in to view detailed team analysis, predictions, and insights for {selectedTeam}.</p>
            
            <div className="modal-features">
              <h4>What You'll Get:</h4>
              <ul>
                <li>✅ Real-time team analytics</li>
                <li>✅ Game predictions and confidence scores</li>
                <li>✅ Player performance insights</li>
                <li>✅ Historical data and trends</li>
                <li>✅ Injury reports and roster updates</li>
              </ul>
            </div>

            <div className="modal-buttons">
              <button 
                onClick={() => {
                  setShowAccessModal(false);
                  onShowSignIn && onShowSignIn();
                }} 
                className="btn-signin"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  setShowAccessModal(false);
                  onShowRegistration && onShowRegistration();
                }} 
                className="btn-trial"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="info-section">
        <div className="info-content">
          <h2>🎯 Get Complete Team Analysis</h2>
          <p>
            Our AI-powered system provides detailed analysis for every {currentConference.name} team. 
            Sign up to access real-time predictions, player insights, and game breakdowns.
          </p>
          
          <div className="features-preview">
            <div className="feature">
              <span className="feature-icon">📊</span>
              <div>
                <h4>Advanced Analytics</h4>
                <p>54-factor analysis for each team</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <div>
                <h4>Game Predictions</h4>
                <p>92.3% accurate predictions</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🏈</span>
              <div>
                <h4>Live Updates</h4>
                <p>Real-time roster and injury reports</p>
              </div>
            </div>
          </div>

          <div className="cta-buttons">
            <button 
              className="cta-primary"
              onClick={() => onShowRegistration && onShowRegistration()}
            >
              Start Free 30-Day Trial
            </button>
            <button 
              className="cta-secondary"
              onClick={() => onShowSignIn && onShowSignIn()}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConferencePage;