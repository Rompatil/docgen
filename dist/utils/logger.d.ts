/**
 * ============================================================================
 * LOGGER — Structured logging with levels, colors, child loggers
 * ============================================================================
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export declare class Logger {
    private level;
    private prefix;
    private logFile?;
    constructor(level?: LogLevel, prefix?: string);
    private shouldLog;
    private write;
    debug(msg: string, ctx?: Record<string, unknown>): void;
    info(msg: string, ctx?: Record<string, unknown>): void;
    warn(msg: string, ctx?: Record<string, unknown>): void;
    error(msg: string, ctx?: Record<string, unknown>): void;
    child(prefix: string): Logger;
    setLevel(level: LogLevel): void;
    enableFileLogging(dir: string): void;
}
/** Singleton logger instance */
export declare const logger: Logger;
export default logger;
export declare function setLogLevel(level: string): void;
export declare function createModuleLogger(moduleName: string): Logger;
export declare function enableFileLogging(outputDir: string): void;
//# sourceMappingURL=logger.d.ts.map