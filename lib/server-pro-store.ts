import fs from "fs";
import path from "path";

type Store = Record<string, { status: "free" | "pro"; updatedAt: number }>;

const STORE_PATH = path.join(process.cwd(), ".data", "pro-store.json");

function ensureStoreFile() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) fs.writeFileSync(STORE_PATH, JSON.stringify({}, null, 2), "utf-8");
}

export function setUserPro(userId: string, status: "free" | "pro") {
  ensureStoreFile();
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  const store: Store = JSON.parse(raw || "{}");
  store[userId] = { status, updatedAt: Date.now() };
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function getUserStatus(userId: string): "free" | "pro" {
  ensureStoreFile();
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  const store: Store = JSON.parse(raw || "{}");
  return store?.[userId]?.status === "pro" ? "pro" : "free";
}
