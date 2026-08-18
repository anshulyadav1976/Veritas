import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function key() {
  const raw = process.env.VERITAS_ENCRYPTION_KEY;
  if (!raw) throw new Error("VERITAS_ENCRYPTION_KEY is required for dashboard-managed credentials");
  const value = Buffer.from(raw, "base64");
  if (value.length !== 32) throw new Error("VERITAS_ENCRYPTION_KEY must decode to exactly 32 bytes");
  return value;
}

export function encryptSecret(secret: string) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), nonce);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return { encryptedSecret: encrypted.toString("base64"), nonce: nonce.toString("base64"), authTag: cipher.getAuthTag().toString("base64") };
}

export function decryptSecret(record: { encryptedSecret: string; nonce: string; authTag: string }) {
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(record.nonce, "base64"));
  decipher.setAuthTag(Buffer.from(record.authTag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(record.encryptedSecret, "base64")), decipher.final()]).toString("utf8");
}
