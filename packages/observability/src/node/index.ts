import Axe from "axe";
import pino, { Logger } from "pino";
import { ILogger } from "../core";

export function createLogger(
  implementation: Pick<Logger, "warn" | "error" | "debug" | "info"> = pino({
    level: process.env.NODE_ENV === "development" ? "trace" : "info",
    // pino-pretty is great for dev, but in prod you'll likely want JSON
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty" }
        : undefined,
  }),
): { logger: ILogger } {
  function emitToOTel(level: string, data: any) {
    console.log("emitting to OTEL");
  }

  const logger: ILogger = new Axe({
    logger: implementation,
    hooks: {
      // We use 'post' so we get the final, normalized, and masked data
      post: [emitToOTel],
    },
  });

  return {
    logger,
  };
}
