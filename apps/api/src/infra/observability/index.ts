import { createLogger } from "@myapp/observability/node";
export const { logger } = createLogger({
  level: "debug",
  environment: "development",
});
