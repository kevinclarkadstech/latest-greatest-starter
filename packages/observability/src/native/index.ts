import Axe from "axe";
import pino from "pino";
import { ILogger } from "../core";

const pinoLogger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

const logger: ILogger = new Axe({
  logger: pinoLogger,
});

export { logger };
