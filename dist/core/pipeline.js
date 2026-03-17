"use strict";
/**
 * ============================================================================
 * DOCUMENTATION PIPELINE — Master Orchestrator
 * ============================================================================
 *
 *   Config → Analyze → Generate → Write → Report
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
exports.runPipeline = runPipeline;
exports.runAnalysisOnly = runAnalysisOnly;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const project_1 = require("./analyzers/project");
const registry_1 = require("./generators/registry");
const logger_1 = require("../utils/logger");
const helpers_1 = require("../utils/helpers");
const log = logger_1.logger.child('Pipeline');
async function runPipeline(config) {
    const startTime = Date.now();
    const errors = [];
    log.info('══════════════════════════════════════════════');
    log.info('  DOCGEN — Documentation Generation Pipeline');
    log.info('══════════════════════════════════════════════');
    log.info(`Project: ${config.projectRoot}`);
    log.info(`Output:  ${config.outputDir}`);
    log.info(`AI: ${config.ai.enabled ? config.ai.provider + '/' + config.ai.model : 'disabled'}`);
    // Stage 1: Analyze
    log.info('📂 Stage 1/3: Analyzing codebase...');
    const analysis = await (0, project_1.analyzeProject)(config);
    log.info(`✓ ${analysis.files.length} files, ${analysis.modules.length} modules, ${analysis.apiEndpoints.length} endpoints`);
    // Stage 2: Generate
    log.info('📝 Stage 2/3: Generating documentation...');
    const generatedDocs = await (0, registry_1.runGenerators)(analysis, config);
    log.info(`✓ ${generatedDocs.length} doc files generated`);
    // Stage 3: Write
    log.info('💾 Stage 3/3: Writing files...');
    const outputDir = path.resolve(config.projectRoot, config.outputDir);
    for (const doc of generatedDocs) {
        try {
            const finalPath = doc.filePath === 'README.md'
                ? path.join(config.projectRoot, 'README.md')
                : doc.filePath.startsWith('docs/')
                    ? path.join(config.projectRoot, doc.filePath)
                    : path.join(outputDir, doc.filePath);
            (0, helpers_1.ensureDir)(path.dirname(finalPath));
            fs.writeFileSync(finalPath, doc.content, 'utf-8');
            log.info(`  ✓ ${doc.filePath}`);
        }
        catch (err) {
            errors.push(`Failed to write ${doc.filePath}: ${err.message}`);
            log.error(`  ✗ ${doc.filePath}: ${err.message}`);
        }
    }
    const duration = Date.now() - startTime;
    log.info('');
    log.info(`✅ Done in ${(duration / 1000).toFixed(1)}s — ${generatedDocs.length} docs written to ${outputDir}`);
    return { analysis, generatedDocs, outputDir, duration, errors };
}
async function runAnalysisOnly(config) {
    return (0, project_1.analyzeProject)(config);
}
//# sourceMappingURL=pipeline.js.map