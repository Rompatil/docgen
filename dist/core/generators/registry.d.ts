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
import { ProjectAnalysis, DocgenConfig, GeneratedDoc } from '../../types/definitions';
/**
 * Run all configured generators and return the documentation files.
 *
 * WHY a registry instead of hardcoded calls? So users can configure
 * which generators to run via config. Running `docgen generate --only api`
 * should only run the API generator, not all of them.
 */
export declare function runGenerators(analysis: ProjectAnalysis, config: DocgenConfig): Promise<GeneratedDoc[]>;
//# sourceMappingURL=registry.d.ts.map