import pino from "pino";
import { AppLogger, AppLoggerOptions } from "../core";

export function createLogger(loggerOptions: AppLoggerOptions): {
  logger: AppLogger;
} {
  const pinoInstance = pino({
    level: loggerOptions.level,
    redact: {
      paths: [
        "password",
        "*.password",
        "user.email",
        "creditCard",
        "*.token",
        "session.id",
        "req.headers.authorization", // If using HTTP logging
        "ssn",
        "*.ssn",
        "*.*.ssn",
        "**.ssn",
      ],
      censor: "***", // Replace with this string
      remove: false, // Set to true to delete the key entirely
    },
    ...(loggerOptions.environment === "development" && {
      transport: { target: "pino-pretty" },
    }),
  });

  function wrap(instance: pino.Logger): AppLogger {
    return {
      trace: (msg, data = {}) => instance.trace(data, msg),
      debug: (msg, data = {}) => instance.debug(data, msg),
      info: (msg, data = {}) => instance.info(data, msg),
      warn: (msg, data = {}) => instance.warn(data, msg),
      error: (msg, data = {}) => {
        if (msg instanceof Error) {
          instance.error({ ...data, err: msg }, msg.message);
        } else {
          instance.error(data, msg);
        }
      },

      // 2. The Child Function: It spawns a new pino child and wraps it
      child: (bindings: Record<string, any>) => {
        const pinoChild = instance.child(bindings);
        return wrap(pinoChild);
      },
    };
  }

  return {
    logger: wrap(pinoInstance),
  };
}
