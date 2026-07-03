import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { readFileSync } from "node:fs";

const algorithm = "aes-256-gcm";

function readSecretFile(path: string | undefined) {
  if (!path) return null;
  try {
    return readFileSync(path, "utf8").trim() || null;
  } catch {
    return null;
  }
}

export function getConfigEncryptionSecret() {
  const secret =
    process.env.CONFIG_ENCRYPTION_KEY?.trim() ||
    readSecretFile(process.env.CONFIG_ENCRYPTION_KEY_FILE) ||
    process.env.BETTER_AUTH_SECRET?.trim() ||
    readSecretFile(process.env.BETTER_AUTH_SECRET_FILE);

  if (!secret) {
    throw new Error(
      "Configuration encryption key is missing. Set CONFIG_ENCRYPTION_KEY or CONFIG_ENCRYPTION_KEY_FILE.",
    );
  }
  return secret;
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
