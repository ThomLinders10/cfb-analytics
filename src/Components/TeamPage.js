import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API, graphqlOperation } from '../MockAWSAmplify.js';
import './TeamPage.css';

const GET_TEAM_DETAILS = `
  query GetTeam($id: ID!) {
    getTeam(id: $id) {
      id
      name
      mascot
      conference
      logoUrl
      teamColors
      players {
        items {
          id
          name
          position
          height
          weight
          year
        }
      }
    }
  }
`;

const TeamPage = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [avatarVideo, setAvatarVideo] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [nextGame, setNextGame] = useState(null);

  const loadTeamData = async () => {
    try {
      const result = await API.graphql(graphqlOperation(GET_TEAM_DETAILS, {
        id: teamId
      }));
      setTeam(result.data.getTeam);
      
      // Load next game data
      await loadNextGame(result.data.getTeam);
      
      // Generate avatar analysis for this team
      await loadTeamAvatarAnalysis(result.data.getTeam);
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNextGame = async (teamData) => {
    try {
      const response = await API.get('schedule', `/team/${teamId}/next-game`);
      setNextGame(response.game || mockNextGame);
    } catch (error) {
      console.error('Error loading next game:', error);
      setNextGame(mockNextGame);
    }
  };

  const loadTeamAvatarAnalysis = async (teamData) => {
    setAvatarLoading(true);
    try {
      // Generate Rita's team-specific analysis
      const response = await API.post('avatar-content', '/generate-team-analysis', {
        body: {
          type: 'team-preview',
          context: {
            teamName: teamData.name,
            conference: teamData.conference,
            nextOpponent: mockNextGame.opponent,
            gameDate: mockNextGame.date,
            prediction: mockNextGame.prediction,
            keyFactors: mockNextGame.keyFactors,
            injuries: mockNextGame.injuries,
            weather: mockNextGame.weather
          }
        }
      });
      
      if (response.videoUrl) {
        setAvatarVideo(response.videoUrl);
        setAvatarLoading(false);
      } else {
        // Video is being generated
        checkTeamVideoStatus(response.videoId);
      }
    } catch (error) {
      console.error('Error loading team avatar analysis:', error);
      // Fallback after 4 seconds
      setTimeout(() => {
        setAvatarVideo('/demo-team-analysis.mp4');
        setAvatarLoading(false);
      }, 4000);
    }
  };

  const checkTeamVideoStatus = async (videoId) => {
    try {
      const response = await API.get('avatar-content', `/video-status/${videoId}`);
      
      if (response.status === 'completed') {
        setAvatarVideo(response.videoUrl);
        setAvatarLoading(false);
      } else if (response.status === 'processing') {
        setTimeout(() => checkTeamVideoStatus(videoId), 15000);
      } else {
        setAvatarLoading(false);
      }
    } catch (error) {
      console.error('Error checking team video status:', error);
      setAvatarLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  // Mock data
  const mockNextGame = {
    opponent: 'Georgia',
    date: 'November 16, 2024',
    location: 'Bryant-Denny Stadium',
    prediction: 'Alabama by 7.5',
    confidence: 0.923,
    keyFactors: ['Home field advantage', 'Rushing attack superiority', 'Defensive depth'],
    injuries: ['LB Wilson (probable)', 'WR Davis (questionable)'],
    weather: 'Clear, 72°F, 5mph winds'
  };

  const teamStats = {
    record: '8-4',
    predictedRecord: '9-3',
    homeAdvantage: 4.2,
    offensiveRating: 87.3,
    defensiveRating: 82.1
  };

  const topPlayers = [
    { name: 'QB Smith', position: 'QB', predictedStats: '285 pass yds, 3 TDs' },
    { name: 'RB Johnson', position: 'RB', predictedStats: '124 rush yds, 2 TDs' },
    { name: 'WR Davis', position: 'WR', predictedStats: '89 rec yds, 1 TD' },
    { name: 'LB Wilson', position: 'LB', predictedStats: '8 tackles, 1 sack' },
    { name: 'CB Brown', position: 'CB', predictedStats: '4 tackles, 1 INT' }
  ];

  if (loading) return <div className="team-loading">Loading team details...</div>;
  if (!team) return <div className="team-error">Team not found</div>;

  return (
    <div className="team-page">
      {/* Team Header */}
      <div className="team-header" style={{backgroundColor: team.teamColors || '#2d5016'}}>
        <div className="team-header-content">
          <div className="team-logo-container">
            <div className="team-logo-xl">{team.name.charAt(0)}</div>
          </div>
          <div className="team-title">
            <h1>{team.name}</h1>
            <h2>{team.mascot}</h2>
            <p>{team.conference} Conference</p>
          </div>
          <div className="team-record">
            <div className="record-item">
              <span className="record-label">Current Record</span>
              <span className="record-value">{teamStats.record}</span>
            </div>
            <div className="record-item">
              <span className="record-label">Predicted Final</span>
              <span className="record-value predicted">{teamStats.predictedRecord}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rita's Team Analysis Video - MAIN FEATURE */}
      <div className="avatar-analysis-section">
        <div className="analysis-header">
          <h2>🎬 Rita's Game Preview</h2>
          <p>AI field reporter analysis for {team.name}'s upcoming matchup</p>
        </div>
        
        <div className="avatar-video-container">
          {avatarLoading ? (
            <div className="avatar-loading">
              <div className="rita-placeholder">
                <div className="reporter-avatar">👩‍📺</div>
                <div className="reporter-name">Rita Garcia</div>
                <div className="reporter-title">Field Reporter</div>
                <div className="analysis-indicator">
                  <div className="spinner"></div>
                  <div className="loading-text">Analyzing {team.name} vs {nextGame?.opponent}...</div>
                </div>
              </div>
              <div className="generation-status">
                <h3>🏟️ Generating Team-Specific Analysis</h3>
                <p>Rita is breaking down {team.name}'s next game with opponent-specific insights...</p>
                <div className="analysis-progress">
                  <div className="progress-step active">📊 Analyzing Team Stats</div>
                  <div className="progress-step active">🎯 Evaluating Matchup</div>
                  <div className="progress-step active">🎙️ Creating Report</div>
                  <div className="progress-step">📹 Finalizing Video</div>
                </div>
              </div>
            </div>
          ) : avatarVideo ? (
            <div className="team-video-player">
              <video 
                controls 
                autoPlay 
                muted
                width="100%" 
                height="350"
                poster="/rita-team-analysis.jpg"
                style={{ borderRadius: '12px' }}
              >
                <source src={avatarVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="video-info">
                <div className="reporter-badge">
                  <div className="reporter-avatar-small">👩‍📺</div>
                  <div className="reporter-details">
                    <span className="reporter-name">Rita Garcia</span>
                    <span className="reporter-role">Field Reporter</span>
                  </div>
                  <span className="fresh-badge">🔴 FRESH</span>
                </div>
                <h3>{team.name} vs {nextGame?.opponent} Preview</h3>
                <p>🎙️ Rita breaks down the key matchups, player advantages, and our 92.3% accurate prediction for this game.</p>
                <div className="analysis-highlights">
                  <div className="highlight">🎯 Prediction: {nextGame?.prediction}</div>
                  <div className="highlight">📊 Confidence: {Math.round((nextGame?.confidence || 0.9) * 100)}%</div>
                  <div className="highlight">🏟️ Location: {nextGame?.location}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="avatar-fallback">
              <div className="static-reporter">
                <div className="reporter-avatar-large">👩‍📺</div>
                <div className="reporter-info">
                  <h3>Rita Garcia</h3>
                  <p>Field Reporter</p>
                </div>
              </div>
              <div className="fallback-content">
                <h3>📹 Analysis Coming Soon</h3>
                <p>Rita is preparing your {team.name} game breakdown. Check back in a few minutes!</p>
                <button 
                  onClick={() => loadTeamAvatarAnalysis(team)}
                  className="retry-button"
                >
                  🔄 Refresh Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="team-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          👥 Roster
        </button>
        <button 
          className={`tab ${activeTab === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictions')}
        >
          🔮 Predictions
        </button>
        <button 
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          🧠 AI Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="team-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Next Game Preview */}
              <div className="next-game-card">
                <h3>🏈 Next Game</h3>
                <div className="game-preview">
                  <div className="game-matchup">
                    <span className="vs">vs</span>
                    <span className="opponent">{nextGame?.opponent}</span>
                  </div>
                  <div className="game-details">
                    <p>📅 {nextGame?.date}</p>
                    <p>📍 {nextGame?.location}</p>
                    <div className="prediction">
                      <span className="predicted-score">{nextGame?.prediction}</span>
                      <span className="confidence">({Math.round((nextGame?.confidence || 0.9) * 100)}% confidence)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Stats */}
              <div className="team-stats-card">
                <h3>📈 Team Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Home Advantage</span>
                    <span className="stat-value">{teamStats.homeAdvantage} pts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Offensive Rating</span>
                    <span className="stat-value">{teamStats.offensiveRating}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Defensive Rating</span>
                    <span className="stat-value">{teamStats.defensiveRating}</span>
                  </div>
                </div>
              </div>

              {/* Key Factors from Rita's Analysis */}
              <div className="analysis-card positive">
                <h3>✅ Rita's Key Advantages</h3>
                <ul>
                  {nextGame?.keyFactors?.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  )) || [
                    'Strong home field advantage (+4.2 points)',
                    'Improved offensive line depth from transfers',
                    'Veteran QB with 3 years starting experience'
                  ]}
                </ul>
              </div>

              {/* Injury Report */}
              <div className="analysis-card neutral">
                <h3>🏥 Injury Report</h3>
                <ul>
                  {nextGame?.injuries?.map((injury, index) => (
                    <li key={index}>{injury}</li>
                  )) || [
                    'LB Wilson (probable)',
                    'WR Davis (questionable)',
                    'No major concerns'
                  ]}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="roster-tab">
            <div className="top-players-section">
              <h3>⭐ Top 5 Players - Rita's Predictions</h3>
              <div className="top-players-grid">
                {topPlayers.map((player, index) => (
                  <div key={index} className="player-card">
                    <div className="player-info">
                      <span className="player-name">{player.name}</span>
                      <span className="player-position">{player.position}</span>
                    </div>
                    <div className="predicted-stats">
                      {player.predictedStats}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="full-roster-section">
              <h3>👥 Full Roster</h3>
              <div className="roster-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Year</th>
                      <th>Height</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.players?.items?.map((player) => (
                      <tr key={player.id}>
                        <td className="player-name">{player.name}</td>
                        <td className="position">{player.position}</td>
                        <td>{player.year}</td>
                        <td>{player.height}</td>
                        <td>{player.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="predictions-tab">
            <div className="season-predictions">
              <h3>🔮 Season Predictions</h3>
              <div className="prediction-cards">
                <div className="prediction-card">
                  <h4>Conference Finish</h4>
                  <p className="big-stat">3rd Place</p>
                  <p className="confidence">87% confidence</p>
                </div>
                <div className="prediction-card">
                  <h4>Bowl Game</h4>
                  <p className="big-stat">NY6 Bowl</p>
                  <p className="confidence">72% confidence</p>
                </div>
                <div className="prediction-card">
                  <h4>Final Ranking</h4>
                  <p className="big-stat">Top 15</p>
                  <p className="confidence">68% confidence</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-tab">
            <div className="deep-analysis">
              <h3>🧠 Deep Team Analysis</h3>
              <div className="analysis-sections">
                <div className="analysis-section">
                  <h4>🎯 Strengths</h4>
                  <p>Rita's analysis highlights {team.name}'s dominant rushing attack and experienced offensive line. The team shows exceptional performance in red zone situations.</p>
                </div>
                <div className="analysis-section">
                  <h4>⚠️ Areas of Concern</h4>
                  <p>Secondary depth remains a question mark after graduation losses. Special teams consistency has been an issue in close games.</p>
                </div>
                <div className="analysis-section">
                  <h4>📈 Trending Up</h4>
                  <p>Emerging sophomore WR showing breakout potential. Transfer portal additions strengthening defensive depth.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;