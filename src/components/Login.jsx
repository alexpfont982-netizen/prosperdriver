import { useState } from "react";
import { COUNTRIES } from "../data/seed";

export default function Login({ t, lang, setLang, onLogin }) {
  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [country, setCountry]   = useState(null);
  const [currency, setCurrency] = useState("");
  const [error, setError]       = useState("");

  function handleCountryChange(code) {
    const c = COUNTRIES.find(c => c.code === code);
    if (c) { setCountry(c); setCurrency(c.symbol); setLang(c.lang); }
  }

  function handleSubmit() {
    if (!email || !password) { setError("Preencha todos os campos."); return; }
    if (mode === "register" && !name)    { setError("Informe seu nome."); return; }
    if (mode === "register" && !country) { setError("Selecione seu país."); return; }

    const users = JSON.parse(localStorage.getItem("pd_users") || "[]");

    if (mode === "register") {
      if (users.find(u => u.email === email)) { setError("Email já cadastrado."); return; }
      const newUser = {
        email, password, name,
        country: country.code,
        countryName: country.name,
        flag: country.flag,
        currency: currency || country.symbol,
        currencyCode: country.currency,
        lang: country.lang,
      };
      localStorage.setItem("pd_users", JSON.stringify([...users, newUser]));
      onLogin(newUser);
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) { setError("Email ou senha incorretos."); return; }
      onLogin(user);
    }
  }

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1px solid #e5e7eb", background: "#f9fafb",
    fontSize: 14, color: "#111827", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };

  const labels = {
    pt: { login:"Entrar", register:"Criar conta", email:"E-mail", password:"Senha", name:"Seu nome", loginTab:"Já tenho conta", registerTab:"Criar conta", welcome:"Bem-vindo ao", sub:"Controle financeiro para motoristas de app", forgot:"Esqueci minha senha", country:"País", currencyLabel:"Moeda (pode alterar)", selectCountry:"Selecione seu país..." },
    es: { login:"Entrar", register:"Registrarse", email:"Correo", password:"Contraseña", name:"Tu nombre", loginTab:"Ya tengo cuenta", registerTab:"Crear cuenta", welcome:"Bienvenido a", sub:"Control financiero para conductores de app", forgot:"Olvidé mi contraseña", country:"País", currencyLabel:"Moneda (puedes cambiarla)", selectCountry:"Selecciona tu país..." },
    en: { login:"Sign In", register:"Sign Up", email:"Email", password:"Password", name:"Your name", loginTab:"I have an account", registerTab:"Create account", welcome:"Welcome to", sub:"Financial control for rideshare drivers", forgot:"Forgot my password", country:"Country", currencyLabel:"Currency (you can change it)", selectCountry:"Select your country..." },
  };
  const l = labels[lang] || labels.pt;

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#eff6ff 0%,#f5f3ff 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif", padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* LANG */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 32 }}>
          {["pt","es","en"].map(lg => (
            <button key={lg} onClick={() => setLang(lg)} style={{
              padding: "5px 14px", borderRadius: 8, border: "1px solid",
              borderColor: lang === lg ? "#2563eb" : "#e5e7eb",
              background: lang === lg ? "#eff6ff" : "#fff",
              color: lang === lg ? "#2563eb" : "#9ca3af",
              fontWeight: 600, fontSize: 11, cursor: "pointer", textTransform: "uppercase",
            }}>
              {lg}
            </button>
          ))}
        </div>

        {/* CARD */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: 36,
          boxShadow: "0 20px 60px rgba(0,0,0,.08)", border: "1px solid #f3f4f6",
        }}>
          {/* LOGO */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 26, color: "#111827", letterSpacing: -0.5 }}>
              Prosper<span style={{ color: "#2563eb" }}>Driver</span>
            </div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>{l.sub}</div>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", background: "#f9fafb", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {["login","register"].map(m => (
              <div key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, textAlign: "center", padding: "8px", borderRadius: 8,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#111827" : "#9ca3af",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                transition: "all .2s",
              }}>
                {m === "login" ? l.loginTab : l.registerTab}
              </div>
            ))}
          </div>

          {/* FIELDS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>{l.name}</div>
                <input style={inp} placeholder="Carlos Silva" value={name} onChange={e => { setName(e.target.value); setError(""); }} />
              </div>
            )}

            {/* COUNTRY SELECTOR */}
            {mode === "register" && (
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>{l.country}</div>
                <select style={inp} value={country?.code || ""} onChange={e => handleCountryChange(e.target.value)}>
                  <option value="">{l.selectCountry}</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} — {c.currency}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CURRENCY — editable */}
            {mode === "register" && country && (
              <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>{l.currencyLabel}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...inp, width: 80, flexShrink: 0, textAlign: "center", fontWeight: 700, color: "#2563eb" }}
                    value={currency} onChange={e => setCurrency(e.target.value)} maxLength={4} />
                  <div style={{ ...inp, flex: 1, display: "flex", alignItems: "center", color: "#9ca3af", fontSize: 13 }}>
                    {country.flag} {country.name} — {country.currency}
                  </div>
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>{l.email}</div>
              <input style={inp} type="email" placeholder="carlos@email.com" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>{l.password}</div>
              <input style={inp} type="password" placeholder="••••••••" value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>

            {/* ERROR */}
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button onClick={handleSubmit} style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none",
              background: "#2563eb", color: "#fff", fontWeight: 700,
              fontSize: 15, cursor: "pointer", marginTop: 4,
              boxShadow: "0 4px 12px rgba(37,99,235,.3)",
            }}>
              {mode === "login" ? l.login : l.register}
            </button>

            {mode === "login" && (
              <div style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", cursor: "pointer" }}>
                {l.forgot}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 20 }}>
          ProsperDriver © 2025
        </div>
      </div>
    </div>
  );
}