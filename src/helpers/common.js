import { clearAuth } from "./storage";

export function formatDuration(duration) {
  if (!duration || duration < 0) return "00:00";

  const totalSeconds = Math.floor(duration * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

export function formatMinutesOnly(duration) {
  if (!duration || duration <= 0) return "0 sec";

  const totalSeconds = Math.floor(duration * 60);

  // if less than 1 min → show seconds
  if (totalSeconds < 60) {
    return `${totalSeconds} ${totalSeconds === 1 ? "sec" : "secs"}`;
  }

  // otherwise show minutes
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes} ${minutes === 1 ? "min" : "mins"}`;
}


export const DateFormat = (value) => {
  if (!value) return null;

  const date = new Date(value);

  const formatted = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return formatted;
};

export function formatClockTimeMMSS(t = 0) {
  if (!Number.isFinite(t)) t = 0;

  const totalSeconds = Math.floor(t);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

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

export function formatClockTime2(
  tOrObj = 0,
  fps = 60
) {
  let time = 0;
  let frame = null;

  // ✅ support object input
  if (typeof tOrObj === "object" && tOrObj !== null) {
    time = tOrObj.time ?? 0;
    frame = tOrObj.frame ?? null;
    fps = tOrObj.fps ?? fps;
  } else {
    time = tOrObj;
  }

  if (!Number.isFinite(fps) || fps <= 0) fps = 60;

  let totalFrames;

  // 🔥 PRIORITY: frame if exists
  if (Number.isFinite(frame)) {
    totalFrames = Math.floor(frame);
  } else {
    if (!Number.isFinite(time)) time = 0;
    totalFrames = Math.floor(time * fps);
  }

  const frames = Math.floor(totalFrames % fps);
  const totalSeconds = Math.floor(totalFrames / fps);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0") +
    ":" +
    String(frames).padStart(2, "0")
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
  window.__APP_AUTH__ = null;
  window.location.replace("/"); 
}

export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength).trimEnd() + "...";
};

export const getInitials = (firstName = "", lastName = "") =>
  `${firstName.trim()[0] || ""}${lastName.trim()[0] || ""}`.toUpperCase();