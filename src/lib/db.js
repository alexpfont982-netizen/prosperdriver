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

// ── JORNADAS ──
export async function getJourneys(userId) {
  const { data, error } = await supabase
    .from("journeys")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addJourney(userId, journey) {
  const { data, error } = await supabase
    .from("journeys")
    .insert({
      user_id: userId,
      date: journey.date,
      started_at: journey.startedAt || null,
      ended_at: journey.endedAt || null,
      elapsed_seconds: journey.elapsed || 0,
      km_start: journey.kmStart || null,
      km_end: journey.kmEnd || null,
      km_done: journey.kmDone || 0,
      total_earned: journey.totalEarned || 0,
      per_km: journey.perKm || 0,
      per_hour: journey.perHour || 0,
      hours: journey.hours || 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJourney(id) {
  const { error } = await supabase.from("journeys").delete().eq("id", id);
  if (error) throw error;
}