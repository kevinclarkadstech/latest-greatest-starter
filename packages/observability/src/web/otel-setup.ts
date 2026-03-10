// import {
//   LoggerProvider,
//   BatchLogRecordProcessor,
// } from "@opentelemetry/sdk-logs";
// import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
// import { logs } from "@opentelemetry/api-logs";
// import { Resource } from "@opentelemetry/resources";
// import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

// /**
//  * Note: In Vite, use import.meta.env. In Next.js, use process.env.
//  * Ensure these are prefixed (e.g., VITE_ or NEXT_PUBLIC_) to be visible in the browser.
//  */

// export function createOtelLogger({
//   AXIOM_TOKEN,
//   AXIOM_URL,
// }: {
//   AXIOM_URL: string;
//   AXIOM_TOKEN: string;
// }) {
//   // 1. Setup the Exporter
//   const logExporter = new OTLPLogExporter({
//     url: AXIOM_URL,
//     headers: {
//       Authorization: `Bearer ${AXIOM_TOKEN}`,
//     },
//   });

//   const loggerProvider = new LoggerProvider({
//     resource: new Resource({
//       [ATTR_SERVICE_NAME]: "my-fastify-api",
//     }),
//     // This replaces .addLogRecordProcessor()
//     processors: [
//       new BatchLogRecordProcessor(logExporter, {
//         scheduledDelayMillis: 5000,
//         maxExportBatchSize: 30,
//       }),
//     ],
//   });

//   // 3. Register and get your logger
//   logs.setGlobalLoggerProvider(loggerProvider);

//   // 5. Export the instance for your Axe hook to use
//   const otelLogger = logs.getLogger("my-app-web");

//   return {
//     otelLogger,
//   };
// }
