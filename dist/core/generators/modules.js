"use strict";
/**
 * ============================================================================
 * MODULE DOCUMENTATION GENERATOR
 * ============================================================================
 *
 * Generates a documentation page for each significant module.
 * Output: docs/modules/{module-name}.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModuleDocs = generateModuleDocs;
const reasoner_1 = require("../../ai/reasoner");
const helpers_1 = require("../../utils/helpers");
const logger_1 = require("../../utils/logger");
const log = logger_1.logger.child('ModuleGen');
async function generateModuleDocs(analysis, config) {
    log.info(`Generating documentation for ${analysis.modules.length} modules...`);
    const docs = [];
    // Generate index page
    docs.push(generateModuleIndex(analysis));
    // Generate per-module docs
    for (const module of analysis.modules) {
        if (module.files.length < 1)
            continue; // Skip empty modules
        const doc = await generateSingleModuleDoc(module, config);
        docs.push(doc);
    }
    return docs;
}
function generateModuleIndex(analysis) {
    const sections = [];
    sections.push('# Modules\n');
    sections.push('This project is organized into the following modules:\n');
    sections.push('| Module | Role | Files | Lines | Dependencies |');
    sections.push('|--------|------|-------|-------|-------------|');
    for (const module of analysis.modules) {
        const link = `[${module.name}](./modules/${sanitizeFilename(module.name)}.md)`;
        const role = module.role || '—';
        const deps = module.dependencies.length || 0;
        sections.push(`| ${link} | ${role} | ${module.files.length} | ${module.totalLines} | ${deps} |`);
    }
    return {
        filePath: 'docs/modules/index.md',
        content: sections.join('\n'),
        generator: 'modules',
        generatedAt: new Date(),
        inputHash: (0, helpers_1.hashContent)(analysis.modules.map(m => m.name).join(',')),
    };
}
async function generateSingleModuleDoc(module, config) {
    const sections = [];
    // Header
    sections.push(`# Module: ${module.name}\n`);
    // Role badge
    if (module.role) {
        sections.push(`> **Role:** ${module.role}\n`);
    }
    // Description
    const description = config.ai.enabled
        ? await (0, reasoner_1.summarizeModule)(module, config.ai)
        : (0, reasoner_1.staticModuleSummary)(module);
    sections.push('## Overview\n');
    sections.push(description + '\n');
    // Files
    sections.push('## Files\n');
    for (const file of module.files) {
        const funcCount = file.functions.length;
        const classCount = file.classes.length;
        const meta = [];
        if (funcCount > 0)
            meta.push(`${funcCount} functions`);
        if (classCount > 0)
            meta.push(`${classCount} classes`);
        sections.push(`- \`${file.relativePath}\` — ${meta.join(', ') || `${file.lineCount} lines`}`);
    }
    sections.push('');
    // Public API
    if (module.publicAPI.length > 0) {
        sections.push('## Public API\n');
        for (const exp of module.publicAPI) {
            sections.push(`- \`${exp.type}\` **${exp.name}**${exp.isDefault ? ' (default)' : ''}`);
        }
        sections.push('');
    }
    // Key Functions
    const allFunctions = module.files.flatMap(f => f.functions).filter(f => f.isExported);
    if (allFunctions.length > 0) {
        sections.push('## Key Functions\n');
        for (const func of allFunctions.slice(0, 20)) {
            const params = func.params.map(p => `${p.name}${p.type ? ': ' + p.type : ''}`).join(', ');
            sections.push(`### \`${func.name}(${params})\`\n`);
            if (func.returnType) {
                sections.push(`**Returns:** \`${func.returnType}\`\n`);
            }
            const summary = (0, reasoner_1.staticFunctionSummary)(func);
            sections.push(summary + '\n');
        }
    }
    // Classes
    const allClasses = module.files.flatMap(f => f.classes);
    if (allClasses.length > 0) {
        sections.push('## Classes\n');
        for (const cls of allClasses) {
            sections.push(`### \`${cls.name}\`\n`);
            if (cls.superClass)
                sections.push(`**Extends:** \`${cls.superClass}\`\n`);
            if (cls.implements.length > 0)
                sections.push(`**Implements:** ${cls.implements.map(i => `\`${i}\``).join(', ')}\n`);
            if (cls.methods.length > 0) {
                sections.push('**Methods:**\n');
                for (const method of cls.methods) {
                    const params = method.params.map(p => p.name).join(', ');
                    const vis = method.name.startsWith('_') ? '🔒' : '🔓';
                    sections.push(`- ${vis} \`${method.name}(${params})\`${method.returnType ? ` → \`${method.returnType}\`` : ''}`);
                }
                sections.push('');
            }
        }
    }
    // Dependencies
    if (module.dependencies.length > 0) {
        sections.push('## Dependencies\n');
        sections.push('This module depends on:\n');
        for (const dep of module.dependencies) {
            sections.push(`- [\`${dep}\`](./modules/${sanitizeFilename(dep)}.md)`);
        }
        sections.push('');
    }
    // Dependents
    if (module.dependents.length > 0) {
        sections.push('## Used By\n');
        for (const dep of module.dependents) {
            sections.push(`- [\`${dep}\`](./modules/${sanitizeFilename(dep)}.md)`);
        }
        sections.push('');
    }
    return {
        filePath: `docs/modules/${sanitizeFilename(module.name)}.md`,
        content: sections.join('\n'),
        generator: 'modules',
        generatedAt: new Date(),
        inputHash: (0, helpers_1.hashContent)(module.files.map(f => f.contentHash).join(',')),
    };
}
function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-');
}
//# sourceMappingURL=modules.js.map