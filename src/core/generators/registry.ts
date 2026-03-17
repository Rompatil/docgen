/**
 * ============================================================================
 * GENERATOR REGISTRY
 * ============================================================================
 *
 * Central registry of all documentation generators.
 * This is the "Strategy" pattern — the pipeline calls generators
 * by name, and this module resolves the name to an implementation.
 */

export { generateReadme } from './readme';
export { generateArchitectureDocs } from './architecture';
export { generateModuleDocs } from './modules';
export { generateAPIDocs } from './api';
export { generateFunctionDocs } from './functions';
export { generateIntegrationsDocs } from './integrations';
export { generateSetupDocs } from './setup';

import { ProjectAnalysis, DocgenConfig, GeneratedDoc, GeneratorName } from '../../types/definitions';
import { generateReadme } from './readme';
import { generateArchitectureDocs } from './architecture';
import { generateModuleDocs } from './modules';
import { generateAPIDocs } from './api';
import { generateFunctionDocs } from './functions';
import { generateIntegrationsDocs } from './integrations';
import { generateSetupDocs } from './setup';
import { logger } from '../../utils/logger';

const log = logger.child('Generators');

/**
 * Run all configured generators and return the documentation files.
 *
 * WHY a registry instead of hardcoded calls? So users can configure
 * which generators to run via config. Running `docgen generate --only api`
 * should only run the API generator, not all of them.
 */
export async function runGenerators(
  analysis: ProjectAnalysis,
  config: DocgenConfig
): Promise<GeneratedDoc[]> {
  const allDocs: GeneratedDoc[] = [];
  const generators = config.generators;

  log.info(`Running generators: ${generators.join(', ')}`);

  for (const name of generators) {
    try {
      log.info(`Running generator: ${name}`);
      const docs = await runSingleGenerator(name, analysis, config);
      allDocs.push(...docs);
      log.info(`Generator ${name} produced ${docs.length} file(s)`);
    } catch (err: any) {
      log.error(`Generator ${name} failed: ${err.message}`);
    }
  }

  return allDocs;
}

async function runSingleGenerator(
  name: GeneratorName,
  analysis: ProjectAnalysis,
  config: DocgenConfig
): Promise<GeneratedDoc[]> {
  switch (name) {
    case 'readme': {
      const doc = await generateReadme(analysis, config);
      return [doc];
    }
    case 'architecture': {
      const doc = await generateArchitectureDocs(analysis, config);
      return [doc];
    }
    case 'modules':
      return generateModuleDocs(analysis, config);
    case 'api':
      return generateAPIDocs(analysis, config);
    case 'functions':
      return generateFunctionDocs(analysis, config);
    case 'integrations': {
      const doc = await generateIntegrationsDocs(analysis, config);
      return [doc];
    }
    case 'setup': {
      const doc = await generateSetupDocs(analysis, config);
      return [doc];
    }
    default:
      log.warn(`Unknown generator: ${name}`);
      return [];
  }
}
