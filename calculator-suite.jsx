import React, { useState, useMemo, useCallback } from "react";

/* ---------------------------------------------------------------
   AESTHETIC DIRECTION: "Lab console" — dark instrumentation panel,
   phosphor-green numeric readouts, amber accent, engraved-metal
   tab rail, monospace/technical typography. Built for a bench
   scientist who also does math.
----------------------------------------------------------------- */

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@500;600;700&display=swap');

    .csuite {
      --bg-deep: #0e1210;
      --bg-panel: #161b18;
      --bg-well: #0a0d0b;
      --line: #2a322d;
      --line-soft: #1f2622;
      --phosphor: #6ee7a0;
      --phosphor-dim: #2f6b48;
      --amber: #e8a33d;
      --amber-dim: #7a5820;
      --text: #d8ddd7;
      --text-dim: #7d8981;
      --danger: #d9694f;
      font-family: 'Barlow Condensed', sans-serif;
      color: var(--text);
      background: var(--bg-deep);
      background-image:
        radial-gradient(circle at 15% 0%, rgba(110,231,160,0.05), transparent 45%),
        radial-gradient(circle at 90% 90%, rgba(232,163,61,0.05), transparent 45%);
    }
    .csuite * { box-sizing: border-box; }
    .mono { font-family: 'Space Mono', monospace; }

    .rivet {
      width: 6px; height: 6px; border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #4a544d, #1a201c 70%);
      box-shadow: 0 0.5px 0 rgba(255,255,255,0.06);
    }

    .tab-btn {
      position: relative;
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-size: 13px;
      padding: 10px 18px;
      background: var(--bg-well);
      color: var(--text-dim);
      border: 1px solid var(--line);
      border-radius: 3px;
      cursor: pointer;
      transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.15s ease;
      white-space: nowrap;
    }
    .tab-btn:hover { color: var(--text); border-color: var(--line); transform: translateY(-1px); }
    .tab-btn.active {
      color: var(--phosphor);
      border-color: var(--phosphor-dim);
      background: linear-gradient(180deg, rgba(110,231,160,0.10), rgba(110,231,160,0.02));
      box-shadow: 0 0 0 1px rgba(110,231,160,0.15) inset, 0 0 14px rgba(110,231,160,0.08);
    }
    .tab-btn.ghost {
      color: var(--amber);
      border-style: dashed;
      border-color: var(--amber-dim);
    }
    .tab-btn.ghost:hover { color: var(--amber); border-color: var(--amber); }

    .panel {
      background: var(--bg-panel);
      border: 1px solid var(--line);
      border-radius: 6px;
      box-shadow: 0 20px 40px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
    }

    .display-well {
      background: var(--bg-well);
      border: 1px solid var(--line-soft);
      border-radius: 4px;
      box-shadow: inset 0 2px 10px rgba(0,0,0,0.6), inset 0 0 20px rgba(110,231,160,0.03);
    }

    .keypad-btn {
      font-family: 'Space Mono', monospace;
      font-size: 17px;
      color: var(--text);
      background: linear-gradient(180deg, #1c2320, #171c19);
      border: 1px solid var(--line);
      border-radius: 4px;
      padding: 14px 0;
      cursor: pointer;
      transition: transform 0.08s ease, border-color 0.15s ease, color 0.15s ease;
      user-select: none;
    }
    .keypad-btn:hover { border-color: #3a453e; }
    .keypad-btn:active { transform: translateY(1px) scale(0.98); }
    .keypad-btn.op { color: var(--amber); }
    .keypad-btn.eq {
      color: var(--bg-deep);
      background: linear-gradient(180deg, #83edac, var(--phosphor));
      border-color: var(--phosphor-dim);
      font-weight: 700;
    }
    .keypad-btn.eq:hover { filter: brightness(1.08); }
    .keypad-btn.clear { color: var(--danger); }
    .keypad-btn.fn { font-size: 13px; color: var(--text-dim); }
    .keypad-btn.fn:hover { color: var(--phosphor); }

    .field-label {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-dim);
      margin-bottom: 6px;
      display: block;
    }
    .field-input {
      width: 100%;
      font-family: 'Space Mono', monospace;
      font-size: 15px;
      color: var(--phosphor);
      background: var(--bg-well);
      border: 1px solid var(--line-soft);
      border-radius: 4px;
      padding: 10px 12px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .field-input:focus {
      border-color: var(--phosphor-dim);
      box-shadow: 0 0 0 3px rgba(110,231,160,0.08);
    }
    .field-input::placeholder { color: #46534b; }

    .go-btn {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 14px;
      color: var(--bg-deep);
      background: linear-gradient(180deg, #f0c069, var(--amber));
      border: 1px solid var(--amber-dim);
      border-radius: 4px;
      padding: 12px 24px;
      cursor: pointer;
      transition: filter 0.15s ease, transform 0.08s ease;
    }
    .go-btn:hover { filter: brightness(1.06); }
    .go-btn:active { transform: translateY(1px); }

    table.results { width: 100%; border-collapse: collapse; font-family: 'Space Mono', monospace; font-size: 13px; }
    table.results th {
      text-align: left;
      font-family: 'Barlow Condensed', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 11px;
      color: var(--text-dim);
      padding: 8px 10px;
      border-bottom: 1px solid var(--line);
      position: sticky; top: 0; background: var(--bg-panel);
    }
    table.results td { padding: 7px 10px; border-bottom: 1px solid var(--line-soft); color: var(--text); }
    table.results tr:hover td { background: rgba(110,231,160,0.04); }
    table.results td.hero { color: var(--phosphor); }

    .scan-fade { animation: scanIn 0.35s ease; }
    @keyframes scanIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg-well); }
    ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
  `}</style>
);

/* ---------------- shared calc engine (standard + scientific) ---------------- */

function useCalcEngine() {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("0");

  const safeEval = (str) => {
    if (!str.trim()) return "0";
    const sanitized = str
      .replace(/\^/g, "**")
      .replace(/π/g, `(${Math.PI})`)
      .replace(/√\(/g, "Math.sqrt(")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/e(?![a-zA-Z])/g, `(${Math.E})`);
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${sanitized});`)();
    if (typeof val !== "number" || !isFinite(val)) throw new Error("bad");
    return String(Math.round(val * 1e10) / 1e10);
  };

  const press = useCallback((token) => {
    if (token === "AC") {
      setExpr("");
      setDisplay("0");
      return;
    }
    if (token === "DEL") {
      setExpr((e) => e.slice(0, -1));
      return;
    }
    if (token === "=") {
      setExpr((e) => {
        try {
          const result = safeEval(e);
          setDisplay(result);
          return result;
        } catch {
          setDisplay("Error");
          return "";
        }
      });
      return;
    }
    setExpr((e) => {
      const next = e + token;
      setDisplay(next || "0");
      return next;
    });
  }, []);

  return { expr, display, press };
}

/* ---------------- Standard Calculator ---------------- */

function StandardCalc() {
  const { expr, display, press } = useCalcEngine();
  const keys = [
    ["AC", "clear"], ["DEL", "fn"], ["%", "op"], ["/", "op"],
    ["7", ""], ["8", ""], ["9", ""], ["*", "op"],
    ["4", ""], ["5", ""], ["6", ""], ["-", "op"],
    ["1", ""], ["2", ""], ["3", ""], ["+", "op"],
    ["0", ""], [".", ""], ["=", "eq"],
  ];
  return (
    <div className="scan-fade">
      <div className="display-well" style={{ padding: "20px 18px", marginBottom: 16 }}>
        <div className="mono" style={{ fontSize: 13, color: "var(--text-dim)", minHeight: 16, textAlign: "right", overflowX: "auto", whiteSpace: "nowrap" }}>
          {expr || "\u00A0"}
        </div>
        <div className="mono" style={{ fontSize: 36, color: "var(--phosphor)", textAlign: "right", overflowX: "auto", whiteSpace: "nowrap", textShadow: "0 0 12px rgba(110,231,160,0.35)" }}>
          {display}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {keys.map(([label, kind], i) => (
          <button
            key={i}
            className={`keypad-btn ${kind}`}
            style={label === "0" ? { gridColumn: "span 2" } : label === "=" ? { gridColumn: "span 1" } : undefined}
            onClick={() => press(label === "DEL" ? "DEL" : label === "AC" ? "AC" : label === "=" ? "=" : label)}
          >
            {label === "DEL" ? "⌫" : label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Scientific Calculator ---------------- */

function ScientificCalc() {
  const { expr, display, press } = useCalcEngine();
  const fnKeys = ["sin(", "cos(", "tan(", "log(", "ln(", "√(", "^2", "^", "π", "e", "(", ")"];
  const numKeys = [
    ["AC", "clear"], ["DEL", "fn"], ["%", "op"], ["/", "op"],
    ["7", ""], ["8", ""], ["9", ""], ["*", "op"],
    ["4", ""], ["5", ""], ["6", ""], ["-", "op"],
    ["1", ""], ["2", ""], ["3", ""], ["+", "op"],
    ["0", ""], [".", ""], ["=", "eq"],
  ];

  const pressFn = (label) => {
    if (label === "^2") return press("^2");
    return press(label);
  };

  return (
    <div className="scan-fade">
      <div className="display-well" style={{ padding: "20px 18px", marginBottom: 16 }}>
        <div className="mono" style={{ fontSize: 13, color: "var(--text-dim)", minHeight: 16, textAlign: "right", overflowX: "auto", whiteSpace: "nowrap" }}>
          {expr || "\u00A0"}
        </div>
        <div className="mono" style={{ fontSize: 36, color: "var(--phosphor)", textAlign: "right", overflowX: "auto", whiteSpace: "nowrap", textShadow: "0 0 12px rgba(110,231,160,0.35)" }}>
          {display}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 10 }}>
        {fnKeys.map((label) => (
          <button key={label} className="keypad-btn fn" onClick={() => pressFn(label)}>
            {label.replace("(", "")}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {numKeys.map(([label, kind], i) => (
          <button
            key={i}
            className={`keypad-btn ${kind}`}
            style={label === "0" ? { gridColumn: "span 2" } : undefined}
            onClick={() => press(label === "DEL" ? "DEL" : label === "AC" ? "AC" : label === "=" ? "=" : label)}
          >
            {label === "DEL" ? "⌫" : label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Gibson Dilution Calculator ---------------- */

function GibsonDilutionCalc() {
  const [stock, setStock] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  const calculate = () => {
    const cInit = parseFloat(stock);
    const cMin = parseFloat(min);
    const cMax = parseFloat(max);

    if ([cInit, cMin, cMax].some((v) => isNaN(v)) || cInit <= 0 || cMin < 0 || cMax < cMin) {
      setError("Enter valid positive values (max ≥ min).");
      setRows(null);
      return;
    }
    setError("");

    const seen = new Set();
    const results = [];

    for (let dna = 1; dna <= 5; dna += 0.5) {
      for (let water = 0.5; water <= 20; water += 0.5) {
        const total = dna + water;
        const conc = cInit * (dna / total);
        if (conc >= cMin && conc <= cMax) {
          // reduce ratio to detect duplicates, key on simplified fraction (x100 to avoid float issues)
          const g = gcd(Math.round(dna * 2), Math.round(water * 2));
          const key = `${Math.round(dna * 2) / g}:${Math.round(water * 2) / g}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({ dna, water, conc });
          }
        }
      }
    }

    results.sort((a, b) => a.conc - b.conc);
    setRows(results);
  };

  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a || 1;
  }

  return (
    <div className="scan-fade">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 16 }}>
        <div>
          <label className="field-label">Initial stock conc. (DNA)</label>
          <input className="field-input" type="number" placeholder="e.g. 500" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Min desired conc.</label>
          <input className="field-input" type="number" placeholder="e.g. 10" value={min} onChange={(e) => setMin(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Max desired conc.</label>
          <input className="field-input" type="number" placeholder="e.g. 50" value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
      </div>

      <button className="go-btn" onClick={calculate}>Calculate ratios</button>

      {error && (
        <div className="mono" style={{ color: "var(--danger)", fontSize: 13, marginTop: 14 }}>
          {error}
        </div>
      )}

      {rows && !error && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8 }}>
            {rows.length} matching ratio{rows.length === 1 ? "" : "s"}
          </div>
          {rows.length > 0 ? (
            <div className="display-well" style={{ maxHeight: 340, overflowY: "auto" }}>
              <table className="results">
                <thead>
                  <tr>
                    <th>DNA : water</th>
                    <th>Concentration</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{fmtRatio(r.dna)} : {fmtRatio(r.water)}</td>
                      <td className="hero">{r.conc.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mono" style={{ color: "var(--text-dim)", fontSize: 13 }}>
              No ratio combinations land in that range.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function fmtRatio(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/* ---------------- "Add new" placeholder tab ---------------- */

function AddNewPlaceholder() {
  return (
    <div className="scan-fade" style={{ textAlign: "center", padding: "50px 20px", color: "var(--text-dim)" }}>
      <div style={{ fontSize: 40, color: "var(--amber)", marginBottom: 10, fontFamily: "'Space Mono', monospace" }}>+</div>
      <div style={{ fontSize: 18, fontFamily: "'Barlow Condensed', sans-serif", color: "var(--text)", marginBottom: 6 }}>
        Slot reserved for the next instrument
      </div>
      <div style={{ fontSize: 13, maxWidth: 380, margin: "0 auto", lineHeight: 1.6 }}>
        Build a new component and append it to the <span className="mono" style={{ color: "var(--phosphor)" }}>calculators</span> array —
        no changes to layout or navigation required.
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   CENTRAL CONFIGURATION — the single source of truth for tabs.
   To add a new calculator: build its component, then add one
   entry here. Nothing else in the app needs to change.
----------------------------------------------------------------- */

const calculators = [
  { id: "standard", label: "Standard", icon: "±", component: StandardCalc },
  { id: "scientific", label: "Scientific", icon: "∑", component: ScientificCalc },
  { id: "gibson", label: "Gibson dilution", icon: "⚗", component: GibsonDilutionCalc },
  { id: "add-new", label: "Add new (+)", icon: "+", component: AddNewPlaceholder, ghost: true },
];

/* ---------------------------------------------------------------
   ROOT APP
----------------------------------------------------------------- */

export default function CalculatorSuite() {
  const [activeId, setActiveId] = useState(calculators[0].id);

  const ActiveComponent = useMemo(
    () => calculators.find((c) => c.id === activeId)?.component ?? StandardCalc,
    [activeId]
  );

  return (
    <div className="csuite" style={{ minHeight: "100vh", padding: "40px 16px", display: "flex", justifyContent: "center" }}>
      {FONTS}
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
          <div className="rivet" />
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 13, color: "var(--text-dim)" }}>
            Bench console
          </div>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <div className="rivet" />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {calculators.map((c) => (
            <button
              key={c.id}
              className={`tab-btn ${activeId === c.id ? "active" : ""} ${c.ghost ? "ghost" : ""}`}
              onClick={() => setActiveId(c.id)}
            >
              <span className="mono" style={{ marginRight: 6, opacity: 0.8 }}>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <ActiveComponent />
        </div>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Modular calculator array — v1.0
        </div>
      </div>
    </div>
  );
}
