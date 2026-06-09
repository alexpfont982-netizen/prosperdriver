import { supabase } from "./supabase";

// ── CORRIDAS ──
export async function getRides(userId) {
  const { data, error } = await supabase
    .from("rides")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addRide(userId, ride) {
  const { data, error } = await supabase
    .from("rides")
    .insert({
      user_id: userId,
      platform: ride.platform,
      amount: ride.amount,
      rides_count: ride.rides || 0,
      hours: ride.hours || 0,
      date: ride.date,
      note: ride.note || "",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRide(id) {
  const { error } = await supabase.from("rides").delete().eq("id", id);
  if (error) throw error;
}

// ── GASTOS ──
export async function getExpenses(userId) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addExpense(userId, expense) {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: userId,
      category: expense.category,
      amount: expense.amount,
      description: expense.desc || expense.description || "",
      date: expense.date,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}