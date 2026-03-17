/**
 * ============================================================================
 * DOCUMENTATION PIPELINE — Master Orchestrator
 * ============================================================================
 *
 *   Config → Analyze → Generate → Write → Report
 */
import { DocgenConfig, ProjectAnalysis, GeneratedDoc } from '../types/definitions';
export interface PipelineResult {
    analysis: ProjectAnalysis;
    generatedDocs: GeneratedDoc[];
    outputDir: string;
    duration: number;
    errors: string[];
}
export declare function runPipeline(config: DocgenConfig): Promise<PipelineResult>;
export declare function runAnalysisOnly(config: DocgenConfig): Promise<ProjectAnalysis>;
//# sourceMappingURL=pipeline.d.ts.map