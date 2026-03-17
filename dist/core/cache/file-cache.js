"use strict";
/**
 * ============================================================================
 * ANALYSIS CACHE — Incremental Analysis Support
 * ============================================================================
 *
 * Content-hash-keyed file cache. Same content = same hash = cache hit,
 * regardless of timestamps or branch switches.
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
exports.AnalysisCache = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../../utils/logger");
const log = logger_1.logger.child('Cache');
class AnalysisCache {
    cacheDir;
    enabled;
    ttl;
    hits = 0;
    misses = 0;
    constructor(config, projectRoot) {
        this.enabled = config.enabled;
        this.ttl = config.ttl * 1000;
        this.cacheDir = path.join(projectRoot, config.directory);
        if (this.enabled) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }
    get(contentHash) {
        if (!this.enabled)
            return null;
        const p = path.join(this.cacheDir, `${contentHash}.json`);
        try {
            if (!fs.existsSync(p)) {
                this.misses++;
                return null;
            }
            if (Date.now() - fs.statSync(p).mtimeMs > this.ttl) {
                fs.unlinkSync(p);
                this.misses++;
                return null;
            }
            this.hits++;
            return JSON.parse(fs.readFileSync(p, 'utf-8'));
        }
        catch {
            this.misses++;
            return null;
        }
    }
    set(contentHash, result) {
        if (!this.enabled)
            return;
        try {
            const lite = { ...result, functions: result.functions.map(f => ({ ...f, body: undefined })) };
            fs.writeFileSync(path.join(this.cacheDir, `${contentHash}.json`), JSON.stringify(lite));
        }
        catch { }
    }
    clear() {
        if (!this.enabled)
            return;
        try {
            for (const f of fs.readdirSync(this.cacheDir))
                fs.unlinkSync(path.join(this.cacheDir, f));
            log.info('Cache cleared');
        }
        catch { }
    }
    getStats() {
        const total = this.hits + this.misses;
        return { hits: this.hits, misses: this.misses, hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(1) + '%' : 'N/A' };
    }
}
exports.AnalysisCache = AnalysisCache;
//# sourceMappingURL=file-cache.js.map