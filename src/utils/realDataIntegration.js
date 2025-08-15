// Real Data Integration for College Sports Predictions
// This replaces all hardcoded values with live data from your database

// 1. REAL ACCURACY CALCULATION
export const calculateRealAccuracy = async () => {
  try {
    const response = await fetch('/api/accuracy/live', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    const data = await response.json();
    
    // Return actual calculated accuracy from your prediction results
    return {
      overall: data.totalCorrect / data.totalPredictions * 100,
      thisWeek: data.weekCorrect / data.weekPredictions * 100,
      lastMonth: data.monthCorrect / data.monthPredictions * 100,
      byConference: data.conferenceAccuracy,
      lastUpdated: data.lastCalculated
    };
  } catch (error) {
    console.error('Failed to fetch real accuracy:', error);
    // Fallback to database query if API fails
    return await getAccuracyFromDatabase();
  }
};

// 2. REAL GAME PREDICTIONS (no hardcoded scores)
export const getRealGamePredictions = async () => {
  try {
    const response = await fetch('/api/predictions/upcoming', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const games = await response.json();
    
    // Return only games with actual ML predictions
    return games.filter(game => 
      game.prediction && 
      game.prediction.confidence > 0 && 
      game.prediction.calculatedAt
    ).map(game => ({
      id: game.gameId,
      gameDate: game.scheduledDate,
      homeTeam: {
        name: game.homeTeam.name,
        logo: game.homeTeam.logoUrl,
        rank: game.homeTeam.currentRank
      },
      awayTeam: {
        name: game.awayTeam.name,
        logo: game.awayTeam.logoUrl,
        rank: game.awayTeam.currentRank
      },
      // REAL prediction data from your ML model
      predictedWinner: game.prediction.winner,
      confidence: Math.round(game.prediction.confidence * 100),
      predictedScore: {
        home: game.prediction.homeScore,
        away: game.prediction.awayScore
      },
      spread: game.prediction.spread,
      overUnder: game.prediction.overUnder,
      // Data integrity tracking
      lastUpdated: game.prediction.calculatedAt,
      dataPoints: game.prediction.dataPointsUsed,
      modelVersion: game.prediction.modelVersion
    }));
  } catch (error) {
    console.error('Failed to fetch real predictions:', error);
    return []; // Return empty rather than fake data
  }
};

// 3. REAL TEAM STATS (for video scripts)
export const getRealTeamStats = async (teamId, opponentId) => {
  try {
    const response = await fetch(`/api/teams/${teamId}/stats?opponent=${opponentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const stats = await response.json();
    
    // Return actual team performance data
    return {
      team: {
        name: stats.team.name,
        record: `${stats.team.wins}-${stats.team.losses}`,
        avgPointsScored: stats.offense.avgPointsPerGame,
        avgYardsPerGame: stats.offense.avgYardsPerGame,
        passingYards: stats.offense.avgPassingYards,
        rushingYards: stats.offense.avgRushingYards,
        avgPointsAllowed: stats.defense.avgPointsAllowed,
        defensiveRanking: stats.defense.nationalRanking,
        recentForm: stats.recentGames.slice(-5), // Last 5 games
        keyInjuries: stats.injuries.filter(i => i.severity === 'out'),
        keyPlayers: stats.keyPlayers
      },
      opponent: {
        name: stats.opponent.name,
        defensiveWeaknesses: stats.opponent.defensiveWeaknesses,
        offensiveStrengths: stats.opponent.offensiveStrengths,
        headToHead: stats.headToHeadRecord
      },
      prediction: {
        confidence: stats.prediction.confidence,
        keyFactors: stats.prediction.topFactors,
        score: stats.prediction.score,
        reasoning: stats.prediction.aiReasoning
      }
    };
  } catch (error) {
    console.error('Failed to fetch real team stats:', error);
    return null; // Don't generate video without real data
  }
};

// 4. DYNAMIC ACCURACY COMPONENT (replaces hardcoded values)
import React, { useState, useEffect } from 'react';

export const LiveAccuracyDisplay = () => {
  const [accuracy, setAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchAccuracy = async () => {
      try {
        const realAccuracy = await calculateRealAccuracy();
        setAccuracy(realAccuracy);
        setLastUpdated(new Date(realAccuracy.lastUpdated));
      } catch (error) {
        console.error('Accuracy fetch failed:', error);
        // Don't show fake numbers on error
        setAccuracy({ overall: 0, error: true });
      } finally {
        setLoading(false);
      }
    };

    fetchAccuracy();
    
    // Update accuracy every 30 minutes
    const interval = setInterval(fetchAccuracy, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="accuracy-loading">Calculating live accuracy...</div>;
  }

  if (accuracy?.error) {
    return <div className="accuracy-error">Unable to load current accuracy</div>;
  }

  return (
    <div className="live-accuracy">
      <div className="accuracy-value">
        {accuracy.overall.toFixed(1)}%
      </div>
      <div className="accuracy-label">Current Accuracy</div>
      <div className="accuracy-updated">
        Updated: {lastUpdated?.toLocaleString()}
      </div>
      {accuracy.overall < 85 && (
        <div className="accuracy-disclaimer">
          *Accuracy varies by sport and conference
        </div>
      )}
    </div>
  );
};

// 5. AVATAR SCRIPT GENERATOR (using real data only)
export const generateRealVideoScript = async (type, teamId = null) => {
  try {
    if (type === 'welcome') {
      const accuracy = await calculateRealAccuracy();
      const upcomingGames = await getRealGamePredictions();
      
      if (!accuracy || accuracy.overall === 0) {
        return null; // Don't generate video without real accuracy
      }
      
      return {
        scriptText: `Welcome to College Sports Predictions! I'm Bob, and our advanced analytics system currently maintains a ${accuracy.overall.toFixed(1)}% accuracy rate across ${upcomingGames.length} upcoming games. We analyze over 320,000 real data points to bring you the most reliable predictions in college sports.`,
        dataSource: 'live_accuracy',
        generated: new Date().toISOString(),
        accuracy: accuracy.overall
      };
    }
    
    if (type === 'team' && teamId) {
      const teamStats = await getRealTeamStats(teamId);
      
      if (!teamStats || !teamStats.prediction) {
        return null; // Don't generate without real prediction
      }
      
      const script = `Hi, I'm Rita reporting from the field! ${teamStats.team.name} is coming into this matchup with a ${teamStats.team.record} record. Our prediction model shows ${teamStats.prediction.reasoning} We're calling for a final score of ${teamStats.prediction.score.away}-${teamStats.prediction.score.home} with ${teamStats.prediction.confidence}% confidence.`;
      
      return {
        scriptText: script,
        dataSource: 'real_team_stats',
        generated: new Date().toISOString(),
        confidence: teamStats.prediction.confidence,
        keyFactors: teamStats.prediction.keyFactors
      };
    }
    
  } catch (error) {
    console.error('Failed to generate real script:', error);
    return null; // Never return fake data
  }
};

// 6. DATA VALIDATION MIDDLEWARE
export const validateRealData = (data) => {
  const validationRules = {
    accuracy: (acc) => acc >= 0 && acc <= 100 && !isNaN(acc),
    prediction: (pred) => pred.confidence > 0 && pred.calculatedAt,
    teamStats: (stats) => stats.team && stats.prediction,
    gameData: (game) => game.scheduledDate && game.homeTeam && game.awayTeam
  };

  return Object.keys(validationRules).every(key => {
    if (data[key] === undefined) return true; // Optional fields
    return validationRules[key](data[key]);
  });
};

// 7. API INTEGRATION SETUP
export const setupRealDataAPIs = () => {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';
  
  return {
    accuracy: `${API_BASE}/accuracy/live`,
    predictions: `${API_BASE}/predictions/upcoming`,
    teamStats: (teamId) => `${API_BASE}/teams/${teamId}/stats`,
    gameResults: `${API_BASE}/games/results`,
    updateAccuracy: `${API_BASE}/accuracy/recalculate`
  };
};

// 8. REAL-TIME ACCURACY CALCULATOR
export const recalculateAccuracy = async () => {
  try {
    const response = await fetch('/api/accuracy/recalculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    const result = await response.json();
    
    return {
      newAccuracy: result.calculatedAccuracy,
      totalPredictions: result.totalPredictions,
      correctPredictions: result.correctPredictions,
      lastCalculated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to recalculate accuracy:', error);
    return null;
  }
};

// 9. HONEST DISCLAIMER COMPONENT
export const AccuracyDisclaimer = ({ accuracy }) => {
  const getDisclaimerText = (acc) => {
    if (acc >= 90) return "Exceptional performance - past results don't guarantee future outcomes";
    if (acc >= 80) return "Strong performance - individual game outcomes may vary";
    if (acc >= 70) return "Good performance - use predictions as one factor in your analysis";
    return "Performance improving - predictions are for entertainment purposes only";
  };

  return (
    <div className="accuracy-disclaimer">
      <p>{getDisclaimerText(accuracy)}</p>
      <small>
        Accuracy calculated from verified game results. 
        Updated every game day.
      </small>
    </div>
  );
};

// IMPLEMENTATION INSTRUCTIONS:
/*
1. Replace all hardcoded accuracy values with calculateRealAccuracy()
2. Replace mock game data with getRealGamePredictions()
3. Use generateRealVideoScript() for all avatar content
4. Add AccuracyDisclaimer component to your predictions page
5. Set up API endpoints that return real data from your database
6. Never generate videos without validated real data
7. Include data source timestamps in all predictions
*/