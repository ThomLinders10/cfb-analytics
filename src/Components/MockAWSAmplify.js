// Enhanced Mock AWS Amplify with Real Data Structure
// File: src/MockAWSAmplify.js
// This simulates your real 320K+ database with actual CFB data

// Mock AWS Amplify configuration
export const configure = (config) => {
  console.log('Mock Amplify configured:', config);
};

// Enhanced Mock API module with real CFB data structure
export const API = {
  graphql: async (operation) => {
    console.log('Mock GraphQL operation:', operation);
    
    // Simulate real game data from your database
    if (operation.query?.includes('GetGame')) {
      const gameId = operation.variables?.id || '1';
      return {
        data: {
          getGame: {
            id: gameId,
            date: '2025-08-30T19:00:00.000Z',
            location: 'Bryant-Denny Stadium, Tuscaloosa, AL',
            network: 'ESPN',
            kickoffTime: '7:00 PM ET',
            homeTeam: {
              id: 'alabama',
              name: 'Alabama',
              mascot: 'Crimson Tide',
              logoUrl: 'https://logos.cfbanalytics.com/alabama.png',
              conference: 'SEC',
              teamColors: '#9E1B32'
            },
            awayTeam: {
              id: 'georgia',
              name: 'Georgia',
              mascot: 'Bulldogs',
              logoUrl: 'https://logos.cfbanalytics.com/georgia.png',
              conference: 'SEC', 
              teamColors: '#BA0C2F'
            },
            prediction: {
              id: 'pred_1',
              predictedHomeScore: 31,
              predictedAwayScore: 24,
              confidence: 0.923, // Your 92.3% accuracy
              expectedBoxScore: {
                homeRushingYards: 189,
                awayRushingYards: 143,
                homePassingYards: 267,
                awayPassingYards: 298,
                homeTurnovers: 1,
                awayTurnovers: 2
              }
            },
            result: null // Game hasn't been played yet
          }
        }
      };
    }
    
    // Mock team data
    if (operation.query?.includes('GetTeam')) {
      return {
        data: {
          getTeam: {
            id: operation.variables?.id || 'alabama',
            name: 'Alabama',
            mascot: 'Crimson Tide',
            conference: 'SEC',
            logoUrl: 'https://logos.cfbanalytics.com/alabama.png',
            teamColors: '#9E1B32',
            players: {
              items: [
                { id: '1', name: 'Jalen Milroe', position: 'QB', height: '6-2', weight: '220', year: 'Junior' },
                { id: '2', name: 'Justice Haynes', position: 'RB', height: '5-10', weight: '195', year: 'Sophomore' },
                { id: '3', name: 'Ryan Williams', position: 'WR', height: '6-0', weight: '178', year: 'Freshman' },
                { id: '4', name: 'Jihaad Campbell', position: 'LB', height: '6-3', weight: '235', year: 'Senior' },
                { id: '5', name: 'Malachi Moore', position: 'DB', height: '5-11', weight: '190', year: 'Senior' }
              ]
            }
          }
        }
      };
    }

    // Mock conference data with all teams
    if (operation.query?.includes('listTeams')) {
      return {
        data: {
          listTeams: {
            items: [
              // SEC Teams
              { id: 'alabama', name: 'Alabama', conference: 'SEC', wins: 12, losses: 1, accuracy: 94.2 },
              { id: 'georgia', name: 'Georgia', conference: 'SEC', wins: 11, losses: 2, accuracy: 91.8 },
              { id: 'lsu', name: 'LSU', conference: 'SEC', wins: 9, losses: 4, accuracy: 89.1 },
              { id: 'tennessee', name: 'Tennessee', conference: 'SEC', wins: 8, losses: 4, accuracy: 87.5 },
              { id: 'texas', name: 'Texas', conference: 'SEC', wins: 10, losses: 3, accuracy: 88.9 },
              { id: 'oklahoma', name: 'Oklahoma', conference: 'SEC', wins: 7, losses: 5, accuracy: 85.2 },
              
              // Big Ten Teams  
              { id: 'ohio-state', name: 'Ohio State', conference: 'Big Ten', wins: 11, losses: 2, accuracy: 92.1 },
              { id: 'michigan', name: 'Michigan', conference: 'Big Ten', wins: 9, losses: 4, accuracy: 88.7 },
              { id: 'penn-state', name: 'Penn State', conference: 'Big Ten', wins: 10, losses: 3, accuracy: 89.3 },
              { id: 'oregon', name: 'Oregon', conference: 'Big Ten', wins: 11, losses: 2, accuracy: 90.8 },
              
              // Group of Five Examples
              { id: 'northern-arizona', name: 'Northern Arizona', conference: 'Big Sky', wins: 6, losses: 6, accuracy: 78.4 },
              { id: 'weber-state', name: 'Weber State', conference: 'Big Sky', wins: 8, losses: 4, accuracy: 82.1 },
              { id: 'boise-state', name: 'Boise State', conference: 'Mountain West', wins: 9, losses: 4, accuracy: 86.3 },
              
              // Add more teams as needed...
            ]
          }
        }
      };
    }

    // Mock games list with betting lines
    if (operation.query?.includes('listGames')) {
      return {
        data: {
          listGames: {
            items: [
              {
                id: '1',
                homeTeam: 'Alabama',
                awayTeam: 'Georgia', 
                week: 14,
                prediction: 'Alabama by 7.5',
                confidence: 92.3,
                factors: ['Home field advantage', 'Rushing attack superiority', 'Defensive line depth'],
                bettingLine: 'Alabama -6.5',
                ourPrediction: 'Alabama -7.5',
                edge: '+1.0 Alabama'
              },
              {
                id: '2',
                homeTeam: 'Arizona State',
                awayTeam: 'Northern Arizona',
                week: 1,
                prediction: 'Arizona State by 42.5',
                confidence: 95.1,
                factors: ['Talent gap', 'FBS vs FCS advantage', 'Home field', 'Recruiting disparity'],
                bettingLine: 'ASU -38.5',
                ourPrediction: 'ASU -42.5',
                edge: '+4.0 ASU'
              },
              {
                id: '3', 
                homeTeam: 'BYU',
                awayTeam: 'Portland State',
                week: 1,
                prediction: 'BYU by 34.5',
                confidence: 93.8,
                factors: ['Experience gap', 'Altitude advantage', 'Offensive scheme'],
                bettingLine: 'BYU -31.5',
                ourPrediction: 'BYU -34.5', 
                edge: '+3.0 BYU'
              }
            ]
          }
        }
      };
    }
    
    return { data: {} };
  },
  
  get: async (apiName, path, config) => {
    console.log('Mock API GET:', apiName, path);
    
    // Mock weather data
    if (path.includes('/game-weather')) {
      return {
        temperature: 78,
        condition: 'Partly Cloudy',
        windSpeed: 8,
        humidity: 65,
        precipitation: 10,
        passingImpact: -5, // Slight negative impact on passing
        rushingImpact: 2,  // Slight positive impact on rushing
        scoringImpact: -2, // Slight decrease in scoring
        summary: 'Ideal football weather with mild wind. Slight advantage to ground game.'
      };
    }
    
    // Mock team endpoints
    if (path.includes('/teams')) {
      return {
        teams: [
          { id: 'alabama', name: 'Alabama', conference: 'SEC', record: '12-1', predictedRecord: '11-2' },
          { id: 'georgia', name: 'Georgia', conference: 'SEC', record: '11-2', predictedRecord: '10-3' },
          { id: 'northern-arizona', name: 'Northern Arizona', conference: 'Big Sky', record: '6-6', predictedRecord: '5-7' }
        ]
      };
    }
    
    // Mock video analysis
    if (path.includes('/game-analysis-video')) {
      // Simulate video generation delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      return {
        videoUrl: 'https://mock-video-analysis.com/alabama-vs-georgia.mp4'
      };
    }
    
    return {};
  },
  
  post: async (apiName, path, config) => {
    console.log('Mock API POST:', apiName, path, config);
    
    // Mock AI analysis
    if (path.includes('/game-analysis')) {
      return {
        analysis: {
          keyMatchups: 'Alabama\'s rushing attack vs Georgia\'s run defense will be decisive. The Tide average 187 yards per game on the ground, while UGA allows just 98 per game.',
          xFactors: 'Weather conditions favor the running game. Both teams have elite defenses, so turnovers will be crucial. Alabama\'s home field advantage worth approximately 3.2 points.',
          reasoning: 'Our 54-factor model gives Alabama a 92.3% probability of victory based on opponent-specific analysis. Key factors include home field (+3.2), rushing advantage (+2.1), and defensive depth (+1.8).',
          upsetPotential: 'Low upset potential (7.7%). Georgia would need to force 3+ turnovers or control time of possession by 8+ minutes to overcome the talent and venue disadvantage.'
        }
      };
    }
    
    // Mock subscription creation
    if (path.includes('/create-subscription')) {
      return {
        client_secret: 'pi_mock_client_secret_12345',
        subscription_id: 'sub_mock_subscription_67890'
      };
    }
    
    // Mock trivia score submission
    if (path.includes('/submit-score')) {
      return {
        success: true,
        newRank: 23,
        pointsEarned: config.body.score
      };
    }
    
    return { success: true, data: config.body };
  }
};

// Mock Auth module  
export const Auth = {
  currentAuthenticatedUser: async () => {
    return {
      username: 'cfb_fan_2024',
      attributes: {
        email: 'fan@cfbanalytics.com',
        favorite_team: 'Alabama',
        subscription: 'premium'
      }
    };
  },
  
  signIn: async (username, password) => {
    return {
      username,
      attributes: { email: username }
    };
  },
  
  signUp: async (username, password, attributes) => {
    return {
      user: { username },
      userConfirmed: true,
      userSub: 'mock-user-id-12345'
    };
  },
  
  signOut: async () => {
    return 'SUCCESS';
  }
};

// Mock GraphQL operations
export const graphqlOperation = (query, variables) => {
  return { query, variables };
};

// Default export
const Amplify = {
  configure,
  API,
  Auth,
  graphqlOperation
};

export default Amplify;