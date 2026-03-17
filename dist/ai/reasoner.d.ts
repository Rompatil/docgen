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
import { ProjectAnalysis, ModuleInfo, FunctionInfo, AIConfig } from '../types/definitions';
/**
 * Generate a high-level project overview.
 */
export declare function summarizeProject(analysis: ProjectAnalysis, config: AIConfig): Promise<string>;
/**
 * Generate a module description.
 */
export declare function summarizeModule(module: ModuleInfo, config: AIConfig): Promise<string>;
/**
 * Generate a function documentation block.
 */
export declare function summarizeFunction(func: FunctionInfo, config: AIConfig): Promise<string>;
/**
 * Generate architecture explanation.
 */
export declare function explainArchitecture(analysis: ProjectAnalysis, config: AIConfig): Promise<string>;
/**
 * Batch-summarize when AI is disabled — returns static analysis descriptions.
 * This ensures the tool is still useful without an API key.
 */
export declare function staticModuleSummary(module: ModuleInfo): string;
export declare function staticFunctionSummary(func: FunctionInfo): string;
//# sourceMappingURL=reasoner.d.ts.map