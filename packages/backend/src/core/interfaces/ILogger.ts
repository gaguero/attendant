/**
 * Logger interface for dependency injection
 */
export interface ILogger {
  info(message: string, meta?: any): void
  warn(message: string, meta?: any): void
  error(message: string, meta?: any): void
  debug(message: string, meta?: any): void
  http(message: string, meta?: any): void
}