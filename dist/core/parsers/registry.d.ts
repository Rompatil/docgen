/**
 * Parser Registry — routes files to the correct language parser.
 */
import { AnalyzedFile } from '../../types/definitions';
export declare function parseFile(filePath: string, rootDir: string): AnalyzedFile | null;
export declare function canParse(filePath: string): boolean;
export declare function getSupportedLanguages(): string[];
export { parseJavaScriptFile } from './javascript';
export { parsePythonFile } from './python';
//# sourceMappingURL=registry.d.ts.map