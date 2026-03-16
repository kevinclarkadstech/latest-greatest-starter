import type { FlagEvaluationContext, FlagProvider, FlagValue } from "../core";

export class JsonFetchFlagProvider implements FlagProvider {
  private flags: Record<string, FlagValue> = {};

  constructor(private readonly url: string) {}

  async initialize(): Promise<void> {
    const response = await fetch(this.url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch feature flags from "${this.url}": ${response.status} ${response.statusText}`,
      );
    }
    this.flags = (await response.json()) as Record<string, FlagValue>;
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
