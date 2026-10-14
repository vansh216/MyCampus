const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "20 Nov"
export const formatDay = (d) => {
  const x = new Date(d);
  return `${x.getDate()} ${MONTHS[x.getMonth()]}`;
};

// "11:59 pm"
export const formatTime = (d) => {
  const x = new Date(d);
  const hours = x.getHours() % 12 || 12;
  const minutes = String(x.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes} ${x.getHours() < 12 ? "am" : "pm"}`;
};

// "20 Nov, 11:59 pm"
export const formatDayTime = (d) => `${formatDay(d)}, ${formatTime(d)}`;

// "20 Nov", "20\u201321 Nov" or "30 Nov \u2013 2 Dec"
export function formatRange(start, end) {
  const s = new Date(start);
  if (!end) return formatDay(s);

  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) return formatDay(s);

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}\u2013${formatDay(e)}`;
  }
  return `${formatDay(s)} \u2013 ${formatDay(e)}`;
}

export function monthKey(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
}

export const monthLabel = (d) =>
  new Date(d).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

// ISO string from the API -> value for <input type="datetime-local">
export function toInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// value from <input type="datetime-local"> -> ISO string for the API, or null
export function fromInputValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}