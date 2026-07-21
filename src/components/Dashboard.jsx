import { useState, useEffect, useRef } from "react";
import { PLAT_CONFIG, CAT_CONFIG } from "../data/seed";
import { getLocalDateStr } from "../lib/dateUtils";

const LOCALE_MAP = { es: "es-ES", pt: "pt-BR", en: "en-US" };

// Dispara `inView = true` la primera vez que el elemento entra en pantalla, y no vuelve a cambiar
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

export default function Dashboard({ t, lang, incomes, expenses, isMobile, currency }) {
  const locale = LOCALE_MAP[lang] || "pt-BR";
  const sym = currency?.symbol || "R$";
  const fmt = (n) => sym + " " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const todayStr = getLocalDateStr();
  const todayIncomes  = incomes.filter(i => i.date === todayStr);
  const todayExpenses = expenses.filter(e => e.date === todayStr);

  const gross  = todayIncomes.reduce((a,i) => a + i.amount, 0);
  const expTot = todayExpenses.reduce((a,e) => a + e.amount, 0);
  const net    = gross - expTot;
  const rides  = todayIncomes.reduce((a,i) => a + i.rides, 0);

  const [evoRef, evoInView] = useInView();

  // EVOLUÇÃO DOS ÚLTIMOS 7 DIAS (ganhos vs gastos, movido desde Histórico)
  const last7 = [...Array(7)].map((_,i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = getLocalDateStr(d);
    const dayIncomes  = incomes.filter(r => r.date === key);
    const dayExpenses = expenses.filter(e => e.date === key);
    return {
      label: d.toLocaleDateString(locale, { weekday: "short" }),
      income:  dayIncomes.reduce((a,r) => a + r.amount, 0),
      expense: dayExpenses.reduce((a,e) => a + e.amount, 0),
    };
  });
  const maxVal = Math.max(...last7.map(d => Math.max(d.income, d.expense)), 1);

  // POR PLATAFORMA (somente hoje)
  const platTotals = {};
  todayIncomes.forEach(i => { platTotals[i.platform] = (platTotals[i.platform]||0) + i.amount; });
  const maxPlat = Math.max(...Object.values(platTotals), 1);

  // NOTA: `expenses` ya viene ordenado del más reciente al más antiguo
  // (cada gasto nuevo se agrega al inicio del arreglo en App.jsx), así que
  // tomamos los primeros N directamente — sin invertir el orden.
  const recentExp = expenses.slice(0, isMobile ? 3 : 5);

  const panel = {
    background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 16, padding: isMobile ? 16 : 22,
    boxShadow: "0 1px 4px rgba(0,0,0,.05)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 180 : 0 }}>

      {/* KPIs — SOMENTE HOJE */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 10 : 14 }}>
        
         {[
          { label: t.grossRevenue,  value: fmt(gross),  badge: gross > 0 ? `${rides} ${t.totalRides}` : t.vsLastMonth, up: true,  color: "#2563eb" },
          { label: t.totalExpenses, value: fmt(expTot), badge: expTot > 0 ? `${todayExpenses.length} lançamentos` : "—", up: false, color: "#ea580c" },
          { label: t.netProfit,     value: fmt(net),    badge: `${t.margin} ${((net/Math.max(gross,1))*100).toFixed(1)}%`, up: net >= 0, color: "#16a34a" },
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
        <div ref={evoRef} style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>Evolução dos últimos 7 dias</div>
          </div>
          <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "#2563eb" }} /> {t.grossRevenue}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "#ea580c" }} /> {t.totalExpenses}
            </div>
          </div>
          {last7.every(d => d.income === 0 && d.expense === 0) ? (
            <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "30px 0" }}>Sem dados ainda</div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 5 : 8, height: isMobile ? 100 : 120 }}>
              {last7.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: "100%" }}>
                    {[
                      { value: d.income, gradient: "linear-gradient(180deg,#2563eb,#bfdbfe)" },
                      { value: d.expense, gradient: "linear-gradient(180deg,#ea580c,#fed7aa)" },
                    ].map((bar, bi) => (
                      <div key={bi} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 3 }}>
                        {bar.value > 0 && (
                          <div style={{ fontSize: 9, color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>
                            {fmt(bar.value)}
                          </div>
                        )}
                        <div style={{
                          width: "100%", borderRadius: bar.value > 0 ? "3px 3px 0 0" : 0, minHeight: evoInView ? 3 : 0,
                          height: evoInView ? `${(bar.value / maxVal * 100)}%` : "0%",
                          background: bar.gradient,
                          transition: `height .875s cubic-bezier(.16,1,.3,1) ${(i * 0.075) + (bi * 0.0375)}s`,
                        }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 8, color: "#9ca3af" }}>{d.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={panel}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 16 }}>{t.byPlatform}</div>
          {Object.keys(platTotals).length === 0 ? (
            <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>Sem dados ainda</div>
          ) : (
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
          )}
        </div>
      </div>

      {/* EXPENSES */}
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
    </div>
  );
}