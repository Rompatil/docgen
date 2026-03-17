"use strict";
/**
 * ============================================================================
 * GENERATOR REGISTRY
 * ============================================================================
 *
 * Central registry of all documentation generators.
 * This is the "Strategy" pattern — the pipeline calls generators
 * by name, and this module resolves the name to an implementation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSetupDocs = exports.generateIntegrationsDocs = exports.generateFunctionDocs = exports.generateAPIDocs = exports.generateModuleDocs = exports.generateArchitectureDocs = exports.generateReadme = void 0;
exports.runGenerators = runGenerators;
var readme_1 = require("./readme");
Object.defineProperty(exports, "generateReadme", { enumerable: true, get: function () { return readme_1.generateReadme; } });
var architecture_1 = require("./architecture");
Object.defineProperty(exports, "generateArchitectureDocs", { enumerable: true, get: function () { return architecture_1.generateArchitectureDocs; } });
var modules_1 = require("./modules");
Object.defineProperty(exports, "generateModuleDocs", { enumerable: true, get: function () { return modules_1.generateModuleDocs; } });
var api_1 = require("./api");
Object.defineProperty(exports, "generateAPIDocs", { enumerable: true, get: function () { return api_1.generateAPIDocs; } });
var functions_1 = require("./functions");
Object.defineProperty(exports, "generateFunctionDocs", { enumerable: true, get: function () { return functions_1.generateFunctionDocs; } });
var integrations_1 = require("./integrations");
Object.defineProperty(exports, "generateIntegrationsDocs", { enumerable: true, get: function () { return integrations_1.generateIntegrationsDocs; } });
var setup_1 = require("./setup");
Object.defineProperty(exports, "generateSetupDocs", { enumerable: true, get: function () { return setup_1.generateSetupDocs; } });
const readme_2 = require("./readme");
const architecture_2 = require("./architecture");
const modules_2 = require("./modules");
const api_2 = require("./api");
const functions_2 = require("./functions");
const integrations_2 = require("./integrations");
const setup_2 = require("./setup");
const logger_1 = require("../../utils/logger");
const log = logger_1.logger.child('Generators');
/**
 * Run all configured generators and return the documentation files.
 *
 * WHY a registry instead of hardcoded calls? So users can configure
 * which generators to run via config. Running `docgen generate --only api`
 * should only run the API generator, not all of them.
 */
async function runGenerators(analysis, config) {
    const allDocs = [];
    const generators = config.generators;
    log.info(`Running generators: ${generators.join(', ')}`);
    for (const name of generators) {
        try {
            log.info(`Running generator: ${name}`);
            const docs = await runSingleGenerator(name, analysis, config);
            allDocs.push(...docs);
            log.info(`Generator ${name} produced ${docs.length} file(s)`);
        }
        catch (err) {
            log.error(`Generator ${name} failed: ${err.message}`);
        }
    }
    return allDocs;
}
async function runSingleGenerator(name, analysis, config) {
    switch (name) {
        case 'readme': {
            const doc = await (0, readme_2.generateReadme)(analysis, config);
            return [doc];
        }
        case 'architecture': {
            const doc = await (0, architecture_2.generateArchitectureDocs)(analysis, config);
            return [doc];
        }
        case 'modules':
            return (0, modules_2.generateModuleDocs)(analysis, config);
        case 'api':
            return (0, api_2.generateAPIDocs)(analysis, config);
        case 'functions':
            return (0, functions_2.generateFunctionDocs)(analysis, config);
        case 'integrations': {
            const doc = await (0, integrations_2.generateIntegrationsDocs)(analysis, config);
            return [doc];
        }
        case 'setup': {
            const doc = await (0, setup_2.generateSetupDocs)(analysis, config);
            return [doc];
        }
        default:
            log.warn(`Unknown generator: ${name}`);
            return [];
    }
}
//# sourceMappingURL=registry.js.map