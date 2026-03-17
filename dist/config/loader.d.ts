/**
 * ============================================================================
 * CONFIGURATION SYSTEM
 * ============================================================================
 * Resolution order: defaults → config file → env vars → CLI overrides
 */
import { DocgenConfig } from '../types/definitions';
export declare const DEFAULT_CONFIG: DocgenConfig;
export declare function loadConfig(projectRoot: string, overrides?: Partial<DocgenConfig>): DocgenConfig;
export declare function generateConfigFile(projectRoot: string): string;
//# sourceMappingURL=loader.d.ts.map