"use strict";
/**
 * ============================================================================
 * DOCGEN — Public API
 * ============================================================================
 *
 * This is the programmatic API. Use this when integrating docgen
 * into other tools, build scripts, or CI pipelines.
 *
 * USAGE:
 *   import { analyzeProject, runPipeline, loadConfig } from '@docgen/core';
 *   const config = loadConfig('./my-project');
 *   const result = await runPipeline(config);
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisCache = exports.getSupportedLanguages = exports.canParse = exports.parseFile = exports.runGenerators = exports.analyzeProject = exports.runAnalysisOnly = exports.runPipeline = exports.DEFAULT_CONFIG = exports.generateConfigFile = exports.loadConfig = void 0;
var loader_1 = require("./config/loader");
Object.defineProperty(exports, "loadConfig", { enumerable: true, get: function () { return loader_1.loadConfig; } });
Object.defineProperty(exports, "generateConfigFile", { enumerable: true, get: function () { return loader_1.generateConfigFile; } });
Object.defineProperty(exports, "DEFAULT_CONFIG", { enumerable: true, get: function () { return loader_1.DEFAULT_CONFIG; } });
var pipeline_1 = require("./core/pipeline");
Object.defineProperty(exports, "runPipeline", { enumerable: true, get: function () { return pipeline_1.runPipeline; } });
Object.defineProperty(exports, "runAnalysisOnly", { enumerable: true, get: function () { return pipeline_1.runAnalysisOnly; } });
var project_1 = require("./core/analyzers/project");
Object.defineProperty(exports, "analyzeProject", { enumerable: true, get: function () { return project_1.analyzeProject; } });
var registry_1 = require("./core/generators/registry");
Object.defineProperty(exports, "runGenerators", { enumerable: true, get: function () { return registry_1.runGenerators; } });
var registry_2 = require("./core/parsers/registry");
Object.defineProperty(exports, "parseFile", { enumerable: true, get: function () { return registry_2.parseFile; } });
Object.defineProperty(exports, "canParse", { enumerable: true, get: function () { return registry_2.canParse; } });
Object.defineProperty(exports, "getSupportedLanguages", { enumerable: true, get: function () { return registry_2.getSupportedLanguages; } });
var file_cache_1 = require("./core/cache/file-cache");
Object.defineProperty(exports, "AnalysisCache", { enumerable: true, get: function () { return file_cache_1.AnalysisCache; } });
__exportStar(require("./types/definitions"), exports);
//# sourceMappingURL=index.js.map