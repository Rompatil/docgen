"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeProject = summarizeProject;
exports.summarizeModule = summarizeModule;
exports.summarizeFunction = summarizeFunction;
exports.explainArchitecture = explainArchitecture;
exports.staticModuleSummary = staticModuleSummary;
exports.staticFunctionSummary = staticFunctionSummary;
const https = __importStar(require("https"));
const logger_1 = require("../utils/logger");
const helpers_1 = require("../utils/helpers");
const log = logger_1.logger.child('AI');
// ─── AI Client ───────────────────────────────────────────────────────────────
/**
 * Simple HTTP client for the Anthropic API.
 *
 * WHY not use the SDK? To minimize dependencies and make the AI
 * layer easy to swap out. The raw API is simple enough.
 *
 * For production, you'd use the official @anthropic-ai/sdk package.
 */
async function callLLM(prompt, systemPrompt, config) {
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
        const response = await httpPost('api.anthropic.com', '/v1/messages', body, {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        });
        const parsed = JSON.parse(response);
        if (parsed.content && parsed.content[0]) {
            return parsed.content[0].text;
        }
        log.warn('Unexpected AI response format');
        return '[AI response unavailable]';
    }
    catch (err) {
        log.error('AI call failed', { error: err.message });
        return '[AI summarization failed — using static analysis only]';
    }
}
function httpPost(hostname, path, body, headers) {
    return new Promise((resolve, reject) => {
        const req = https.request({ hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(body) } }, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(data));
        });
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
async function summarizeProject(analysis, config) {
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
async function summarizeModule(module, config) {
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
async function summarizeFunction(func, config) {
    const params = func.params.map(p => `${p.name}${p.type ? ': ' + p.type : ''}${p.isOptional ? ' (optional)' : ''}${p.defaultValue ? ' = ' + p.defaultValue : ''}`).join(', ');
    const prompt = `Document the function "${func.name}".

FACTS:
- Parameters: ${params || 'none'}
- Returns: ${func.returnType || 'unknown'}
- Async: ${func.isAsync}
- Complexity: ${func.complexity}
- Decorators: ${func.decorators.join(', ') || 'None'}
${func.className ? `- Class: ${func.className}` : ''}
${func.existingDoc ? `- Existing doc: ${func.existingDoc}` : ''}
${func.body ? `- Source:\n\`\`\`\n${(0, helpers_1.truncate)(func.body, 500)}\n\`\`\`` : ''}

Write a brief (2-3 sentences) description of what this function does and when to use it. Only reference what's in the facts and source code.`;
    return callLLM(prompt, SYSTEM_PROMPT, config);
}
/**
 * Generate architecture explanation.
 */
async function explainArchitecture(analysis, config) {
    const moduleDescriptions = analysis.modules.map(m => `- ${m.name} (${m.role || 'unknown'}): ${m.files.length} files, depends on [${m.dependencies.join(', ')}]`).join('\n');
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
function staticModuleSummary(module) {
    const fileCount = module.files.length;
    const exportCount = module.publicAPI.length;
    const roleStr = module.role ? `Serves as a **${module.role}** layer.` : '';
    return `The \`${module.name}\` module contains ${fileCount} file${fileCount !== 1 ? 's' : ''} ` +
        `and exports ${exportCount} public symbol${exportCount !== 1 ? 's' : ''}. ${roleStr} ` +
        `Dependencies: ${module.dependencies.length > 0 ? module.dependencies.join(', ') : 'none'}. ` +
        `Used by: ${module.dependents.length > 0 ? module.dependents.join(', ') : 'none'}.`;
}
function staticFunctionSummary(func) {
    const params = func.params.map(p => p.name + (p.type ? `: ${p.type}` : '')).join(', ');
    const asyncStr = func.isAsync ? 'Async function' : 'Function';
    const returnStr = func.returnType ? ` Returns \`${func.returnType}\`.` : '';
    return `${asyncStr} \`${func.name}(${params})\`.${returnStr}` +
        (func.complexity > 5 ? ' ⚠️ High complexity.' : '');
}
//# sourceMappingURL=reasoner.js.map