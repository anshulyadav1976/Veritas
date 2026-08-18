import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/crypto";
import { runMigrations } from "@/lib/migrations";

export const providers = ["openai", "brave", "newsapi", "guardian", "google_fact_check"] as const;
export type Provider = typeof providers[number];

export function listStoredCredentials() {
  runMigrations();
  return db.prepare("SELECT provider, base_url AS baseUrl, model, masked_suffix AS maskedSuffix, updated_at AS updatedAt FROM provider_credentials ORDER BY provider").all() as Array<{ provider: Provider; baseUrl: string | null; model: string | null; maskedSuffix: string; updatedAt: string }>;
}

export function saveCredential(provider: Provider, secret: string, baseUrl?: string, model?: string) {
  const encrypted = encryptSecret(secret);
  db.prepare("INSERT INTO provider_credentials (provider, encrypted_secret, nonce, auth_tag, base_url, model, masked_suffix) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(provider) DO UPDATE SET encrypted_secret = excluded.encrypted_secret, nonce = excluded.nonce, auth_tag = excluded.auth_tag, base_url = excluded.base_url, model = excluded.model, masked_suffix = excluded.masked_suffix, updated_at = CURRENT_TIMESTAMP")
    .run(provider, encrypted.encryptedSecret, encrypted.nonce, encrypted.authTag, baseUrl || null, model || null, `••••${secret.slice(-4)}`);
}

export function removeCredential(provider: Provider) { db.prepare("DELETE FROM provider_credentials WHERE provider = ?").run(provider); }
