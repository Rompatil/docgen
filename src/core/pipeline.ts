/**
 * ============================================================================
 * DOCUMENTATION PIPELINE — Master Orchestrator
 * ============================================================================
 *
 *   Config → Analyze → Generate → Write → Report
 */

import * as fs from 'fs';
import * as path from 'path';
import { DocgenConfig, ProjectAnalysis, GeneratedDoc } from '../types/definitions';
import { analyzeProject } from './analyzers/project';
import { runGenerators } from './generators/registry';
import { logger } from '../utils/logger';
import { ensureDir } from '../utils/helpers';

const log = logger.child('Pipeline');

export interface PipelineResult {
  analysis: ProjectAnalysis;
  generatedDocs: GeneratedDoc[];
  outputDir: string;
  duration: number;
  errors: string[];
}

export async function runPipeline(config: DocgenConfig): Promise<PipelineResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  log.info('══════════════════════════════════════════════');
  log.info('  DOCGEN — Documentation Generation Pipeline');
  log.info('══════════════════════════════════════════════');
  log.info(`Project: ${config.projectRoot}`);
  log.info(`Output:  ${config.outputDir}`);
  log.info(`AI: ${config.ai.enabled ? config.ai.provider + '/' + config.ai.model : 'disabled'}`);

  // Stage 1: Analyze
  log.info('📂 Stage 1/3: Analyzing codebase...');
  const analysis = await analyzeProject(config);
  log.info(`✓ ${analysis.files.length} files, ${analysis.modules.length} modules, ${analysis.apiEndpoints.length} endpoints`);

  // Stage 2: Generate
  log.info('📝 Stage 2/3: Generating documentation...');
  const generatedDocs = await runGenerators(analysis, config);
  log.info(`✓ ${generatedDocs.length} doc files generated`);

  // Stage 3: Write
  log.info('💾 Stage 3/3: Writing files...');
  const outputDir = path.resolve(config.projectRoot, config.outputDir);

  for (const doc of generatedDocs) {
    try {
      const finalPath = doc.filePath === 'README.md'
        ? path.join(config.projectRoot, 'README.md')
        : doc.filePath.startsWith('docs/')
          ? path.join(config.projectRoot, doc.filePath)
          : path.join(outputDir, doc.filePath);

      ensureDir(path.dirname(finalPath));
      fs.writeFileSync(finalPath, doc.content, 'utf-8');
      log.info(`  ✓ ${doc.filePath}`);
    } catch (err: any) {
      errors.push(`Failed to write ${doc.filePath}: ${err.message}`);
      log.error(`  ✗ ${doc.filePath}: ${err.message}`);
    }
  }

  const duration = Date.now() - startTime;
  log.info('');
  log.info(`✅ Done in ${(duration / 1000).toFixed(1)}s — ${generatedDocs.length} docs written to ${outputDir}`);

  return { analysis, generatedDocs, outputDir, duration, errors };
}

export async function runAnalysisOnly(config: DocgenConfig): Promise<ProjectAnalysis> {
  return analyzeProject(config);
}
