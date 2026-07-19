import { LayoutDashboard, PlusCircle, Receipt, BarChart2, Target, X, Menu, TrendingUp, History, FileText } from "lucide-react";
import { useDevice } from "../hooks/useDevice";
import logoMark from "../assets/logo-mark.png";
import avatarMale from "../assets/avatar-male.png";
import avatarFemale from "../assets/avatar-female.png";
import avatarNeutral from "../assets/avatar-neutral.png";


const navItems = [
  { id: "dashboard",     icon: LayoutDashboard },
  { id: "newRide",       icon: TrendingUp },
  { id: "newExpense",    icon: Receipt },
  { id: "history",       icon: History },
  { id: "reports",       icon: FileText },
  { id: "monthlyGoals",  icon: Target },
];

function avatarForGender(gender) {
  if (gender === "male")   return avatarMale;
  if (gender === "female") return avatarFemale;
  return avatarNeutral;
}

export default function Sidebar({ t, lang, setLang, activeNav, setActiveNav, onNewRide, onNewExpense, user, onLogout, mobileOpen, setMobileOpen }) {
  const { isMobile } = useDevice();

  if (isMobile && !mobileOpen) return null;

  return (
    <>
      {/* OVERLAY mobile */}
      {isMobile && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
          zIndex: 199,
        }} />
      )}

      <aside style={{
        width: 220, background: "#fff", borderRight: "1px solid #e5e7eb",
        display: "flex", flexDirection: "column", flexShrink: 0,
        height: "100vh", position: "fixed", left: 0, top: 0,
        zIndex: 200,
        transform: isMobile ? (mobileOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
        transition: "transform .3s ease",
        boxShadow: isMobile ? "4px 0 20px rgba(0,0,0,.1)" : "none",
      }}>
        {/* LOGO */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* ICONO LOGO */}
          <img
            src={logoMark}
            alt="ProsperDriver"
            style={{ width: 36, height: 36, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#111827", letterSpacing: -0.5, lineHeight: 1 }}>
              Prosper<span style={{ color: "#2563eb" }}>Driver</span>
            </div>
            <div style={{ fontSize: 9, color: "#9ca3af", letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>
              Financial Control
            </div>
          </div>
        </div>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4 }}>
            <X size={20} />
          </button>
        )}
      </div>

        {/* LANG SWITCHER */}
        <div style={{ display: "flex", gap: 6, padding: "12px 16px", borderBottom: "1px solid #e5e7eb" }}>
          {["pt", "es", "en"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              flex: 1, padding: "5px 0", borderRadius: 8, border: "1px solid",
              borderColor: lang === l ? "#2563eb" : "#e5e7eb",
              background: lang === l ? "#eff6ff" : "#fff",
              color: lang === l ? "#2563eb" : "#9ca3af",
              fontWeight: 600, fontSize: 11, cursor: "pointer", textTransform: "uppercase",
            }}>
              {l}
            </button>
          ))}
        </div>

        {/* NAV */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {navItems.map(({ id, icon: Icon }) => {
            const isAction = id === "newRide" || id === "newExpense";
            const isActive = !isAction && activeNav === id;
            return (
              <div key={id} onClick={() => {
                if (id === "newRide") onNewRide();
                else if (id === "newExpense") onNewExpense();
                else setActiveNav(id);
                if (isMobile) setMobileOpen(false);
              }} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                fontSize: 13, fontWeight: 500,
                background: isActive ? "#eff6ff" : "transparent",
                color: isActive ? "#2563eb" : "#6b7280",
                border: isActive ? "1px solid #dbeafe" : "1px solid transparent",
              }}>
                <Icon size={16} />
                {t[id] || id}
              </div>
            );
          })}
        </nav>

              {/* BANNER SIDEBAR */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb" }}>
        <div style={{
          background: "linear-gradient(135deg,#eff6ff,#f5f3ff)",
          border: "1px solid #dbeafe", borderRadius: 12,
          padding: "12px", textAlign: "center",
        }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>📢</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#2563eb", marginBottom: 2 }}>
            Publicidade
          </div>
          <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.4 }}>
            Seu anúncio aqui
          </div>
        </div>
      </div>

             {/* DRIVER */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f9fafb", borderRadius: 10, marginBottom: 8 }}>
            <img
              src={avatarForGender(user?.gender)}
              alt="avatar"
              style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
            />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "Usuário"}
              </div>
              <div style={{ fontSize: 11, color: "#22c55e" }}>● {t.online}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            width: "100%", padding: "8px", borderRadius: 8,
            border: "1px solid #fee2e2", background: "#fff5f5",
            color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            🚪 {lang === "pt" ? "Sair" : lang === "es" ? "Cerrar sesión" : "Log out"}
          </button>
        </div>
      </aside>
    </>
  );
}