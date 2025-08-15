import React, { useState, useEffect } from 'react';

const BroadcastBooth = () => {
  const [selectedWeek, setSelectedWeek] = useState('Week 1');
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];

  return (
    <div className="broadcast-booth">
      <div className="booth-header">
        <h3 className="booth-title">🎬 CollegeSports Analysis</h3>
        <p className="booth-subtitle">Live from the CSP Studios</p>
      </div>
      
      <div className="avatars-container">
        <div className="avatar">
          <div className="avatar-circle">👨‍💼</div>
          <div className="avatar-name">Bob</div>
          <div className="avatar-role">Lead Analyst</div>
        </div>
        <div className="avatar">
          <div className="avatar-circle">📊</div>
          <div className="avatar-name">Tony</div>
          <div className="avatar-role">Stats Expert</div>
        </div>
        <div className="avatar">
          <div className="avatar-circle">🎯</div>
          <div className="avatar-name">Rita</div>
          <div className="avatar-role">Predictions Specialist</div>
        </div>
      </div>
      
      <div className="current-topic">
        <div className="topic-title">📊 This Week's Focus</div>
        <div className="topic-content">
          "Our machine learning models are analyzing thousands of data points from 
          college football teams across all major conferences. We're tracking 
          offensive efficiency, defensive capabilities, and coaching performance 
          to generate the most accurate predictions possible."
        </div>
      </div>
      
      <div className="booth-controls">
        {weeks.map(week => (
          <button
            key={week}
            className={`week-btn ${selectedWeek === week ? 'active' : ''}`}
            onClick={() => setSelectedWeek(week)}
          >
            {week}
          </button>
        ))}
      </div>
      
      <div className="analysis-summary">
        <h4>📈 Key Insights for {selectedWeek}</h4>
        <ul>
          <li>🎯 Random Forest models processing 50+ statistical parameters</li>
          <li>📊 Tracking team performance across multiple seasons</li>
          <li>🏆 Honest accuracy reporting - no inflated statistics</li>
          <li>🔬 Continuous model improvement with each game result</li>
        </ul>
      </div>
      
      <div className="broadcast-footer">
        <p>🎬 Avatar videos coming soon - Enhanced with AI-powered analysis</p>
      </div>
    </div>
  );
};

const TeamPage = () => {
  return (
    <div>
      <h2>Team Page Component</h2>
      <p>Team analysis coming soon</p>
    </div>
  );
};

const VideoAdminPanel = () => {
  return (
    <div>
      <h2>Video Admin Panel</h2>
      <p>Video management coming soon</p>
    </div>
  );
};

const videoStyles = `
.broadcast-booth {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  max-width: 400px;
  margin: 0 auto;
}

.booth-header {
  text-align: center;
  margin-bottom: 20px;
}

.booth-title {
  color: #00ff88;
  margin-bottom: 5px;
  font-size: 1.4rem;
}

.booth-subtitle {
  color: #888;
  font-size: 0.9rem;
}

.avatars-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.avatar {
  text-align: center;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(45deg, #00ff88, #0066cc);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  font-size: 1.5rem;
}

.avatar-name {
  font-weight: bold;
  font-size: 0.9rem;
}

.avatar-role {
  font-size: 0.7rem;
  color: #aaa;
}

.current-topic {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.topic-title {
  color: #00ff88;
  font-weight: bold;
  margin-bottom: 8px;
}

.topic-content {
  font-size: 0.85rem;
  line-height: 1.4;
  color: #ddd;
}

.booth-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.week-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.week-btn:hover {
  background: rgba(0, 255, 136, 0.2);
}

.week-btn.active {
  background: #00ff88;
  color: black;
}

.analysis-summary {
  background: rgba(0, 255, 136, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.analysis-summary h4 {
  color: #00ff88;
  margin-bottom: 12px;
  font-size: 1rem;
}

.analysis-summary ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.analysis-summary li {
  padding: 4px 0;
  font-size: 0.85rem;
  color: #ddd;
}

.broadcast-footer {
  text-align: center;
  font-size: 0.8rem;
  color: #888;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
}
`;

export { BroadcastBooth, TeamPage, VideoAdminPanel, videoStyles };