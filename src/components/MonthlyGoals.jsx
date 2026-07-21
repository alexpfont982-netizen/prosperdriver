import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import { getLocalDateStr, getLocalMonthStr } from "../lib/dateUtils";

export default function MonthlyGoals({ t, incomes, expenses, isMobile, currency, profile, onUpdateGoals }) {
  const sym = currency?.symbol || "R$";
  const fmt = (n) => sym + " " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const now = new Date();
  const currentMonthStr = getLocalMonthStr(now); // YYYY-MM
  const todayStr = getLocalDateStr(now);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Totales del MES actual (antes sumaba todo el historial — corregido)
  const monthIncomes  = incomes.filter(i => i.date?.slice(0, 7) === currentMonthStr);
  const monthExpenses = expenses.filter(e => e.date?.slice(0, 7) === currentMonthStr);
  const grossMonth = monthIncomes.reduce((a, i) => a + i.amount, 0);
  const expMonth   = monthExpenses.reduce((a, e) => a + e.amount, 0);
  const netMonth   = grossMonth - expMonth;

  // Totales de HOY
  const todayIncomes  = incomes.filter(i => i.date === todayStr);
  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const grossDay = todayIncomes.reduce((a, i) => a + i.amount, 0);
  const expDay   = todayExpenses.reduce((a, e) => a + e.amount, 0);
  const netDay   = grossDay - expDay;

  const goalGross = profile?.goal_gross ?? 6000;
  const goalNet   = profile?.goal_net ?? 4000;

  const autoGoalGrossDay = goalGross / daysInMonth;
  const autoGoalNetDay   = goalNet / daysInMonth;

  const goalGrossDayEffective = profile?.goal_gross_day ?? autoGoalGrossDay;
  const goalNetDayEffective   = profile?.goal_net_day ?? autoGoalNetDay;

  const [editing, setEditing]           = useState(false);
  const [fGross, setFGross]             = useState(goalGross);
  const [fNet, setFNet]                 = useState(goalNet);
  const [fGrossDay, setFGrossDay]       = useState(goalGrossDayEffective);
  const [fNetDay, setFNetDay]           = useState(goalNetDayEffective);
  const [autoGrossDay, setAutoGrossDay] = useState(profile?.goal_gross_day == null);
  const [autoNetDay, setAutoNetDay]     = useState(profile?.goal_net_day == null);
  const [saving, setSaving]             = useState(false);

  function startEdit() {
    setFGross(goalGross); setFNet(goalNet);
    setFGrossDay(goalGrossDayEffective); setFNetDay(goalNetDayEffective);
    setAutoGrossDay(profile?.goal_gross_day == null);
    setAutoNetDay(profile?.goal_net_day == null);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onUpdateGoals?.({
        goalGross: parseFloat(fGross) || 0,
        goalNet: parseFloat(fNet) || 0,
        goalGrossDay: autoGrossDay ? null : (parseFloat(fGrossDay) || 0),
        goalNetDay: autoNetDay ? null : (parseFloat(fNetDay) || 0),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const monthlyGoalsList = [
    { label: t.grossRevenue, cur: grossMonth, target: goalGross },
    { label: t.netProfit,    cur: netMonth,   target: goalNet   },
  ];
  const dailyGoalsList = [
    { label: t.grossRevenue, cur: grossDay, target: goalGrossDayEffective },
    { label: t.netProfit,    cur: netDay,   target: goalNetDayEffective   },
  ];

  const panel = {
    background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 16, padding: isMobile ? 16 : 22,
    boxShadow: "0 1px 4px rgba(0,0,0,.05)",
  };

  const inp = {
    background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10,
    padding: "8px 12px", color: "#111827", fontFamily: "inherit",
    fontSize: 14, outline: "none", width: 120,
  };

  function renderProgress(list) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {list.map((g, i) => {
          const pct = Math.min(100, (g.cur / Math.max(g.target, 1) * 100)).toFixed(0);
          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{g.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                  {fmt(g.cur)} / {fmt(g.target)}
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
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 180 : 0 }}>

      {/* METAS DO MÊS + FORMULARIO DE EDICIÓN (mês e dia juntos) */}
      <div style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>{t.monthlyGoals}</div>
          {!editing && (
            <button onClick={startEdit} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8, border: "1px solid #e5e7eb",
              background: "#f9fafb", color: "#374151", fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}>
              <Pencil size={13} /> {t.editGoals}
            </button>
          )}
        </div>

        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* METAS DO MÊS */}
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>
                {t.grossRevenue} · {t.monthlyGoals}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>{sym}</span>
                <input style={inp} type="number" value={fGross} onChange={e => setFGross(e.target.value)} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>
                {t.netProfit} · {t.monthlyGoals}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>{sym}</span>
                <input style={inp} type="number" value={fNet} onChange={e => setFNet(e.target.value)} />
              </div>
            </div>

            <div style={{ height: 1, background: "#e5e7eb", margin: "2px 0" }} />

            {/* METAS DO DIA */}
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.dailyGoals}</div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{t.grossRevenue} · {t.dailyGoals}</span>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280", cursor: "pointer" }}>
                  <input type="checkbox" checked={autoGrossDay} onChange={e => setAutoGrossDay(e.target.checked)} />
                  {t.automaticGoal}
                </label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>{sym}</span>
                <input
                  style={{ ...inp, opacity: autoGrossDay ? 0.6 : 1 }}
                  type="number"
                  disabled={autoGrossDay}
                  value={autoGrossDay ? (parseFloat(fGross || 0) / daysInMonth).toFixed(2) : fGrossDay}
                  onChange={e => setFGrossDay(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{t.netProfit} · {t.dailyGoals}</span>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280", cursor: "pointer" }}>
                  <input type="checkbox" checked={autoNetDay} onChange={e => setAutoNetDay(e.target.checked)} />
                  {t.automaticGoal}
                </label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>{sym}</span>
                <input
                  style={{ ...inp, opacity: autoNetDay ? 0.6 : 1 }}
                  type="number"
                  disabled={autoNetDay}
                  value={autoNetDay ? (parseFloat(fNet || 0) / daysInMonth).toFixed(2) : fNetDay}
                  onChange={e => setFNetDay(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditing(false)} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb",
                background: "#fff", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <X size={14} /> Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: "10px", borderRadius: 10, border: "none",
                background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: 13,
                cursor: saving ? "not-allowed" : "pointer", opacity: saving ? .7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <Check size={14} /> {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        ) : (
          renderProgress(monthlyGoalsList)
        )}
      </div>

      {/* METAS DO DIA — solo visible fuera del modo edición */}
      {!editing && (
        <div style={panel}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 18 }}>{t.dailyGoals}</div>
          {renderProgress(dailyGoalsList)}
        </div>
      )}
    </div>
  );
}