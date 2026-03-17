/**
 * ============================================================================
 * ANALYSIS CACHE — Incremental Analysis Support
 * ============================================================================
 *
 * Content-hash-keyed file cache. Same content = same hash = cache hit,
 * regardless of timestamps or branch switches.
 */
import { AnalyzedFile, CacheConfig } from '../../types/definitions';
export declare class AnalysisCache {
    private cacheDir;
    private enabled;
    private ttl;
    private hits;
    private misses;
    constructor(config: CacheConfig, projectRoot: string);
    get(contentHash: string): AnalyzedFile | null;
    set(contentHash: string, result: AnalyzedFile): void;
    clear(): void;
    getStats(): {
        hits: number;
        misses: number;
        hitRate: string;
    };
}
//# sourceMappingURL=file-cache.d.ts.map