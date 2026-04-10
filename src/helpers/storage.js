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
    return JSON.parse(sessionStorage.getItem(constants.GUEST_KEY));
  } catch {
    return null;
  }
}

export function setGuestIdentity(data) {
  try {
    if (!data) {
      sessionStorage.removeItem(constants.GUEST_KEY);
      return;
    }

    sessionStorage.setItem(constants.GUEST_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to persist guest identity", e);
  }
}

export function getReviewerPassword(projectId) {
  if (!projectId) return null;

  try {
    return sessionStorage.getItem(
      `${constants.REVIEWER_PASSWORD_KEY}_${projectId}`
    );
  } catch {
    return null;
  }
}

export function setReviewerPassword(projectId, password) {
  if (!projectId) return;

  try {
    const key = `${constants.REVIEWER_PASSWORD_KEY}_${projectId}`;

    if (!password) {
      sessionStorage.removeItem(key);
      return;
    }

    sessionStorage.setItem(key, password);
  } catch (e) {
    console.error("Failed to persist reviewer password", e);
  }
}

export function clearAuth() {
  try {
    localStorage.clear();
    sessionStorage.removeItem(constants.GUEST_KEY);

    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(`${constants.REVIEWER_PASSWORD_KEY}_`)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error("Failed to clear auth", e);
  }
}
