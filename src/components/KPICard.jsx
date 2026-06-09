export default function KPICard({ label, value, badge, badgeUp, color }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      padding: 22,
      borderTop: `3px solid ${color}`,
      boxShadow: "0 1px 4px rgba(0,0,0,.06)",
    }}>
      <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontWeight: 700, fontSize: 28, color: "#111827", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 11, padding: "3px 9px", borderRadius: 20, marginTop: 8,
        background: badgeUp ? "#f0fdf4" : "#fff7ed",
        color: badgeUp ? "#16a34a" : "#ea580c",
      }}>
        {badgeUp ? "▲" : "▼"} {badge}
      </div>
    </div>
  );
}