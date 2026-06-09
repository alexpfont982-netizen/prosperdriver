import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, MapPin, ChevronDown, ChevronUp } from "lucide-react";

export default function WorkTimer({ isMobile }) {
  const [status, setStatus] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [km, setKm] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const intervalRef = useRef(null);
  const lastTickRef = useRef(null);

  useEffect(() => {
    if (status === "running") {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - lastTickRef.current) / 1000);
        lastTickRef.current = now;
        setElapsed(p => p + diff);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  function handleStart() {
    setStatus("running");
    setStartedAt(new Date());
    setElapsed(0);
    setKm("");
    setShowPanel(true);
  }

  function handlePause() { setStatus("paused"); }
  function handleResume() { setStatus("running"); }
  function handleFinish() { setStatus("finished"); clearInterval(intervalRef.current); }
  function handleReset() { setStatus("idle"); setElapsed(0); setKm(""); setStartedAt(null); setShowPanel(false); }

  function formatTime(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const statusColor = { idle: "#6b7280", running: "#16a34a", paused: "#ea580c", finished: "#2563eb" };
  const statusLabel = { idle: "Pronto", running: "Trabalhando", paused: "Pausado", finished: "Finalizado" };

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>

      {/* BOTÃO/PILL no topbar */}
      <button onClick={() => status === "idle" ? handleStart() : setShowPanel(p => !p)} style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: isMobile ? "6px 10px" : "8px 14px",
        borderRadius: 50, border: `1.5px solid ${statusColor[status]}`,
        background: status === "idle" ? "#fff" : `${statusColor[status]}12`,
        color: statusColor[status], fontSize: isMobile ? 11 : 12, fontWeight: 600,
        cursor: "pointer", whiteSpace: "nowrap",
        boxShadow: status === "running" ? `0 0 0 3px ${statusColor[status]}22` : "none",
        transition: "all .2s",
      }}>
        {status === "idle" && <><Play size={12} fill={statusColor[status]} /> {isMobile ? "Jornada" : "Iniciar Jornada"}</>}
        {status === "running" && <>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", animation: "pulse 1.5s infinite" }} />
          {formatTime(elapsed)}
        </>}
        {status === "paused" && <><Pause size={12} /> {formatTime(elapsed)}</>}
        {status === "finished" && <><Square size={12} /> {formatTime(elapsed)}</>}
      </button>

      {/* PANEL dropdown */}
      {showPanel && status !== "idle" && (
        <>
          {/* overlay */}
          <div onClick={() => setShowPanel(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />

          <div style={{
            position: "fixed", top: 60, right: 8,
            width: "calc(100vw - 16px)", maxWidth: 300, zIndex: 200,
            background: "#fff", borderRadius: 16,
            border: `2px solid ${statusColor[status]}`,
            boxShadow: "0 8px 32px rgba(0,0,0,.12)",
            overflow: "hidden",
          }}>
            {/* header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              background: `${statusColor[status]}10`,
              borderBottom: `1px solid ${statusColor[status]}22`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: statusColor[status],
                  animation: status === "running" ? "pulse 1.5s infinite" : "none",
                }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: statusColor[status] }}>
                  {statusLabel[status]}
                </span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#111827", fontFamily: "monospace" }}>
                {formatTime(elapsed)}
              </span>
            </div>

            {/* body */}
            <div style={{ padding: 14 }}>
              {/* inicio */}
              {startedAt && (
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12 }}>
                  🕐 Início: {startedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  {status === "finished" && (
                    <span> → Fim: {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  )}
                </div>
              )}

              {/* KM */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <MapPin size={13} color="#6b7280" />
                <span style={{ fontSize: 12, color: "#6b7280", flexShrink: 0 }}>Km rodados:</span>
                <input type="number" placeholder="0" value={km}
                  onChange={e => setKm(e.target.value)}
                  style={{
                    flex: 1, padding: "5px 10px", borderRadius: 8,
                    border: "1px solid #e5e7eb", background: "#f9fafb",
                    fontSize: 13, fontWeight: 600, color: "#111827",
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: 12, color: "#6b7280" }}>km</span>
              </div>

              {/* finalizado */}
              {status === "finished" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: 10, padding: "10px 14px", fontSize: 12,
                  }}>
                    <div style={{ fontWeight: 600, color: "#16a34a", marginBottom: 4 }}>✓ Jornada finalizada</div>
                    <div style={{ color: "#374151" }}>⏱ Tempo ativo: <strong>{formatTime(elapsed)}</strong></div>
                    {km && <div style={{ color: "#374151" }}>🗺 Km: <strong>{km} km</strong></div>}
                  </div>
                  <button onClick={handleReset} style={{
                    padding: "9px", borderRadius: 10, border: "1px solid #e5e7eb",
                    background: "#fff", color: "#374151", fontSize: 13,
                    fontWeight: 500, cursor: "pointer",
                  }}>
                    Nova Jornada
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  {status === "running" ? (
                    <button onClick={handlePause} style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "9px", borderRadius: 10, border: "none",
                      background: "#fff7ed", color: "#ea580c", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>
                      <Pause size={13} /> Pausar
                    </button>
                  ) : (
                    <button onClick={handleResume} style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "9px", borderRadius: 10, border: "none",
                      background: "#f0fdf4", color: "#16a34a", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}>
                      <Play size={13} fill="#16a34a" /> Retomar
                    </button>
                  )}
                  <button onClick={handleFinish} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px", borderRadius: 10, border: "none",
                    background: "#eff6ff", color: "#2563eb", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>
                    <Square size={13} /> Finalizar
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity:1; transform:scale(1); }
          50% { opacity:.5; transform:scale(1.3); }
        }
      `}</style>
    </div>
  );
}