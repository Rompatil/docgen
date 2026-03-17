"use strict";
/**
 * ============================================================================
 * PROJECT ANALYZER — Orchestrates parsing, module detection, dep graph
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
exports.analyzeProject = analyzeProject;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const registry_1 = require("../parsers/registry");
const helpers_1 = require("../../utils/helpers");
const logger_1 = require("../../utils/logger");
const log = logger_1.logger.child('Analyzer');
async function analyzeProject(config) {
    const startTime = Date.now();
    const rootDir = path.resolve(config.projectRoot);
    log.info(`Analyzing: ${rootDir}`);
    // 1. Discover files
    const files = (0, helpers_1.findFiles)(rootDir, config.include, config.exclude);
    log.info(`Found ${files.length} files`);
    // 2. Parse files
    const analyzedFiles = [];
    const errors = [];
    for (let i = 0; i < files.length; i += config.concurrency) {
        const batch = files.slice(i, i + config.concurrency);
        const results = await Promise.all(batch.map(async (fp) => {
            try {
                return (0, registry_1.parseFile)(fp, rootDir);
            }
            catch (err) {
                errors.push({ filePath: path.relative(rootDir, fp), message: err.message, severity: 'error' });
                return null;
            }
        }));
        for (const r of results) {
            if (r) {
                analyzedFiles.push(r);
                errors.push(...r.parseErrors);
            }
        }
        if ((i + config.concurrency) % 100 === 0)
            log.info(`Parsed ${Math.min(i + config.concurrency, files.length)}/${files.length}`);
    }
    // 3. Group into modules
    const modules = buildModules(analyzedFiles);
    // 4. Dependency graph
    const dependencyGraph = buildDependencyGraph(analyzedFiles);
    enrichModuleDependencies(modules, dependencyGraph);
    // 5. Frameworks
    const frameworks = (0, helpers_1.detectFrameworks)(rootDir).map(f => ({ ...f, framework: f.framework }));
    // 6. Language stats
    const languages = computeLanguageStats(analyzedFiles);
    // 7. External deps
    const externalDependencies = extractExternalDeps(rootDir);
    // 8. Config files
    const configFiles = detectConfigFiles(rootDir);
    // 9. Env vars
    const envVariables = detectEnvVariables(analyzedFiles, rootDir);
    // 10. API endpoints
    const apiEndpoints = analyzedFiles.flatMap(f => f.apiEndpoints);
    const pkg = (0, helpers_1.parsePackageJson)(rootDir);
    const duration = Date.now() - startTime;
    log.info(`Analysis done in ${duration}ms: ${analyzedFiles.length} files, ${modules.length} modules`);
    return {
        name: pkg?.name || path.basename(rootDir),
        rootPath: rootDir,
        version: pkg?.version,
        description: pkg?.description,
        languages, frameworks, files: analyzedFiles, modules,
        dependencyGraph, externalDependencies, apiEndpoints,
        configFiles, envVariables,
        analyzedAt: new Date(),
        analysisDuration: duration,
        errors,
    };
}
// ─── Module Building ─────────────────────────────────────────────────────────
function buildModules(files) {
    const map = new Map();
    for (const f of files) {
        const mod = (0, helpers_1.inferModuleName)(f.relativePath);
        if (!map.has(mod))
            map.set(mod, []);
        map.get(mod).push(f);
    }
    return Array.from(map.entries()).map(([name, mFiles]) => ({
        name,
        path: name,
        files: mFiles,
        dependencies: [],
        dependents: [],
        publicAPI: mFiles.flatMap(f => f.exports),
        totalLines: mFiles.reduce((s, f) => s + f.lineCount, 0),
        role: inferRole(name, mFiles),
    }));
}
function inferRole(name, files) {
    const n = name.toLowerCase();
    if (n.includes('route') || n.includes('api') || n.includes('controller'))
        return 'api';
    if (n.includes('service') || n.includes('provider'))
        return 'service';
    if (n.includes('model') || n.includes('schema') || n.includes('entity'))
        return 'model';
    if (n.includes('util') || n.includes('helper') || n.includes('lib'))
        return 'utility';
    if (n.includes('config') || n.includes('setting'))
        return 'config';
    if (n.includes('test') || n.includes('spec'))
        return 'test';
    if (n.includes('component') || n.includes('view') || n.includes('page'))
        return 'ui';
    if (n.includes('middleware') || n.includes('guard'))
        return 'middleware';
    if (files.some(f => f.apiEndpoints.length > 0))
        return 'api';
    return undefined;
}
// ─── Dependency Graph ────────────────────────────────────────────────────────
function buildDependencyGraph(files) {
    const edges = [];
    const byPath = new Map();
    for (const f of files) {
        byPath.set(f.relativePath.replace(/\.(ts|tsx|js|jsx|py)$/, ''), f);
        byPath.set(f.relativePath, f);
    }
    for (const file of files) {
        for (const imp of file.imports) {
            if (!imp.isRelative)
                continue;
            const resolved = path.normalize(path.join(path.dirname(file.relativePath), imp.source));
            const target = byPath.get(resolved) || byPath.get(resolved + '/index');
            if (target) {
                edges.push({
                    from: file.relativePath, to: target.relativePath,
                    type: 'import',
                    symbols: [...imp.specifiers, ...(imp.defaultImport ? [imp.defaultImport] : [])],
                });
            }
        }
    }
    return edges;
}
function enrichModuleDependencies(modules, graph) {
    for (const edge of graph) {
        const fromMod = (0, helpers_1.inferModuleName)(edge.from);
        const toMod = (0, helpers_1.inferModuleName)(edge.to);
        if (fromMod === toMod)
            continue;
        const src = modules.find(m => m.name === fromMod);
        const tgt = modules.find(m => m.name === toMod);
        if (src && !src.dependencies.includes(toMod))
            src.dependencies.push(toMod);
        if (tgt && !tgt.dependents.includes(fromMod))
            tgt.dependents.push(fromMod);
    }
}
// ─── Stats & Detection ───────────────────────────────────────────────────────
function computeLanguageStats(files) {
    const stats = new Map();
    for (const f of files) {
        const e = stats.get(f.language) || { fileCount: 0, lineCount: 0 };
        e.fileCount++;
        e.lineCount += f.lineCount;
        stats.set(f.language, e);
    }
    const total = Array.from(stats.values()).reduce((s, v) => s + v.lineCount, 0);
    return Array.from(stats.entries())
        .map(([lang, s]) => ({ language: lang, ...s, percentage: total > 0 ? Math.round((s.lineCount / total) * 100) : 0 }))
        .sort((a, b) => b.lineCount - a.lineCount);
}
function extractExternalDeps(rootDir) {
    const pkg = (0, helpers_1.parsePackageJson)(rootDir);
    if (!pkg)
        return [];
    const deps = [];
    const catMap = {
        database: ['mongoose', 'sequelize', 'typeorm', 'prisma', 'knex', 'pg', 'mysql', 'mongodb', 'redis', 'ioredis'],
        auth: ['passport', 'jsonwebtoken', 'bcrypt', 'oauth', 'auth0', 'next-auth'],
        payment: ['stripe', 'paypal', 'braintree'],
        http: ['axios', 'node-fetch', 'got'],
        testing: ['jest', 'mocha', 'vitest', 'cypress', 'playwright'],
        framework: ['express', 'fastify', 'koa', 'next', 'react', 'vue', '@angular/core', '@nestjs/core'],
        cloud: ['aws-sdk', '@aws-sdk', 'firebase', 'googleapis', '@azure', '@google-cloud'],
        logging: ['winston', 'pino', 'morgan'],
        validation: ['joi', 'yup', 'zod', 'class-validator'],
        messaging: ['amqplib', 'bull', 'bullmq', 'socket.io'],
    };
    const categorize = (name) => {
        for (const [cat, pkgs] of Object.entries(catMap)) {
            if (pkgs.some(p => name.includes(p)))
                return cat;
        }
        return 'utility';
    };
    for (const [name, version] of Object.entries(pkg.dependencies || {})) {
        deps.push({ name, version: version, category: categorize(name), isDev: false });
    }
    for (const [name, version] of Object.entries(pkg.devDependencies || {})) {
        deps.push({ name, version: version, category: categorize(name), isDev: true });
    }
    return deps;
}
function detectConfigFiles(rootDir) {
    const configs = [];
    const checks = [
        { p: 'Dockerfile', type: 'docker', desc: 'Docker container config' },
        { p: 'docker-compose.yml', type: 'docker', desc: 'Docker Compose setup' },
        { p: 'docker-compose.yaml', type: 'docker', desc: 'Docker Compose setup' },
        { p: '.github/workflows', type: 'ci', desc: 'GitHub Actions CI/CD' },
        { p: '.gitlab-ci.yml', type: 'ci', desc: 'GitLab CI pipeline' },
        { p: '.env', type: 'env', desc: 'Environment variables' },
        { p: '.env.example', type: 'env', desc: 'Env variable template' },
        { p: 'tsconfig.json', type: 'build', desc: 'TypeScript config' },
        { p: 'webpack.config.js', type: 'build', desc: 'Webpack config' },
        { p: 'vite.config.ts', type: 'build', desc: 'Vite config' },
        { p: '.eslintrc.json', type: 'lint', desc: 'ESLint config' },
        { p: '.prettierrc', type: 'lint', desc: 'Prettier config' },
    ];
    for (const { p: cp, type, desc } of checks) {
        if (fs.existsSync(path.join(rootDir, cp)))
            configs.push({ path: cp, type, description: desc });
    }
    return configs;
}
function detectEnvVariables(files, rootDir) {
    const vars = new Map();
    // .env.example
    const envPath = path.join(rootDir, '.env.example');
    if (fs.existsSync(envPath)) {
        for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
            const m = line.match(/^(\w+)=/);
            if (m) {
                const comment = line.includes('#') ? line.split('#')[1]?.trim() : undefined;
                vars.set(m[1], { name: m[1], usedIn: ['.env.example'], hasDefault: line.split('=')[1]?.trim() !== '', isRequired: true, description: comment });
            }
        }
    }
    // Scan for process.env (JS/TS) and os.environ (Python)
    for (const file of files) {
        try {
            const content = fs.readFileSync(file.filePath, 'utf-8');
            const regex = file.language === 'python'
                ? /os\.(?:environ\.get|getenv)\(["'](\w+)["']/g
                : /process\.env\.(\w+)/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                const name = match[1];
                const existing = vars.get(name);
                if (existing)
                    existing.usedIn.push(file.relativePath);
                else
                    vars.set(name, { name, usedIn: [file.relativePath], hasDefault: false, isRequired: false });
            }
        }
        catch { }
    }
    return Array.from(vars.values());
}
//# sourceMappingURL=project.js.map