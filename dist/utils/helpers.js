"use strict";
/**
 * ============================================================================
 * UTILITY HELPERS — Shared pure functions across the platform
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
exports.findFiles = findFiles;
exports.hashContent = hashContent;
exports.hashFile = hashFile;
exports.detectLanguage = detectLanguage;
exports.readFileContent = readFileContent;
exports.fileExists = fileExists;
exports.ensureDir = ensureDir;
exports.inferModuleName = inferModuleName;
exports.countLines = countLines;
exports.truncate = truncate;
exports.detectFrameworks = detectFrameworks;
exports.parsePackageJson = parsePackageJson;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// ─── File Discovery ──────────────────────────────────────────────────────────
function findFiles(rootDir, includePatterns, excludePatterns) {
    const results = [];
    const excludeDirs = new Set([
        'node_modules', '.git', 'dist', 'build', '__pycache__',
        '.next', '.venv', 'venv', 'coverage', '.docgen-cache',
    ]);
    const supportedExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs']);
    function walk(dir) {
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!excludeDirs.has(entry.name) && !entry.name.startsWith('.'))
                    walk(fullPath);
            }
            else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (supportedExts.has(ext))
                    results.push(fullPath);
            }
        }
    }
    walk(rootDir);
    return results;
}
// ─── Hashing ─────────────────────────────────────────────────────────────────
function hashContent(content) {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}
function hashFile(filePath) {
    return hashContent(fs.readFileSync(filePath, 'utf-8'));
}
// ─── Language Detection ──────────────────────────────────────────────────────
const EXT_MAP = {
    '.ts': 'typescript', '.tsx': 'typescript',
    '.js': 'javascript', '.jsx': 'javascript',
    '.py': 'python', '.java': 'java', '.go': 'go', '.rs': 'rust',
};
function detectLanguage(filePath) {
    return EXT_MAP[path.extname(filePath).toLowerCase()] || 'unknown';
}
// ─── File I/O ────────────────────────────────────────────────────────────────
function readFileContent(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}
function fileExists(filePath) {
    return fs.existsSync(filePath);
}
function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}
// ─── Path Helpers ────────────────────────────────────────────────────────────
function inferModuleName(relativePath, depth = 2) {
    const parts = relativePath.split(path.sep);
    parts.pop(); // Remove filename
    const skipDirs = new Set(['src', 'lib', 'app', 'packages']);
    while (parts.length > 0 && skipDirs.has(parts[0]))
        parts.shift();
    return parts.slice(0, depth).join('/') || 'root';
}
// ─── Content Helpers ─────────────────────────────────────────────────────────
function countLines(content) {
    return content.split('\n').filter(line => line.trim().length > 0).length;
}
function truncate(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength - 3) + '...';
}
// ─── Framework Detection ─────────────────────────────────────────────────────
function detectFrameworks(rootDir) {
    const results = [];
    const pkg = parsePackageJson(rootDir);
    const allDeps = { ...pkg?.dependencies, ...pkg?.devDependencies };
    const checks = [
        { name: 'express', key: 'express' },
        { name: 'nestjs', key: '@nestjs/core' },
        { name: 'nextjs', key: 'next' },
        { name: 'react', key: 'react' },
        { name: 'vue', key: 'vue' },
        { name: 'angular', key: '@angular/core' },
    ];
    for (const { name, key } of checks) {
        if (allDeps?.[key]) {
            results.push({ framework: name, confidence: 0.95, evidence: [`${key} in dependencies`] });
        }
    }
    // Python frameworks
    let pyDeps = '';
    for (const f of ['requirements.txt', 'pyproject.toml']) {
        const p = path.join(rootDir, f);
        if (fs.existsSync(p))
            pyDeps += fs.readFileSync(p, 'utf-8');
    }
    for (const fw of ['fastapi', 'flask', 'django']) {
        if (pyDeps.includes(fw)) {
            results.push({ framework: fw, confidence: 0.95, evidence: [`${fw} in Python deps`] });
        }
    }
    return results;
}
// ─── Package.json Parsing ────────────────────────────────────────────────────
function parsePackageJson(rootDir) {
    const p = path.join(rootDir, 'package.json');
    if (!fs.existsSync(p))
        return null;
    try {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=helpers.js.map