import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "veritas_owner";
const maxAge = 60 * 60 * 8;
const secret = () => process.env.VERITAS_ENCRYPTION_KEY ?? "";
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function dashboardIsConfigured() {
  return Boolean(process.env.VERITAS_ENCRYPTION_KEY && process.env.VERITAS_ADMIN_PASSWORD);
}

export function validPassword(value: string) {
  const expected = process.env.VERITAS_ADMIN_PASSWORD;
  if (!expected || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export async function setOwnerSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + maxAge * 1000 })).toString("base64url");
  (await cookies()).set(cookieName, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
}

export async function clearOwnerSession() { (await cookies()).delete(cookieName); }

export async function isOwner() {
  if (!dashboardIsConfigured()) return false;
  const value = (await cookies()).get(cookieName)?.value;
  const [payload, signature] = value?.split(".") ?? [];
  if (!payload || !signature || signature.length !== sign(payload).length || !timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payload)))) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).exp > Date.now(); } catch { return false; }
}
