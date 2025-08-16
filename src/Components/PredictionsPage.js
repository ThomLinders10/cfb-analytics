import React, { useState } from "react";

const DEFAULT_API_BASE = "https://3k8m39q58c.execute-api.us-east-1.amazonaws.com/dev";
const API_BASE = (process.env.REACT_APP_API_GATEWAY_URL || DEFAULT_API_BASE).replace(/\/$/, "");

function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(+n)) return "--";
  return Math.round(+n).toLocaleString();
}

function TwoColRow({ label, left, right }) {
  const both = Number.isFinite(+left) && Number.isFinite(+right);
  const delta = both ? (+right - +left) : null; // actual - predicted
  const color = delta === null ? "#555" : delta === 0 ? "#555" : (delta > 0 ? "#0a0" : "#b00");
  const sign = delta === null ? "" : (delta > 0 ? "+" : "");
  return (
    <tr>
      <td style={{ padding: "8px 6px", color: "#555" }}>{label}</td>
      <td style={{ padding: "8px 6px", textAlign: "right" }}>{Number.isFinite(+left) ? fmt(left) : left}</td>
      <td style={{ padding: "8px 6px", textAlign: "right" }}>{Number.isFinite(+right) ? fmt(right) : right}</td>
      <td style={{ padding: "8px 6px", textAlign: "right", color }}>{delta === null ? "—" : `${sign}${fmt(delta)}`}</td>
    </tr>
  );
}

function ReviewTable({ pred, act, homeName, awayName }) {
  const hasActuals = act && Number.isFinite(act.homePts) && Number.isFinite(act.awayPts);
  const A = hasActuals ? act : null;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #eee" }}></th>
            <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #eee" }}>Predicted</th>
            <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #eee" }}>{hasActuals ? "Actual" : "TBD"}</th>
            <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #eee" }}>Δ (Act − Pred)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "8px 6px", fontWeight: 600 }}>Score</td>
            <td style={{ padding: "8px 6px", textAlign: "right" }}>
              {Math.round(pred.homePoints)}–{Math.round(pred.awayPoints)}
            </td>
            <td style={{ padding: "8px 6px", textAlign: "right" }}>
              {hasActuals ? `${fmt(A.homePts)}–${fmt(A.awayPts)}` : "TBD"}
            </td>
            <td style={{ padding: "8px 6px", textAlign: "right", color: hasActuals ? (Math.round(A.homePts - A.awayPts) - Math.round(pred.homePoints - pred.awayPoints) > 0 ? "#0a0" : "#b00") : "#555" }}>
              {hasActuals ? `${fmt((A.homePts - A.awayPts) - (pred.homePoints - pred.awayPoints))}` : "—"}
            </td>
          </tr>

          <TwoColRow label={`${homeName} total yds`} left={pred.homeYds?.total} right={hasActuals ? A.homeYdsTotal : "TBD"} />
          <TwoColRow label={`${homeName} rush yds`} left={pred.homeYds?.rushing} right={hasActuals ? A.homeYdsRush : "TBD"} />
          <TwoColRow label={`${homeName} pass yds`} left={pred.homeYds?.passing} right={hasActuals ? A.homeYdsPass : "TBD"} />

          <TwoColRow label={`${awayName} total yds`} left={pred.awayYds?.total} right={hasActuals ? A.awayYdsTotal : "TBD"} />
          <TwoColRow label={`${awayName} rush yds`} left={pred.awayYds?.rushing} right={hasActuals ? A.awayYdsRush : "TBD"} />
          <TwoColRow label={`${awayName} pass yds`} left={pred.awayYds?.passing} right={hasActuals ? A.awayYdsPass : "TBD"} />
        </tbody>
      </table>
    </div>
  );
}

export default function PredictionsPage() {
  const [season, setSeason] = useState(2025);
  const [homeTeam, setHomeTeam] = useState("LSU");
  const [awayTeam, setAwayTeam] = useState("UCLA");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // Optional: user-entered actuals for review (until backend wires real data)
  const [hasActuals, setHasActuals] = useState(false);
  const [actHomePts, setActHomePts] = useState("");
  const [actAwayPts, setActAwayPts] = useState("");
  const [actHomeYdsRush, setActHomeYdsRush] = useState("");
  const [actHomeYdsPass, setActHomeYdsPass] = useState("");
  const [actAwayYdsRush, setActAwayYdsRush] = useState("");
  const [actAwayYdsPass, setActAwayYdsPass] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season: Number(season), homeTeam, awayTeam }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const pred = result ? {
    homePoints: result?.predicted?.homePoints ?? null,
    awayPoints: result?.predicted?.awayPoints ?? null,
    homeYds: result?.yards?.home ?? {},
    awayYds: result?.yards?.away ?? {},
  } : null;

  const act = hasActuals ? {
    homePts: actHomePts === "" ? null : +actHomePts,
    awayPts: actAwayPts === "" ? null : +actAwayPts,
    homeYdsRush: actHomeYdsRush === "" ? null : +actHomeYdsRush,
    homeYdsPass: actHomeYdsPass === "" ? null : +actHomeYdsPass,
    homeYdsTotal: (actHomeYdsRush === "" || actHomeYdsPass === "") ? null : (+actHomeYdsRush + +actHomeYdsPass),
    awayYdsRush: actAwayYdsRush === "" ? null : +actAwayYdsRush,
    awayYdsPass: actAwayYdsPass === "" ? null : +actAwayYdsPass,
    awayYdsTotal: (actAwayYdsRush === "" || actAwayYdsPass === "") ? null : (+actAwayYdsRush + +actAwayYdsPass),
  } : null;

  const favored =
    result && result.predicted
      ? (result.predicted.homePoints >= result.predicted.awayPoints ? result.matchup?.homeTeam : result.matchup?.awayTeam)
      : null;

  const margin =
    result && result.predicted
      ? Math.abs(Math.round(result.predicted.homePoints - result.predicted.awayPoints))
      : null;

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>College Football Predictions</h1>

      <div style={{ marginBottom: 12, fontSize: 12, color: "#555" }}>
        API: <code>{API_BASE}/predict</code>
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", alignItems: "end" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Season</span>
          <input value={season} onChange={(e) => setSeason(e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Home Team</span>
          <input value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Away Team</span>
          <input value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} />
        </label>
        <button type="submit" disabled={loading} style={{ height: 36 }}>
          {loading ? "Predicting..." : "Predict Game"}
        </button>
      </form>

      {error ? (
        <div style={{ marginTop: 16, color: "#b00" }}>Error: {error}</div>
      ) : null}

      {result ? (
        <>
          <div style={{
            marginTop: 20, padding: 12, border: "1px solid #ddd", borderRadius: 10,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)", background: "#fff"
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Projected Score</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {result.matchup?.homeTeam} {Math.round(result.predicted.homePoints)} – {Math.round(result.predicted.awayPoints)} {result.matchup?.awayTeam}
            </div>
            <div style={{ color: "#555", marginTop: 6 }}>
              Favored: <strong>{favored}</strong> by <strong>{margin}</strong>
              {typeof result.predicted?.confidence === "number" ? <> • Confidence: <strong>{result.predicted.confidence.toFixed(1)}</strong></> : null}
            </div>
          </div>

          <div style={{
            marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 10,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)", background: "#fff"
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Predicted vs Actual</div>
            <ReviewTable
              pred={{
                homePoints: result.predicted?.homePoints ?? null,
                awayPoints: result.predicted?.awayPoints ?? null,
                homeYds: result.yards?.home ?? {},
                awayYds: result.yards?.away ?? {},
              }}
              act={act}
              homeName={result.matchup?.homeTeam}
              awayName={result.matchup?.awayTeam}
            />

            <div style={{ marginTop: 12, background: "#f8f8f8", borderRadius: 8, padding: 10 }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={hasActuals} onChange={(e) => setHasActuals(e.target.checked)} />
                <span>Enter actuals for review (optional)</span>
              </label>

              {hasActuals ? (
                <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", marginTop: 10 }}>
                  <label>Home points <input value={actHomePts} onChange={(e)=>setActHomePts(e.target.value)} /></label>
                  <label>Away points <input value={actAwayPts} onChange={(e)=>setActAwayPts(e.target.value)} /></label>
                  <label>Home rush yds <input value={actHomeYdsRush} onChange={(e)=>setActHomeYdsRush(e.target.value)} /></label>
                  <label>Home pass yds <input value={actHomeYdsPass} onChange={(e)=>setActHomeYdsPass(e.target.value)} /></label>
                  <label>Away rush yds <input value={actAwayYdsRush} onChange={(e)=>setActAwayYdsRush(e.target.value)} /></label>
                  <label>Away pass yds <input value={actAwayYdsPass} onChange={(e)=>setActAwayYdsPass(e.target.value)} /></label>
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={() => setShowDetails(s => !s)} style={{ marginBottom: 8 }}>
              {showDetails ? "Hide raw JSON" : "Show raw JSON"}
            </button>
            {showDetails ? (
              <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #eee", background: "#fafafa", padding: 12, borderRadius: 8 }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
