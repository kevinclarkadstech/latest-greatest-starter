import type { FlagEvaluationContext, FlagProvider, FlagValue } from "./types";

export class InMemoryFlagProvider implements FlagProvider {
  private readonly flags: Record<string, FlagValue>;

  constructor(flags: Record<string, FlagValue> = {}) {
    this.flags = flags;
  }

  async initialize(): Promise<void> {}

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
