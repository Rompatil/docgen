/**
 * ============================================================================
 * AI REASONING LAYER
 * ============================================================================
 *
 * CRITICAL ARCHITECTURE DECISION:
 * The AI layer ONLY summarizes and explains. It never invents facts.
 *
 *   AST Analysis → provides FACTS (function names, params, types, imports)
 *   AI Layer    → provides EXPLANATION (what it does, why it matters)
 *
 * This "grounded generation" approach prevents hallucination.
 * The AI can't claim a function takes 3 params when the AST says it takes 2.
 *
 * HOW IT WORKS:
 * 1. Receive structured data (from analyzers)
 * 2. Build a prompt that includes the FACTS
 * 3. Ask the LLM to explain those facts in human-readable form
 * 4. Return the explanation
 *
 * LEARNING: This is the same pattern used in RAG (Retrieval-Augmented
 * Generation) — you retrieve facts first, then generate based on those facts.
 */

import * as https from 'https';
import {
  ProjectAnalysis, ModuleInfo, FunctionInfo, ClassInfo,
  APIEndpoint, AIConfig,
} from '../types/definitions';
import { logger } from '../utils/logger';
import { truncate } from '../utils/helpers';

const log = logger.child('AI');

// ─── AI Client ───────────────────────────────────────────────────────────────

/**
 * Simple HTTP client for the Anthropic API.
 *
 * WHY not use the SDK? To minimize dependencies and make the AI
 * layer easy to swap out. The raw API is simple enough.
 *
 * For production, you'd use the official @anthropic-ai/sdk package.
 */
async function callLLM(
  prompt: string,
  systemPrompt: string,
  config: AIConfig
): Promise<string> {
  if (!config.enabled) {
    return '[AI summarization disabled — enable in config to get human-readable descriptions]';
  }

  const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY || process.env.DOCGEN_AI_KEY;

  if (!apiKey) {
    log.warn('No AI API key configured. Set ANTHROPIC_API_KEY or DOCGEN_AI_KEY env var.');
    return '[No API key configured — summaries unavailable]';
  }

  try {
    const body = JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const response = await httpPost(
      'api.anthropic.com',
      '/v1/messages',
      body,
      {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      }
    );

    const parsed = JSON.parse(response);
    if (parsed.content && parsed.content[0]) {
      return parsed.content[0].text;
    }

    log.warn('Unexpected AI response format');
    return '[AI response unavailable]';
  } catch (err: any) {
    log.error('AI call failed', { error: err.message });
    return '[AI summarization failed — using static analysis only]';
  }
}

function httpPost(
  hostname: string,
  path: string,
  body: string,
  headers: Record<string, string>
): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(body) } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a technical documentation writer. You write clear, concise, accurate documentation for software engineers.

RULES:
- Only describe what the code ACTUALLY does based on the provided analysis data
- Never invent features, parameters, or behaviors not in the data
- Use precise technical language
- Be concise — no fluff
- Write in present tense ("handles", "returns", not "will handle")
- Use markdown formatting`;

/**
 * Generate a high-level project overview.
 */
export async function summarizeProject(
  analysis: ProjectAnalysis,
  config: AIConfig
): Promise<string> {
  const prompt = `Generate a concise project overview for "${analysis.name}".

FACTS from analysis:
- Languages: ${analysis.languages.map(l => `${l.language} (${l.percentage}%)`).join(', ')}
- Frameworks: ${analysis.frameworks.map(f => f.framework).join(', ') || 'None detected'}
- Total files: ${analysis.files.length}
- Modules: ${analysis.modules.map(m => m.name).join(', ')}
- API endpoints: ${analysis.apiEndpoints.length}
- External deps: ${analysis.externalDependencies.filter(d => !d.isDev).length} production, ${analysis.externalDependencies.filter(d => d.isDev).length} dev
- Description from package.json: ${analysis.description || 'Not provided'}

Write a 2-3 paragraph overview explaining what this project is and how it's structured. Only reference what's in the facts above.`;

  return callLLM(prompt, SYSTEM_PROMPT, config);
}

/**
 * Generate a module description.
 */
export async function summarizeModule(
  module: ModuleInfo,
  config: AIConfig
): Promise<string> {
  const fileList = module.files.map(f => f.relativePath).join('\n  ');
  const exports = module.publicAPI.map(e => `${e.type}: ${e.name}`).join(', ');
  const deps = module.dependencies.join(', ') || 'None';

  const prompt = `Describe the "${module.name}" module.

FACTS:
- Files:\n  ${fileList}
- Role: ${module.role || 'unknown'}
- Public exports: ${exports || 'None'}
- Dependencies: ${deps}
- Dependents: ${module.dependents.join(', ') || 'None'}
- Lines of code: ${module.totalLines}

Write a 1-2 paragraph description of this module's purpose and responsibilities. Only reference what's in the facts.`;

  return callLLM(prompt, SYSTEM_PROMPT, config);
}

/**
 * Generate a function documentation block.
 */
export async function summarizeFunction(
  func: FunctionInfo,
  config: AIConfig
): Promise<string> {
  const params = func.params.map(p =>
    `${p.name}${p.type ? ': ' + p.type : ''}${p.isOptional ? ' (optional)' : ''}${p.defaultValue ? ' = ' + p.defaultValue : ''}`
  ).join(', ');

  const prompt = `Document the function "${func.name}".

FACTS:
- Parameters: ${params || 'none'}
- Returns: ${func.returnType || 'unknown'}
- Async: ${func.isAsync}
- Complexity: ${func.complexity}
- Decorators: ${func.decorators.join(', ') || 'None'}
${func.className ? `- Class: ${func.className}` : ''}
${func.existingDoc ? `- Existing doc: ${func.existingDoc}` : ''}
${func.body ? `- Source:\n\`\`\`\n${truncate(func.body, 500)}\n\`\`\`` : ''}

Write a brief (2-3 sentences) description of what this function does and when to use it. Only reference what's in the facts and source code.`;

  return callLLM(prompt, SYSTEM_PROMPT, config);
}

/**
 * Generate architecture explanation.
 */
export async function explainArchitecture(
  analysis: ProjectAnalysis,
  config: AIConfig
): Promise<string> {
  const moduleDescriptions = analysis.modules.map(m =>
    `- ${m.name} (${m.role || 'unknown'}): ${m.files.length} files, depends on [${m.dependencies.join(', ')}]`
  ).join('\n');

  const prompt = `Explain the architecture of "${analysis.name}".

FACTS:
Modules:
${moduleDescriptions}

Frameworks: ${analysis.frameworks.map(f => f.framework).join(', ')}
API endpoints: ${analysis.apiEndpoints.length}
External services: ${analysis.externalDependencies.filter(d => !d.isDev).map(d => `${d.name} (${d.category})`).join(', ')}

Describe:
1. The overall architecture pattern (monolith, microservice, layered, etc.)
2. How the modules relate to each other
3. The data flow through the system

Only reference what's in the facts above. Be specific.`;

  return callLLM(prompt, SYSTEM_PROMPT, config);
}

/**
 * Batch-summarize when AI is disabled — returns static analysis descriptions.
 * This ensures the tool is still useful without an API key.
 */
export function staticModuleSummary(module: ModuleInfo): string {
  const fileCount = module.files.length;
  const exportCount = module.publicAPI.length;
  const roleStr = module.role ? `Serves as a **${module.role}** layer.` : '';

  return `The \`${module.name}\` module contains ${fileCount} file${fileCount !== 1 ? 's' : ''} ` +
    `and exports ${exportCount} public symbol${exportCount !== 1 ? 's' : ''}. ${roleStr} ` +
    `Dependencies: ${module.dependencies.length > 0 ? module.dependencies.join(', ') : 'none'}. ` +
    `Used by: ${module.dependents.length > 0 ? module.dependents.join(', ') : 'none'}.`;
}

export function staticFunctionSummary(func: FunctionInfo): string {
  const params = func.params.map(p => p.name + (p.type ? `: ${p.type}` : '')).join(', ');
  const asyncStr = func.isAsync ? 'Async function' : 'Function';
  const returnStr = func.returnType ? ` Returns \`${func.returnType}\`.` : '';

  return `${asyncStr} \`${func.name}(${params})\`.${returnStr}` +
    (func.complexity > 5 ? ' ⚠️ High complexity.' : '');
}
