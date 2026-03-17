#!/usr/bin/env node
"use strict";
/**
 * ============================================================================
 * DOCGEN CLI
 * ============================================================================
 *
 * Command-line interface for the documentation platform.
 *
 * COMMANDS:
 *   docgen init          Create config file in current project
 *   docgen analyze       Analyze project and print report
 *   docgen generate      Full pipeline: analyze + generate docs
 *   docgen watch         Watch for changes and regenerate
 *   docgen serve         Start local documentation server
 *
 * DESIGN: We use Commander.js for CLI parsing. Each command maps
 * to a handler function that calls the core pipeline.
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
const commander_1 = require("commander");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const loader_1 = require("../config/loader");
const pipeline_1 = require("../core/pipeline");
const logger_1 = require("../utils/logger");
const program = new commander_1.Command();
program
    .name('docgen')
    .description('🔍 Autonomous Codebase Documentation Platform')
    .version('1.0.0');
// ─── INIT COMMAND ────────────────────────────────────────────────────────────
program
    .command('init')
    .description('Initialize docgen in current project')
    .option('-d, --dir <path>', 'Project directory', '.')
    .action(async (options) => {
    const projectRoot = path.resolve(options.dir);
    console.log('\n🔧 Initializing docgen...\n');
    // Create config file
    const configPath = (0, loader_1.generateConfigFile)(projectRoot);
    console.log(`✓ Created config file: ${configPath}`);
    // Create docs directory
    const docsDir = path.join(projectRoot, 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    console.log(`✓ Created docs directory: ${docsDir}`);
    // Create .gitignore entry for cache
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const content = fs.readFileSync(gitignorePath, 'utf-8');
        if (!content.includes('.docgen-cache')) {
            fs.appendFileSync(gitignorePath, '\n# Docgen cache\n.docgen-cache/\n');
            console.log('✓ Added .docgen-cache to .gitignore');
        }
    }
    console.log('\n✅ docgen initialized! Run `docgen generate` to create documentation.\n');
    console.log('Tip: Set ANTHROPIC_API_KEY for AI-powered summaries.\n');
});
// ─── ANALYZE COMMAND ─────────────────────────────────────────────────────────
program
    .command('analyze [dir]')
    .description('Analyze a codebase and print report')
    .option('-v, --verbose', 'Verbose output', false)
    .action(async (dir, options) => {
    const projectRoot = path.resolve(dir || '.');
    if (options.verbose)
        logger_1.logger.setLevel('debug');
    console.log(`\n🔍 Analyzing ${projectRoot}...\n`);
    const config = (0, loader_1.loadConfig)(projectRoot, {
        ai: { enabled: false, provider: '', model: '', maxTokens: 0, temperature: 0 },
    });
    const analysis = await (0, pipeline_1.runAnalysisOnly)(config);
    // Print report
    console.log('\n══════════════════════════════════════════');
    console.log('  ANALYSIS REPORT');
    console.log('══════════════════════════════════════════\n');
    console.log(`Project: ${analysis.name} ${analysis.version || ''}`);
    console.log(`Files:   ${analysis.files.length}`);
    console.log(`Modules: ${analysis.modules.length}`);
    console.log(`Endpoints: ${analysis.apiEndpoints.length}`);
    console.log(`Duration: ${analysis.analysisDuration}ms\n`);
    // Languages
    console.log('Languages:');
    for (const lang of analysis.languages) {
        const bar = '█'.repeat(Math.round(lang.percentage / 5));
        console.log(`  ${lang.language.padEnd(12)} ${bar} ${lang.percentage}% (${lang.fileCount} files)`);
    }
    console.log('');
    // Frameworks
    if (analysis.frameworks.length > 0) {
        console.log('Frameworks:');
        for (const fw of analysis.frameworks) {
            console.log(`  ✓ ${fw.framework} (${(fw.confidence * 100).toFixed(0)}% confidence)`);
        }
        console.log('');
    }
    // Modules
    console.log('Modules:');
    for (const mod of analysis.modules.slice(0, 15)) {
        const role = mod.role ? ` [${mod.role}]` : '';
        console.log(`  ${mod.name.padEnd(25)} ${mod.files.length} files${role}`);
    }
    if (analysis.modules.length > 15) {
        console.log(`  ... and ${analysis.modules.length - 15} more`);
    }
    console.log('');
    // API Endpoints
    if (analysis.apiEndpoints.length > 0) {
        console.log('API Endpoints:');
        for (const ep of analysis.apiEndpoints.slice(0, 10)) {
            const auth = ep.requiresAuth ? ' 🔒' : '';
            console.log(`  ${ep.method.padEnd(7)} ${ep.path}${auth}`);
        }
        if (analysis.apiEndpoints.length > 10) {
            console.log(`  ... and ${analysis.apiEndpoints.length - 10} more`);
        }
        console.log('');
    }
    // Errors
    if (analysis.errors.length > 0) {
        console.log(`⚠️  ${analysis.errors.length} parse errors (use --verbose to see details)`);
    }
    console.log('══════════════════════════════════════════\n');
});
// ─── GENERATE COMMAND ────────────────────────────────────────────────────────
program
    .command('generate [dir]')
    .description('Generate documentation for a project')
    .option('-o, --output <dir>', 'Output directory', 'docs')
    .option('--no-ai', 'Disable AI summaries')
    .option('--only <generators>', 'Comma-separated list of generators to run')
    .option('-v, --verbose', 'Verbose output', false)
    .action(async (dir, options) => {
    const projectRoot = path.resolve(dir || '.');
    if (options.verbose)
        logger_1.logger.setLevel('debug');
    const overrides = {
        outputDir: options.output,
    };
    if (options.ai === false) {
        overrides.ai = { enabled: false, provider: '', model: '', maxTokens: 0, temperature: 0 };
    }
    if (options.only) {
        overrides.generators = options.only.split(',').map((g) => g.trim());
    }
    const config = (0, loader_1.loadConfig)(projectRoot, overrides);
    const result = await (0, pipeline_1.runPipeline)(config);
    if (result.errors.length > 0) {
        console.log(`\n⚠️  ${result.errors.length} errors occurred during generation.`);
    }
});
// ─── WATCH COMMAND ───────────────────────────────────────────────────────────
program
    .command('watch [dir]')
    .description('Watch for changes and regenerate documentation')
    .option('-o, --output <dir>', 'Output directory', 'docs')
    .option('--no-ai', 'Disable AI summaries')
    .action(async (dir, options) => {
    const projectRoot = path.resolve(dir || '.');
    console.log(`\n👀 Watching ${projectRoot} for changes...\n`);
    console.log('Press Ctrl+C to stop.\n');
    const overrides = { outputDir: options.output };
    if (options.ai === false) {
        overrides.ai = { enabled: false, provider: '', model: '', maxTokens: 0, temperature: 0 };
    }
    const config = (0, loader_1.loadConfig)(projectRoot, overrides);
    // Initial generation
    await (0, pipeline_1.runPipeline)(config);
    // Watch for changes using polling (chokidar would be better but
    // this avoids the dependency for the minimal viable version)
    let debounceTimer = null;
    const watchDirs = ['src', 'lib', 'app', 'routes', 'api'].map(d => path.join(projectRoot, d)).filter(d => fs.existsSync(d));
    if (watchDirs.length === 0) {
        watchDirs.push(projectRoot);
    }
    // Simple polling watcher
    const seen = new Map();
    const check = () => {
        let changed = false;
        for (const watchDir of watchDirs) {
            try {
                walkDir(watchDir, (filePath) => {
                    const stat = fs.statSync(filePath);
                    const prev = seen.get(filePath);
                    if (prev !== stat.mtimeMs) {
                        seen.set(filePath, stat.mtimeMs);
                        if (prev !== undefined)
                            changed = true;
                    }
                });
            }
            catch { }
        }
        if (changed) {
            if (debounceTimer)
                clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                console.log('\n🔄 Changes detected, regenerating...\n');
                try {
                    await (0, pipeline_1.runPipeline)(config);
                }
                catch (err) {
                    console.error(`Error: ${err.message}`);
                }
            }, 1000);
        }
    };
    // Initial scan
    check();
    // Poll every 2 seconds
    setInterval(check, 2000);
});
// ─── SERVE COMMAND ───────────────────────────────────────────────────────────
program
    .command('serve [dir]')
    .description('Start local documentation server')
    .option('-p, --port <port>', 'Port number', '3333')
    .action(async (dir, options) => {
    const projectRoot = path.resolve(dir || '.');
    const docsDir = path.join(projectRoot, 'docs');
    if (!fs.existsSync(docsDir)) {
        console.log('No docs directory found. Run `docgen generate` first.');
        process.exit(1);
    }
    const port = parseInt(options.port, 10);
    console.log(`\n🌐 Starting documentation server...`);
    console.log(`   http://localhost:${port}\n`);
    // Dynamically import express to avoid failure when not installed
    try {
        const express = require('express');
        const { marked } = require('marked');
        const app = express();
        // Serve markdown files as HTML
        app.get('*', (req, res) => {
            let reqPath = req.path === '/' ? '/index.md' : req.path;
            if (!reqPath.endsWith('.md'))
                reqPath += '.md';
            const filePath = path.join(docsDir, reqPath);
            if (!fs.existsSync(filePath)) {
                // Try README
                const readmePath = path.join(projectRoot, 'README.md');
                if (req.path === '/' && fs.existsSync(readmePath)) {
                    const md = fs.readFileSync(readmePath, 'utf-8');
                    return res.send(wrapHTML(marked(md), 'Home'));
                }
                return res.status(404).send(wrapHTML('<h1>404 — Not Found</h1>', '404'));
            }
            const md = fs.readFileSync(filePath, 'utf-8');
            res.send(wrapHTML(marked(md), path.basename(filePath, '.md')));
        });
        app.listen(port);
    }
    catch {
        console.log('Express not installed. Install it with: npm install express marked');
    }
});
// ─── Parse and Execute ───────────────────────────────────────────────────────
program.parse(process.argv);
// ─── Helpers ─────────────────────────────────────────────────────────────────
function walkDir(dir, callback) {
    const excludes = new Set(['node_modules', '.git', 'dist', 'build', '.docgen-cache']);
    try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (excludes.has(entry.name) || entry.name.startsWith('.'))
                continue;
            const full = path.join(dir, entry.name);
            if (entry.isDirectory())
                walkDir(full, callback);
            else if (entry.isFile())
                callback(full);
        }
    }
    catch { }
}
function wrapHTML(body, title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Docgen</title>
  <style>
    :root { --bg: #0d1117; --fg: #c9d1d9; --accent: #58a6ff; --border: #30363d; --code-bg: #161b22; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--fg); line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 2rem; }
    h1, h2, h3 { color: #f0f6fc; margin: 1.5em 0 0.5em; }
    h1 { border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: var(--code-bg); padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
    pre { background: var(--code-bg); padding: 1em; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid var(--border); padding: 0.5em 1em; text-align: left; }
    th { background: var(--code-bg); }
    blockquote { border-left: 3px solid var(--accent); padding-left: 1em; margin: 1em 0; color: #8b949e; }
    hr { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1em; margin-bottom: 2em; }
    .header a { margin-left: 1em; }
  </style>
</head>
<body>
  <div class="header">
    <strong>📖 Docgen</strong>
    <nav><a href="/">Home</a><a href="/architecture">Architecture</a><a href="/modules/">Modules</a><a href="/api/endpoints">API</a><a href="/setup">Setup</a></nav>
  </div>
  ${body}
</body>
</html>`;
}
//# sourceMappingURL=commands.js.map