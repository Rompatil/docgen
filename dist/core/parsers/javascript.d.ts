/**
 * ============================================================================
 * JAVASCRIPT / TYPESCRIPT PARSER (Babel AST)
 * ============================================================================
 *
 * Parses JS/TS/JSX/TSX files into structured AnalyzedFile objects.
 * Uses Babel for AST, which handles all modern syntax including decorators,
 * optional chaining, JSX, and TypeScript.
 */
import { AnalyzedFile } from '../../types/definitions';
export declare function parseJavaScriptFile(filePath: string, content: string, rootDir: string): AnalyzedFile;
//# sourceMappingURL=javascript.d.ts.map