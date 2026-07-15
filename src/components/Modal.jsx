import { X } from "lucide-react";
import { PLAT_CONFIG } from "../data/seed";
import { useState } from "react";

export default function Modal({ t, onClose, onSaveIncome, onSaveExpense, defaultTab, currency }) {
  const tab = defaultTab || "income";
  const [selPlat, setSelPlat] = useState("uber");
  const [f, setF] = useState({
    amount: "", rides: "", hours: "", date: new Date().toISOString().slice(0,10),
    note: "", category: "", desc: "",
  });

  function handleSaveIncome() {
    if (!f.amount || !f.date) return;
    onSaveIncome({ platform: selPlat, amount: parseFloat(f.amount), rides: parseInt(f.rides)||0, hours: parseFloat(f.hours)||0, date: f.date });
    onClose();
  }

  function handleSaveExpense() {
    if (!f.amount || !f.date || !f.category) return;
    onSaveExpense({ category: f.category, amount: parseFloat(f.amount), desc: f.desc || "—", date: f.date });
    onClose();
  }

  const inp = {
    background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10,
    padding: "10px 13px", color: "#111827", fontFamily: "inherit",
    fontSize: 14, outline: "none", width: "100%",
  };

 const categories = ["fuel","maintenance","fee","insurance","car-wash","tires","oil","other"];
const catEmoji = { fuel:"⛽", maintenance:"🔧", fee:"📱", insurance:"🛡️", "car-wash":"🚿", tires:"🔄", oil:"🛢️", other:"📦" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 460, maxHeight: "88vh", overflow: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,.15)",
      }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#111827" }}>
              {tab === "income" ? t.registerRide : t.registerExpense}
            </div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 3 }}>
              {tab === "income" ? t.byPlatform : t.category}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb",
            background: "#f9fafb", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", color: "#6b7280",
          }}>
            <X size={16} />
          </button>
        </div>

        {tab === "income" ? (
          <div>
            {/* PLATFORMS */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                {t.platform}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(PLAT_CONFIG).map(([k, v]) => (
                  <div key={k} onClick={() => setSelPlat(k)} style={{
                    padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                    border: selPlat === k ? `1px solid ${v.color}` : "1px solid #e5e7eb",
                    background: selPlat === k ? `${v.color}18` : "#f9fafb",
                    color: selPlat === k ? v.color : "#6b7280",
                  }}>
                    {v.label}
                  </div>
                ))}
              </div>
            </div>

            {/* FIELDS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.amount.replace("R$", currency?.symbol || "R$")}</div>
                <input style={inp} type="number" placeholder="0,00" value={f.amount} onChange={e => setF(p => ({...p, amount: e.target.value}))} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.date}</div>
                <input style={inp} type="date" value={f.date} onChange={e => setF(p => ({...p, date: e.target.value}))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.rides}</div>
                <input style={inp} type="number" placeholder="0" value={f.rides} onChange={e => setF(p => ({...p, rides: e.target.value}))} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.hours}</div>
                <input style={inp} type="number" placeholder="0" step="0.5" value={f.hours} onChange={e => setF(p => ({...p, hours: e.target.value}))} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.note}</div>
              <input style={inp} placeholder={t.optional} value={f.note} onChange={e => setF(p => ({...p, note: e.target.value}))} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                {t.cancel}
              </button>
              <button onClick={handleSaveIncome} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                {t.save}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.category}</div>
              <select style={inp} value={f.category} onChange={e => setF(p => ({...p, category: e.target.value}))}>
                <option value="">—</option>
                <option value="fuel">⛽ {t.fuel}</option>
                <option value="maintenance">🔧 {t.maintenance}</option>
                <option value="fee">📱 {t.fee}</option>
                <option value="insurance">🛡️ {t.insurance}</option>
                <option value="car-wash">🚿 {t.carWash}</option>
                <option value="tires">🔄 {t.tires}</option>
                <option value="oil">🛢️ {t.oil}</option>
                <option value="other">📦 {t.other}</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.amount.replace("R$", currency?.symbol || "R$")}</div>
                <input style={inp} type="number" placeholder="0,00" value={f.amount} onChange={e => setF(p => ({...p, amount: e.target.value}))} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.date}</div>
                <input style={inp} type="date" value={f.date} onChange={e => setF(p => ({...p, date: e.target.value}))} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t.description}</div>
              <input style={inp} placeholder="Ex: Abastecimento posto X" value={f.desc} onChange={e => setF(p => ({...p, desc: e.target.value}))} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                {t.cancel}
              </button>
              <button onClick={handleSaveExpense} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#ea580c", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                {t.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}