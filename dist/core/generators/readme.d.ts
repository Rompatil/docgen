/**
 * ============================================================================
 * README GENERATOR
 * ============================================================================
 *
 * Generates a comprehensive README.md from project analysis.
 *
 * TEMPLATE STRUCTURE:
 * 1. Project title + description
 * 2. Technology stack
 * 3. Architecture overview
 * 4. Getting started (setup, install, run)
 * 5. Environment variables
 * 6. API overview (if applicable)
 * 7. Project structure
 * 8. Testing
 * 9. Contributing
 *
 * WHY generate README? Because most READMEs are either missing or outdated.
 * An auto-generated README that's always in sync with the code is
 * dramatically more useful than a hand-written one from 6 months ago.
 */
import { ProjectAnalysis, DocgenConfig, GeneratedDoc } from '../../types/definitions';
export declare function generateReadme(analysis: ProjectAnalysis, config: DocgenConfig): Promise<GeneratedDoc>;
//# sourceMappingURL=readme.d.ts.map