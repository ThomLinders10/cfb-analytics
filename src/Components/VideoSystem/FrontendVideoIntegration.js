// Frontend integration for avatar videos in React components

// Updated BroadcastBooth component with real video integration
import React, { useState, useEffect } from 'react';

const BroadcastBooth = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHomepageVideo();
  }, []);

  const loadHomepageVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load existing video first
      const videoExists = await checkVideoExists('homepage/welcome-video.mp4');
      
      if (videoExists) {
        const cdnUrl = process.env.REACT_APP_VIDEO_CDN_URL;
        setVideoUrl(`${cdnUrl}/homepage/welcome-video.mp4`);
      } else {
        // Generate new video if none exists
        await generateHomepageVideo();
      }
    } catch (err) {
      console.error('Error loading homepage video:', err);
      setError('Unable to load video content');
    } finally {
      setLoading(false);
    }
  };

  const checkVideoExists = async (videoPath) => {
    try {
      const cdnUrl = process.env.REACT_APP_VIDEO_CDN_URL;
      const response = await fetch(`${cdnUrl}/${videoPath}`, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const generateHomepageVideo = async () => {
    try {
      const apiUrl = process.env.REACT_APP_VIDEO_API_URL;
      const response = await fetch(`${apiUrl}/generate/homepage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const result = await response.json();
      setVideoUrl(result.result.videoUrl);
    } catch (err) {
      console.error('Error generating video:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="broadcast-booth">
        <div className="booth-header">
          <h3 className="booth-title">🎬 CollegeSports Analysis</h3>
          <p className="booth-subtitle">Loading broadcast team...</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Preparing your personalized broadcast...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="broadcast-booth">
        <div className="booth-header">
          <h3 className="booth-title">🎬 CollegeSports Analysis</h3>
          <p className="booth-subtitle">Live from the CSP Studios</p>
        </div>
        <div className="error-container">
          <p>Unable to load broadcast content</p>
          <button onClick={loadHomepageVideo} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="broadcast-booth">
      <div className="booth-header">
        <h3 className="booth-title">🎬 CollegeSports Analysis</h3>
        <p className="booth-subtitle">Live from the CSP Studios</p>
      </div>
      
      {videoUrl ? (
        <div className="video-container">
          <video
            src={videoUrl}
            controls
            autoPlay
            muted
            className="booth-video"
            onError={() => setError('Video playback failed')}
          >
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <div className="fallback-content">
          <div className="avatars-container">
            <div className="avatar">
              <div className="avatar-circle">🧑‍💼</div>
              <div className="avatar-name">Bob</div>
              <div className="avatar-role">Lead Analyst</div>
            </div>
            <div className="avatar">
              <div className="avatar-circle">👨‍💻</div>
              <div className="avatar-name">Tony</div>
              <div className="avatar-role">Stats Expert</div>
            </div>
          </div>
          
          <div className="current-topic">
            <div className="topic-title">🏈 Welcome to CollegeSportsPredictions</div>
            <div className="topic-content">
              Using 320,000+ data points and 54 parameters to predict college football outcomes 
              with 92.3% accuracy. Click Predictions to see our track record or Conferences 
              to explore this week's games.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Updated TeamPage component with Rita videos
const TeamPage = ({ teamName }) => {
  const [teamVideo, setTeamVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextGame, setNextGame] = useState(null);

  useEffect(() => {
    if (teamName) {
      loadTeamVideo();
    }
  }, [teamName]);

  const loadTeamVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if video exists for this team
      const teamSlug = teamName.replace(/\s+/g, '-').toLowerCase();
      const videoPath = `teams/${teamSlug}/next-game.mp4`;
      const videoExists = await checkVideoExists(videoPath);
      
      if (videoExists) {
        const cdnUrl = process.env.REACT_APP_VIDEO_CDN_URL;
        setTeamVideo(`${cdnUrl}/${videoPath}`);
      } else {
        // Generate new video for this team
        await generateTeamVideo(teamName);
      }
    } catch (err) {
      console.error('Error loading team video:', err);
      setError('Unable to load team analysis');
    } finally {
      setLoading(false);
    }
  };

  const checkVideoExists = async (videoPath) => {
    try {
      const cdnUrl = process.env.REACT_APP_VIDEO_CDN_URL;
      const response = await fetch(`${cdnUrl}/${videoPath}`, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const generateTeamVideo = async (team) => {
    try {
      const apiUrl = process.env.REACT_APP_VIDEO_API_URL;
      const response = await fetch(`${apiUrl}/generate/team/${encodeURIComponent(team)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate team video');
      }

      const result = await response.json();
      setTeamVideo(result.result.videoUrl);
      setNextGame(result.result.nextGame);
    } catch (err) {
      console.error('Error generating team video:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="team-video-section">
        <div className="video-header">
          <h2>🎬 Field Report: {teamName}</h2>
          <p>Loading Rita's analysis...</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing upcoming matchup...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-video-section">
        <div className="video-header">
          <h2>🎬 Field Report: {teamName}</h2>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadTeamVideo} className="retry-btn">
            Reload Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="team-video-section">
      <div className="video-header">
        <h2>🎬 Field Report: {teamName}</h2>
        <p>Rita's live analysis from the field</p>
      </div>
      
      {teamVideo ? (
        <div className="team-video-container">
          <video
            src={teamVideo}
            controls
            autoPlay
            muted
            className="team-video"
            onError={() => setError('Video playback failed')}
          >
            Your browser does not support video playback.
          </video>
          
          {nextGame && (
            <div className="game-info">
              <h3>Next Matchup</h3>
              <p>{nextGame.homeTeam} vs {nextGame.awayTeam}</p>
              <p>{new Date(nextGame.date).toLocaleDateString()}</p>
              {nextGame.location && <p>📍 {nextGame.location}</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="fallback-team-content">
          <div className="rita-placeholder">
            <div className="avatar-circle rita">👩‍🎤</div>
            <div className="avatar-info">
              <h3>Rita</h3>
              <p>Field Reporter</p>
            </div>
          </div>
          
          <div className="team-analysis-text">
            <p>Hi I'm Rita down on the field for you today! We're preparing a detailed 
            analysis of {teamName}'s next matchup with our latest prediction data.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin component for manual video generation
const VideoAdminPanel = () => {
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');

  const generateAllVideos = async () => {
    try {
      setGenerating(true);
      setResults(null);

      const apiUrl = process.env.REACT_APP_VIDEO_API_URL;
      const response = await fetch(`${apiUrl}/generate/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      setResults(result);
    } catch (error) {
      console.error('Error generating videos:', error);
      setResults({ error: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const generateHomepageVideo = async () => {
    try {
      setGenerating(true);
      
      const apiUrl = process.env.REACT_APP_VIDEO_API_URL;
      const response = await fetch(`${apiUrl}/generate/homepage`, {
        method: 'POST'
      });

      const result = await response.json();
      setResults(result);
    } catch (error) {
      console.error('Error generating homepage video:', error);
      setResults({ error: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const generateTeamVideo = async () => {
    if (!selectedTeam) return;

    try {
      setGenerating(true);
      
      const apiUrl = process.env.REACT_APP_VIDEO_API_URL;
      const response = await fetch(`${apiUrl}/generate/team/${encodeURIComponent(selectedTeam)}`, {
        method: 'POST'
      });

      const result = await response.json();
      setResults(result);
    } catch (error) {
      console.error('Error generating team video:', error);
      setResults({ error: error.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="video-admin-panel">
      <h2>🎬 Video Generation Admin</h2>
      
      <div className="admin-controls">
        <div className="control-group">
          <h3>Homepage Video</h3>
          <button 
            onClick={generateHomepageVideo}
            disabled={generating}
            className="admin-btn"
          >
            {generating ? 'Generating...' : 'Generate Homepage Video'}
          </button>
        </div>

        <div className="control-group">
          <h3>Team Video</h3>
          <input
            type="text"
            placeholder="Enter team name"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="team-input"
          />
          <button 
            onClick={generateTeamVideo}
            disabled={generating || !selectedTeam}
            className="admin-btn"
          >
            {generating ? 'Generating...' : 'Generate Team Video'}
          </button>
        </div>

        <div className="control-group">
          <h3>Batch Generation</h3>
          <button 
            onClick={generateAllVideos}
            disabled={generating}
            className="admin-btn danger"
          >
            {generating ? 'Generating All Videos...' : 'Generate ALL Videos'}
          </button>
          <p className="warning">⚠️ This will generate videos for all teams (may take 30+ minutes)</p>
        </div>
      </div>

      {generating && (
        <div className="generation-status">
          <div className="loading-spinner"></div>
          <p>Video generation in progress... This may take several minutes.</p>
        </div>
      )}

      {results && (
        <div className="generation-results">
          <h3>Generation Results</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// CSS for video components
const videoStyles = `
.broadcast-booth {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  border: 1px solid rgba(34, 139, 34, 0.2);
  width: 100%;
  max-width: 500px;
  min-height: 450px;
}

.video-container {
  width: 100%;
  margin: 1rem 0;
}

.booth-video,
.team-video {
  width: 100%;
  border-radius: 10px;
  background: #000;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #228B22;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: #228B22;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #1e7a1e;
}

.team-video-section {
  margin: 2rem 0;
}

.video-header {
  text-align: center;
  margin-bottom: 1rem;
}

.game-info {
  background: rgba(34, 139, 34, 0.1);
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
}

.video-admin-panel {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 10px;
  margin: 2rem 0;
}

.admin-controls {
  display: grid;
  gap: 2rem;
}

.control-group {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.admin-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  margin: 0.5rem;
}

.admin-btn:hover {
  background: #0056b3;
}

.admin-btn.danger {
  background: #dc3545;
}

.admin-btn.danger:hover {
  background: #c82333;
}

.admin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.team-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.warning {
  color: #856404;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.generation-results {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  margin-top: 1rem;
}

.generation-results pre {
  white-space: pre-wrap;
  font-size: 0.8rem;
}
`;

export { BroadcastBooth, TeamPage, VideoAdminPanel, videoStyles };