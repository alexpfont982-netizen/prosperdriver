import { useState } from "react";
import { useTranslation } from "./i18n/useTranslation";
import { SEED_INCOMES, SEED_EXPENSES } from "./data/seed";
import { useDevice } from "./hooks/useDevice";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Modal from "./components/Modal";
import Login from "./components/Login";
import { Menu } from "lucide-react";

export default function App() {
  const { t, lang, setLang, currency, setCurrency, setCountry } = useTranslation();
  const { isMobile }                = useDevice();
  const [user, setUser]             = useState(null);
  const [incomes, setIncomes]       = useState(SEED_INCOMES);
  const [expenses, setExpenses]     = useState(SEED_EXPENSES);
  const [modal, setModal]           = useState(null);
  const [activeNav, setActiveNav]   = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast]           = useState(false);
  const [toastMsg, setToastMsg]     = useState("");

  function showToast(msg) {
    setToastMsg(msg); setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  function handleLogin(userData) {
    setUser(userData);
    // Aplicar moneda y idioma del usuario registrado
    if (userData.currency) setCurrency({ code: userData.currencyCode, symbol: userData.currency });
    if (userData.lang)     setLang(userData.lang);
    showToast("✓ " + (userData.lang === "pt" ? "Bem-vindo!" : userData.lang === "es" ? "¡Bienvenido!" : "Welcome!") + " " + userData.name);
  }

  function handleLogout() { setUser(null); }

  function handleSaveIncome(data) {
    setIncomes(p => [...p, { id: Date.now(), ...data }]);
    showToast("✓ " + t.registerRide);
  }

  function handleSaveExpense(data) {
    setExpenses(p => [...p, { id: Date.now(), ...data }]);
    showToast("✓ " + t.registerExpense);
  }

  if (!user) {
    return (
      <>
        <Login
          t={t} lang={lang} setLang={setLang}
          onLogin={handleLogin}
          setCountry={setCountry}
        />
        <div style={{
          position: "fixed", bottom: 24, right: 24,
          background: "#111827", borderRadius: 12, padding: "12px 20px",
          fontSize: 13, color: "#fff", zIndex: 2000,
          boxShadow: "0 8px 24px rgba(0,0,0,.2)",
          transform: toast ? "translateY(0)" : "translateY(80px)",
          opacity: toast ? 1 : 0, transition: "all .35s cubic-bezier(.16,1,.3,1)",
        }}>
          {toastMsg}
        </div>
      </>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* SIDEBAR */}
      <Sidebar
        t={t} lang={lang} setLang={setLang}
        activeNav={activeNav} setActiveNav={setActiveNav}
        onNewRide={() => setModal("income")}
        onNewExpense={() => setModal("expense")}
        user={user} onLogout={handleLogout}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
        currency={currency} setCurrency={setCurrency}
      />

      {/* MAIN */}
      <main style={{
        marginLeft: isMobile ? 0 : 220,
        flex: 1, padding: isMobile ? "16px" : "32px 36px",
        overflow: "auto", minWidth: 0,
      }}>
        {/* TOPBAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 16 : 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button onClick={() => setMobileOpen(true)} style={{
                background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: 10, padding: "8px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Menu size={20} color="#374151" />
              </button>
            )}
            <div>
              <h1 style={{ fontWeight: 700, fontSize: isMobile ? 20 : 24, color: "#111827", margin: 0 }}>
                {t.dashboard}
              </h1>
              {!isMobile && (
                <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 3 }}>
                  {user.flag} {user.countryName} — {currency.symbol} {currency.code}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {!isMobile && (
              <button onClick={() => setModal("expense")} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 16px",
                borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff",
                color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}>
                + {t.newExpense}
              </button>
            )}
            <button onClick={() => setModal("income")} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: isMobile ? "9px 14px" : "9px 16px",
              borderRadius: 10, border: "none", background: "#2563eb",
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              + {isMobile ? t.newRide.split(" ")[0] : t.newRide}
            </button>
          </div>
        </div>

        {/* DASHBOARD */}
        <Dashboard
          t={t} incomes={incomes} expenses={expenses}
          isMobile={isMobile} currency={currency}
        />
      </main>

      {/* BOTTOM NAV mobile */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "#fff", borderTop: "1px solid #e5e7eb",
          display: "flex", zIndex: 100,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {[
            { label: t.dashboard,  icon: "🏠", action: () => setActiveNav("dashboard") },
            { label: t.newRide,    icon: "🚗", action: () => setModal("income") },
            { label: t.newExpense, icon: "📋", action: () => setModal("expense") },
            { label: "Menu",       icon: "☰",  action: () => setMobileOpen(true) },
          ].map((item, i) => (
            <button key={i} onClick={item.action} style={{
              flex: 1, padding: "12px 4px 10px", border: "none", background: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              cursor: "pointer", fontSize: 18,
            }}>
              <span>{item.icon}</span>
              <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 500 }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <Modal
          t={t} defaultTab={modal}
          onClose={() => setModal(null)}
          onSaveIncome={handleSaveIncome}
          onSaveExpense={handleSaveExpense}
          currency={currency}
        />
      )}

      {/* TOAST */}
      <div style={{
        position: "fixed", bottom: isMobile ? 80 : 24, right: 24,
        background: "#111827", borderRadius: 12, padding: "12px 20px",
        fontSize: 13, color: "#fff", zIndex: 2000,
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        transform: toast ? "translateY(0)" : "translateY(80px)",
        opacity: toast ? 1 : 0, transition: "all .35s cubic-bezier(.16,1,.3,1)",
      }}>
        {toastMsg}
      </div>
    </div>
  );
}