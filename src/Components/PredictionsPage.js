import React, { useState } from 'react';

const DEFAULT_API_BASE = 'https://3k8m39q58c.execute-api.us-east-1.amazonaws.com/dev';
// Use env var if set; otherwise fall back to your real API base.
const API_BASE = (process.env.REACT_APP_API_GATEWAY_URL || DEFAULT_API_BASE).replace(/\/$/, '');

export default function PredictionsPage() {
  const [season, setSeason] = useState(2024);
  const [homeTeam, setHomeTeam] = useState('LSU');
  const [awayTeam, setAwayTeam] = useState('UCLA');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const resp = await fetch(${API_BASE}/predict, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ season: Number(season), homeTeam, awayTeam }),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(HTTP : );
      }
      const json = await resp.json();
      setResult(json);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth: 720, margin: '40px auto', padding: 16}}>
      <h1>College Football Predictions</h1>

      <div style={{marginBottom: 12, fontSize: 12, color: '#555'}}>
        API: <code>{API_BASE}</code>
      </div>

      <form onSubmit={submit} style={{display:'grid', gap:12}}>
        <label>Season <input value={season} onChange={e=>setSeason(e.target.value)} /></label>
        <label>Home Team <input value={homeTeam} onChange={e=>setHomeTeam(e.target.value)} /></label>
        <label>Away Team <input value={awayTeam} onChange={e=>setAwayTeam(e.target.value)} /></label>
        <button type="submit" disabled={loading}>{loading ? 'Predicting…' : 'Predict Game'}</button>
      </form>

      {error && <div style={{marginTop:16, color:'#b00'}}>Error: {error}</div>}

      {result && (
        <div style={{marginTop:24}}>
          <h2>Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          {result?.predicted && (
            <div>
              <p><strong>Score:</strong> {Math.round(result.predicted.homePoints)}–{Math.round(result.predicted.awayPoints)} ({result.matchup.homeTeam} vs {result.matchup.awayTeam})</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
