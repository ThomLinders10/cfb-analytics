import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';

const TeamPage = () => {
  const { teamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [team, setTeam] = useState(location.state?.teamData || null);

  useEffect(() => {
    // Fetch complete team data if not passed via navigation
    if (!team || !team.details) {
      // Mock API call - replace with your endpoint
      const fetchTeamData = async () => {
        const mockTeam = {
          id: teamId,
          name: team?.name || 'Loading...',
          logo: team?.logo || '',
          record: team?.record || '0-0',
          conferenceRecord: '5-1',
          ranking: 5,
          recentGames: [
            { opponent: 'vs Auburn', score: '35-21', result: 'W' },
            { opponent: '@ LSU', score: '28-31', result: 'L' }
          ]
        };
        setTeam(mockTeam);
      };
      fetchTeamData();
    }
  }, [teamId, team]);

  return (
    <div className="team-page">
      <button onClick={() => navigate('/conferences')} className="back-button">
        ← Back to Conferences
      </button>
      
      {team && (
        <>
          <header className="team-header">
            <img src={team.logo} alt={team.name} className="team-logo-large" />
            <div>
              <h1>{team.name}</h1>
              {team.ranking && <p>Ranked #{team.ranking}</p>}
            </div>
          </header>
          
          <section className="team-stats">
            <div className="stat-card">
              <h3>Overall Record</h3>
              <p>{team.record}</p>
            </div>
            <div className="stat-card">
              <h3>Conference Record</h3>
              <p>{team.conferenceRecord}</p>
            </div>
          </section>
          
          {team.recentGames && (
            <section className="recent-games">
              <h3>Recent Games</h3>
              {team.recentGames.map((game, idx) => (
                <div key={idx} className={`game-card ${game.result}`}>
                  <span>{game.opponent}</span>
                  <span>{game.score}</span>
                  <span>{game.result}</span>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default TeamPage;