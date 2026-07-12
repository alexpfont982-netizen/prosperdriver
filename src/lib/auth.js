import { supabase } from "./supabase";

// REGISTRO
export async function signUp({ email, password, name, country }) {
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

// SESION ACTIVA
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}