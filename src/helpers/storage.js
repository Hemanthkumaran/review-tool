import { constants } from "./enum";

export function getAuthToken() {
  try {
    return localStorage.getItem(constants.AUTH_TOKEN);
  } catch {
    return null;
  }
}

export function getGuestIdentity() {
  try {
    return JSON.parse(localStorage.getItem(constants.GUEST_KEY));
  } catch {
    return null;
  }
}

export function setGuestIdentity(data) {
  localStorage.setItem(constants.GUEST_KEY, JSON.stringify(data));
}

export function clearAuth() {
  try {
    localStorage.removeItem(constants.AUTH_TOKEN);
    localStorage.removeItem(constants.GUEST_KEY);

    // optional: clear other session scoped values
    localStorage.removeItem("lastProjectId");
    localStorage.removeItem("activeVersionId");
  } catch (e) {
    console.error("Failed to clear auth", e);
  }
}