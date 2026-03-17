/**
 * ============================================================================
 * ANALYSIS CACHE — Incremental Analysis Support
 * ============================================================================
 *
 * Content-hash-keyed file cache. Same content = same hash = cache hit,
 * regardless of timestamps or branch switches.
 */

import * as fs from 'fs';
import * as path from 'path';
import { AnalyzedFile, CacheConfig } from '../../types/definitions';
import { logger } from '../../utils/logger';

const log = logger.child('Cache');

export class AnalysisCache {
  private cacheDir: string;
  private enabled: boolean;
  private ttl: number;
  private hits = 0;
  private misses = 0;

  constructor(config: CacheConfig, projectRoot: string) {
    this.enabled = config.enabled;
    this.ttl = config.ttl * 1000;
    this.cacheDir = path.join(projectRoot, config.directory);
    if (this.enabled) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  get(contentHash: string): AnalyzedFile | null {
    if (!this.enabled) return null;
    const p = path.join(this.cacheDir, `${contentHash}.json`);
    try {
      if (!fs.existsSync(p)) { this.misses++; return null; }
      if (Date.now() - fs.statSync(p).mtimeMs > this.ttl) {
        fs.unlinkSync(p);
        this.misses++;
        return null;
      }
      this.hits++;
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch { this.misses++; return null; }
  }

  set(contentHash: string, result: AnalyzedFile): void {
    if (!this.enabled) return;
    try {
      const lite = { ...result, functions: result.functions.map(f => ({ ...f, body: undefined })) };
      fs.writeFileSync(path.join(this.cacheDir, `${contentHash}.json`), JSON.stringify(lite));
    } catch {}
  }

  clear(): void {
    if (!this.enabled) return;
    try {
      for (const f of fs.readdirSync(this.cacheDir)) fs.unlinkSync(path.join(this.cacheDir, f));
      log.info('Cache cleared');
    } catch {}
  }

  getStats() {
    const total = this.hits + this.misses;
    return { hits: this.hits, misses: this.misses, hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(1) + '%' : 'N/A' };
  }
}
