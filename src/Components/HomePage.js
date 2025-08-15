import React, { useState, useEffect } from 'react';
import { BroadcastBooth } from './VideoSystem/VideoComponents';
import RealDataAPI from '../utils/realDataIntegration';

const HomePage = () => {
  const [realAccuracy, setRealAccuracy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealAccuracy();
  }, []);

  const loadRealAccuracy = async () => {
    try {
      const api = new RealDataAPI();
      const accuracy = await api.getRealModelAccuracy();
      setRealAccuracy(accuracy);
    } catch (error) {
      console.error('Error loading accuracy:', error);
      setRealAccuracy({
        accuracy: 0,
        message: 'Accuracy tracking begins with first game results'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage">
      <div className="homepage-grid">
        {/* Left Panel - Stats */}
        <div className="left-panel">
          <div className="stats-container">
            <h1>Welcome to College Sports Predictions</h1>
            <p className="tagline">AI-powered predictions with real-time accuracy</p>
            
            <div className="accuracy-display">
              <div className="accuracy-circle">
                <span className="accuracy-number">
                  {loading ? '--' : (realAccuracy?.accuracy * 100)?.toFixed(1) || '0.0'}%
                </span>
                <span className="accuracy-label">Current Accuracy</span>
              </div>
              <div className="accuracy-details">
                {realAccuracy?.message || 'Loading accuracy data...'}
              </div>
            </div>

            <div className="features-grid">
              <div className="feature">
                <h3>🎯 Real Predictions</h3>
                <p>Machine learning models trained on 25,000+ game records</p>
              </div>
              <div className="feature">
                <h3>📊 Live Accuracy</h3>
                <p>Honest tracking of prediction performance vs actual results</p>
              </div>
              <div className="feature">
                <h3>🏈 College Football</h3>
                <p>Comprehensive coverage of all major conferences and teams</p>
              </div>
              <div className="feature">
                <h3>🤖 AI Powered</h3>
                <p>Advanced analytics and statistical modeling for better predictions</p>
              </div>
            </div>

            <div className="cta-section">
              <h2>Ready to Get Started?</h2>
              <p>Join thousands of users getting better predictions than ESPN, CBS, and Vegas</p>
              <div className="cta-buttons">
                <button className="btn-primary">Start Free Trial</button>
                <button className="btn-secondary">View Predictions</button>
              </div>
              <p className="trial-details">30-day free trial • No credit card required • Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Broadcast Booth */}
        <div className="right-panel">
          <div className="broadcast-container">
            <BroadcastBooth />
          </div>
        </div>
      </div>

      {/* Bottom Section - Why Choose Us */}
      <div className="why-choose-section">
        <div className="container">
          <h2>Why Choose College Sports Predictions?</h2>
          <div className="reasons-grid">
            <div className="reason">
              <div className="reason-icon">🎯</div>
              <h3>Data-Driven Accuracy</h3>
              <p>Our models analyze 50+ statistical parameters across multiple seasons to generate honest, trackable predictions.</p>
            </div>
            <div className="reason">
              <div className="reason-icon">🏆</div>
              <h3>Proven Performance</h3>
              <p>Track record of beating major sports networks and betting sites with transparent accuracy reporting.</p>
            </div>
            <div className="reason">
              <div className="reason-icon">🔬</div>
              <h3>Advanced Analytics</h3>
              <p>Random Forest ensemble models trained on comprehensive team performance data and opponent matchups.</p>
            </div>
            <div className="reason">
              <div className="reason-icon">📈</div>
              <h3>Continuous Improvement</h3>
              <p>Our models learn from each game result, constantly improving prediction accuracy throughout the season.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bottom-cta">
        <div className="container">
          <h2>Ready to Make Better Predictions?</h2>
          <p>Join the community of users who trust data over hype</p>
          <button className="btn-primary large">Start Your Free Trial Today</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;