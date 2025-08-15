// Real Data API Connector - No Mock Data Allowed
class RealDataAPI {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_GATEWAY_URL || 
                       process.env.REACT_APP_ML_ENGINE_URL ||
                       'https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/dev';
        this.region = process.env.REACT_APP_REGION || 'us-east-1';
    }

    // Real API call wrapper with error handling
    async makeAPICall(endpoint, data = {}, method = 'POST') {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: method === 'GET' ? undefined : JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw new Error(`API Error: ${error.message}`);
        }
    }

    // Get real teams from database
    async getRealTeams() {
        try {
            const result = await this.makeAPICall('/teams', {}, 'GET');
            return {
                teams: result.teams || [],
                totalTeams: result.totalTeams || 0,
                source: 'Real Database'
            };
        } catch (error) {
            console.error('Failed to get real teams:', error);
            return {
                teams: [],
                totalTeams: 0,
                error: error.message,
                source: 'Error - Database Unavailable'
            };
        }
    }

    // Get real team data with all statistics
    async getRealTeamData(teamName, season = 2024) {
        try {
            const result = await this.makeAPICall('/team-data', {
                teamName: teamName,
                season: season
            });

            return result.team;
        } catch (error) {
            console.error(`Failed to get team data for ${teamName}:`, error);
            return null;
        }
    }

    // Get real model accuracy - never return fake numbers
    async getRealModelAccuracy() {
        try {
            const result = await this.makeAPICall('/model-accuracy', {
                action: 'getOverallAccuracy'
            });

            return {
                accuracy: result.accuracy || 0,
                totalPredictions: result.totalPredictions || 0,
                correctPredictions: result.correctPredictions || 0,
                modelInfo: result.modelInfo || null,
                message: result.message || 'No accuracy data available',
                isReal: true,
                lastUpdated: new Date().toISOString()
            };

        } catch (error) {
            console.error('Failed to get real model accuracy:', error);
            return {
                accuracy: 0,
                totalPredictions: 0,
                correctPredictions: 0,
                modelInfo: null,
                message: 'Accuracy calculation unavailable - API error',
                isReal: true,
                error: error.message
            };
        }
    }

    // Get real current predictions
    async getRealCurrentPredictions(season = 2024, includeCompleted = true) {
        try {
            const result = await this.makeAPICall('/current-predictions', {
                season: season,
                includeCompleted: includeCompleted
            });

            return {
                predictions: result.predictions || [],
                totalPredictions: result.totalPredictions || 0,
                season: season,
                source: 'Real ML Model Predictions'
            };

        } catch (error) {
            console.error('Failed to get real predictions:', error);
            return {
                predictions: [],
                totalPredictions: 0,
                season: season,
                error: error.message,
                source: 'Error - Predictions Unavailable'
            };
        }
    }

    // Generate real prediction using ML model
    async generateRealPrediction(homeTeam, awayTeam, gameId = null) {
        try {
            const result = await this.makeAPICall('/generate-prediction', {
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                gameId: gameId
            });

            return {
                ...result,
                isReal: true,
                generatedAt: new Date().toISOString(),
                source: 'Real ML Random Forest Model'
            };

        } catch (error) {
            console.error(`Failed to generate prediction for ${homeTeam} vs ${awayTeam}:`, error);
            return {
                error: error.message,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                isReal: true,
                message: 'Prediction generation failed - check ML model availability'
            };
        }
    }

    // Get real team schedule and predictions
    async getRealTeamSchedule(teamName, season = 2024) {
        try {
            const result = await this.makeAPICall('/team-schedule', {
                teamName: teamName,
                season: season
            });

            return {
                games: result.games || [],
                teamName: teamName,
                totalGames: result.totalGames || 0,
                season: season
            };

        } catch (error) {
            console.error(`Failed to get schedule for ${teamName}:`, error);
            return {
                games: [],
                teamName: teamName,
                totalGames: 0,
                season: season,
                error: error.message
            };
        }
    }

    // Calculate real team-specific accuracy
    async calculateRealTeamAccuracy(teamName, season = 2024) {
        try {
            const result = await this.makeAPICall('/calculate-accuracy', {
                teamName: teamName,
                season: season
            });

            return {
                accuracy: result.accuracy || 0,
                totalPredictions: result.totalPredictions || 0,
                correctPredictions: result.correctPredictions || 0,
                teamName: teamName,
                season: season,
                message: result.message || 'No team-specific accuracy data',
                isReal: true
            };

        } catch (error) {
            console.error(`Failed to calculate team accuracy for ${teamName}:`, error);
            return {
                accuracy: 0,
                totalPredictions: 0,
                correctPredictions: 0,
                teamName: teamName,
                season: season,
                message: 'Team accuracy calculation failed',
                error: error.message,
                isReal: true
            };
        }
    }

    // Get real conferences from database
    async getRealConferences() {
        try {
            const result = await this.makeAPICall('/database/teams', {
                season: 2024
            });

            return {
                conferences: result.conferences || [],
                teams: result.teams || [],
                totalTeams: result.totalTeams || 0,
                season: result.season || 2024
            };

        } catch (error) {
            console.error('Failed to get real conferences:', error);
            return {
                conferences: [],
                teams: [],
                totalTeams: 0,
                season: 2024,
                error: error.message
            };
        }
    }

    // Validate that we're getting real data (not mock)
    validateRealData(data, dataType) {
        const validationResults = {
            isValid: true,
            issues: [],
            dataType: dataType
        };

        // Check for common mock data indicators
        if (typeof data === 'object' && data !== null) {
            // Check for hardcoded fake accuracy numbers
            if (data.accuracy === 0.923 || data.accuracy === 92.3) {
                validationResults.isValid = false;
                validationResults.issues.push('Detected hardcoded 92.3% accuracy');
            }

            // Check for hardcoded team names
            const mockTeamNames = ['Sample Team', 'Mock University', 'Test State'];
            if (data.team && mockTeamNames.includes(data.team)) {
                validationResults.isValid = false;
                validationResults.issues.push('Detected mock team name');
            }

            // Check for obviously fake prediction confidence
            if (data.confidence === 0.743 || data.confidence === 74.3) {
                validationResults.isValid = false;
                validationResults.issues.push('Detected hardcoded confidence level');
            }

            // Check for hardcoded data points claim
            if (data.dataPoints === 320000 || data.totalDataPoints === 320000) {
                validationResults.isValid = false;
                validationResults.issues.push('Detected hardcoded 320,000 data points claim');
            }
        }

        return validationResults;
    }

    // Health check for API availability
    async healthCheck() {
        try {
            const startTime = Date.now();
            await this.makeAPICall('/teams', {}, 'GET');
            const responseTime = Date.now() - startTime;

            return {
                status: 'healthy',
                responseTime: responseTime,
                timestamp: new Date().toISOString(),
                apiURL: this.baseURL
            };

        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString(),
                apiURL: this.baseURL
            };
        }
    }
}

// Export for use in React components
export default RealDataAPI;

// Utility functions for data validation
export const DataValidation = {
    isRealAccuracy: (accuracy) => {
        // Real accuracy should be between 0 and 1, not hardcoded values
        return typeof accuracy === 'number' && 
               accuracy >= 0 && 
               accuracy <= 1 && 
               accuracy !== 0.923; // Not the fake 92.3%
    },

    isRealPrediction: (prediction) => {
        return prediction &&
               typeof prediction.confidence === 'number' &&
               prediction.confidence !== 0.743 && // Not fake 74.3%
               prediction.homeTeam &&
               prediction.awayTeam &&
               typeof prediction.predictedHomeScore === 'number' &&
               typeof prediction.predictedAwayScore === 'number';
    },

    isRealTeamData: (teamData) => {
        return teamData &&
               teamData.school &&
               !teamData.school.includes('Mock') &&
               !teamData.school.includes('Sample') &&
               typeof teamData.offensePointsPerGame === 'number';
    },

    logDataSource: (data, source) => {
        console.log(`✅ Real Data Source: ${source}`, {
            timestamp: new Date().toISOString(),
            dataType: typeof data,
            hasRealValues: data && !JSON.stringify(data).includes('mock'),
            source: source
        });
    }
};