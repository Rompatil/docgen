/**
 * ============================================================================
 * INTEGRATIONS DOCUMENTATION GENERATOR
 * ============================================================================
 */

import { ProjectAnalysis, DocgenConfig, GeneratedDoc } from '../../types/definitions';
import { hashContent } from '../../utils/helpers';

export async function generateIntegrationsDocs(
  analysis: ProjectAnalysis,
  config: DocgenConfig
): Promise<GeneratedDoc> {
  const sections: string[] = [];
  sections.push(`# Integrations & Dependencies — ${analysis.name}\n`);

  const nonDevDeps = analysis.externalDependencies.filter(d => !d.isDev);
  const categories = [...new Set(nonDevDeps.map(d => d.category))];
  const priorityOrder = ['database', 'auth', 'payment', 'cloud', 'messaging', 'http', 'framework'];
  categories.sort((a, b) => {
    const ai = priorityOrder.indexOf(a);
    const bi = priorityOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  for (const category of categories) {
    const deps = nonDevDeps.filter(d => d.category === category);
    sections.push(`## ${category.charAt(0).toUpperCase() + category.slice(1)}\n`);
    for (const dep of deps) {
      sections.push(`- **${dep.name}** ${dep.version || ''}`);
    }
    sections.push('');
  }

  const devDeps = analysis.externalDependencies.filter(d => d.isDev);
  if (devDeps.length > 0) {
    sections.push('## Dev Dependencies\n');
    for (const dep of devDeps) {
      sections.push(`- \`${dep.name}\` (${dep.category})`);
    }
    sections.push('');
  }

  const infraConfigs = analysis.configFiles.filter(c => ['docker', 'ci', 'infrastructure'].includes(c.type));
  if (infraConfigs.length > 0) {
    sections.push('## Infrastructure\n');
    for (const cfg of infraConfigs) {
      sections.push(`- **${cfg.path}** — ${cfg.description}`);
    }
    sections.push('');
  }

  return {
    filePath: 'docs/integrations.md',
    content: sections.join('\n'),
    generator: 'integrations',
    generatedAt: new Date(),
    inputHash: hashContent(analysis.externalDependencies.map(d => d.name).join(',')),
  };
}
