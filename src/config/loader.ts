/**
 * ============================================================================
 * CONFIGURATION SYSTEM
 * ============================================================================
 * Resolution order: defaults → config file → env vars → CLI overrides
 */

import * as fs from 'fs';
import * as path from 'path';
import { DocgenConfig, GeneratorName } from '../types/definitions';

export const DEFAULT_CONFIG: DocgenConfig = {
  projectRoot: process.cwd(),
  outputDir: 'docs',
  include: [
    'src/**/*.{ts,tsx,js,jsx}',
    'lib/**/*.{ts,tsx,js,jsx}',
    'app/**/*.{ts,tsx,js,jsx}',
    '**/*.py',
  ],
  exclude: [
    'node_modules/**', 'dist/**', 'build/**', '.git/**',
    '__pycache__/**', '*.min.js', '*.bundle.js', 'coverage/**',
    '.next/**', '.venv/**', 'venv/**',
  ],
  generators: ['all'],
  ai: {
    enabled: true,
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2048,
    temperature: 0.3,
  },
  cache: {
    enabled: true,
    directory: '.docgen-cache',
    ttl: 86400,
  },
  logLevel: 'info',
  insertInlineDoc: false,
  overwriteExistingDocs: false,
  concurrency: 4,
};

export function loadConfig(projectRoot: string, overrides?: Partial<DocgenConfig>): DocgenConfig {
  const config: DocgenConfig = { ...DEFAULT_CONFIG, projectRoot };

  // Try config file
  const configPaths = [
    path.join(projectRoot, 'docgen.config.json'),
    path.join(projectRoot, '.docgenrc.json'),
    path.join(projectRoot, '.docgenrc'),
  ];
  for (const cp of configPaths) {
    if (fs.existsSync(cp)) {
      try {
        const fileConfig = JSON.parse(fs.readFileSync(cp, 'utf-8'));
        Object.assign(config, fileConfig);
        if (fileConfig.ai) config.ai = { ...config.ai, ...fileConfig.ai };
        if (fileConfig.cache) config.cache = { ...config.cache, ...fileConfig.cache };
        break;
      } catch {}
    }
  }

  // Env var overrides
  if (process.env.DOCGEN_AI_KEY) config.ai.apiKey = process.env.DOCGEN_AI_KEY;
  if (process.env.ANTHROPIC_API_KEY && !config.ai.apiKey) config.ai.apiKey = process.env.ANTHROPIC_API_KEY;
  if (process.env.DOCGEN_AI_PROVIDER) config.ai.provider = process.env.DOCGEN_AI_PROVIDER;
  if (process.env.DOCGEN_AI_MODEL) config.ai.model = process.env.DOCGEN_AI_MODEL;
  if (process.env.DOCGEN_OUTPUT_DIR) config.outputDir = process.env.DOCGEN_OUTPUT_DIR;
  if (process.env.DOCGEN_LOG_LEVEL) config.logLevel = process.env.DOCGEN_LOG_LEVEL as DocgenConfig['logLevel'];

  // Programmatic overrides (CLI flags)
  if (overrides) {
    if (overrides.ai) config.ai = { ...config.ai, ...overrides.ai };
    if (overrides.cache) config.cache = { ...config.cache, ...overrides.cache };
    const { ai: _a, cache: _c, ...rest } = overrides;
    Object.assign(config, rest);
  }

  // Resolve 'all' generator
  if (config.generators.includes('all')) {
    config.generators = ['readme', 'architecture', 'modules', 'api', 'functions', 'integrations', 'setup'];
  }

  return config;
}

export function generateConfigFile(projectRoot: string): string {
  const configPath = path.join(projectRoot, 'docgen.config.json');
  const starterConfig = {
    outputDir: 'docs',
    generators: ['all'],
    ai: { enabled: true, provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
    cache: { enabled: true },
    insertInlineDoc: false,
  };
  fs.writeFileSync(configPath, JSON.stringify(starterConfig, null, 2));
  return configPath;
}
