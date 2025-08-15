import React, { useState, useEffect } from 'react';
import './TriviaGame.css';

const TriviaGame = ({ user }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [category, setCategory] = useState('general');
  const [sessionTime, setSessionTime] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [error, setError] = useState(null);

  // OpenAI API configuration
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  // Timer for session tracking
  useEffect(() => {
    let interval;
    if (gameActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameActive]);

  // Generate trivia question using OpenAI
  const generateQuestion = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const difficultyPrompt = {
        easy: "beginner-friendly",
        medium: "intermediate level",
        hard: "expert level"
      };

      const categoryPrompt = {
        general: "college football and basketball",
        football: "college football",
        basketball: "college basketball", 
        history: "college sports history",
        records: "college sports records and statistics",
        current: "current college sports (2024-2025 season)"
      };

      const prompt = `Generate a ${difficultyPrompt[difficulty]} multiple choice trivia question about ${categoryPrompt[category]}. 

Requirements:
- One question with exactly 4 multiple choice answers (A, B, C, D)
- Only ONE correct answer
- Make it engaging and educational
- Include recent players, teams, coaches, or events when possible
- Avoid questions that could become outdated quickly

Format your response as JSON:
{
  "question": "The actual question text",
  "answers": {
    "A": "First option",
    "B": "Second option", 
    "C": "Third option",
    "D": "Fourth option"
  },
  "correct": "A",
  "explanation": "Brief explanation of why the answer is correct",
  "difficulty": "${difficulty}",
  "category": "${categoryPrompt[category]}"
}`;

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a college sports trivia expert. Generate engaging, accurate trivia questions about college football and basketball. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const questionData = JSON.parse(data.choices[0].message.content);
      
      setCurrentQuestion(questionData);
      setGameActive(true);
      
    } catch (err) {
      console.error('Error generating question:', err);
      setError('Unable to generate question. Please check your OpenAI API connection.');
      
      // Fallback to let user know system needs API key
      setCurrentQuestion({
        question: "OpenAI API connection needed to generate endless trivia questions.",
        answers: {
          A: "Add REACT_APP_OPENAI_API_KEY to environment",
          B: "This will enable unlimited questions", 
          C: "Questions will be fresh and current",
          D: "All of the above"
        },
        correct: "D",
        explanation: "Once connected to OpenAI, this trivia system will generate unlimited, fresh college sports questions.",
        difficulty: "info",
        category: "system"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerKey) => {
    if (showResult) return;
    setSelectedAnswer(answerKey);
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    
    if (selectedAnswer === currentQuestion.correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    generateQuestion();
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTotalQuestions(0);
    setSessionTime(0);
    setGameActive(true);
    generateQuestion();
  };

  const endSession = () => {
    setGameActive(false);
    // Here you could save the session stats to your database
    saveSessionStats();
  };

  const saveSessionStats = async () => {
    if (!user) return;
    
    const sessionData = {
      userId: user.id,
      score: score,
      totalQuestions: totalQuestions,
      sessionTime: sessionTime,
      accuracy: totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0,
      maxStreak: streak,
      difficulty: difficulty,
      category: category,
      timestamp: new Date().toISOString()
    };

    try {
      // Save to your real database
      await fetch('/api/trivia/save-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(sessionData)
      });
    } catch (err) {
      console.error('Error saving session:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracy = () => {
    return totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0;
  };

  return (
    <div className="trivia-game">
      {/* Game Header */}
      <div className="trivia-header">
        <h1>🏆 College Sports Trivia Challenge</h1>
        <p>Test your knowledge with unlimited AI-generated questions</p>
        
        {/* Game Stats */}
        {gameActive && (
          <div className="game-stats">
            <div className="stat">
              <span className="value">{score}</span>
              <span className="label">Correct</span>
            </div>
            <div className="stat">
              <span className="value">{totalQuestions}</span>
              <span className="label">Total</span>
            </div>
            <div className="stat">
              <span className="value">{getAccuracy()}%</span>
              <span className="label">Accuracy</span>
            </div>
            <div className="stat">
              <span className="value">{streak}</span>
              <span className="label">Streak</span>
            </div>
            <div className="stat">
              <span className="value">{formatTime(sessionTime)}</span>
              <span className="label">Time</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Controls */}
      {!gameActive ? (
        <div className="game-setup">
          <h2>🎮 Start Your Trivia Session</h2>
          
          <div className="setup-options">
            <div className="option-group">
              <label>Difficulty:</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy - Beginner Level</option>
                <option value="medium">Medium - Intermediate</option>
                <option value="hard">Hard - Expert Level</option>
              </select>
            </div>
            
            <div className="option-group">
              <label>Category:</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="general">General - Football & Basketball</option>
                <option value="football">College Football Only</option>
                <option value="basketball">College Basketball Only</option>
                <option value="history">College Sports History</option>
                <option value="records">Records & Statistics</option>
                <option value="current">Current Season (2024-25)</option>
              </select>
            </div>
          </div>

          <button className="start-game-btn" onClick={startGame}>
            🚀 Start Unlimited Trivia
          </button>
          
          <div className="feature-highlights">
            <h3>🌟 Unlimited Features</h3>
            <ul>
              <li>✅ Endless AI-generated questions</li>
              <li>✅ Fresh content every time</li>
              <li>✅ Multiple difficulty levels</li>
              <li>✅ Track your streaks and accuracy</li>
              <li>✅ Play for hours - build the habit!</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Question Section */}
          {loading ? (
            <div className="loading-question">
              <div className="loading-spinner"></div>
              <p>Generating your next question...</p>
              <p className="loading-detail">Creating fresh college sports trivia with AI</p>
            </div>
          ) : currentQuestion ? (
            <div className="question-section">
              <div className="question-header">
                <span className="question-number">Question #{totalQuestions + 1}</span>
                <span className="question-category">{currentQuestion.category}</span>
                <span className="question-difficulty">{currentQuestion.difficulty}</span>
              </div>
              
              <h2 className="question-text">{currentQuestion.question}</h2>
              
              <div className="answers-grid">
                {Object.entries(currentQuestion.answers).map(([key, answer]) => (
                  <button
                    key={key}
                    className={`answer-btn ${selectedAnswer === key ? 'selected' : ''} ${
                      showResult ? (key === currentQuestion.correct ? 'correct' : selectedAnswer === key ? 'incorrect' : '') : ''
                    }`}
                    onClick={() => handleAnswerSelect(key)}
                    disabled={showResult}
                  >
                    <span className="answer-key">{key}</span>
                    <span className="answer-text">{answer}</span>
                  </button>
                ))}
              </div>
              
              {!showResult && selectedAnswer ? (
                <button className="submit-btn" onClick={submitAnswer}>
                  Submit Answer
                </button>
              ) : showResult ? (
                <div className="result-section">
                  <div className={`result-message ${selectedAnswer === currentQuestion.correct ? 'correct' : 'incorrect'}`}>
                    {selectedAnswer === currentQuestion.correct ? (
                      <>
                        <span className="result-icon">🎉</span>
                        <span>Correct! Great job!</span>
                      </>
                    ) : (
                      <>
                        <span className="result-icon">📚</span>
                        <span>Good try! Learn something new!</span>
                      </>
                    )}
                  </div>
                  
                  <div className="explanation">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </div>
                  
                  <div className="next-controls">
                    <button className="next-btn" onClick={nextQuestion}>
                      Next Question →
                    </button>
                    <button className="end-session-btn" onClick={endSession}>
                      End Session
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {error && (
            <div className="error-section">
              <h3>⚠️ API Connection Needed</h3>
              <p>{error}</p>
              <div className="setup-instructions">
                <h4>To Enable Unlimited Trivia:</h4>
                <ol>
                  <li>Add OpenAI API key to environment variables</li>
                  <li>Set REACT_APP_OPENAI_API_KEY in your .env file</li>
                  <li>Restart the application</li>
                </ol>
                <p>Once connected, users can play endless, fresh trivia questions!</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Session Summary */}
      {!gameActive && totalQuestions > 0 && (
        <div className="session-summary">
          <h3>📊 Session Complete!</h3>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="value">{score} / {totalQuestions}</span>
              <span className="label">Correct Answers</span>
            </div>
            <div className="summary-stat">
              <span className="value">{getAccuracy()}%</span>
              <span className="label">Accuracy</span>
            </div>
            <div className="summary-stat">
              <span className="value">{formatTime(sessionTime)}</span>
              <span className="label">Time Played</span>
            </div>
          </div>
          <button className="play-again-btn" onClick={startGame}>
            🔄 Play Another Session
          </button>
        </div>
      )}
    </div>
  );
};

export default TriviaGame;