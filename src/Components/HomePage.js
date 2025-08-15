import React from 'react';
import { BroadcastBooth } from './VideoSystem/VideoComponents';

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="homepage-grid">
        <div className="left-panel">
          <h1>Welcome to College Sports Predictions</h1>
          <p>AI-powered predictions with real-time accuracy</p>
        </div>
        <div className="right-panel">
          <BroadcastBooth />
        </div>
      </div>
    </div>
  );
};

export default HomePage;