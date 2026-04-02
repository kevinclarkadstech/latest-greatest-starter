import { AppLogger, AppLoggerOptions, LogLevels } from "../core";

export function createLogger(loggerOptions: AppLoggerOptions): {
  logger: AppLogger;
} {
  function emitToOTel(level: string, message: string, meta: any) {
    console.log("emitting to OTEL");
  }

  const currentPriority = LogLevels[loggerOptions.level!];

  function wrap(ctx: Record<string, any>): AppLogger {
    function combineDataWithContext(data?: Record<string, any>) {
      return { ...ctx, ...data };
    }
    const logger: AppLogger = {
      info: (msg, data) => {
        if (LogLevels.info < currentPriority) return;

        console.log(`[INFO] ${msg}`, combineDataWithContext(data));
        emitToOTel("info", msg, combineDataWithContext(data));
      },
      error: (msg, data = {}) => {
        if (LogLevels.error < currentPriority) return;
        if (msg instanceof Error) {
          console.error(
            { ...combineDataWithContext(data), err: msg },
            msg.message,
          );
        } else {
          console.error(combineDataWithContext(data), msg);
        }
        emitToOTel(
          "error",
          msg instanceof Error ? msg.stack || msg.message : msg,
          combineDataWithContext(data),
        );
      },
      warn: (msg, data = {}) => {
        if (LogLevels.warn < currentPriority) return;
        console.warn(`[WARN] ${msg}`, combineDataWithContext(data));
        emitToOTel("warn", msg, combineDataWithContext(data));
      },
      debug: (msg, data = {}) => {
        if (LogLevels.debug < currentPriority) return;
        console.debug(`[DEBUG] ${msg}`, combineDataWithContext(data));
        emitToOTel("debug", msg, combineDataWithContext(data));
      },
      trace: (msg, data) => {
        if (LogLevels.trace < currentPriority) return;
        console.trace(`[TRACE] ${msg}`, combineDataWithContext(data));
        emitToOTel("trace", msg, combineDataWithContext(data));
      },
      child: (bindings) => {
        return wrap({ ...ctx, ...bindings });
      },
    };

    return logger;
  }

  return {
    logger: wrap({}),
  };
}
