import React, { useState } from "react";

const DEFAULT_API_BASE = "https://3k8m39q58c.execute-api.us-east-1.amazonaws.com/dev";
const API_BASE = (process.env.REACT_APP_API_GATEWAY_URL || DEFAULT_API_BASE).replace(/\/$/, "");

function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(+n)) return "--";
  return Math.round(+n).toLocaleString();
}

function TwoColRow({ label, left, right }) {
  const leftNum = Number.isFinite(+left) ? +left : null;
  const rightNum = Number.isFinite(+right) ? +right : null;
  const both = leftNum !== null && rightNum !== null;
  const delta = both ? rightNum - leftNum : null; // actual - predicted
  const color = delta === null ? "#555" : delta === 0 ? "#555" : (delta > 0 ? "#0a0" : "#b00");
  const sign = delta === null ? "" : (delta > 0 ? "+" : "");
  return (
    <tr>
      <td style={{ padding: "8px 6px", color: "#555" }}>{label}</td>
      <td style={{ padding: "8px 6px", textAlign: "right" }}>{leftNum !== null ? fmt(leftNum) : (left || "--")}</td>
      <td style={{ padding: "8px 6px", textAlign: "right" }}>{rightNum !== null ? fmt(rightNum) : (right || "TBD")}</td>
      <td style={{ padding: "8px 6px", textAlign: "right", color }}>{delta === null ? "--" : `${sign}${fmt(delta)}`}</td>
    </tr>
  );
}

function ReviewTable({ pred, act, homeName, awayName }) {
  const hasActuals = !!(act && Number.isFinite(act.homePts) && Number.isFinite(act.awayPts));
  const A = hasActuals ? act : null;

  const predMargin = Math.round((pred.homePoints ?? 0) - (pred.awayPoints ?? 0));
  const actMargin  = hasActuals ? Math.round((A.homePts ?? 0) - (A.awayPts ?? 0)) : null;
  const marginDelta = actMargin === null ? null : (actMargin - predMargin);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #eee" }}></th>
            <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #eee" }}>Predicted</th>
            <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #eee" }}>{hasActuals ? "Actual" : "TBD"}</th>
            <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "1px solid #eee" }}>Delta (Act - Pred)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: "8px 6px", fontWeight: 600 }}>Score</td>
            <td style={{ padding: "8px 6px", textAlign: "right" }}>
              {Math.round(pred.homePoints ?? 0)}-{Math.round(pred.awayPoints ?? 0)}
            </td>
            <td style={{ padding: "8px 6px", textAlign: "right" }}>
              {hasActuals ? `${fmt(A.homePts)}-${fmt(A.awayPts)}` : "TBD"}
            </td>
            <td style={{ padding: "8px 6px", textAlign: "right", color: marginDelta === null ? "#555" : (marginDelta > 0 ? "#0a0" : "#b00") }}>
              {marginDelta === null ? "--" : fmt(marginDelta)}
            </td>
          </tr>

          <TwoColRow label={`${homeName} total yds`} left={pred.homeYds?.total}   right={hasActuals ? A.homeYdsTotal : null} />
          <TwoColRow label={`${homeName} rush yds`}  left={pred.homeYds?.rushing} right={hasActuals ? A.homeYdsRush  : null} />
          <TwoColRow label={`${homeName} pass yds`}  left={pred.homeYds?.passing} right={hasActuals ? A.homeYdsPass  : null} />

          <TwoColRow label={`${awayName} total yds`} left={pred.awayYds?.total}   right={hasActuals ? A.awayYdsTotal : null} />
          <TwoColRow label={`${awayName} rush yds`}  left={pred.awayYds?.rushing} right={hasActuals ? A.awayYdsRush  : null} />
          <TwoColRow label={`${awayName} pass yds`}  left={pred.awayYds?.passing} right={hasActuals ? A.awayYdsPass  : null} />
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

  // schedule/actuals metadata
  const [scheduled, setScheduled] = useState(null); // true/false/null
  const [gameMeta, setGameMeta] = useState(null);   // {date, venue, neutralSite}
  const [autoActuals, setAutoActuals] = useState(null); // {homePts, awayPts, ...} if final
  const [hasActuals, setHasActuals] = useState(false);

  // manual actuals (optional)
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
    setScheduled(null);
    setGameMeta(null);
    setAutoActuals(null);
    setHasActuals(false);

    try {
      // 1) Call predictor
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

      // 2) Check schedule/actuals from static json
      try {
        const schedRes = await fetch(`/schedules/${season}.json`, { cache: "no-store" });
        if (schedRes.ok) {
          const sched = await schedRes.json();
          // try to match either exact (home/away) or reversed
          const found = Array.isArray(sched.games) ? sched.games.find(g =>
            (g.homeTeam?.toLowerCase() === homeTeam.toLowerCase() && g.awayTeam?.toLowerCase() === awayTeam.toLowerCase()) ||
            (g.homeTeam?.toLowerCase() === awayTeam.toLowerCase() && g.awayTeam?.toLowerCase() === homeTeam.toLowerCase())
          ) : null;

          if (!found) {
            setScheduled(false);
          } else {
            setScheduled(true);
            setGameMeta({ date: found.date || null, venue: found.venue || null, neutralSite: !!found.neutralSite });

            // If schedule is reversed relative to inputs, swap actuals orientation
            const sameOrientation = (found.homeTeam?.toLowerCase() === homeTeam.toLowerCase());
            if (found.final && found.actual) {
              const A = {
                homePts: sameOrientation ? found.actual.homePts : found.actual.awayPts,
                awayPts: sameOrientation ? found.actual.awayPts : found.actual.homePts,
                homeYdsRush: sameOrientation ? found.actual.homeYds?.rushing : found.actual.awayYds?.rushing,
                homeYdsPass: sameOrientation ? found.actual.homeYds?.passing : found.actual.awayYds?.passing,
                awayYdsRush: sameOrientation ? found.actual.awayYds?.rushing : found.actual.homeYds?.rushing,
                awayYdsPass: sameOrientation ? found.actual.awayYds?.passing : found.actual.homeYds?.passing
              };
              A.homeYdsTotal = (A.homeYdsRush ?? 0) + (A.homeYdsPass ?? 0);
              A.awayYdsTotal = (A.awayYdsRush ?? 0) + (A.awayYdsPass ?? 0);
              setAutoActuals(A);
              setHasActuals(true);
            }
          }
        } else {
          setScheduled(null); // no schedule file
        }
      } catch {
        setScheduled(null);
      }
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

  // pick autoActuals if present; else manual
  const act = autoActuals ? autoActuals : (hasActuals ? {
    homePts:      actHomePts      === "" ? null : +actHomePts,
    awayPts:      actAwayPts      === "" ? null : +actAwayPts,
    homeYdsRush:  actHomeYdsRush  === "" ? null : +actHomeYdsRush,
    homeYdsPass:  actHomeYdsPass  === "" ? null : +actHomeYdsPass,
    homeYdsTotal: (actHomeYdsRush === "" || actHomeYdsPass === "") ? null : (+actHomeYdsRush + +actHomeYdsPass),
    awayYdsRush:  actAwayYdsRush  === "" ? null : +actAwayYdsRush,
    awayYdsPass:  actAwayYdsPass  === "" ? null : +actAwayYdsPass,
    awayYdsTotal: (actAwayYdsRush === "" || actAwayYdsPass === "") ? null : (+actAwayYdsRush + +actAwayYdsPass),
  } : null);

  const favored =
    result && result.predicted
      ? (result.predicted.homePoints >= result.predicted.awayPoints ? result.matchup?.homeTeam : result.matchup?.awayTeam)
      : null;

  const margin =
    result && result.predicted
      ? Math.abs(Math.round((result.predicted.homePoints ?? 0) - (result.predicted.awayPoints ?? 0)))
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
          <div style={{ marginTop: 12, padding: 10, background: "#f8f8f8", borderRadius: 8 }}>
            {scheduled === false && <div>Schedule: Not scheduled for {season}.</div>}
            {scheduled === true && (
              <div>
                <div>Schedule: Scheduled{gameMeta?.date ? ` on ${gameMeta.date}` : ""}{gameMeta?.venue ? ` • ${gameMeta.venue}` : ""}{gameMeta?.neutralSite ? " • Neutral site" : ""}.</div>
                {autoActuals && <div>Result: Final — actuals loaded.</div>}
                {!autoActuals && <div>Result: TBD — no final posted in schedule file.</div>}
              </div>
            )}
            {scheduled === null && <div>Schedule: Unknown (no schedule file for {season}).</div>}
          </div>

          <div style={{
            marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 10,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)", background: "#fff"
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Projected Score</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {result.matchup?.homeTeam} {Math.round(result.predicted?.homePoints ?? 0)} - {Math.round(result.predicted?.awayPoints ?? 0)} {result.matchup?.awayTeam}
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
                homeYds: { total: (result.yards?.home?.rushing ?? 0) + (result.yards?.home?.passing ?? 0), ...result.yards?.home },
                awayYds: { total: (result.yards?.away?.rushing ?? 0) + (result.yards?.away?.passing ?? 0), ...result.yards?.away },
              }}
              act={act}
              homeName={result.matchup?.homeTeam}
              awayName={result.matchup?.awayTeam}
            />

            {!autoActuals && (
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
            )}
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