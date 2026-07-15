import { useState, useEffect } from "react";
import { useTranslation } from "./i18n/useTranslation";
import { useDevice } from "./hooks/useDevice";
import { supabase } from "./lib/supabase";
import { signIn, signUp, signOut, getProfile, updateGoals } from "./lib/auth";
import { getRides, addRide, getExpenses, addExpense, getJourneys, addJourney } from "./lib/db";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Modal from "./components/Modal";
import Login from "./components/Login";
import WorkTimer from "./components/WorkTimer";
import { Menu } from "lucide-react";
import History from "./components/History";
import MonthlyGoals from "./components/MonthlyGoals";

export default function App() {
  const { t, lang, setLang, currency, setCurrency } = useTranslation();
  const { isMobile } = useDevice();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [modal, setModal] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [view, setView] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  function showToast(msg) {
    setToastMsg(msg); setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUser(session.user);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadUser(session.user);
      else { setUser(null); setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadUser(authUser) {
    try {
      const prof = await getProfile(authUser.id);
      setUser(authUser);
      setProfile(prof);
      setCurrency({ code: prof.currency_code, symbol: prof.currency_symbol });
      setLang(prof.lang);
      const [ridesData, expensesData, journeysData] = await Promise.all([
        getRides(authUser.id),
        getExpenses(authUser.id),
        getJourneys(authUser.id),
      ]);
      setIncomes(ridesData.map(r => ({ ...r, rides: r.rides_count })));
      setExpenses(expensesData.map(e => ({ ...e, desc: e.description })));
      setJourneys(journeysData);
      setIncomes(ridesData.map(r => ({ ...r, rides: r.rides_count })));
      setExpenses(expensesData.map(e => ({ ...e, desc: e.description })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin({ email, password }) {
    try {
      await signIn({ email, password });
      showToast("✓ Bem-vindo!");
    } catch (err) { throw err; }
  }

  async function handleRegister({ email, password, name, country, currency: curr, gender, birthDate }) {
    try {
      await signUp({ email, password, name, country, gender, birthDate });
      showToast("✓ Conta criada!");
    } catch (err) { throw err; }
  }

  async function handleLogout() {
    await signOut();
    setUser(null); setProfile(null);
    setIncomes([]); setExpenses([]);
  }

  async function handleSaveIncome(data) {
    try {
      console.log("Salvando corrida:", data);
      const saved = await addRide(user.id, data);
      console.log("Salvo:", saved);
      setIncomes(p => [{ ...saved, rides: saved.rides_count }, ...p]);
      showToast("✓ " + t.registerRide);
    } catch (err) {
      console.error("Erro:", err);
      showToast("❌ Erro ao salvar");
    }
  }

  async function handleSaveExpense(data) {
    try {
      const saved = await addExpense(user.id, data);
      setExpenses(p => [{ ...saved, desc: saved.description }, ...p]);
      showToast("✓ " + t.registerExpense);
    } catch (err) { showToast("❌ Erro ao salvar"); }
  }

  async function handleSaveJourney(data) {
  try {
    const saved = await addJourney(user.id, data);
    setJourneys(p => [saved, ...p]);
  } catch (err) {
    console.error("Erro ao salvar jornada:", err);

    async function handleUpdateGoals({ goalGross, goalNet }) {
  try {
    const updated = await updateGoals(user.id, { goalGross, goalNet });
    setProfile(updated);
  } catch (err) {
    console.error("Erro ao salvar metas:", err);
  }
}
  }
}

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 24, color: "#111827" }}>Prosper<span style={{ color: "#2563eb" }}>Driver</span></div>
        <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>Carregando...</div>
      </div>
    </div>
  );

  if (!user) return (
    <>
      <Login t={t} lang={lang} setLang={setLang} onLogin={handleLogin} onRegister={handleRegister} />
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Sidebar
        t={t} lang={lang} setLang={setLang}
        activeNav={activeNav} setActiveNav={(id) => { setActiveNav(id); setView(id); }}
        onNewRide={() => setModal("income")}
        onNewExpense={() => setModal("expense")}
        user={profile} onLogout={handleLogout}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
        currency={currency} setCurrency={setCurrency}
      />

      <main style={{ marginLeft: isMobile ? 0 : 220, flex: 1, padding: isMobile ? "16px" : "32px 36px", overflow: "auto", minWidth: 0 }}>

        {/* TOPBAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 16 : 28 }}>

          {/* IZQUIERDA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button onClick={() => setMobileOpen(true)} style={{
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
                padding: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Menu size={20} color="#374151" />
              </button>
            )}
            <div>
              <h1 style={{ fontWeight: 700, fontSize: isMobile ? 20 : 24, color: "#111827", margin: 0 }}>
                {isMobile ? "ProsperDriver" : t.dashboard}
              </h1>
              {!isMobile && (
                <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 3 }}>
                  {profile?.flag} {profile?.country_name} — {currency.symbol} {currency.code}
                </p>
              )}
            </div>
          </div>

          {/* DERECHA */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            <WorkTimer
              isMobile={isMobile}
              incomes={incomes}
              expenses={expenses}
              currency={currency}
              onSaveIncome={handleSaveIncome}
              onSaveExpense={handleSaveExpense}
            />
          </div>
        </div> 

        {view === "dashboard" && (
          <Dashboard t={t} incomes={incomes} expenses={expenses} isMobile={isMobile} currency={currency} />
        )}
        {view === "history" && (
          <History t={t} incomes={incomes} expenses={expenses} isMobile={isMobile} currency={currency} />
        )}
        {view === "monthlyGoals" && (
          <MonthlyGoals t={t} incomes={incomes} expenses={expenses} isMobile={isMobile} currency={currency} />
        )}
      </main>

      {/* BANNER PUBLICITARIO MOBILE */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 64, left: 0, right: 0,
          background: "#fff", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          height: 60, zIndex: 99, padding: "0 12px",
        }}>
          <div style={{
            width: "100%", maxWidth: 320, height: 50,
            background: "#f9fafb", border: "1px dashed #d1d5db",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>📢 Publicidade</span>
          </div>
        </div>
      )}

      {/* BOTTOM NAV mobile */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "#fff", borderTop: "1px solid #e5e7eb",
          display: "flex", zIndex: 100,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {[
            { label: t.dashboard, icon: "🏠", action: () => { setActiveNav("dashboard"); setView("dashboard"); } },
            { label: t.newRide, icon: "🚗", action: () => setModal("income") },
            { label: t.newExpense, icon: "📋", action: () => setModal("expense") },
            { label: t.history, icon: "🕐", action: () => { setActiveNav("history"); setView("history"); } },
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

      {modal && (
        <Modal t={t} defaultTab={modal} onClose={() => setModal(null)}
          onSaveIncome={handleSaveIncome} onSaveExpense={handleSaveExpense} currency={currency} />
      )}

      <div style={{
        position: "fixed", bottom: isMobile ? 140 : 24, right: 24,
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