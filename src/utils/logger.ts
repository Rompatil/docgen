/**
 * ============================================================================
 * LOGGER — Structured logging with levels, colors, child loggers
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[2m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';
const LABELS: Record<LogLevel, string> = { debug: 'DBG', info: 'INF', warn: 'WRN', error: 'ERR' };

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private logFile?: string;

  constructor(level: LogLevel = 'info', prefix = '') {
    this.level = level;
    this.prefix = prefix;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVELS[level] >= LEVELS[this.level];
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;
    const ts = new Date().toISOString().substring(11, 19);
    const pre = this.prefix ? `[${this.prefix}] ` : '';
    const ctx = context ? ' ' + JSON.stringify(context) : '';
    const line = `${ts} [${LABELS[level]}] ${pre}${message}${ctx}`;
    console.log(`${COLORS[level]}${line}${RESET}`);
    if (this.logFile) {
      try { fs.appendFileSync(this.logFile, line + '\n'); } catch {}
    }
  }

  debug(msg: string, ctx?: Record<string, unknown>) { this.write('debug', msg, ctx); }
  info(msg: string, ctx?: Record<string, unknown>) { this.write('info', msg, ctx); }
  warn(msg: string, ctx?: Record<string, unknown>) { this.write('warn', msg, ctx); }
  error(msg: string, ctx?: Record<string, unknown>) { this.write('error', msg, ctx); }

  child(prefix: string): Logger {
    const child = new Logger(this.level, prefix);
    child.logFile = this.logFile;
    return child;
  }

  setLevel(level: LogLevel) { this.level = level; }

  enableFileLogging(dir: string) {
    this.logFile = path.join(dir, 'docgen.log');
  }
}

/** Singleton logger instance */
export const logger = new Logger('info');
export default logger;

export function setLogLevel(level: string): void {
  logger.setLevel(level as LogLevel);
}

export function createModuleLogger(moduleName: string): Logger {
  return logger.child(moduleName);
}

export function enableFileLogging(outputDir: string): void {
  logger.enableFileLogging(outputDir);
}
