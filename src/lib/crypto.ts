import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "crypto";

const SECRET = process.env.AUTH_SECRET || "ganalo-dev-secret-change-in-prod";

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(pw, salt, 64);
  return timingSafeEqual(test, Buffer.from(hash, "hex"));
}

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const sig = (data: string) => createHmac("sha256", SECRET).update(data).digest("base64url");

export function signToken(payload: { uid: string }, days = 30) {
  const body = b64(JSON.stringify({ ...payload, exp: Date.now() + days * 864e5 }));
  return `${body}.${sig(body)}`;
}

export function verifyToken(token?: string): { uid: string } | null {
  if (!token) return null;
  const [body, s] = token.split(".");
  if (!body || !s || sig(body) !== s) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    return data.exp > Date.now() ? { uid: data.uid } : null;
  } catch {
    return null;
  }
}
