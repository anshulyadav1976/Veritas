import { beforeEach, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./crypto";

describe("credential encryption", () => {
  beforeEach(() => { process.env.VERITAS_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64"); });
  it("round trips AES-GCM encrypted secrets", () => {
    expect(decryptSecret(encryptSecret("secret-value"))).toBe("secret-value");
  });
  it("rejects a malformed key", () => {
    process.env.VERITAS_ENCRYPTION_KEY = "too-short";
    expect(() => encryptSecret("secret-value")).toThrow("32 bytes");
  });
});
