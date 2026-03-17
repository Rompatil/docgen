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

import { ProjectAnalysis, DocgenConfig, GeneratedDoc, ModuleInfo } from '../../types/definitions';
import { explainArchitecture } from '../../ai/reasoner';
import { hashContent } from '../../utils/helpers';
import { logger } from '../../utils/logger';

const log = logger.child('ArchGen');

export async function generateArchitectureDocs(
  analysis: ProjectAnalysis,
  config: DocgenConfig
): Promise<GeneratedDoc> {
  log.info('Generating architecture documentation...');

  const sections: string[] = [];

  // ── Header ───────────────────────────────────────────────────────────
  sections.push(`# Architecture — ${analysis.name}\n`);

  // AI-generated architecture explanation
  const explanation = await explainArchitecture(analysis, config.ai);
  sections.push('## Overview\n');
  sections.push(explanation + '\n');

  // ── Module Diagram ───────────────────────────────────────────────────
  sections.push('## Module Relationships\n');
  sections.push(generateMermaidModuleDiagram(analysis) + '\n');

  // ── Module Details ───────────────────────────────────────────────────
  sections.push('## Modules\n');
  for (const module of analysis.modules) {
    sections.push(`### ${module.name}\n`);
    sections.push(`- **Role:** ${module.role || 'General'}`);
    sections.push(`- **Files:** ${module.files.length}`);
    sections.push(`- **Lines:** ${module.totalLines}`);
    sections.push(`- **Exports:** ${module.publicAPI.map(e => `\`${e.name}\``).join(', ') || 'None'}`);

    if (module.dependencies.length > 0) {
      sections.push(`- **Depends on:** ${module.dependencies.map(d => `\`${d}\``).join(', ')}`);
    }
    if (module.dependents.length > 0) {
      sections.push(`- **Used by:** ${module.dependents.map(d => `\`${d}\``).join(', ')}`);
    }
    sections.push('');
  }

  // ── Dependency Graph ─────────────────────────────────────────────────
  sections.push('## Dependency Graph\n');
  sections.push(generateMermaidDependencyGraph(analysis) + '\n');

  // ── External Integrations ────────────────────────────────────────────
  const nonDevDeps = analysis.externalDependencies.filter(d => !d.isDev);
  const categories = [...new Set(nonDevDeps.map(d => d.category))].filter(c => c !== 'utility');

  if (categories.length > 0) {
    sections.push('## External Integrations\n');
    for (const cat of categories) {
      const deps = nonDevDeps.filter(d => d.category === cat);
      sections.push(`### ${capitalize(cat)}\n`);
      for (const dep of deps) {
        sections.push(`- **${dep.name}** ${dep.version || ''}`);
      }
      sections.push('');
    }
  }

  // ── Technology Layer Diagram ──────────────────────────────────────────
  sections.push('## Technology Stack\n');
  sections.push(generateStackDiagram(analysis) + '\n');

  const content = sections.join('\n');

  return {
    filePath: 'docs/architecture.md',
    content,
    generator: 'architecture',
    generatedAt: new Date(),
    inputHash: hashContent(JSON.stringify(analysis.modules.map(m => m.name))),
  };
}

// ─── Mermaid Diagram Generators ──────────────────────────────────────────────

/**
 * Generate a Mermaid flowchart showing module relationships.
 *
 * LEARNING: Mermaid is a markdown-based diagramming tool. You write
 * text like `A --> B` and it renders as a diagram. GitHub and GitLab
 * render Mermaid blocks natively in markdown files.
 */
function generateMermaidModuleDiagram(analysis: ProjectAnalysis): string {
  const lines: string[] = ['```mermaid', 'graph TD'];

  // Style definitions
  const roleStyles: Record<string, string> = {
    api: ':::api',
    service: ':::service',
    model: ':::model',
    utility: ':::util',
    config: ':::config',
    ui: ':::ui',
    middleware: ':::mw',
  };

  // Add nodes
  for (const module of analysis.modules) {
    const id = sanitizeMermaidId(module.name);
    const label = `${module.name}\\n(${module.files.length} files)`;
    const style = module.role ? roleStyles[module.role] || '' : '';
    lines.push(`  ${id}["${label}"]${style}`);
  }

  // Add edges
  const addedEdges = new Set<string>();
  for (const module of analysis.modules) {
    for (const dep of module.dependencies) {
      const fromId = sanitizeMermaidId(module.name);
      const toId = sanitizeMermaidId(dep);
      const edgeKey = `${fromId}-${toId}`;
      if (!addedEdges.has(edgeKey)) {
        lines.push(`  ${fromId} --> ${toId}`);
        addedEdges.add(edgeKey);
      }
    }
  }

  // Class definitions for styling
  lines.push('');
  lines.push('  classDef api fill:#e1f5fe,stroke:#0288d1');
  lines.push('  classDef service fill:#f3e5f5,stroke:#7b1fa2');
  lines.push('  classDef model fill:#e8f5e9,stroke:#388e3c');
  lines.push('  classDef util fill:#fff3e0,stroke:#f57c00');
  lines.push('  classDef config fill:#fce4ec,stroke:#c62828');
  lines.push('  classDef ui fill:#e0f2f1,stroke:#00695c');
  lines.push('  classDef mw fill:#f1f8e9,stroke:#558b2f');

  lines.push('```');
  return lines.join('\n');
}

function generateMermaidDependencyGraph(analysis: ProjectAnalysis): string {
  const lines: string[] = ['```mermaid', 'graph LR'];

  // Only show unique module-level dependencies
  const edges = new Set<string>();
  for (const edge of analysis.dependencyGraph) {
    const from = edge.from.split('/').slice(0, 2).join('/');
    const to = edge.to.split('/').slice(0, 2).join('/');
    if (from !== to) {
      edges.add(`${from}|${to}`);
    }
  }

  for (const edge of edges) {
    const [from, to] = edge.split('|');
    lines.push(`  ${sanitizeMermaidId(from)} --> ${sanitizeMermaidId(to)}`);
  }

  lines.push('```');
  return lines.join('\n');
}

function generateStackDiagram(analysis: ProjectAnalysis): string {
  const lines: string[] = ['```mermaid', 'graph TB'];

  // Build layer diagram
  const hasAPI = analysis.apiEndpoints.length > 0;
  const hasDB = analysis.externalDependencies.some(d => d.category === 'database');
  const hasAuth = analysis.externalDependencies.some(d => d.category === 'auth');

  if (hasAPI) {
    lines.push('  Client["Client"] --> API["API Layer"]');
  }
  if (hasAuth) {
    lines.push('  API --> Auth["Authentication"]');
  }
  lines.push('  API --> Services["Business Logic"]');
  if (hasDB) {
    const dbDeps = analysis.externalDependencies.filter(d => d.category === 'database');
    lines.push(`  Services --> DB["Database\\n(${dbDeps.map(d => d.name).join(', ')})"]`);
  }

  const cloudDeps = analysis.externalDependencies.filter(d => d.category === 'cloud');
  if (cloudDeps.length > 0) {
    lines.push(`  Services --> Cloud["Cloud Services\\n(${cloudDeps.map(d => d.name).join(', ')})"]`);
  }

  lines.push('```');
  return lines.join('\n');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sanitizeMermaidId(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
