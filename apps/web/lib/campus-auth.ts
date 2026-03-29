/**
 * Client-only auth: accounts + session in localStorage.
 * Passwords are SHA-256 hashed (demo app — use a real backend for production).
 */

const SESSION_KEY = "campusquest-session-v1";
const ACCOUNTS_KEY = "campusquest-accounts-v1";

export type CampusSession = {
  email: string;
  displayName: string;
};

type StoredAccount = {
  passwordHash: string;
  displayName: string;
};

function readAccounts(): Record<string, StoredAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredAccount>;
  } catch {
    return {};
  }
}

function writeAccounts(data: Record<string, StoredAccount>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data));
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Must be a real address, and end with `.edu` (includes subdomains like mail.uri.edu). */
export function isStudentEduEmail(email: string): boolean {
  const t = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return false;
  return t.endsWith(".edu");
}

export function getSession(): CampusSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as CampusSession;
    if (typeof p.email !== "string" || typeof p.displayName !== "string") return null;
    return { email: p.email.toLowerCase(), displayName: p.displayName.trim() };
  } catch {
    return null;
  }
}

export function setSession(session: CampusSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export async function signUp(params: {
  email: string;
  displayName: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = params.email.trim().toLowerCase();
  const displayName = params.displayName.trim();
  if (!isStudentEduEmail(email)) {
    return { ok: false, error: "Use your school email — it must end with .edu." };
  }
  if (displayName.length < 2 || displayName.length > 40) {
    return { ok: false, error: "Display name should be 2–40 characters." };
  }
  if (params.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  const accounts = readAccounts();
  if (accounts[email]) {
    return { ok: false, error: "An account already exists for this email." };
  }
  const passwordHash = await sha256Hex(params.password);
  accounts[email] = { passwordHash, displayName };
  writeAccounts(accounts);
  setSession({ email, displayName });
  return { ok: true };
}

export async function login(params: {
  email: string;
  password: string;
}): Promise<{ ok: true; displayName: string } | { ok: false; error: string }> {
  const email = params.email.trim().toLowerCase();
  if (!isStudentEduEmail(email)) {
    return { ok: false, error: "Use your school email — it must end with .edu." };
  }
  const accounts = readAccounts();
  const acc = accounts[email];
  if (!acc) {
    return { ok: false, error: "No account found for that email." };
  }
  const hash = await sha256Hex(params.password);
  if (hash !== acc.passwordHash) {
    return { ok: false, error: "Incorrect password." };
  }
  setSession({ email, displayName: acc.displayName });
  return { ok: true, displayName: acc.displayName };
}

export function logout() {
  clearSession();
}
