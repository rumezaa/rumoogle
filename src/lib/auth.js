import { createHmac, timingSafeEqual } from "crypto";

// Single-admin auth: the password lives in the ADMIN_PASSWORD env var.
// The session cookie holds an HMAC derived from it, so changing the password
// signs every existing session out.

export const SESSION_COOKIE = "rumoogle_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const digest = (key, value) => createHmac("sha256", key).update(value).digest();

function sessionToken() {
  const secret = process.env.ADMIN_PASSWORD;
  return secret ? digest(secret, "admin-session-v1").toString("hex") : null;
}

export function checkPassword(password) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || typeof password !== "string") return false;
  return timingSafeEqual(digest("pw", password), digest("pw", secret));
}

export function createSession() {
  return sessionToken();
}

export function isAdmin(request) {
  const expected = sessionToken();
  const actual = request.cookies.get(SESSION_COOKIE)?.value;
  if (!expected || !actual || actual.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
