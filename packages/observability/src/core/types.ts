export interface AppLogger {
  info(msg: string, data?: Record<string, any>): void;
  error(msg: string | Error, data?: Record<string, any>): void;
  warn(msg: string, data?: Record<string, any>): void;
  debug(msg: string, data?: Record<string, any>): void;
  trace(msg: string, data?: Record<string, any>): void;
  // The 'child' method returns a fresh AppLogger
  child(bindings: Record<string, any>): AppLogger;
}

export interface AppLoggerOptions {
  level: LogLevel;
  environment: "development" | "production" | "test";
  redact?: {
    paths: string[];
    censor?: string; // What to replace redacted values with (default: '***')
    remove?: boolean; // If true, the key will be removed entirely instead of being censored
  };
}

export const LogLevels = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
} as const;

export type LogLevel = keyof typeof LogLevels;
