import {
  ConsoleLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { logs } from "@opentelemetry/api-logs";

// 1. Initialize the Exporter (Points to Axiom)
const logExporter = new ConsoleLogRecordExporter();

// new OTLPLogExporter({
//   url: 'https://api.axiom.co/v1/datasets/YOUR_LOG_DATASET/ingest',
//   headers: {
//     Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
//     'Content-Type': 'application/json'
//   },
// });

// 2. The "Brain": LoggerProvider
const loggerProvider = new LoggerProvider({
  // 3. Add the Processor (The "Pipe" that moves logs to the Exporter)
  processors: [new SimpleLogRecordProcessor(logExporter)],
});

// 4. Register globally so your Axe/Pino bridge can find it
logs.setGlobalLoggerProvider(loggerProvider);

export const otelLogger = logs.getLogger("my-app-node");
