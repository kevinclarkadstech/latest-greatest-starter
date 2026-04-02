import { createLogger } from "@myapp/observability/web";
export const { logger } = createLogger({
  level: "debug",
  environment: "development",
});
