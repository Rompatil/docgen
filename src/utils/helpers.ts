/**
 * ============================================================================
 * UTILITY HELPERS — Shared pure functions across the platform
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ─── File Discovery ──────────────────────────────────────────────────────────

export function findFiles(
  rootDir: string,
  includePatterns: string[],
  excludePatterns: string[]
): string[] {
  const results: string[] = [];
  const excludeDirs = new Set([
    'node_modules', '.git', 'dist', 'build', '__pycache__',
    '.next', '.venv', 'venv', 'coverage', '.docgen-cache',
  ]);
  const supportedExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs']);

  function walk(dir: string): void {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!excludeDirs.has(entry.name) && !entry.name.startsWith('.')) walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (supportedExts.has(ext)) results.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return results;
}

// ─── Hashing ─────────────────────────────────────────────────────────────────

export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

export function hashFile(filePath: string): string {
  return hashContent(fs.readFileSync(filePath, 'utf-8'));
}

// ─── Language Detection ──────────────────────────────────────────────────────

const EXT_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript',
  '.js': 'javascript', '.jsx': 'javascript',
  '.py': 'python', '.java': 'java', '.go': 'go', '.rs': 'rust',
};

export function detectLanguage(filePath: string): string {
  return EXT_MAP[path.extname(filePath).toLowerCase()] || 'unknown';
}

// ─── File I/O ────────────────────────────────────────────────────────────────

export function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

// ─── Path Helpers ────────────────────────────────────────────────────────────

export function inferModuleName(relativePath: string, depth: number = 2): string {
  const parts = relativePath.split(path.sep);
  parts.pop(); // Remove filename
  const skipDirs = new Set(['src', 'lib', 'app', 'packages']);
  while (parts.length > 0 && skipDirs.has(parts[0])) parts.shift();
  return parts.slice(0, depth).join('/') || 'root';
}

// ─── Content Helpers ─────────────────────────────────────────────────────────

export function countLines(content: string): number {
  return content.split('\n').filter(line => line.trim().length > 0).length;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// ─── Framework Detection ─────────────────────────────────────────────────────

export function detectFrameworks(rootDir: string): Array<{ framework: string; confidence: number; evidence: string[] }> {
  const results: Array<{ framework: string; confidence: number; evidence: string[] }> = [];
  const pkg = parsePackageJson(rootDir);
  const allDeps = { ...pkg?.dependencies, ...pkg?.devDependencies };

  const checks: Array<{ name: string; key: string }> = [
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
    if (fs.existsSync(p)) pyDeps += fs.readFileSync(p, 'utf-8');
  }
  for (const fw of ['fastapi', 'flask', 'django']) {
    if (pyDeps.includes(fw)) {
      results.push({ framework: fw, confidence: 0.95, evidence: [`${fw} in Python deps`] });
    }
  }

  return results;
}

// ─── Package.json Parsing ────────────────────────────────────────────────────

export function parsePackageJson(rootDir: string): Record<string, any> | null {
  const p = path.join(rootDir, 'package.json');
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}
