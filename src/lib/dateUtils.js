// Devuelve la fecha LOCAL del dispositivo en formato YYYY-MM-DD.
// A diferencia de `date.toISOString().slice(0,10)` (que siempre da la fecha en UTC),
// esto respeta la zona horaria real del conductor — evita que una jornada cerrada
// de noche "salte" al día siguiente en los reportes.
export function getLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Igual, pero para el mes en formato YYYY-MM (usado en Metas do Mês / Relatórios)
export function getLocalMonthStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}