import { useState, useEffect, useRef } from "react";
import { Play, Pause, Flag, MapPin, Plus, X } from "lucide-react";
import { PLAT_CONFIG } from "../data/seed";

export default function WorkTimer({
  t, isMobile, incomes = [], expenses = [], currency,
  onSaveIncome, onSaveExpense, onSaveJourney,
  activeSession, activeSessionLoaded,
  onSaveActiveSession, onClearActiveSession,
}) {
  const [status, setStatus]           = useState("idle");
  const [elapsed, setElapsed]         = useState(0);
  const [kmStart, setKmStart]         = useState("");
  const [kmEnd, setKmEnd]             = useState("");
  const [startedAt, setStartedAt]     = useState(null);
  const [showPanel, setShowPanel]     = useState(false);
  const [step, setStep]               = useState("idle");
  const [summary, setSummary]         = useState(null);
  const [earnings, setEarnings]       = useState([{ platform:"uber", amount:"" }]);
  const [dayExpenses, setDayExpenses] = useState([]);
  const intervalRef                   = useRef(null);

  // accumulatedElapsed = segundos ya contabilizados antes del tramo "running" actual
  // runStartAt = timestamp (ms) en que empezó el tramo "running" actual (null si no está corriendo)
  const accumulatedElapsedRef = useRef(0);
  const runStartAtRef         = useRef(null);
  const hydratedRef           = useRef(false);

  // Envía el estado actual de la jornada a Supabase (tabla active_sessions).
  // Se llama en cada transición importante, no en cada tecla presionada, para no saturar de writes.
  function persist(overrides = {}) {
    const merged = {
      status, step, kmStart, kmEnd,
      startedAt: startedAt ? startedAt.toISOString() : null,
      accumulatedElapsed: accumulatedElapsedRef.current,
      runStartAt: runStartAtRef.current,
      earnings, dayExpenses, summary,
      ...overrides,
    };

    if (merged.status === "idle" && !merged.summary) {
      onClearActiveSession?.();
      return;
    }

    onSaveActiveSession?.({
      status: merged.status,
      step: merged.step,
      km_start: merged.kmStart !== "" && merged.kmStart != null ? parseFloat(merged.kmStart) : null,
      km_end: merged.kmEnd !== "" && merged.kmEnd != null ? parseFloat(merged.kmEnd) : null,
      started_at: merged.startedAt,
      accumulated_elapsed: merged.accumulatedElapsed,
      run_start_at: merged.runStartAt,
      earnings: merged.earnings,
      day_expenses: merged.dayExpenses,
      summary: merged.summary,
    });
  }

  // HIDRATACIÓN: cuando App.jsx termina de cargar la sesión activa desde Supabase, restaurarla aquí
  useEffect(() => {
    if (!activeSessionLoaded || hydratedRef.current) return;
    hydratedRef.current = true;

    const saved = activeSession;
    if (saved && saved.status && saved.status !== "idle") {
      setStatus(saved.status);
      setStep(saved.step || saved.status);
      setKmStart(saved.km_start != null ? String(saved.km_start) : "");
      setKmEnd(saved.km_end != null ? String(saved.km_end) : "");
      setStartedAt(saved.started_at ? new Date(saved.started_at) : null);
      setEarnings(saved.earnings?.length ? saved.earnings : [{ platform:"uber", amount:"" }]);
      setDayExpenses(saved.day_expenses || []);
      setSummary(saved.summary || null);

      accumulatedElapsedRef.current = saved.accumulated_elapsed || 0;
      runStartAtRef.current = saved.run_start_at ? parseInt(saved.run_start_at, 10) : null;

      if (saved.status === "running" && runStartAtRef.current) {
        const extra = Math.floor((Date.now() - runStartAtRef.current) / 1000);
        setElapsed(accumulatedElapsedRef.current + Math.max(extra, 0));
      } else {
        setElapsed(accumulatedElapsedRef.current);
      }

      // Muestra el panel de nuevo para que el usuario vea que su jornada sigue activa
      setShowPanel(true);
    }
  }, [activeSessionLoaded, activeSession]);

  // TICKER: recalcula elapsed cada segundo a partir de timestamps reales (evita desfases por segundo plano)
  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        const extra = runStartAtRef.current
          ? Math.floor((Date.now() - runStartAtRef.current) / 1000)
          : 0;
        setElapsed(accumulatedElapsedRef.current + Math.max(extra, 0));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  function handleStart() {
    if (!kmStart) return;
    const now = new Date();
    accumulatedElapsedRef.current = 0;
    runStartAtRef.current = Date.now();
    setStatus("running"); setStep("running");
    setStartedAt(now); setElapsed(0);
    persist({
      status: "running", step: "running",
      startedAt: now.toISOString(),
      accumulatedElapsed: 0, runStartAt: runStartAtRef.current,
    });
  }

  function handlePause() {
    const extra = runStartAtRef.current ? Math.floor((Date.now() - runStartAtRef.current) / 1000) : 0;
    accumulatedElapsedRef.current += Math.max(extra, 0);
    runStartAtRef.current = null;
    setStatus("paused"); setStep("paused");
    setElapsed(accumulatedElapsedRef.current);
    persist({
      status: "paused", step: "paused",
      accumulatedElapsed: accumulatedElapsedRef.current, runStartAt: null,
    });
  }

  function handleResume() {
    runStartAtRef.current = Date.now();
    setStatus("running"); setStep("running");
    persist({
      status: "running", step: "running",
      accumulatedElapsed: accumulatedElapsedRef.current, runStartAt: runStartAtRef.current,
    });
  }

  function handleFinish() {
    const extra = runStartAtRef.current ? Math.floor((Date.now() - runStartAtRef.current) / 1000) : 0;
    accumulatedElapsedRef.current += Math.max(extra, 0);
    runStartAtRef.current = null;
    setStatus("finished");
    clearInterval(intervalRef.current);
    setElapsed(accumulatedElapsedRef.current);
    setStep("km");
    persist({
      status: "finished", step: "km",
      accumulatedElapsed: accumulatedElapsedRef.current, runStartAt: null,
    });
  }

  function handleConfirmKm() {
    if (!kmEnd) return;
    setStep("earnings");
    persist({ step: "earnings", kmEnd });
  }

  function addEarning() {
    setEarnings(p => {
      const next = [...p, { platform:"uber", amount:"" }];
      persist({ earnings: next });
      return next;
    });
  }
  function removeEarning(i) {
    setEarnings(p => {
      const next = p.filter((_,idx) => idx !== i);
      persist({ earnings: next });
      return next;
    });
  }
  function updateEarning(i, field, val) {
    setEarnings(p => p.map((e,idx) => idx===i ? {...e,[field]:val} : e));
  }
  async function handleConfirmEarnings() {
    const today = new Date().toISOString().slice(0,10);
    for (const e of earnings) {
      if (e.amount && parseFloat(e.amount) > 0) {
        await onSaveIncome?.({
          platform: e.platform,
          amount: parseFloat(e.amount),
          rides: 0, hours: elapsed/3600,
          date: today,
          note: "Registrado via Jornada",
        });
      }
    }
    setStep("expenses");
    persist({ step: "expenses", earnings });
  }
  function updateDayExpense(i, field, val) {
    setDayExpenses(p => p.map((x,idx) => idx===i ? {...x,[field]:val} : x));
  }
  async function buildSummary() {
    // Guardar cualquier gasto ingresado en este paso ANTES de armar el resumen.
    // Esto corre sin importar si el usuario tocó "Salvar e Ver Resumo" o "Pular",
    // para que nunca se pierda un gasto ya escrito.
    const todayForExpenses = new Date().toISOString().slice(0,10);
    for (const e of dayExpenses) {
      if (e.amount && parseFloat(e.amount) > 0) {
        await onSaveExpense?.({
          category: e.category,
          amount: parseFloat(e.amount),
          desc: e.desc || e.category,
          date: todayForExpenses,
        });
      }
    }

    const kmDone      = parseFloat(kmEnd) - parseFloat(kmStart);
    const hours       = elapsed / 3600;
    const totalEarned = earnings.reduce((a,e) => a + (parseFloat(e.amount)||0), 0);
    const perKm       = kmDone > 0 ? totalEarned / kmDone : 0;
    const perHour     = hours  > 0 ? totalEarned / hours  : 0;
    const finalSummary = { kmDone: kmDone > 0 ? kmDone : 0, hours, elapsed, totalEarned, perKm, perHour };
    setSummary(finalSummary);
    setStep("summary");
    persist({ step: "summary", summary: finalSummary, dayExpenses });

    // Guardar la jornada finalizada en la tabla journeys, para poder consultarla después
    const today = new Date().toISOString().slice(0,10);
    await onSaveJourney?.({
      date: today,
      startedAt: startedAt ? startedAt.toISOString() : null,
      endedAt: new Date().toISOString(),
      elapsed,
      kmStart: parseFloat(kmStart) || null,
      kmEnd: parseFloat(kmEnd) || null,
      kmDone: finalSummary.kmDone,
      totalEarned: finalSummary.totalEarned,
      perKm: finalSummary.perKm,
      perHour: finalSummary.perHour,
      hours: finalSummary.hours,
    });
  }
  function handleReset() {
    setStatus("idle"); setStep("idle");
    setElapsed(0); setKmStart(""); setKmEnd("");
    setStartedAt(null); setShowPanel(false);
    setSummary(null);
    setEarnings([{ platform:"uber", amount:"" }]);
    setDayExpenses([]);
    accumulatedElapsedRef.current = 0;
    runStartAtRef.current = null;
    onClearActiveSession?.();
  }
  function formatTime(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  const today = new Date().toISOString().slice(0,10);
  const allDayExpenses = [
    ...expenses.filter(e => e.date?.slice(0,10) === today),
    ...dayExpenses.filter(e => e.amount && parseFloat(e.amount) > 0),
  ];

  const sym = currency?.symbol || "R$";
  const statusColor = { idle:"#6b7280", running:"#16a34a", paused:"#ea580c", finished:"#2563eb" };
  const stepLabel = {
    idle:"Iniciar Jornada", running:"Trabalhando", paused:"Pausado",
    km:"Km Final", earnings:"Registrar Ganhos", expenses:"Registrar Gastos", summary:"Resumo da Jornada",
  };
  const inp = {
    flex:1, padding:"7px 10px", borderRadius:8,
    border:"1px solid #e5e7eb", background:"#f9fafb",
    fontSize:13, fontWeight:600, color:"#111827", outline:"none",
  };

  return (
    <div style={{ position:"relative" }}>

      {/* BOTÃO TOPBAR */}
      <button onClick={() => setShowPanel(p=>!p)} style={{
        display:"flex", alignItems:"center", gap:6,
        padding: isMobile ? "6px 10px" : "8px 14px",
        borderRadius:50, border:`1.5px solid ${statusColor[status]}`,
        background: status==="idle" ? "#fff" : `${statusColor[status]}12`,
        color: statusColor[status], fontSize:12, fontWeight:600,
        cursor:"pointer", whiteSpace:"nowrap",
        boxShadow: status==="running" ? `0 0 0 3px ${statusColor[status]}22` : "none",
        transition:"all .2s",
      }}>
        {status==="idle"     && <><Play size={12} fill="#6b7280"/> {isMobile ? (t?.journeyShort || "Jornada") : (t?.startJourney || "Iniciar Jornada")}</>}
        {status==="running"  && <><div style={{width:7,height:7,borderRadius:"50%",background:"#16a34a",animation:"pulse 1.5s infinite"}}/>{formatTime(elapsed)}</>}
        {status==="paused"   && <><Pause size={12}/> {formatTime(elapsed)}</>}
        {status==="finished" && <><Flag size={12}/> {step==="summary"?"Ver resumo":"Finalizando..."}</>}
      </button>

      {/* PANEL */}
      {showPanel && (
        <>
          <div onClick={() => setShowPanel(false)} style={{ position:"fixed", inset:0, zIndex:199 }}/>
          <div style={{
            position:"fixed", top:60, right:8,
            width:"calc(100vw - 16px)", maxWidth:340, zIndex:200,
            background:"#fff", borderRadius:16,
            border:`2px solid ${statusColor[status]}`,
            boxShadow:"0 8px 32px rgba(0,0,0,.12)",
            maxHeight:"80vh", overflow:"auto",
          }}>
            {/* HEADER */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 16px", background:`${statusColor[status]}08`,
              borderBottom:`1px solid ${statusColor[status]}22`,
              position:"sticky", top:0,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:statusColor[status],
                  animation:status==="running"?"pulse 1.5s infinite":"none" }}/>
                <span style={{ fontSize:12, fontWeight:600, color:statusColor[status] }}>
                  {stepLabel[step]}
                </span>
              </div>
              {(step==="running"||step==="paused") && (
                <span style={{ fontSize:18, fontWeight:700, color:"#111827", fontFamily:"monospace" }}>
                  {formatTime(elapsed)}
                </span>
              )}
            </div>

            <div style={{ padding:16 }}>

              {/* IDLE */}
              {step==="idle" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ fontSize:13, color:"#374151", fontWeight:500 }}>
                    🚗 Informe o km do hodômetro para começar
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <MapPin size={14} color="#6b7280" style={{ flexShrink:0 }}/>
                    <span style={{ fontSize:12, color:"#6b7280", flexShrink:0 }}>Km inicial:</span>
                    <input type="number" placeholder="Ex: 45230" value={kmStart}
                      onChange={e => setKmStart(e.target.value)} style={inp}/>
                    <span style={{ fontSize:12, color:"#6b7280", flexShrink:0 }}>km</span>
                  </div>
                  <button onClick={handleStart} disabled={!kmStart} style={{
                    width:"100%", padding:"11px", borderRadius:10, border:"none",
                    background: kmStart?"#16a34a":"#e5e7eb",
                    color: kmStart?"#fff":"#9ca3af",
                    fontWeight:700, fontSize:14, cursor:kmStart?"pointer":"not-allowed",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  }}>
                    <Play size={14} fill={kmStart?"#fff":"#9ca3af"}/> Iniciar Jornada
                  </button>
                </div>
              )}

              {/* RUNNING / PAUSED */}
              {(step==="running"||step==="paused") && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {startedAt && (
                    <div style={{ fontSize:11, color:"#9ca3af" }}>
                      🕐 Início: {startedAt.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
                      {" · "}🗺 Km inicial: <strong>{kmStart} km</strong>
                    </div>
                  )}
                  <div style={{ display:"flex", gap:8 }}>
                    {step==="running" ? (
                      <button onClick={handlePause} style={{
                        flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                        padding:"10px", borderRadius:10, border:"none",
                        background:"#fff7ed", color:"#ea580c", fontSize:13, fontWeight:600, cursor:"pointer",
                      }}>
                        <Pause size={13}/> Pausar
                      </button>
                    ) : (
                      <button onClick={handleResume} style={{
                        flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                        padding:"10px", borderRadius:10, border:"none",
                        background:"#f0fdf4", color:"#16a34a", fontSize:13, fontWeight:600, cursor:"pointer",
                      }}>
                        <Play size={13} fill="#16a34a"/> Retomar
                      </button>
                    )}
                    <button onClick={handleFinish} style={{
                      flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                      padding:"10px", borderRadius:10, border:"none",
                      background:"#eff6ff", color:"#2563eb", fontSize:13, fontWeight:600, cursor:"pointer",
                    }}>
                      <Flag size={13}/> Encerrar
                    </button>
                  </div>
                </div>
              )}

              {/* KM FINAL */}
              {step==="km" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ fontSize:13, color:"#374151", fontWeight:500 }}>
                    🏁 Registre o km final do hodômetro
                  </div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>
                    ⏱ Tempo: <strong>{formatTime(elapsed)}</strong>
                    {" · "}🗺 Km inicial: <strong>{kmStart}</strong>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <MapPin size={14} color="#6b7280" style={{ flexShrink:0 }}/>
                    <span style={{ fontSize:12, color:"#6b7280", flexShrink:0 }}>Km final:</span>
                    <input type="number" placeholder="Ex: 45410" value={kmEnd}
                      onChange={e => setKmEnd(e.target.value)} style={inp}/>
                    <span style={{ fontSize:12, color:"#6b7280", flexShrink:0 }}>km</span>
                  </div>
                  <button onClick={handleConfirmKm} disabled={!kmEnd} style={{
                    width:"100%", padding:"11px", borderRadius:10, border:"none",
                    background: kmEnd?"#2563eb":"#e5e7eb",
                    color: kmEnd?"#fff":"#9ca3af",
                    fontWeight:700, fontSize:14, cursor:kmEnd?"pointer":"not-allowed",
                  }}>
                    Próximo → Registrar Ganhos
                  </button>
                </div>
              )}

              {/* EARNINGS */}
              {step==="earnings" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ fontSize:13, color:"#374151", fontWeight:600 }}>
                    💰 Quanto você ganhou hoje?
                  </div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>
                    Adicione os ganhos por plataforma
                  </div>
                  {earnings.map((e,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <select value={e.platform} onChange={ev => updateEarning(i,"platform",ev.target.value)}
                        style={{ ...inp, flex:"0 0 90px", fontWeight:500 }}>
                        {Object.entries(PLAT_CONFIG).map(([k,v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <input type="number" placeholder="0,00" value={e.amount}
                        onChange={ev => updateEarning(i,"amount",ev.target.value)}
                        style={{ ...inp, flex:1 }}/>
                      <span style={{ fontSize:11, color:"#9ca3af", flexShrink:0 }}>{sym}</span>
                      {earnings.length > 1 && (
                        <button onClick={() => removeEarning(i)} style={{
                          background:"none", border:"none", cursor:"pointer", color:"#9ca3af", padding:2,
                        }}>
                          <X size={14}/>
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addEarning} style={{
                    display:"flex", alignItems:"center", gap:6, padding:"8px",
                    borderRadius:8, border:"1px dashed #d1d5db",
                    background:"#f9fafb", color:"#6b7280", fontSize:12,
                    fontWeight:500, cursor:"pointer", width:"100%", justifyContent:"center",
                  }}>
                    <Plus size={13}/> Adicionar plataforma
                  </button>
                  <button onClick={handleConfirmEarnings} style={{
                    width:"100%", padding:"11px", borderRadius:10, border:"none",
                    background:"#2563eb", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer",
                  }}>
                    Próximo → Registrar Gastos
                  </button>
                </div>
              )}

              {/* EXPENSES */}
              {step==="expenses" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ fontSize:13, color:"#374151", fontWeight:600 }}>
                    📋 Você teve algum gasto hoje?
                  </div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>
                    Combustível, lavagem, manutenção...
                  </div>
                  {dayExpenses.map((e,i) => (
                    <div key={i} style={{ display:"flex", flexDirection:"column", gap:6,
                      padding:10, background:"#f9fafb", borderRadius:10, border:"1px solid #e5e7eb" }}>
                      <div style={{ display:"flex", gap:8 }}>
                        <select value={e.category}
                          onChange={ev => updateDayExpense(i, "category", ev.target.value)}
                          style={{ ...inp, flex:1 }}>
                          <option value="fuel">⛽ Combustível</option>
                          <option value="maintenance">🔧 Manutenção</option>
                          <option value="fee">📱 Taxa Plataforma</option>
                          <option value="tires">🔄 Pneus</option>
                          <option value="oil">🛢️ Óleo</option>
                          <option value="car-wash">🚿 Lavagem</option>
                          <option value="insurance">🛡️ Seguro</option>
                          <option value="other">📦 Outros</option>
                        </select>
                        <button onClick={() => setDayExpenses(p => { const next = p.filter((_,idx) => idx!==i); persist({ dayExpenses: next }); return next; })}
                          style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af" }}>
                          <X size={14}/>
                        </button>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <input type="number" placeholder="Valor" value={e.amount}
                          onChange={ev => updateDayExpense(i, "amount", ev.target.value)}
                          style={{ ...inp, flex:1 }}/>
                        <span style={{ fontSize:11, color:"#9ca3af" }}>{sym}</span>
                      </div>
                      <input placeholder="Descrição (opcional)" value={e.desc}
                        onChange={ev => updateDayExpense(i, "desc", ev.target.value)}
                        style={{ ...inp, width:"100%", fontWeight:400 }}/>
                    </div>
                  ))}
                  <button onClick={() => setDayExpenses(p => { const next = [...p, { category:"fuel", amount:"", desc:"" }]; persist({ dayExpenses: next }); return next; })} style={{
                    display:"flex", alignItems:"center", gap:6, padding:"8px",
                    borderRadius:8, border:"1px dashed #d1d5db",
                    background:"#f9fafb", color:"#6b7280", fontSize:12,
                    fontWeight:500, cursor:"pointer", width:"100%", justifyContent:"center",
                  }}>
                    <Plus size={13}/> Adicionar gasto
                  </button>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={buildSummary} style={{
                      flex:2, padding:"11px", borderRadius:10, border:"none",
                      background:"#16a34a", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
                    }}>
                      Salvar e Ver Resumo ✓
                    </button>
                    <button onClick={buildSummary} style={{
                      flex:1, padding:"11px", borderRadius:10,
                      border:"1px solid #e5e7eb", background:"#fff",
                      color:"#6b7280", fontWeight:500, fontSize:12, cursor:"pointer",
                    }}>
                      Pular
                    </button>
                  </div>
                </div>
              )}

              {/* SUMMARY */}
              {step==="summary" && summary && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12, padding:14 }}>
                    <div style={{ fontWeight:700, color:"#16a34a", fontSize:15, marginBottom:10 }}>
                      ✅ Jornada concluída!
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {[
                        { icon:"⏱", label:"Tempo ativo",  val: formatTime(summary.elapsed) },
                        { icon:"🗺", label:"Km rodados",   val: `${summary.kmDone.toFixed(1)} km` },
                        { icon:"💰", label:"Total ganho",  val: `${sym} ${summary.totalEarned.toLocaleString("pt-BR")}` },
                        { icon:"📊", label:"Por km",       val: `${sym} ${summary.perKm.toFixed(2)}` },
                        { icon:"⏰", label:"Por hora",     val: `${sym} ${summary.perHour.toFixed(2)}` },
                        { icon:"🕐", label:"Horas trab.",  val: `${summary.hours.toFixed(1)}h` },
                        { icon:"📍", label:"Km inicial",   val: `${kmStart} km` },
                        { icon:"🏁", label:"Km final",     val: `${kmEnd} km` },
                      ].map((item,i) => (
                        <div key={i} style={{ background:"#fff", borderRadius:8, padding:"8px 10px", border:"1px solid #dcfce7" }}>
                          <div style={{ fontSize:10, color:"#9ca3af", marginBottom:2 }}>{item.icon} {item.label}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{item.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GASTOS DEL DÍA */}
                  {allDayExpenses.length > 0 && (
                    <div style={{ background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12, padding:14 }}>
                      <div style={{ fontWeight:600, color:"#ea580c", fontSize:13, marginBottom:8 }}>
                        📋 Gastos do dia
                      </div>
                      {allDayExpenses.map((e,i) => (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12,
                          padding:"5px 0", borderBottom:"1px solid #fed7aa" }}>
                          <span style={{ color:"#374151" }}>{e.desc || e.description || e.category}</span>
                          <span style={{ fontWeight:600, color:"#ea580c" }}>
                            -{sym} {parseFloat(e.amount||0).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      ))}
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13,
                        fontWeight:700, marginTop:8 }}>
                        <span style={{ color:"#374151" }}>Total gastos</span>
                        <span style={{ color:"#ea580c" }}>
                          -{sym} {allDayExpenses.reduce((a,e)=>a+(parseFloat(e.amount)||0),0).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  )}

                  <button onClick={handleReset} style={{
                    padding:"10px", borderRadius:10, border:"1px solid #e5e7eb",
                    background:"#fff", color:"#374151", fontSize:13, fontWeight:500, cursor:"pointer",
                  }}>
                    Nova Jornada
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1;transform:scale(1);}
          50%{opacity:.5;transform:scale(1.3);}
        }
      `}</style>
    </div>
  );
}