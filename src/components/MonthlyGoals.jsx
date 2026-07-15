import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";

export default function MonthlyGoals({ t, incomes, expenses, isMobile, currency, profile, onUpdateGoals }) {
  const sym = currency?.symbol || "R$";
  const fmt = (n) => sym + " " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 0 });

  const gross  = incomes.reduce((a,i) => a + i.amount, 0);
  const expTot = expenses.reduce((a,e) => a + e.amount, 0);
  const net    = gross - expTot;

  const goalGross = profile?.goal_gross ?? 6000;
  const goalNet   = profile?.goal_net ?? 4000;

  const [editing, setEditing]     = useState(false);
  const [fGross, setFGross]       = useState(goalGross);
  const [fNet, setFNet]           = useState(goalNet);
  const [saving, setSaving]       = useState(false);

  function startEdit() {
    setFGross(goalGross); setFNet(goalNet);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onUpdateGoals?.({ goalGross: parseFloat(fGross) || 0, goalNet: parseFloat(fNet) || 0 });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const goals = [
    { label: t.grossRevenue, cur: gross, target: goalGross },
    { label: t.netProfit,    cur: net,   target: goalNet   },
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 180 : 0 }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>{t.grossRevenue}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>{sym}</span>
                <input style={inp} type="number" value={fGross} onChange={e => setFGross(e.target.value)} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>{t.netProfit}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>{sym}</span>
                <input style={inp} type="number" value={fNet} onChange={e => setFNet(e.target.value)} />
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
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {goals.map((g,i) => {
              const pct = Math.min(100,(g.cur/Math.max(g.target,1)*100)).toFixed(0);
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
        )}
      </div>
    </div>
  );
}