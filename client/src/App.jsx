import { useState } from "react";
import "./App.css";

const COLORS = { Safe: "#16a34a", Suspicious: "#d97706", Dangerous: "#dc2626" };

export default function App() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function check() {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <h1>Scam Check</h1>
      <p className="sub">Paste any message or link, from WhatsApp, email or anywhere.</p>

      <textarea value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Paste a suspicious message here..." rows={6} />

      <div className="row">
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
        <button onClick={check} disabled={loading || !text.trim()}>
          {loading ? "Checking..." : "Check message"}
        </button>
      </div>

      {error && <p className="err">{error}</p>}

      {result && (
        <div className="card" style={{ borderColor: COLORS[result.risk] }}>
          <span className="badge" style={{ background: COLORS[result.risk] }}>{result.risk}</span>
          <ul>{result.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
          <p className="action"><b>What to do:</b> {result.action}</p>
          <details><summary>What we checked</summary>
            <small>Checks triggered: {result.findings.join(", ") || "none"}. Sensitive data was masked before analysis.</small>
          </details>
        </div>
      )}
    </div>
  );
}