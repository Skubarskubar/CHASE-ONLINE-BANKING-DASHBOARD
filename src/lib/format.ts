export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatMoney(n: number, opts?: { sign?: boolean; hidden?: boolean }) {
  if (opts?.hidden) return "$••••••";
  const abs = Math.abs(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  if (n < 0) return `−${abs}`;
  if (opts?.sign && n > 0) return `+${abs}`;
  return abs;
}

export function parseMoney(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return round2(n);
}

export function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

export function todayISO() {
  return isoDate(new Date());
}

export function formatLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatWeekday(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function formatMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function nextDue(day: number, from = new Date()) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const thisMonth = new Date(from.getFullYear(), from.getMonth(), day);
  const target = thisMonth < today ? new Date(from.getFullYear(), from.getMonth() + 1, day) : thisMonth;
  return isoDate(target);
}

export function addMonthsISO(iso: string, months: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1 + months, d || 1);
  return isoDate(dt);
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}${Date.now().toString(36).slice(-3)}`;
}

export function confirmation() {
  return `CHS${Math.floor(10000000 + Math.random() * 89999999)}`;
}

export function marketOpen(now = new Date()) {
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const mins = et.getHours() * 60 + et.getMinutes();
  return day >= 1 && day <= 5 && mins >= 9 * 60 + 30 && mins < 16 * 60;
}

export function daysUntil(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, (m || 1) - 1, d || 1);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

export const CAT_COLORS: Record<string, string> = {
  Groceries: "#117ACA",
  Dining: "#e07a3d",
  Transport: "#5b6ee1",
  Shopping: "#0f9d8a",
  Travel: "#7c5cbf",
  Entertainment: "#d94680",
  "Bills & utilities": "#64748b",
  Health: "#16a34a",
  Housing: "#b45309",
  Income: "#128842",
  Transfer: "#94a3b8",
  Payment: "#0c5ea8",
  "Loan payment": "#7c5c46",
  Zelle: "#6d28d9",
  Cash: "#52525b",
  Fees: "#b91c1c",
  Other: "#78716c",
};

export function catColor(category: string) {
  return CAT_COLORS[category] || "#78716c";
}
