// PredictionEngineAPI.js - Real connection to your prediction engine

class PredictionEngineAPI {
  constructor() {
    this.baseURL = process.env.REACT_APP_ENGINE_API_URL || 'https://your-prediction-engine.com/api';
    this.apiKey = process.env.REACT_APP_ENGINE_API_KEY;
  }

  // Get current national rankings from your engine
  async getNationalRankings() {
    try {
      const response = await fetch(`${this.baseURL}/rankings/national`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client': 'collegesportspredictions-web'
        }
      });

      if (!response.ok) {
        throw new Error(`Engine API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Expected format from your engine:
      return {
        rankings: data.rankings, // Array of {rank, team, confidence, keyFactors, winProbability}
        accuracy: data.accuracy, // {overall, top10, top25, historical}
        dataPoints: data.dataPoints, // Number of data points analyzed
        lastUpdated: data.lastUpdated,
        factors: data.factors // Array of the 54 factors considered
      };
    } catch (error) {
      console.error('Error fetching national rankings:', error);
      throw error;
    }
  }

  // Get conference rankings from your engine
  async getConferenceRankings(conference) {
    try {
      const response = await fetch(`${this.baseURL}/rankings/conference/${conference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client': 'collegesportspredictions-web'
        }
      });

      if (!response.ok) {
        throw new Error(`Engine API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Expected format from your engine:
      return {
        conference: conference,
        rankings: data.rankings,
        championshipOdds: data.championshipOdds,
        accuracy: data.accuracy,
        dataPoints: data.dataPoints,
        lastUpdated: data.lastUpdated
      };
    } catch (error) {
      console.error('Error fetching conference rankings:', error);
      throw error;
    }
  }

  // Get specific team analysis
  async getTeamAnalysis(teamName) {
    try {
      const response = await fetch(`${this.baseURL}/teams/${teamName}/analysis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client': 'collegesportspredictions-web'
        }
      });

      if (!response.ok) {
        throw new Error(`Engine API Error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        team: data.team,
        currentRanking: data.currentRanking,
        winProbability: data.winProbability,
        nextGame: data.nextGame,
        keyFactors: data.keyFactors,
        strengthOfSchedule: data.strengthOfSchedule,
        injuries: data.injuries,
        weather: data.weather,
        momentum: data.momentum,
        historicalPerformance: data.historicalPerformance
      };
    } catch (error) {
      console.error('Error fetching team analysis:', error);
      throw error;
    }
  }

  // Get game predictions
  async getGamePredictions(gameId) {
    try {
      const response = await fetch(`${this.baseURL}/games/${gameId}/prediction`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client': 'collegesportspredictions-web'
        }
      });

      if (!response.ok) {
        throw new Error(`Engine API Error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        game: data.game,
        prediction: data.prediction,
        confidence: data.confidence,
        keyFactors: data.keyFactors,
        weather: data.weather,
        injuries: data.injuries,
        historical: data.historical,
        bettingLine: data.bettingLine,
        ourLine: data.ourLine
      };
    } catch (error) {
      console.error('Error fetching game prediction:', error);
      throw error;
    }
  }

  // Get weekly accuracy report
  async getAccuracyReport() {
    try {
      const response = await fetch(`${this.baseURL}/accuracy/weekly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client': 'collegesportspredictions-web'
        }
      });

      if (!response.ok) {
        throw new Error(`Engine API Error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        weeklyAccuracy: data.weeklyAccuracy,
        overallAccuracy: data.overallAccuracy,
        vsESPN: data.vsESPN,
        vsCBS: data.vsCBS,
        vsVegas: data.vsVegas,
        totalPredictions: data.totalPredictions,
        correctPredictions: data.correctPredictions
      };
    } catch (error) {
      console.error('Error fetching accuracy report:', error);
      throw error;
    }
  }

  // Check if engine is available
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Engine health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const predictionEngine = new PredictionEngineAPI();
export default PredictionEngineAPI;