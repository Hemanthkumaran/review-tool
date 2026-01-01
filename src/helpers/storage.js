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
