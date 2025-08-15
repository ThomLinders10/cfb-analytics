// Mock AWS Amplify for Development - Replace with real AWS when ready

// Mock Authentication
const Auth = {
  signUp: async (userData) => {
    console.log('Mock signup:', userData);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      user: {
        username: userData.email,
        email: userData.email,
        name: userData.name,
        favoriteTeam: userData.favoriteTeam,
        subscription: 'trial'
      }
    };
  },

  signIn: async (email, password) => {
    console.log('Mock signin:', email);
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      username: email,
      email: email,
      subscription: 'premium'
    };
  },

  getCurrentUser: async () => {
    // Mock returning no user initially
    throw new Error('No current user');
  },

  signOut: async () => {
    console.log('Mock signout');
    return true;
  }
};

// Mock API
const API = {
  get: async (apiName, path, options) => {
    console.log('Mock API GET:', apiName, path);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data based on path
    if (path.includes('/teams')) {
      return mockTeamData;
    } else if (path.includes('/games')) {
      return mockGameData;
    } else if (path.includes('/predictions')) {
      return mockPredictionData;
    }
    
    return { message: 'Mock API response' };
  },

  post: async (apiName, path, options) => {
    console.log('Mock API POST:', apiName, path, options);
    await new Promise(resolve => setTimeout(resolve, 700));
    return { success: true, data: options.body };
  }
};

// Mock team data
const mockTeamData = {
  'alabama': {
    name: 'Alabama Crimson Tide',
    conference: 'SEC',
    record: '11-2',
    ranking: 4,
    nextGame: {
      opponent: 'Georgia',
      date: '2025-01-20',
      location: 'Atlanta, GA',
      prediction: {
        winProbability: 73.2,
        pointSpread: -6.5,
        confidence: 'High'
      }
    },
    recentGames: [
      { opponent: 'Auburn', result: 'W 42-13', date: '2024-11-30' },
      { opponent: 'LSU', result: 'W 35-17', date: '2024-11-09' }
    ]
  },
  'arizona': {
    name: 'Arizona Wildcats',
    conference: 'Big 12',
    record: '8-5',
    ranking: 23,
    nextGame: {
      opponent: 'Colorado',
      date: '2025-01-18',
      location: 'Tucson, AZ',
      prediction: {
        winProbability: 68.7,
        pointSpread: -3.5,
        confidence: 'Medium'
      }
    },
    recentGames: [
      { opponent: 'ASU', result: 'L 28-35', date: '2024-11-30' },
      { opponent: 'TCU', result: 'W 31-21', date: '2024-11-23' }
    ]
  }
};

// Mock game data
const mockGameData = [
  {
    id: 'game_001',
    homeTeam: 'Alabama',
    awayTeam: 'Georgia',
    date: '2025-01-20',
    time: '4:00 PM ET',
    venue: 'Mercedes-Benz Stadium',
    city: 'Atlanta, GA',
    prediction: {
      winner: 'Alabama',
      winProbability: 73.2,
      pointSpread: -6.5,
      totalPoints: 52.5,
      confidence: 'High',
      factors: [
        'Alabama\'s rushing attack vs Georgia\'s run defense',
        'Weather conditions favor Alabama',
        'Historical performance in neutral site games'
      ]
    },
    weather: {
      condition: 'Clear',
      temperature: 45,
      windSpeed: 8
    }
  }
];

// Mock prediction data
const mockPredictionData = {
  accuracy: 92.3,
  totalPredictions: 10484,
  correctPredictions: 9681,
  thisWeekGames: 15,
  confidence: {
    high: 8,
    medium: 5,
    low: 2
  }
};

// Mock GraphQL operations
const graphqlOperation = (query, variables) => {
  console.log('Mock GraphQL operation:', query, variables);
  return { query, variables };
};

// Configuration mock
const configure = (config) => {
  console.log('Mock Amplify configure:', config);
  return true;
};

// Export all components
const MockAWSAmplify = {
  Auth,
  API,
  configure,
  graphqlOperation
};

// Named exports for compatibility
export { Auth, API, configure, graphqlOperation };

// Default export
export default MockAWSAmplify;