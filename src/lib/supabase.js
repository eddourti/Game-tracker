import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

const SYNC_CODE_KEY = "game-tracker:sync-code";

function randomCode() {
  // Short, easy to type on another device — not a security boundary, just
  // a shared key so the same library shows up across your own devices.
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getSyncCode() {
  let code = localStorage.getItem(SYNC_CODE_KEY);
  if (!code) {
    code = randomCode();
    localStorage.setItem(SYNC_CODE_KEY, code);
  }
  return code;
}

export function setSyncCode(code) {
  const clean = code.trim().toUpperCase();
  if (!clean) return;
  localStorage.setItem(SYNC_CODE_KEY, clean);
}
