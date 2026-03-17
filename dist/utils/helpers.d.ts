/**
 * ============================================================================
 * UTILITY HELPERS — Shared pure functions across the platform
 * ============================================================================
 */
export declare function findFiles(rootDir: string, includePatterns: string[], excludePatterns: string[]): string[];
export declare function hashContent(content: string): string;
export declare function hashFile(filePath: string): string;
export declare function detectLanguage(filePath: string): string;
export declare function readFileContent(filePath: string): string;
export declare function fileExists(filePath: string): boolean;
export declare function ensureDir(dirPath: string): void;
export declare function inferModuleName(relativePath: string, depth?: number): string;
export declare function countLines(content: string): number;
export declare function truncate(text: string, maxLength: number): string;
export declare function detectFrameworks(rootDir: string): Array<{
    framework: string;
    confidence: number;
    evidence: string[];
}>;
export declare function parsePackageJson(rootDir: string): Record<string, any> | null;
//# sourceMappingURL=helpers.d.ts.map