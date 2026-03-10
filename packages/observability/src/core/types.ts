export interface ILogger {
  info(msg: string, meta?: any): void;
  warn(msg: string, meta?: any): void;
  error(msg: string | Error, meta?: any): void;
  debug(msg: string, meta?: any): void;
  // Note: We don't put .child() in the shared interface
  // because the Browser/Mobile loggers rarely use it.
}
