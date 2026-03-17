/**
 * ============================================================================
 * API DOCUMENTATION GENERATOR
 * ============================================================================
 *
 * Generates API endpoint documentation from detected routes.
 * Supports Express, FastAPI, Flask patterns.
 */

import { ProjectAnalysis, DocgenConfig, GeneratedDoc, APIEndpoint } from '../../types/definitions';
import { hashContent } from '../../utils/helpers';
import { logger } from '../../utils/logger';

const log = logger.child('APIGen');

export async function generateAPIDocs(
  analysis: ProjectAnalysis,
  config: DocgenConfig
): Promise<GeneratedDoc[]> {
  if (analysis.apiEndpoints.length === 0) {
    log.info('No API endpoints detected, skipping API docs');
    return [];
  }

  log.info(`Generating API docs for ${analysis.apiEndpoints.length} endpoints...`);
  const docs: GeneratedDoc[] = [];

  // Main endpoints file
  docs.push(generateEndpointsDocs(analysis));

  return docs;
}

function generateEndpointsDocs(analysis: ProjectAnalysis): GeneratedDoc {
  const sections: string[] = [];
  const endpoints = analysis.apiEndpoints;

  sections.push('# API Endpoints\n');
  sections.push(`This document describes the ${endpoints.length} API endpoints exposed by ${analysis.name}.\n`);

  // Summary table
  sections.push('## Summary\n');
  sections.push('| Method | Path | Handler | Auth Required |');
  sections.push('|--------|------|---------|:-------------:|');
  for (const ep of endpoints) {
    const auth = ep.requiresAuth ? '✅' : '—';
    sections.push(`| \`${ep.method}\` | \`${ep.path}\` | \`${ep.handler}\` | ${auth} |`);
  }
  sections.push('');

  // Group by base path
  const groups = groupEndpointsByBasePath(endpoints);

  for (const [basePath, eps] of Object.entries(groups)) {
    sections.push(`## ${basePath || '/'}\n`);

    for (const ep of eps) {
      sections.push(`### \`${ep.method} ${ep.path}\`\n`);

      sections.push(`**Handler:** \`${ep.handler}\`  `);
      sections.push(`**File:** \`${ep.filePath}\`:${ep.line}\n`);

      if (ep.requiresAuth) {
        sections.push('> 🔒 **Authentication required**\n');
      }

      if (ep.middleware.length > 0) {
        sections.push(`**Middleware:** ${ep.middleware.map(m => `\`${m}\``).join(' → ')}\n`);
      }

      // Request info
      if (ep.requestSchema) {
        sections.push('**Request Body:**\n');
        sections.push('```json');
        sections.push(JSON.stringify(ep.requestSchema, null, 2));
        sections.push('```\n');
      }

      // Response info
      if (ep.responseSchema) {
        sections.push('**Response:**\n');
        sections.push('```json');
        sections.push(JSON.stringify(ep.responseSchema, null, 2));
        sections.push('```\n');
      }

      // Example curl
      sections.push('**Example:**\n');
      sections.push('```bash');
      sections.push(generateCurlExample(ep));
      sections.push('```\n');
    }
  }

  return {
    filePath: 'docs/api/endpoints.md',
    content: sections.join('\n'),
    generator: 'api',
    generatedAt: new Date(),
    inputHash: hashContent(endpoints.map(e => e.method + e.path).join(',')),
  };
}

function groupEndpointsByBasePath(endpoints: APIEndpoint[]): Record<string, APIEndpoint[]> {
  const groups: Record<string, APIEndpoint[]> = {};

  for (const ep of endpoints) {
    // Get first path segment: /api/users/:id → /api/users
    const parts = ep.path.split('/').filter(Boolean);
    const basePath = '/' + parts.slice(0, 2).join('/');

    if (!groups[basePath]) groups[basePath] = [];
    groups[basePath].push(ep);
  }

  return groups;
}

function generateCurlExample(ep: APIEndpoint): string {
  const base = 'http://localhost:3000';
  const path = ep.path.replace(/:(\w+)/g, '{$1}');

  if (ep.method === 'GET') {
    return `curl ${base}${path}`;
  }

  return `curl -X ${ep.method} ${base}${path} \\
  -H "Content-Type: application/json" \\
  -d '{}'`;
}
