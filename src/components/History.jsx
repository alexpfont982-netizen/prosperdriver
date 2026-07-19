import { useState } from "react";
import { PLAT_CONFIG, CAT_CONFIG } from "../data/seed";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function History({ t, incomes, expenses, journeys = [], isMobile, currency }) {
  const [tab, setTab]       = useState("incomes");
  const [filter, setFilter] = useState("all");

  const sym = currency?.symbol || "R$";
  const fmt = (n) => sym + " " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  // ── GANANCIAS agrupadas por fecha ──
  const incomesByDate = {};
  incomes.forEach(r => {
    const d = r.date?.slice(0,10) || "—";
    if (!incomesByDate[d]) incomesByDate[d] = [];
    incomesByDate[d].push(r);
  });

  // ── GASTOS filtrados ──
  const filteredExpenses = filter === "all"
    ? expenses
    : expenses.filter(e => e.category === filter);

  // ── DATOS GRÁFICO (últimos 7 días) ──
  const last7 = [...Array(7)].map((_,i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0,10);
    const dayIncomes  = incomes.filter(r => r.date?.slice(0,10) === key);
    const dayExpenses = expenses.filter(e => e.date?.slice(0,10) === key);
    return {
      label: d.toLocaleDateString("pt-BR", { weekday:"short" }),
      income:  dayIncomes.reduce((a,r) => a + r.amount, 0),
      expense: dayExpenses.reduce((a,e) => a + e.amount, 0),
    };
  });
  const maxVal = Math.max(...last7.map(d => Math.max(d.income, d.expense)), 1);

  // ── GANHOS E DESPESAS ACUMULADOS (histórico completo) ──
  const cumulativeData = (() => {
    const dailyMap = {};
    incomes.forEach(i => {
      dailyMap[i.date] = dailyMap[i.date] || { date: i.date, income: 0, expense: 0 };
      dailyMap[i.date].income += i.amount;
    });
    expenses.forEach(e => {
      dailyMap[e.date] = dailyMap[e.date] || { date: e.date, income: 0, expense: 0 };
      dailyMap[e.date].expense += e.amount;
    });
    const sorted = Object.values(dailyMap).sort((a,b) => a.date.localeCompare(b.date));
    let cumIncome = 0, cumExpense = 0;
    return sorted.map(d => {
      cumIncome += d.income;
      cumExpense += d.expense;
      return { date: d.date.slice(5).replace("-","/"), ganancias: cumIncome, gastos: cumExpense };
    });
  })();

  const panel = {
    background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 16, padding: isMobile ? 16 : 22,
    boxShadow: "0 1px 4px rgba(0,0,0,.05)",
  };

  const categories = ["fuel","maintenance","fee","insurance","car-wash","tires","oil","other"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 180 : 0 }}>

      {/* GANHOS E DESPESAS ACUMULADOS */}
      <div style={panel}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 16 }}>
          Ganhos e Despesas Acumulados
        </div>
        {cumulativeData.length === 0 ? (
          <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>Sem dados ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
            <AreaChart data={cumulativeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Area type="monotone" dataKey="ganancias" stroke="#16a34a" strokeWidth={2} fill="url(#colorGanancias)" name={t.grossRevenue} />
              <Area type="monotone" dataKey="gastos" stroke="#ea580c" strokeWidth={2} fill="url(#colorGastos)" name={t.totalExpenses} />
            </AreaChart>
          </ResponsiveContainer>
        )}
        <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: "#6b7280" }}>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#16a34a", marginRight: 4 }} />{t.grossRevenue}</span>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#ea580c", marginRight: 4 }} />{t.totalExpenses}</span>
        </div>
      </div>

      {/* GRÁFICO EVOLUCIÓN */}
      <div style={panel}>
        <div style={{ fontWeight:600, fontSize:15, color:"#111827", marginBottom:4 }}>
          Evolução dos últimos 7 dias
        </div>
        <div style={{ display:"flex", gap:16, marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#6b7280" }}>
            <div style={{ width:10, height:10, borderRadius:2, background:"#2563eb" }}/> Ganhos
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#6b7280" }}>
            <div style={{ width:10, height:10, borderRadius:2, background:"#ea580c" }}/> Gastos
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:isMobile ? 6 : 10, height:120 }}>
          {last7.map((d,i) => (
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, height:"100%", justifyContent:"flex-end" }}>
              <div style={{ width:"100%", display:"flex", gap:2, alignItems:"flex-end", height:"100%" }}>
                {[
                  { value: d.income, gradient: "linear-gradient(180deg,#2563eb,#bfdbfe)" },
                  { value: d.expense, gradient: "linear-gradient(180deg,#ea580c,#fed7aa)" },
                ].map((bar, bi) => (
                  <div key={bi} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height:"100%", gap:3 }}>
                    {bar.value > 0 && (
                      <div style={{ fontSize:8, color:"#6b7280", fontWeight:600, whiteSpace:"nowrap" }}>
                        {fmt(bar.value)}
                      </div>
                    )}
                    <div style={{
                      width:"100%", borderRadius:"3px 3px 0 0", minHeight:3,
                      height: `${(bar.value/maxVal*100)}%`,
                      background: bar.gradient,
                    }}/>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:9, color:"#9ca3af", textAlign:"center" }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", background:"#f3f4f6", borderRadius:12, padding:4, gap:4 }}>
        {[
          { id:"incomes",  label: `💰 Ganhos (${incomes.length})` },
          { id:"expenses", label: `📋 Gastos (${expenses.length})` },
          { id:"journeys", label: `🚗 Jornadas (${journeys.length})` },
        ].map(tb => (
          <div key={tb.id} onClick={() => setTab(tb.id)} style={{
            flex:1, textAlign:"center", padding:"9px", borderRadius:9,
            fontSize:13, fontWeight:500, cursor:"pointer",
            background: tab === tb.id ? "#fff" : "transparent",
            color: tab === tb.id ? "#111827" : "#9ca3af",
            boxShadow: tab === tb.id ? "0 1px 4px rgba(0,0,0,.08)" : "none",
            transition: "all .2s",
          }}>
            {tb.label}
          </div>
        ))}
      </div>

      {/* GANANCIAS */}
      {tab === "incomes" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {Object.keys(incomesByDate).length === 0 ? (
            <div style={{ ...panel, textAlign:"center", color:"#9ca3af", padding:40 }}>
              Nenhum ganho registrado ainda.
            </div>
          ) : (
            Object.entries(incomesByDate)
              .sort((a,b) => b[0].localeCompare(a[0]))
              .map(([date, rides]) => {
                const total = rides.reduce((a,r) => a+r.amount, 0);
                const totalRides = rides.reduce((a,r) => a+(r.rides||0), 0);
                const totalHours = rides.reduce((a,r) => a+(r.hours||0), 0);
                return (
                  <div key={date} style={panel}>
                    {/* fecha header */}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14, color:"#111827" }}>
                          {new Date(date+"T12:00:00").toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long" })}
                        </div>
                        <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>
                          {totalRides > 0 && `${totalRides} corridas`}
                          {totalHours > 0 && ` · ${totalHours}h trabalhadas`}
                        </div>
                      </div>
                      <div style={{ fontWeight:700, fontSize:18, color:"#16a34a" }}>{fmt(total)}</div>
                    </div>
                    {/* plataformas */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {rides.map((r,i) => {
                        const c = PLAT_CONFIG[r.platform] || { label:r.platform, color:"#888" };
                        return (
                          <div key={i} style={{
                            display:"flex", alignItems:"center", gap:6,
                            padding:"5px 10px", borderRadius:8,
                            background:`${c.color}12`, border:`1px solid ${c.color}30`,
                          }}>
                            <div style={{ width:6, height:6, borderRadius:"50%", background:c.color }}/>
                            <span style={{ fontSize:12, fontWeight:500, color:c.color }}>{c.label}</span>
                            <span style={{ fontSize:12, color:"#374151" }}>{fmt(r.amount)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* GASTOS */}
      {tab === "expenses" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* filtro categoría */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <button onClick={() => setFilter("all")} style={{
              padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500,
              border: filter==="all" ? "1px solid #2563eb" : "1px solid #e5e7eb",
              background: filter==="all" ? "#eff6ff" : "#fff",
              color: filter==="all" ? "#2563eb" : "#6b7280", cursor:"pointer",
            }}>
              Todos
            </button>
            {categories.map(c => {
              const ci = CAT_CONFIG[c] || { label:c, color:"#888" };
              return (
                <button key={c} onClick={() => setFilter(c)} style={{
                  padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500,
                  border: filter===c ? `1px solid ${ci.color}` : "1px solid #e5e7eb",
                  background: filter===c ? `${ci.color}15` : "#fff",
                  color: filter===c ? ci.color : "#6b7280", cursor:"pointer",
                }}>
                  {t[ci.label] || ci.label}
                </button>
              );
            })}
          </div>

          {filteredExpenses.length === 0 ? (
            <div style={{ ...panel, textAlign:"center", color:"#9ca3af", padding:40 }}>
              Nenhuma despesa encontrada.
            </div>
          ) : (
            [...filteredExpenses]
              .sort((a,b) => b.date?.localeCompare(a.date))
              .map((e,i) => {
                const ci = CAT_CONFIG[e.category] || { label:e.category, bg:"#f9fafb", color:"#6b7280" };
                return (
                  <div key={i} style={{
                    ...panel,
                    display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
                  }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:"#111827", marginBottom:4 }}>{e.desc || e.description}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ background:ci.bg, color:ci.color, borderRadius:20, padding:"2px 9px", fontSize:11, fontWeight:500 }}>
                          {t[ci.label] || ci.label}
                        </span>
                        <span style={{ fontSize:11, color:"#9ca3af" }}>
                          {new Date(e.date+"T12:00:00").toLocaleDateString("pt-BR", { day:"2-digit", month:"short" })}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize:15, fontWeight:700, color:"#ea580c", flexShrink:0 }}>
                      -{fmt(e.amount)}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
      {/* JORNADAS */}
      {tab === "journeys" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {journeys.length === 0 ? (
            <div style={{ ...panel, textAlign:"center", color:"#9ca3af", padding:40 }}>
              Nenhuma jornada registrada ainda.
            </div>
          ) : (
            [...journeys]
              .sort((a,b) => b.date?.localeCompare(a.date))
              .map((j) => (
                <div key={j.id} style={panel}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:"#111827" }}>
                      {new Date(j.date+"T12:00:00").toLocaleDateString("pt-BR", { weekday:"long", day:"2-digit", month:"long" })}
                    </div>
                    <div style={{ fontWeight:700, fontSize:16, color:"#16a34a" }}>{fmt(j.total_earned)}</div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:8 }}>
                    {[
                      { label:"Tempo ativo", val: `${String(Math.floor(j.elapsed_seconds/3600)).padStart(2,"0")}:${String(Math.floor((j.elapsed_seconds%3600)/60)).padStart(2,"0")}` },
                      { label:"Km rodados",  val: `${Number(j.km_done||0).toFixed(1)} km` },
                      { label:"Por km",      val: fmt(j.per_km||0) },
                      { label:"Por hora",    val: fmt(j.per_hour||0) },
                    ].map((item,i) => (
                      <div key={i} style={{ background:"#f9fafb", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:10, color:"#9ca3af", marginBottom:2 }}>{item.label}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}