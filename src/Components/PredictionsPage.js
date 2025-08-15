import React, { useState, useEffect } from 'react';

const PredictionsPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with your API
    const mockPredictions = [
      {
        id: 1,
        gameDate: '2025-08-23',
        homeTeam: { name: 'Alabama', logo: '/logos/alabama.png', rank: 4 },
        awayTeam: { name: 'Georgia', logo: '/logos/georgia.png', rank: 2 },
        predictedWinner: 'Georgia',
        confidence: 72,
        predictedScore: { home: 24, away: 31 },
        spread: -7,
        overUnder: 55
      },
      {
        id: 2,
        gameDate: '2025-08-23',
        homeTeam: { name: 'Ohio State', logo: '/logos/ohio-state.png', rank: 5 },
        awayTeam: { name: 'Michigan', logo: '/logos/michigan.png', rank: 8 },
        predictedWinner: 'Ohio State',
        confidence: 65,
        predictedScore: { home: 35, away: 28 },
        spread: 7,
        overUnder: 63
      }
    ];

    const mockAccuracy = {
      overall: 74.3,
      thisWeek: 81.2,
      lastMonth: 72.5,
      byConference: {
        'SEC': 76.5,
        'Big Ten': 73.2,
        'ACC': 71.8,
        'Big 12': 75.1
      }
    };

    setTimeout(() => {
      setPredictions(mockPredictions);
      setAccuracy(mockAccuracy);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="predictions-page loading">
        <div className="spinner">Loading predictions...</div>
      </div>
    );
  }

  return (
    <div className="predictions-page">
      <div className="predictions-header">
        <h1>College Football Predictions</h1>
        <p>AI-powered predictions with {accuracy?.overall}% accuracy</p>
      </div>

      <div className="accuracy-section">
        <h2>Prediction Accuracy</h2>
        <div className="accuracy-grid">
          <div className="accuracy-card">
            <h3>Overall</h3>
            <div className="accuracy-value">{accuracy.overall}%</div>
            <div className="accuracy-bar">
              <div className="accuracy-fill" style={{width: `${accuracy.overall}%`}}></div>
            </div>
          </div>
          <div className="accuracy-card">
            <h3>This Week</h3>
            <div className="accuracy-value">{accuracy.thisWeek}%</div>
            <div className="accuracy-bar">
              <div className="accuracy-fill" style={{width: `${accuracy.thisWeek}%`}}></div>
            </div>
          </div>
          <div className="accuracy-card">
            <h3>Last Month</h3>
            <div className="accuracy-value">{accuracy.lastMonth}%</div>
            <div className="accuracy-bar">
              <div className="accuracy-fill" style={{width: `${accuracy.lastMonth}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="upcoming-predictions">
        <h2>This Week's Predictions</h2>
        <div className="predictions-grid">
          {predictions.map(game => (
            <div key={game.id} className="prediction-card">
              <div className="game-header">
                <span className="game-date">
                  {new Date(game.gameDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="teams-matchup">
                <div className="team away">
                  <img src={game.awayTeam.logo} alt={game.awayTeam.name} />
                  <div className="team-info">
                    <p className="team-name">{game.awayTeam.name}</p>
                    {game.awayTeam.rank && <p className="team-rank">#{game.awayTeam.rank}</p>}
                  </div>
                </div>
                
                <div className="vs">VS</div>
                
                <div className="team home">
                  <img src={game.homeTeam.logo} alt={game.homeTeam.name} />
                  <div className="team-info">
                    <p className="team-name">{game.homeTeam.name}</p>
                    {game.homeTeam.rank && <p className="team-rank">#{game.homeTeam.rank}</p>}
                  </div>
                </div>
              </div>
              
              <div className="prediction-details">
                <div className="predicted-winner">
                  <span className="label">Winner:</span>
                  <span className="value">{game.predictedWinner}</span>
                </div>
                
                <div className="confidence-meter">
                  <span className="label">Confidence:</span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{
                        width: `${game.confidence}%`,
                        backgroundColor: game.confidence > 70 ? '#10b981' : 
                                       game.confidence > 50 ? '#f59e0b' : '#ef4444'
                      }}
                    ></div>
                  </div>
                  <span className="confidence-value">{game.confidence}%</span>
                </div>
                
                <div className="predicted-score">
                  <span className="label">Score:</span>
                  <span className="value">
                    {game.predictedScore.away} - {game.predictedScore.home}
                  </span>
                </div>
                
                <div className="betting-info">
                  <span className="spread">Spread: {game.spread > 0 ? '+' : ''}{game.spread}</span>
                  <span className="over-under">O/U: {game.overUnder}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="conference-accuracy">
        <h2>Accuracy by Conference</h2>
        <div className="conference-grid">
          {Object.entries(accuracy.byConference).map(([conf, acc]) => (
            <div key={conf} className="conference-stat">
              <h3>{conf}</h3>
              <div className="accuracy-value">{acc}%</div>
              <div className="accuracy-bar">
                <div className="accuracy-fill" style={{width: `${acc}%`}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictionsPage;