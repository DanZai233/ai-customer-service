import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import {
  getOptionalRuntimeSecret,
  getRequiredRuntimeSecret,
} from "@/lib/runtime-secrets";

const algorithm = "aes-256-gcm";

export function getConfigEncryptionSecret() {
  const dedicated = getOptionalRuntimeSecret(
    process.env.CONFIG_ENCRYPTION_KEY,
    process.env.CONFIG_ENCRYPTION_KEY_FILE,
  );
  if (dedicated) return dedicated;
  return getRequiredRuntimeSecret(
    process.env.BETTER_AUTH_SECRET,
    process.env.BETTER_AUTH_SECRET_FILE,
    "Configuration encryption key",
  );
}

function deriveKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string, masterSecret?: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    algorithm,
    deriveKey(masterSecret ?? getConfigEncryptionSecret()),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptSecret(value: string, masterSecret?: string) {
  const [version, iv, tag, encrypted] = value.split(".");
  if (version !== "v1" || !iv || !tag || encrypted === undefined) {
    throw new Error("Unsupported encrypted configuration value");
  }

  const decipher = createDecipheriv(
    algorithm,
    deriveKey(masterSecret ?? getConfigEncryptionSecret()),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
