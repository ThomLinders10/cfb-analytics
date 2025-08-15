import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API, graphqlOperation } from '../MockAWSAmplify.js';
import './GamePage.css';

const GET_GAME_DETAILS = `
  query GetGame($id: ID!) {
    getGame(id: $id) {
      id
      date
      location
      network
      kickoffTime
      homeTeam {
        id
        name
        mascot
        logoUrl
        conference
        teamColors
      }
      awayTeam {
        id
        name
        mascot
        logoUrl
        conference
        teamColors
      }
      prediction {
        id
        predictedHomeScore
        predictedAwayScore
        confidence
        expectedBoxScore
      }
      result {
        actualHomeScore
        actualAwayScore
        finalBoxScore
      }
    }
  }
`;

const GamePage = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prediction');

  useEffect(() => {
    loadGameData();
    loadWeatherData();
    loadAIAnalysis();
    loadVideoAnalysis();
  }, [gameId]);

  const loadGameData = async () => {
    try {
      const result = await API.graphql(graphqlOperation(GET_GAME_DETAILS, {
        id: gameId
      }));
      setGame(result.data.getGame);
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      // Call your weather API
      const response = await API.get('weather', '/game-weather', {
        queryStringParameters: { gameId }
      });
      setWeatherData(response);
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  };

  const loadAIAnalysis = async () => {
    try {
      // Call OpenAI analysis endpoint
      const response = await API.post('ai-analysis', '/game-analysis', {
        body: { gameId }
      });
      setAiAnalysis(response.analysis);
    } catch (error) {
      console.error('Error loading AI analysis:', error);
    }
  };

  const loadVideoAnalysis = async () => {
    try {
      // Get HeyGen video analysis
      const response = await API.get('video', '/game-analysis-video', {
        queryStringParameters: { gameId }
      });
      setVideoUrl(response.videoUrl);
    } catch (error) {
      console.error('Error loading video:', error);
    }
  };

  if (loading) return <div className="game-loading">Loading game analysis...</div>;
  if (!game) return <div className="game-error">Game not found</div>;

  const { homeTeam, awayTeam, prediction } = game;
  const isHomeWinner = prediction?.predictedHomeScore > prediction?.predictedAwayScore;

  return (
    <div className="game-page">
      {/* Game Header */}
      <div className="game-header">
        <div className="game-date-info">
          <h2>🏈 Game Analysis</h2>
          <p>{new Date(game.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p>📍 {game.location} • 📺 {game.network} • ⏰ {game.kickoffTime}</p>
        </div>
      </div>

      {/* Matchup Display */}
      <div className="matchup-section">
        <div className="team-side away">
          <img src={awayTeam.logoUrl} alt={awayTeam.name} className="team-logo-huge" />
          <div className="team-info">
            <h2>{awayTeam.name}</h2>
            <p>{awayTeam.mascot}</p>
            <p className="conference">{awayTeam.conference}</p>
          </div>
          <div className={`predicted-score ${!isHomeWinner ? 'winner' : ''}`}>
            {prediction?.predictedAwayScore || '--'}
          </div>
        </div>

        <div className="vs-section">
          <div className="at-symbol">@</div>
          <div className="confidence-display">
            <span className="confidence-value">
              {prediction ? Math.round(prediction.confidence * 100) : '--'}%
            </span>
            <span className="confidence-label">Confidence</span>
          </div>
        </div>

        <div className="team-side home">
          <div className={`predicted-score ${isHomeWinner ? 'winner' : ''}`}>
            {prediction?.predictedHomeScore || '--'}
          </div>
          <div className="team-info">
            <h2>{homeTeam.name}</h2>
            <p>{homeTeam.mascot}</p>
            <p className="conference">{homeTeam.conference}</p>
          </div>
          <img src={homeTeam.logoUrl} alt={homeTeam.name} className="team-logo-huge" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="game-tabs">
        <button 
          className={`tab ${activeTab === 'prediction' ? 'active' : ''}`}
          onClick={() => setActiveTab('prediction')}
        >
          🔮 Prediction
        </button>
        <button 
          className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          🧠 AI Analysis
        </button>
        <button 
          className={`tab ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveTab('weather')}
        >
          🌤️ Weather Impact
        </button>
        <button 
          className={`tab ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          🎥 Video Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="game-content">
        {activeTab === 'prediction' && (
          <div className="prediction-tab">
            <div className="prediction-grid">
              <div className="key-factors-card">
                <h3>🔑 Key Prediction Factors</h3>
                <div className="factors-list">
                  <div className="factor-item">
                    <span className="factor-icon">🏠</span>
                    <span className="factor-name">Home Field Advantage</span>
                    <span className="factor-impact">+3.2 pts</span>
                  </div>
                  <div className="factor-item">
                    <span className="factor-icon">⭐</span>
                    <span className="factor-name">Emerging Players</span>
                    <span className="factor-impact">+1.8 pts</span>
                  </div>
                  <div className="factor-item">
                    <span className="factor-icon">📊</span>
                    <span className="factor-name">Recent Performance</span>
                    <span className="factor-impact">-0.5 pts</span>
                  </div>
                  <div className="factor-item">
                    <span className="factor-icon">🌤️</span>
                    <span className="factor-name">Weather Conditions</span>
                    <span className="factor-impact">+1.1 pts</span>
                  </div>
                </div>
              </div>

              <div className="predicted-stats-card">
                <h3>📊 Predicted Player Performances</h3>
                <div className="predicted-stats">
                  <div className="team-stats">
                    <h4>{awayTeam.name}</h4>
                    <div className="player-prediction">
                      <span className="player-name">QB Johnson</span>
                      <span className="predicted-stat">267 pass yds, 2 TDs</span>
                    </div>
                    <div className="player-prediction">
                      <span className="player-name">RB Williams</span>
                      <span className="predicted-stat">98 rush yds, 1 TD</span>
                    </div>
                    <div className="player-prediction">
                      <span className="player-name">WR Davis</span>
                      <span className="predicted-stat">76 rec yds, 1 TD</span>
                    </div>
                  </div>
                  
                  <div className="team-stats">
                    <h4>{homeTeam.name}</h4>
                    <div className="player-prediction">
                      <span className="player-name">QB Smith</span>
                      <span className="predicted-stat">298 pass yds, 3 TDs</span>
                    </div>
                    <div className="player-prediction">
                      <span className="player-name">RB Brown</span>
                      <span className="predicted-stat">124 rush yds, 2 TDs</span>
                    </div>
                    <div className="player-prediction">
                      <span className="player-name">WR Wilson</span>
                      <span className="predicted-stat">89 rec yds, 1 TD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-tab">
            <div className="ai-analysis-card">
              <h3>🧠 OpenAI Game Analysis</h3>
              {aiAnalysis ? (
                <div className="analysis-content">
                  <div className="analysis-section">
                    <h4>🔍 Key Matchups</h4>
                    <p>{aiAnalysis.keyMatchups}</p>
                  </div>
                  <div className="analysis-section">
                    <h4>⚡ X-Factors</h4>
                    <p>{aiAnalysis.xFactors}</p>
                  </div>
                  <div className="analysis-section">
                    <h4>🎯 Prediction Reasoning</h4>
                    <p>{aiAnalysis.reasoning}</p>
                  </div>
                  <div className="analysis-section">
                    <h4>⚠️ Upset Potential</h4>
                    <p>{aiAnalysis.upsetPotential}</p>
                  </div>
                </div>
              ) : (
                <div className="analysis-loading">
                  <div className="spinner"></div>
                  <p>Generating AI analysis...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="weather-tab">
            <div className="weather-impact-card">
              <h3>🌤️ Weather Impact Analysis</h3>
              {weatherData ? (
                <div className="weather-content">
                  <div className="current-conditions">
                    <div className="weather-main">
                      <span className="temperature">{weatherData.temperature}°F</span>
                      <span className="condition">{weatherData.condition}</span>
                    </div>
                    <div className="weather-details">
                      <div className="weather-detail">
                        <span className="detail-label">Wind</span>
                        <span className="detail-value">{weatherData.windSpeed} mph</span>
                      </div>
                      <div className="weather-detail">
                        <span className="detail-label">Humidity</span>
                        <span className="detail-value">{weatherData.humidity}%</span>
                      </div>
                      <div className="weather-detail">
                        <span className="detail-label">Precipitation</span>
                        <span className="detail-value">{weatherData.precipitation}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="weather-impact">
                    <h4>📊 Weather Impact on Game</h4>
                    <div className="impact-factors">
                      <div className="impact-item">
                        <span className="impact-label">Passing Game</span>
                        <span className={`impact-value ${weatherData.passingImpact > 0 ? 'positive' : 'negative'}`}>
                          {weatherData.passingImpact > 0 ? '+' : ''}{weatherData.passingImpact}%
                        </span>
                      </div>
                      <div className="impact-item">
                        <span className="impact-label">Rushing Game</span>
                        <span className={`impact-value ${weatherData.rushingImpact > 0 ? 'positive' : 'negative'}`}>
                          {weatherData.rushingImpact > 0 ? '+' : ''}{weatherData.rushingImpact}%
                        </span>
                      </div>
                      <div className="impact-item">
                        <span className="impact-label">Scoring</span>
                        <span className={`impact-value ${weatherData.scoringImpact > 0 ? 'positive' : 'negative'}`}>
                          {weatherData.scoringImpact > 0 ? '+' : ''}{weatherData.scoringImpact}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="weather-summary">
                      <p>{weatherData.summary}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="weather-loading">
                  <div className="spinner"></div>
                  <p>Loading weather data...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="video-tab">
            <div className="video-analysis-card">
              <h3>🎥 AI Avatar Analysis</h3>
              {videoUrl ? (
                <div className="video-content">
                  <div className="video-player">
                    <video 
                      controls 
                      width="100%" 
                      height="400"
                      poster="/video-thumbnail.jpg"
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="video-description">
                    <p>🎙️ Personalized game analysis powered by HeyGen avatars and ElevenLabs voice synthesis</p>
                    <p>📊 This analysis covers all 54 factors that go into our prediction model</p>
                  </div>
                </div>
              ) : (
                <div className="video-loading">
                  <div className="spinner"></div>
                  <p>Generating personalized video analysis...</p>
                  <p className="video-eta">This usually takes 2-3 minutes</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;