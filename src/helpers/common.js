import { clearAuth } from "./storage";

// export function formatClockTime(t = 0) {
//   const sec = Math.floor(t % 60)
//     .toString()
//     .padStart(2, "0");
//   const min = Math.floor(t / 60)
//     .toString()
//     .padStart(2, "0");
//   return `${min}:${sec}`;
// }
export function formatClockTime(t = 0) {
  if (!Number.isFinite(t)) t = 0;

  const totalMs = Math.floor(t * 1000);

  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const ms = Math.floor((totalMs % 1000) / 10); // 2-digit centiseconds (00–99)

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0") +
    "." +
    String(ms).padStart(2, "0")
  );
}

export function formatRelative(date) {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  const diffSeconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (diffSeconds < 60) return "Now";

  const mins = Math.floor(diffSeconds / 60);
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}



export function logout() {
  clearAuth();

  // Clear in-memory state (important for React apps)
  window.__APP_AUTH__ = null;

  // Hard reload so React state, SWR cache, etc are wiped
  window.location.replace("/"); 
}
