"use strict";
/**
 * ============================================================================
 * LOGGER — Structured logging with levels, colors, child loggers
 * ============================================================================
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
exports.setLogLevel = setLogLevel;
exports.createModuleLogger = createModuleLogger;
exports.enableFileLogging = enableFileLogging;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const COLORS = {
    debug: '\x1b[2m',
    info: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
};
const RESET = '\x1b[0m';
const LABELS = { debug: 'DBG', info: 'INF', warn: 'WRN', error: 'ERR' };
class Logger {
    level;
    prefix;
    logFile;
    constructor(level = 'info', prefix = '') {
        this.level = level;
        this.prefix = prefix;
    }
    shouldLog(level) {
        return LEVELS[level] >= LEVELS[this.level];
    }
    write(level, message, context) {
        if (!this.shouldLog(level))
            return;
        const ts = new Date().toISOString().substring(11, 19);
        const pre = this.prefix ? `[${this.prefix}] ` : '';
        const ctx = context ? ' ' + JSON.stringify(context) : '';
        const line = `${ts} [${LABELS[level]}] ${pre}${message}${ctx}`;
        console.log(`${COLORS[level]}${line}${RESET}`);
        if (this.logFile) {
            try {
                fs.appendFileSync(this.logFile, line + '\n');
            }
            catch { }
        }
    }
    debug(msg, ctx) { this.write('debug', msg, ctx); }
    info(msg, ctx) { this.write('info', msg, ctx); }
    warn(msg, ctx) { this.write('warn', msg, ctx); }
    error(msg, ctx) { this.write('error', msg, ctx); }
    child(prefix) {
        const child = new Logger(this.level, prefix);
        child.logFile = this.logFile;
        return child;
    }
    setLevel(level) { this.level = level; }
    enableFileLogging(dir) {
        this.logFile = path.join(dir, 'docgen.log');
    }
}
exports.Logger = Logger;
/** Singleton logger instance */
exports.logger = new Logger('info');
exports.default = exports.logger;
function setLogLevel(level) {
    exports.logger.setLevel(level);
}
function createModuleLogger(moduleName) {
    return exports.logger.child(moduleName);
}
function enableFileLogging(outputDir) {
    exports.logger.enableFileLogging(outputDir);
}
//# sourceMappingURL=logger.js.map