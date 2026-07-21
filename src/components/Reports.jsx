import { getLocalDateStr } from "../lib/dateUtils";

const LOCALE_MAP = { es: "es-ES", pt: "pt-BR", en: "en-US" };

export default function Reports({ t, lang, journeys = [], expenses = [], isMobile, currency }) {
  const locale = LOCALE_MAP[lang] || "pt-BR";
  const sym = currency?.symbol || "R$";
  const fmt = (n) => sym + " " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  // Solo los últimos 3 meses
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const cutoff = getLocalDateStr(threeMonthsAgo);
  const recentJourneys = journeys.filter(j => j.date >= cutoff);

  // Agrupar por mes (YYYY-MM)
  const byMonth = {};
  recentJourneys.forEach(j => {
    const monthKey = j.date?.slice(0, 7);
    if (!monthKey) return;
    if (!byMonth[monthKey]) byMonth[monthKey] = [];
    byMonth[monthKey].push(j);
  });
  const months = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

  function expensesForDate(date) {
    return expenses
      .filter(e => e.date === date)
      .reduce((a, e) => a + Number(e.amount || 0), 0);
  }

  const panel = {
    background: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 16, padding: isMobile ? 16 : 22,
    boxShadow: "0 1px 4px rgba(0,0,0,.05)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 20, paddingBottom: isMobile ? 180 : 0 }}>

      <div style={{ fontSize: 12, color: "#9ca3af" }}>
        {t.reportsSubtitle}
      </div>

      {months.length === 0 ? (
        <div style={{ ...panel, textAlign: "center", color: "#9ca3af", padding: 40 }}>
          {t.noReports}
        </div>
      ) : (
        months.map(monthKey => {
          const monthJourneys   = [...byMonth[monthKey]].sort((a, b) => b.date.localeCompare(a.date));
          const monthTotalEarned = monthJourneys.reduce((a, j) => a + Number(j.total_earned || 0), 0);
          const monthTotalKm     = monthJourneys.reduce((a, j) => a + Number(j.km_done || 0), 0);
          const monthTotalHours  = monthJourneys.reduce((a, j) => a + Number(j.hours || 0), 0);
          const daysWorked       = monthJourneys.length;
          const avgKmPerDay      = daysWorked > 0 ? monthTotalKm / daysWorked : 0;
          const avgHoursPerDay   = daysWorked > 0 ? monthTotalHours / daysWorked : 0;
          const avgPerKm         = monthTotalKm > 0 ? monthTotalEarned / monthTotalKm : 0;
          const avgPerHour       = monthTotalHours > 0 ? monthTotalEarned / monthTotalHours : 0;
          const monthLabel = new Date(monthKey + "-02T12:00:00").toLocaleDateString(locale, { month: "long", year: "numeric" });

          return (
            <div key={monthKey} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* HEADER DE MES */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", textTransform: "capitalize" }}>
                  {monthLabel}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  {monthJourneys.length} {monthJourneys.length === 1 ? t.journeyShort.toLowerCase() : t.journeyShort.toLowerCase() + "s"}
                </div>
              </div>

              {/* RESUMEN DEL MES */}
              <div style={{ ...panel, display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>{t.grossRevenue}</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#16a34a" }}>{fmt(monthTotalEarned)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>Km</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>{monthTotalKm.toFixed(1)} km</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>{t.hours}</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>{monthTotalHours.toFixed(1)}h</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>{t.avgKmDay}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{avgKmPerDay.toFixed(1)} km</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>{t.avgHoursDay}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{avgHoursPerDay.toFixed(1)}h</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>{t.perKm} / {t.perHour}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#2563eb" }}>{fmt(avgPerKm)} · {fmt(avgPerHour)}</div>
                </div>
              </div>

              {/* REPORTES DIARIOS DEL MES */}
              {monthJourneys.map(j => {
                const dayExpTotal = expensesForDate(j.date);
                const net = Number(j.total_earned || 0) - dayExpTotal;
                return (
                  <div key={j.id} style={panel}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                        {new Date(j.date + "T12:00:00").toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "long" })}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: net >= 0 ? "#16a34a" : "#ea580c" }}>
                        {fmt(net)}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(6,1fr)", gap: 8 }}>
                      {[
                        { label: t.grossRevenue,  val: fmt(j.total_earned || 0) },
                        { label: t.totalExpenses, val: fmt(dayExpTotal) },
                        { label: "Km",            val: `${Number(j.km_done || 0).toFixed(1)} km` },
                        { label: t.hours,         val: `${Number(j.hours || 0).toFixed(1)}h` },
                        { label: t.perKm,         val: fmt(j.per_km || 0) },
                        { label: t.perHour,       val: fmt(j.per_hour || 0) },
                      ].map((item, i) => (
                        <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{item.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}