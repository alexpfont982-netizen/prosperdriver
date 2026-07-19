import { supabase } from "./supabase";

// REGISTRO
export async function signUp({ email, password, name, country, gender, birthDate }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        country_code: country.code,
        country_name: country.name,
        flag: country.flag,
        currency_symbol: country.symbol,
        currency_code: country.currency,
        lang: country.lang,
        gender: gender || null,
        birth_date: birthDate || null,
      },
    },
  });
  if (error) throw error;

  // El perfil ya se crea automáticamente por el trigger "on_auth_user_created"
  // (lee estos datos desde raw_user_meta_data), así que no hace falta insertarlo aquí.

  return data.user;
}

// LOGIN
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// LOGOUT
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// OBTENER PERFIL
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

// ACTUALIZAR METAS (mês e dia)
// goalGrossDay / goalNetDay: pasar null para que la meta diaria sea automática (mensual ÷ días del mes)
export async function updateGoals(userId, { goalGross, goalNet, goalGrossDay = null, goalNetDay = null }) {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      goal_gross: goalGross,
      goal_net: goalNet,
      goal_gross_day: goalGrossDay,
      goal_net_day: goalNetDay,
    })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// SESION ACTIVA
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}