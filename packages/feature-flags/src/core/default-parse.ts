import type { FlagMap } from "./types";

export function defaultParse<Keys extends string>(
  input: unknown,
): FlagMap<Keys> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Feature flags must be a JSON object");
  }
  return input as FlagMap<Keys>;
}
