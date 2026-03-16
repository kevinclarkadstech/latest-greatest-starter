import { readFile } from "fs/promises";
import type { FlagEvaluationContext, FlagProvider, FlagValue } from "../core";

export class JsonFileFlagProvider implements FlagProvider {
  private flags: Record<string, FlagValue> = {};

  constructor(private readonly filePath: string) {}

  async initialize(): Promise<void> {
    const content = await readFile(this.filePath, "utf-8");
    try {
      this.flags = JSON.parse(content) as Record<string, FlagValue>;
    } catch {
      throw new Error(
        `Failed to parse feature flags from "${this.filePath}": file contains invalid JSON`,
      );
    }
  }

  async getBooleanValue(
    key: string,
    defaultValue: boolean,
    _context?: FlagEvaluationContext,
  ): Promise<boolean> {
    const value = this.flags[key];
    return typeof value === "boolean" ? value : defaultValue;
  }

  async getStringValue(
    key: string,
    defaultValue: string,
    _context?: FlagEvaluationContext,
  ): Promise<string> {
    const value = this.flags[key];
    return typeof value === "string" ? value : defaultValue;
  }

  async getNumberValue(
    key: string,
    defaultValue: number,
    _context?: FlagEvaluationContext,
  ): Promise<number> {
    const value = this.flags[key];
    return typeof value === "number" ? value : defaultValue;
  }
}
