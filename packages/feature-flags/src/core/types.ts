export type FlagValue = boolean | string | number;

export interface FlagEvaluationContext {
  userId?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface FlagProvider {
  initialize(): Promise<void>;
  getBooleanValue(
    key: string,
    defaultValue: boolean,
    context?: FlagEvaluationContext,
  ): Promise<boolean>;
  getStringValue(
    key: string,
    defaultValue: string,
    context?: FlagEvaluationContext,
  ): Promise<string>;
  getNumberValue(
    key: string,
    defaultValue: number,
    context?: FlagEvaluationContext,
  ): Promise<number>;
}
