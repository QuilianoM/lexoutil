export type SubscriptionStatus = "free" | "pro";

const USER_ID_KEY = "lexoutil_user_id_v1";
const SUB_STATUS_KEY = "lexoutil_sub_status_v1";

function randomId() {
  return (
    Date.now().toString(16) +
    "_" +
    Math.random().toString(16).slice(2) +
    "_" +
    Math.random().toString(16).slice(2)
  );
}

export function getLocalUserId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = randomId();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getSubscriptionStatus(): SubscriptionStatus {
  if (typeof window === "undefined") return "free";
  const v = localStorage.getItem(SUB_STATUS_KEY);
  return v === "pro" ? "pro" : "free";
}

export function setSubscriptionStatus(status: SubscriptionStatus) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUB_STATUS_KEY, status);
}

export function isPro(): boolean {
  return getSubscriptionStatus() === "pro";
}
