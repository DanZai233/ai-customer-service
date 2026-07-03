import { readFileSync } from "node:fs";

function readSecretFile(path: string | undefined) {
  if (!path) return null;
  try {
    return readFileSync(path, "utf8").trim() || null;
  } catch {
    return null;
  }
}

export function getOptionalRuntimeSecret(
  value: string | undefined,
  filePath: string | undefined,
) {
  return value?.trim() || readSecretFile(filePath);
}

export function getRequiredRuntimeSecret(
  value: string | undefined,
  filePath: string | undefined,
  description: string,
) {
  const secret = getOptionalRuntimeSecret(value, filePath);
  if (!secret) throw new Error(`${description} is not configured`);
  return secret;
}
