/**
 * ============================================================================
 * PYTHON PARSER (Regex-based for Node.js environment)
 * ============================================================================
 *
 * Extracts functions, classes, imports, and FastAPI/Flask endpoints from Python.
 * Uses pattern matching since we can't use Python's ast module from Node.js.
 */
import { AnalyzedFile } from '../../types/definitions';
export declare function parsePythonFile(filePath: string, content: string, rootDir: string): AnalyzedFile;
//# sourceMappingURL=python.d.ts.map