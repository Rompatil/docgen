"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReadme = generateReadme;
const reasoner_1 = require("../../ai/reasoner");
const helpers_1 = require("../../utils/helpers");
const logger_1 = require("../../utils/logger");
const log = logger_1.logger.child('ReadmeGen');
async function generateReadme(analysis, config) {
    log.info('Generating README.md...');
    const sections = [];
    // ── Title & Description ──────────────────────────────────────────────
    sections.push(`# ${analysis.name}\n`);
    if (analysis.description) {
        sections.push(`> ${analysis.description}\n`);
    }
    // AI-generated overview
    const overview = await (0, reasoner_1.summarizeProject)(analysis, config.ai);
    sections.push(overview + '\n');
    // ── Tech Stack ───────────────────────────────────────────────────────
    sections.push('## Technology Stack\n');
    // Languages
    if (analysis.languages.length > 0) {
        sections.push('**Languages:**\n');
        for (const lang of analysis.languages) {
            sections.push(`- ${capitalize(lang.language)} — ${lang.fileCount} files (${lang.percentage}%)`);
        }
        sections.push('');
    }
    // Frameworks
    if (analysis.frameworks.length > 0) {
        sections.push('**Frameworks & Libraries:**\n');
        for (const fw of analysis.frameworks) {
            sections.push(`- ${capitalize(fw.framework)}`);
        }
        sections.push('');
    }
    // Key dependencies
    const keyDeps = analysis.externalDependencies
        .filter(d => !d.isDev && d.category !== 'utility')
        .slice(0, 15);
    if (keyDeps.length > 0) {
        sections.push('**Key Dependencies:**\n');
        const grouped = groupBy(keyDeps, 'category');
        for (const [category, deps] of Object.entries(grouped)) {
            sections.push(`- **${capitalize(category)}:** ${deps.map(d => d.name).join(', ')}`);
        }
        sections.push('');
    }
    // ── Getting Started ──────────────────────────────────────────────────
    sections.push('## Getting Started\n');
    sections.push('### Prerequisites\n');
    const hasNode = analysis.languages.some(l => l.language === 'javascript' || l.language === 'typescript');
    const hasPython = analysis.languages.some(l => l.language === 'python');
    if (hasNode)
        sections.push('- Node.js >= 18.0.0');
    if (hasPython)
        sections.push('- Python >= 3.8');
    sections.push('');
    sections.push('### Installation\n');
    sections.push('```bash');
    sections.push(`# Clone the repository`);
    sections.push(`git clone <repository-url>`);
    sections.push(`cd ${analysis.name}`);
    if (hasNode) {
        sections.push('');
        sections.push('# Install dependencies');
        sections.push('npm install');
    }
    if (hasPython) {
        sections.push('');
        sections.push('# Install Python dependencies');
        sections.push('pip install -r requirements.txt');
    }
    sections.push('```\n');
    // ── Environment Variables ────────────────────────────────────────────
    if (analysis.envVariables.length > 0) {
        sections.push('### Environment Variables\n');
        sections.push('Create a `.env` file in the project root:\n');
        sections.push('```env');
        for (const env of analysis.envVariables) {
            const desc = env.description ? ` # ${env.description}` : '';
            sections.push(`${env.name}=${env.hasDefault ? '<has-default>' : '<required>'}${desc}`);
        }
        sections.push('```\n');
    }
    // ── Running ──────────────────────────────────────────────────────────
    sections.push('### Running the Application\n');
    sections.push('```bash');
    if (hasNode) {
        sections.push('# Development');
        sections.push('npm run dev');
        sections.push('');
        sections.push('# Production');
        sections.push('npm start');
    }
    if (hasPython) {
        sections.push('# Run the application');
        sections.push('python main.py');
    }
    sections.push('```\n');
    // ── API Overview ─────────────────────────────────────────────────────
    if (analysis.apiEndpoints.length > 0) {
        sections.push('## API Overview\n');
        sections.push(`This project exposes ${analysis.apiEndpoints.length} API endpoint${analysis.apiEndpoints.length !== 1 ? 's' : ''}.\n`);
        sections.push('| Method | Path | Handler | Auth |');
        sections.push('|--------|------|---------|------|');
        // Show first 20 endpoints
        for (const ep of analysis.apiEndpoints.slice(0, 20)) {
            const auth = ep.requiresAuth ? '🔒' : '—';
            sections.push(`| \`${ep.method}\` | \`${ep.path}\` | ${ep.handler} | ${auth} |`);
        }
        if (analysis.apiEndpoints.length > 20) {
            sections.push(`\n*...and ${analysis.apiEndpoints.length - 20} more. See [API Documentation](./docs/api/endpoints.md).*`);
        }
        sections.push('');
    }
    // ── Project Structure ────────────────────────────────────────────────
    sections.push('## Project Structure\n');
    sections.push('```');
    for (const module of analysis.modules.slice(0, 20)) {
        const role = module.role ? ` — ${module.role}` : '';
        const fileCount = module.files.length;
        sections.push(`${module.path}/  (${fileCount} files${role})`);
    }
    sections.push('```\n');
    // ── Infrastructure ───────────────────────────────────────────────────
    if (analysis.configFiles.length > 0) {
        sections.push('## Infrastructure\n');
        for (const cfg of analysis.configFiles) {
            sections.push(`- **${cfg.path}** — ${cfg.description}`);
        }
        sections.push('');
    }
    // ── Testing ──────────────────────────────────────────────────────────
    const testDeps = analysis.externalDependencies.filter(d => d.category === 'testing');
    if (testDeps.length > 0) {
        sections.push('## Testing\n');
        sections.push(`Testing framework: ${testDeps.map(d => d.name).join(', ')}\n`);
        sections.push('```bash');
        if (hasNode)
            sections.push('npm test');
        if (hasPython)
            sections.push('pytest');
        sections.push('```\n');
    }
    // ── Footer ───────────────────────────────────────────────────────────
    sections.push('---\n');
    sections.push(`*Documentation generated by [docgen](https://github.com/docgen) on ${new Date().toISOString().split('T')[0]}*`);
    const content = sections.join('\n');
    return {
        filePath: 'README.md',
        content,
        generator: 'readme',
        generatedAt: new Date(),
        inputHash: (0, helpers_1.hashContent)(JSON.stringify(analysis.name + analysis.files.length)),
    };
}
// ─── Helpers ─────────────────────────────────────────────────────────────────
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
        const k = String(item[key]);
        if (!acc[k])
            acc[k] = [];
        acc[k].push(item);
        return acc;
    }, {});
}
//# sourceMappingURL=readme.js.map