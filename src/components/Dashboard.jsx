import { PLAT_CONFIG, CAT_CONFIG } from "../data/seed";

const weekDays = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom","Hj"];
const weekVals = [480,390,520,460,510,430,560,490];

export default function Dashboard({ t, incomes, expenses, isMobile, currency }) {
  const sym = currency?.symbol || "R$";
  const fmt = (n) => sym + " " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 0 });

  const gross  = incomes.reduce((a,i) => a + i.amount, 0);
  const expTot = expenses.reduce((a,e) => a + e.amount, 0);
  const net    = gross - expTot;
  const rides  = incomes.reduce((a,i) => a + i.rides, 0);
  const maxBar = Math.max(...weekVals);

  const platTotals = {};
  incomes.forEach(i => { platTotals[i.platform] = (platTotals[i.platform]||0) + i.amount; });
  const maxPlat = Math.max(...Object.values(platTotals), 1);

  const goals = [
    { label: t.grossRevenue, cur: gross, target: 6000, unit: true  },
    { label: t.netProfit,    cur: net,   target: 4000, unit: true  },
    { label: t.totalRides,   cur: rides, target: 240,  unit: false },
  ];

  const recentExp = [...expenses].reverse().slice(0, isMobile ? 3 : 5);

  const panel = {
    background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 16, padding: isMobile ? 16 : 22,
    boxShadow: "0 1px 4px rgba(0,0,0,.05)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 80 : 0 }}>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 10 : 14 }}>
        {[
          { label: t.grossRevenue,  value: fmt(gross),  badge: `12% ${t.vsLastMonth}`, up: true,  color: "#2563eb" },
          { label: t.totalExpenses, value: fmt(expTot), badge: `${fmt(210)} ${t.fuel}`, up: false, color: "#ea580c" },
          { label: t.netProfit,     value: fmt(net),    badge: `${t.margin} ${((net/Math.max(gross,1))*100).toFixed(1)}%`, up: true, color: "#16a34a" },
        ].map((k,i) => (
          <div key={i} style={{ ...panel, borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontSize: isMobile ? 9 : 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 20 : 26, color: "#111827", lineHeight: 1 }}>{k.value}</div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 10, padding: "3px 7px", borderRadius: 20, marginTop: 6,
              background: k.up ? "#f0fdf4" : "#fff7ed",
              color: k.up ? "#16a34a" : "#ea580c",
            }}>
              {k.up ? "▲" : "▼"} {k.badge}
            </div>
          </div>
        ))}
      </div>

      {/* CHART + PLATFORMS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: isMobile ? 14 : 16 }}>
        <div style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{t.weeklyRevenue}</div>
            <div style={{ fontSize: 12, color: "#2563eb", cursor: "pointer" }}>Ver tudo</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 5 : 8, height: isMobile ? 90 : 110 }}>
            {weekVals.map((v,i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                <div style={{
                  width: "100%", borderRadius: "4px 4px 0 0",
                  height: `${(v/maxBar*100)}%`,
                  background: i === weekVals.length-1 ? "linear-gradient(180deg,#2563eb,#bfdbfe)" : "linear-gradient(180deg,#93c5fd,#dbeafe)",
                  minHeight: 4,
                }} />
                <div style={{ fontSize: 8, color: "#9ca3af" }}>{weekDays[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={panel}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 16 }}>{t.byPlatform}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(platTotals).sort((a,b) => b[1]-a[1]).map(([k,v]) => {
              const c = PLAT_CONFIG[k] || { label: k, color: "#888" };
              const pct = (v/maxPlat*100).toFixed(0);
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, width: 50, flexShrink: 0, color: "#374151" }}>{c.label}</div>
                  <div style={{ flex: 1, height: 5, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: c.color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, minWidth: 60, textAlign: "right", color: "#111827" }}>{fmt(v)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EXPENSES + GOALS */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 14 : 16 }}>
        <div style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{t.lastExpenses}</div>
            <div style={{ fontSize: 12, color: "#2563eb", cursor: "pointer" }}>Ver tudo</div>
          </div>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentExp.map(e => {
                const ci = CAT_CONFIG[e.category] || { label: e.category, bg: "#f9fafb", color: "#6b7280" };
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f9fafb", borderRadius: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <span style={{ background: ci.bg, color: ci.color, borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 500 }}>{t[ci.label] || ci.label}</span>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>{e.date.slice(5).replace("-","/")}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "#ea580c", fontWeight: 700, marginLeft: 10 }}>-{sym} {e.amount}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[t.description, t.category, t.date, t.amount].map(h => (
                    <th key={h} style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, padding: "6px 8px", textAlign: "left", borderBottom: "1px solid #f3f4f6" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentExp.map(e => {
                  const ci = CAT_CONFIG[e.category] || { label: e.category, bg: "#f9fafb", color: "#6b7280" };
                  return (
                    <tr key={e.id}>
                      <td style={{ padding: "10px 8px", fontSize: 12, color: "#374151", borderBottom: "1px solid #f9fafb" }}>{e.desc}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f9fafb" }}>
                        <span style={{ background: ci.bg, color: ci.color, borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 500 }}>{t[ci.label] || ci.label}</span>
                      </td>
                      <td style={{ padding: "10px 8px", fontSize: 11, color: "#9ca3af", borderBottom: "1px solid #f9fafb" }}>{e.date.slice(5).replace("-","/")}</td>
                      <td style={{ padding: "10px 8px", fontSize: 12, color: "#ea580c", fontWeight: 600, borderBottom: "1px solid #f9fafb" }}>-{sym} {e.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={panel}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 18 }}>{t.monthlyGoals}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {goals.map((g,i) => {
              const pct = Math.min(100,(g.cur/g.target*100)).toFixed(0);
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: 13, color: "#374151" }}>{g.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                      {g.unit ? `${fmt(g.cur)} / ${fmt(g.target)}` : `${g.cur} / ${g.target}`}
                    </span>
                  </div>
                  <div style={{ height: 7, background: "#f3f4f6", borderRadius: 4, overflow: "hidden", marginBottom: 5 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#2563eb,#7c3aed)", borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{pct}% {t.goalReached}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}