import { clearAuth } from "./storage";

export function formatClockTime(t = 0) {
  const sec = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  const min = Math.floor(t / 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

export function formatRelative(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "Now";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}


export function logout() {
  clearAuth();

  // Clear in-memory state (important for React apps)
  window.__APP_AUTH__ = null;

  // Hard reload so React state, SWR cache, etc are wiped
  window.location.replace("/"); 
}
