import React, { useState, useEffect } from 'react';
import { API } from '../MockAWSAmplify.js';
import './BroadcastBooth.css';

const BroadcastBooth = ({ user, onSubscriptionClick }) => {
  const [currentWeek, setCurrentWeek] = useState(14);
  const [gamesPredictions, setGamesPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarVideo, setAvatarVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [emergingPlayers, setEmergingPlayers] = useState([]);

  useEffect(() => {
    loadWeekData();
    loadAvatarContent();
    loadEmergingPlayers();
  }, [currentWeek]);

  const loadWeekData = async () => {
    try {
      const response = await API.get('predictions', `/week/${currentWeek}`);
      setGamesPredictions(response.games || mockGames);
    } catch (error) {
      console.error('Error loading week data:', error);
      setGamesPredictions(mockGames);
    } finally {
      setLoading(false);
    }
  };

  const loadAvatarContent = async () => {
    setVideoLoading(true);
    try {
      // Generate avatar content based on current week's games
      const response = await API.post('avatar-content', '/generate-broadcast', {
        body: {
          type: 'homepage',
          context: {
            week: currentWeek,
            topGames: gamesPredictions.slice(0, 3),
            accuracy: '92.3%',
            dataPoints: '320,000+',
            weeklyHighlights: 'SEC Championship implications, CFP rankings update'
          }
        }
      });
      
      if (response.videoUrl) {
        setAvatarVideo(response.videoUrl);
      } else {
        // Video is being generated, check status
        checkVideoStatus(response.videoId);
      }
    } catch (error) {
      console.error('Error loading avatar content:', error);
      // Fallback to demo video
      setTimeout(() => {
        setAvatarVideo('/demo-broadcast.mp4');
        setVideoLoading(false);
      }, 3000);
    }
  };

  const checkVideoStatus = async (videoId) => {
    try {
      const response = await API.get('avatar-content', `/video-status/${videoId}`);
      
      if (response.status === 'completed') {
        setAvatarVideo(response.videoUrl);
        setVideoLoading(false);
      } else if (response.status === 'processing') {
        // Check again in 10 seconds
        setTimeout(() => checkVideoStatus(videoId), 10000);
      } else {
        // Generation failed, show static content
        setVideoLoading(false);
      }
    } catch (error) {
      console.error('Error checking video status:', error);
      setVideoLoading(false);
    }
  };

  const loadEmergingPlayers = async () => {
    try {
      const response = await API.get('analytics', '/emerging-players');
      setEmergingPlayers(response.players || mockEmergingPlayers);
    } catch (error) {
      console.error('Error loading emerging players:', error);
      setEmergingPlayers(mockEmergingPlayers);
    }
  };

  // Mock data for development
  const mockGames = [
    {
      id: '1',
      homeTeam: 'Alabama',
      awayTeam: 'Georgia',
      date: '2025-08-30',
      location: 'Atlanta, GA',
      prediction: 'Alabama by 7.5',
      confidence: 0.923,
      factors: ['Home field advantage', 'Rushing attack superiority', 'Defensive depth']
    },
    {
      id: '2',
      homeTeam: 'Ohio State',
      awayTeam: 'Michigan',
      date: '2025-08-31',
      location: 'Columbus, OH',
      prediction: 'Ohio State by 10.5',
      confidence: 0.891,
      factors: ['Talent advantage', 'Quarterback experience', 'Offensive line depth']
    },
    {
      id: '3',
      homeTeam: 'Arizona State',
      awayTeam: 'Northern Arizona',
      date: '2025-08-29',
      location: 'Tempe, AZ',
      prediction: 'Arizona State by 42.5',
      confidence: 0.951,
      factors: ['FBS vs FCS gap', 'Recruiting disparity', 'Coaching advantage']
    }
  ];

  const mockEmergingPlayers = [
    { name: 'Ryan Williams', team: 'Alabama', position: 'WR', impactScore: 94, mentions: 847 },
    { name: 'Jeremiah Smith', team: 'Ohio State', position: 'WR', impactScore: 91, mentions: 723 },
    { name: 'Dylan Raiola', team: 'Nebraska', position: 'QB', impactScore: 88, mentions: 692 },
    { name: 'Zachariah Branch', team: 'USC', position: 'WR', impactScore: 85, mentions: 634 },
    { name: 'Julian Lewis', team: 'Colorado', position: 'QB', impactScore: 83, mentions: 567 }
  ];

  return (
    <div className="broadcast-booth">
      {/* Header */}
      <div className="broadcast-header">
        <div className="logo-section">
          <h1>📺 CFB Analytics Broadcast Booth</h1>
          <p className="tagline">Live AI Analysis with Bob & Tony</p>
        </div>
        <div className="accuracy-badge">
          <span className="accuracy-number">92.3%</span>
          <span className="accuracy-label">Prediction Accuracy</span>
        </div>
      </div>

      {/* Avatar Video Section - MAIN FEATURE */}
      <div className="avatar-broadcast-section">
        <div className="broadcast-studio">
          <div className="video-container">
            {videoLoading ? (
              <div className="video-loading">
                <div className="loading-animation">
                  <div className="avatar-placeholder bob">
                    <div className="avatar-face">👨‍💼</div>
                    <div className="avatar-name">Bob</div>
                    <div className="speaking-indicator"></div>
                  </div>
                  <div className="avatar-placeholder tony">
                    <div className="avatar-face">👨‍🏫</div>
                    <div className="avatar-name">Tony</div>
                    <div className="speaking-indicator"></div>
                  </div>
                </div>
                <div className="generation-status">
                  <div className="spinner"></div>
                  <h3>🎬 Generating This Week's Analysis</h3>
                  <p>Bob and Tony are preparing your personalized CFB breakdown...</p>
                  <div className="generation-progress">
                    <div className="progress-step active">📝 Analyzing Games</div>
                    <div className="progress-step active">🎙️ Generating Script</div>
                    <div className="progress-step active">🎬 Creating Video</div>
                    <div className="progress-step">✅ Ready to Watch</div>
                  </div>
                </div>
              </div>
            ) : avatarVideo ? (
              <div className="video-player">
                <video 
                  controls 
                  autoPlay 
                  muted
                  width="100%" 
                  height="400"
                  poster="/broadcast-thumbnail.jpg"
                  style={{ borderRadius: '12px' }}
                >
                  <source src={avatarVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="video-description">
                  <div className="broadcast-info">
                    <span className="live-badge">🔴 FRESH ANALYSIS</span>
                    <span className="duration">Week {currentWeek} Breakdown • 2:47</span>
                  </div>
                  <h3>Bob & Tony's Week {currentWeek} CFB Preview</h3>
                  <p>🎙️ Our AI anchors break down this week's biggest games, emerging players, and betting insights. Generated with real-time data from our 320,000+ point database.</p>
                </div>
              </div>
            ) : (
              <div className="video-fallback">
                <div className="static-broadcast">
                  <div className="anchor-duo">
                    <div className="anchor bob">
                      <div className="anchor-avatar">👨‍💼</div>
                      <div className="anchor-info">
                        <h4>Bob Richardson</h4>
                        <p>Lead Anchor</p>
                      </div>
                    </div>
                    <div className="anchor tony">
                      <div className="anchor-avatar">👨‍🏫</div>
                      <div className="anchor-info">
                        <h4>Tony Martinez</h4>
                        <p>Stats Expert</p>
                      </div>
                    </div>
                  </div>
                  <div className="fallback-content">
                    <h3>🎬 Video Coming Soon</h3>
                    <p>Bob and Tony are analyzing this week's games. Your personalized broadcast will be ready shortly!</p>
                    <button 
                      onClick={loadAvatarContent}
                      className="retry-button"
                    >
                      🔄 Refresh Analysis
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Broadcast Controls */}
          <div className="broadcast-controls">
            <div className="week-selector">
              {[12, 13, 14, 15, 16].map(week => (
                <button
                  key={week}
                  className={currentWeek === week ? 'active' : ''}
                  onClick={() => setCurrentWeek(week)}
                >
                  Week {week}
                </button>
              ))}
            </div>
            
            <div className="broadcast-stats">
              <div className="stat-item">
                <span className="stat-value">{gamesPredictions.length}</span>
                <span className="stat-label">Games Analyzed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">54</span>
                <span className="stat-label">Factors Tracked</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">92.3%</span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Week Predictions Grid */}
      <div className="predictions-section">
        <h2>🎯 This Week's Top Predictions</h2>
        <div className="predictions-grid">
          {gamesPredictions.slice(0, 6).map((game, index) => (
            <div key={game.id} className="prediction-card" onClick={() => window.location.href = `/game/${game.id}`}>
              <div className="game-header">
                <span className="game-date">{new Date(game.date).toLocaleDateString()}</span>
                <span className="confidence-badge">{Math.round(game.confidence * 100)}% Confidence</span>
              </div>
              
              <div className="matchup">
                <div className="team away">
                  <div className="team-logo">{game.awayTeam.charAt(0)}</div>
                  <div className="team-info">
                    <div className="team-name">{game.awayTeam}</div>
                  </div>
                </div>
                
                <div className="vs-section">
                  <div className="at-symbol">@</div>
                  <div className="prediction-text">{game.prediction}</div>
                </div>
                
                <div className="team home">
                  <div className="team-info">
                    <div className="team-name">{game.homeTeam}</div>
                  </div>
                  <div className="team-logo">{game.homeTeam.charAt(0)}</div>
                </div>
              </div>
              
              <div className="location">{game.location}</div>
              
              <div className="ai-insights">
                <span className="insights-label">🧠 Key Factors:</span>
                <div className="factors-preview">
                  {game.factors.slice(0, 2).join(', ')}...
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emerging Players Widget */}
      <div className="emerging-players-section">
        <h2>⭐ Emerging Players This Week</h2>
        <p className="section-subtitle">Players our AI flagged before they became household names</p>
        <div className="emerging-players-widget">
          {emergingPlayers.map((player, index) => (
            <div key={index} className="emerging-player-card">
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div className="player-team">{player.team} • {player.position}</div>
              </div>
              <div className="player-metrics">
                <div className="impact-meter">
                  <div 
                    className="impact-fill" 
                    style={{ width: `${player.impactScore}%` }}
                  ></div>
                </div>
                <div className="mentions-count">{player.mentions} mentions</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>🚀 Get Full Access to AI-Powered Analysis</h2>
          <p>Join Bob and Tony for deeper game breakdowns, player analysis, and exclusive predictions</p>
          <div className="cta-benefits">
            <div className="benefit">✅ Personalized avatar analysis for your team</div>
            <div className="benefit">✅ 54-factor game predictions</div>
            <div className="benefit">✅ Emerging player alerts</div>
            <div className="benefit">✅ 30-day free trial</div>
          </div>
          <button 
            className="cta-button"
            onClick={onSubscriptionClick}
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastBooth;