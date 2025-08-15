import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ConferencePage = () => {
  const [teams, setTeams] = useState([]);
  const [conferences, setConferences] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data - replace with your API
    const mockConferences = [
      { id: 1, name: 'SEC' },
      { id: 2, name: 'Big Ten' },
      { id: 3, name: 'ACC' }
    ];
    
    const mockTeams = [
      { id: 1, name: 'Alabama', conferenceId: 1, logo: '/logos/alabama.png', record: '10-2' },
      { id: 2, name: 'Georgia', conferenceId: 1, logo: '/logos/georgia.png', record: '11-1' },
      { id: 3, name: 'Ohio State', conferenceId: 2, logo: '/logos/ohio-state.png', record: '9-3' }
    ];
    
    setConferences(mockConferences);
    setTeams(mockTeams);
  }, []);

  const handleTeamClick = (team) => {
    navigate(`/team/${team.id}`, { 
      state: { teamData: team }
    });
  };

  return (
    <div className="conference-page">
      <h1>College Football Conferences</h1>
      
      {conferences.map((conference) => (
        <div key={conference.id} className="conference-section">
          <h2>{conference.name}</h2>
          <div className="teams-grid">
            {teams
              .filter(team => team.conferenceId === conference.id)
              .map((team) => (
                <div key={team.id} className="team-card">
                  <Link 
                    to={`/team/${team.id}`}
                    state={{ teamData: team }}
                    className="team-link"
                  >
                    <img src={team.logo} alt={team.name} className="team-logo" />
                    <h3>{team.name}</h3>
                    <p>Record: {team.record}</p>
                  </Link>
                  <button 
                    onClick={() => handleTeamClick(team)}
                    className="team-details-btn"
                  >
                    View Details
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConferencePage;