export const SEED_INCOMES = [
  { id: 1, platform: "uber", amount: 480, rides: 18, hours: 8, date: "2025-06-01" },
  { id: 2, platform: "99", amount: 390, rides: 15, hours: 7, date: "2025-06-02" },
  { id: 3, platform: "indrive", amount: 520, rides: 20, hours: 9, date: "2025-06-03" },
  { id: 4, platform: "uber", amount: 460, rides: 17, hours: 8, date: "2025-06-04" },
  { id: 5, platform: "uber", amount: 510, rides: 19, hours: 9, date: "2025-06-05" },
  { id: 6, platform: "cabify", amount: 430, rides: 16, hours: 7, date: "2025-06-06" },
  { id: 7, platform: "99", amount: 560, rides: 21, hours: 9, date: "2025-06-07" },
  { id: 8, platform: "uber", amount: 490, rides: 18, hours: 8, date: "2025-06-08" },
];

export const SEED_EXPENSES = [
  { id: 1, category: "fuel", amount: 210, desc: "Abastecimento Shell", date: "2025-06-03" },
  { id: 2, category: "maintenance", amount: 380, desc: "Revisão óleo + filtro", date: "2025-06-05" },
  { id: 3, category: "fee", amount: 320, desc: "Taxa Uber Junho", date: "2025-06-01" },
  { id: 4, category: "car-wash", amount: 60, desc: "Lavagem completa", date: "2025-06-07" },
  { id: 5, category: "other", amount: 150, desc: "Acessórios USB", date: "2025-06-06" },
];

export const PLAT_CONFIG = {
  uber: { label: "Uber", color: "#0EA5E9" },
  "99": { label: "99", color: "#EF4444" },
  indrive: { label: "inDrive", color: "#8B5CF6" },
  cabify: { label: "Cabify", color: "#22C55E" },
};

export const CAT_CONFIG = {
  fuel: { label: "fuel", bg: "#EFF6FF", color: "#2563EB" },
  maintenance: { label: "maintenance", bg: "#FFF7ED", color: "#EA580C" },
  fee: { label: "fee", bg: "#F5F3FF", color: "#7C3AED" },
  insurance: { label: "insurance", bg: "#F0FDF4", color: "#16A34A" },
  "car-wash": { label: "carWash", bg: "#EFF6FF", color: "#0EA5E9" },
  other: { label: "other", bg: "#F9FAFB", color: "#6B7280" },
  tires: { label: "tires", bg: "#1a1a2e", color: "#6366f1" },
  oil: { label: "oil", bg: "#1c1a0e", color: "#ca8a04" },
};

export const COUNTRIES = [
  { code: "BR", name: "Brasil", flag: "🇧🇷", currency: "BRL", symbol: "R$", lang: "pt" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", currency: "COP", symbol: "$", lang: "es" },
  { code: "MX", name: "México", flag: "🇲🇽", currency: "MXN", symbol: "$", lang: "es" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", currency: "VES", symbol: "Bs.", lang: "es" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", currency: "ARS", symbol: "$", lang: "es" },
  { code: "PE", name: "Perú", flag: "🇵🇪", currency: "PEN", symbol: "S/.", lang: "es" },
  { code: "CL", name: "Chile", flag: "🇨🇱", currency: "CLP", symbol: "$", lang: "es" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", currency: "USD", symbol: "$", lang: "es" },
  { code: "US", name: "EEUU", flag: "🇺🇸", currency: "USD", symbol: "$", lang: "en" },
  { code: "ES", name: "España", flag: "🇪🇸", currency: "EUR", symbol: "€", lang: "es" },
];