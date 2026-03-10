import Axe from "axe";
import { ILogger } from "../core";
import { Logger } from "pino";

export function createLogger(
  implementation: Pick<Logger, "warn" | "error" | "debug" | "info"> = console,
): { logger: ILogger } {
  const logger: ILogger = new Axe({
    logger: implementation,
  });

  return {
    logger,
  };
}
