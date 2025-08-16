import React, { useState } from 'react';

const DEFAULT_API_BASE = 'https://3k8m39q58c.execute-api.us-east-1.amazonaws.com/dev';
const API_BASE = (process.env.REACT_APP_API_GATEWAY_URL || DEFAULT_API_BASE).replace(/\/$/, '');

export default function PredictionsPage() {
  const [season, setSeason] = useState(2024);
  const [homeTeam, setHomeTeam] = useState('LSU');
  const [awayTeam, setAwayTeam] = useState('UCLA');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(${API_BASE}/predict, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ season: Number(season), homeTeam, awayTeam }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(HTTP : );
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>College Football Predictions</h1>

      <div style={{ marginBottom: 12, fontSize: 12, color: '#555' }}>
        API: <code>{API_BASE}/predict</code>
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Season
          <input value={season} onChange={(e) => setSeason(e.target.value)} />
        </label>
        <label>
          Home Team
          <input value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
        </label>
        <label>
          Away Team
          <input value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Game'}
        </button>
      </form>

      {error ? (
        <div style={{ marginTop: 16, color: '#b00' }}>Error: {error}</div>
      ) : null}

      {result ? (
        <div style={{ marginTop: 24 }}>
          <h2>Result</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
          {result.predicted && result.matchup ? (
            <p>
              <strong>Score:</strong>{' '}
              {Math.round(result.predicted.homePoints)}–
              {Math.round(result.predicted.awayPoints)} (
              {result.matchup.homeTeam} vs {result.matchup.awayTeam})
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
