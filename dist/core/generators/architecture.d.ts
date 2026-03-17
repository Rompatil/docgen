/**
 * ============================================================================
 * ARCHITECTURE GENERATOR
 * ============================================================================
 *
 * Generates architecture documentation including:
 * - System overview
 * - Module relationship diagram (Mermaid)
 * - Dependency graph
 * - Data flow description
 *
 * The Mermaid diagrams render on GitHub, GitLab, and most doc platforms,
 * making them ideal for auto-generated architecture docs.
 */
import { ProjectAnalysis, DocgenConfig, GeneratedDoc } from '../../types/definitions';
export declare function generateArchitectureDocs(analysis: ProjectAnalysis, config: DocgenConfig): Promise<GeneratedDoc>;
//# sourceMappingURL=architecture.d.ts.map