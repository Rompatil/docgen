/**
 * ============================================================================
 * DOCGEN — Public API
 * ============================================================================
 *
 * This is the programmatic API. Use this when integrating docgen
 * into other tools, build scripts, or CI pipelines.
 *
 * USAGE:
 *   import { analyzeProject, runPipeline, loadConfig } from '@docgen/core';
 *   const config = loadConfig('./my-project');
 *   const result = await runPipeline(config);
 */

export { loadConfig, generateConfigFile, DEFAULT_CONFIG } from './config/loader';
export { runPipeline, runAnalysisOnly } from './core/pipeline';
export { analyzeProject } from './core/analyzers/project';
export { runGenerators } from './core/generators/registry';
export { parseFile, canParse, getSupportedLanguages } from './core/parsers/registry';
export { AnalysisCache } from './core/cache/file-cache';
export * from './types/definitions';
