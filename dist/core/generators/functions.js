"use strict";
/**
 * ============================================================================
 * FUNCTION & CLASS DOCUMENTATION GENERATOR
 * ============================================================================
 *
 * Generates detailed documentation for all exported functions and classes.
 * Also optionally generates JSDoc/docstring inserts for source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFunctionDocs = generateFunctionDocs;
const reasoner_1 = require("../../ai/reasoner");
async function generateFunctionDocs(analysis, config) {
    const docs = [];
    // Group functions and classes by file
    for (const file of analysis.files) {
        const exportedFuncs = file.functions.filter(f => f.isExported);
        const exportedClasses = file.classes.filter(c => c.isExported);
        if (exportedFuncs.length === 0 && exportedClasses.length === 0)
            continue;
        const sections = [];
        sections.push(`# ${file.relativePath}\n`);
        sections.push(`**Language:** ${file.language} | **Lines:** ${file.lineCount}\n`);
        // Imports summary
        if (file.imports.length > 0) {
            const external = file.imports.filter(i => !i.isRelative);
            const internal = file.imports.filter(i => i.isRelative);
            if (external.length > 0) {
                sections.push(`**External imports:** ${external.map(i => `\`${i.source}\``).join(', ')}`);
            }
            if (internal.length > 0) {
                sections.push(`**Internal imports:** ${internal.map(i => `\`${i.source}\``).join(', ')}`);
            }
            sections.push('');
        }
        // Functions
        if (exportedFuncs.length > 0) {
            sections.push('## Functions\n');
            for (const func of exportedFuncs) {
                sections.push(formatFunctionDoc(func));
            }
        }
        // Classes
        if (exportedClasses.length > 0) {
            sections.push('## Classes\n');
            for (const cls of exportedClasses) {
                sections.push(formatClassDoc(cls));
            }
        }
        const safeName = file.relativePath.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
        docs.push({
            filePath: `docs/functions/${safeName}.md`,
            content: sections.join('\n'),
            generator: 'functions',
            generatedAt: new Date(),
            inputHash: file.contentHash,
        });
    }
    return docs;
}
function formatFunctionDoc(func) {
    const lines = [];
    const asyncPrefix = func.isAsync ? 'async ' : '';
    const params = func.params.map(p => {
        let s = p.name;
        if (p.type)
            s += `: ${p.type}`;
        if (p.isOptional)
            s += '?';
        if (p.defaultValue)
            s += ` = ${p.defaultValue}`;
        return s;
    }).join(', ');
    lines.push(`### \`${asyncPrefix}${func.name}(${params})\`\n`);
    if (func.returnType) {
        lines.push(`**Returns:** \`${func.returnType}\`\n`);
    }
    if (func.decorators.length > 0) {
        lines.push(`**Decorators:** ${func.decorators.join(', ')}\n`);
    }
    if (func.complexity > 5) {
        lines.push(`**Complexity:** ${func.complexity} ⚠️ (consider refactoring)\n`);
    }
    // Description
    if (func.existingDoc) {
        lines.push(`${cleanDoc(func.existingDoc)}\n`);
    }
    else {
        lines.push(`${(0, reasoner_1.staticFunctionSummary)(func)}\n`);
    }
    // Parameters table
    if (func.params.length > 0) {
        lines.push('**Parameters:**\n');
        lines.push('| Name | Type | Optional | Default | Description |');
        lines.push('|------|------|:--------:|---------|-------------|');
        for (const p of func.params) {
            const opt = p.isOptional ? '✓' : '—';
            const def = p.defaultValue || '—';
            const desc = p.description || '—';
            lines.push(`| \`${p.name}\` | \`${p.type || 'any'}\` | ${opt} | ${def} | ${desc} |`);
        }
        lines.push('');
    }
    lines.push(`📍 Defined at line ${func.startLine}–${func.endLine}\n`);
    lines.push('---\n');
    return lines.join('\n');
}
function formatClassDoc(cls) {
    const lines = [];
    lines.push(`### \`class ${cls.name}\`\n`);
    if (cls.superClass)
        lines.push(`**Extends:** \`${cls.superClass}\`\n`);
    if (cls.implements.length > 0)
        lines.push(`**Implements:** ${cls.implements.map(i => `\`${i}\``).join(', ')}\n`);
    if (cls.decorators.length > 0)
        lines.push(`**Decorators:** ${cls.decorators.join(', ')}\n`);
    if (cls.existingDoc)
        lines.push(`${cleanDoc(cls.existingDoc)}\n`);
    // Properties
    if (cls.properties.length > 0) {
        lines.push('**Properties:**\n');
        for (const prop of cls.properties) {
            const vis = prop.isPrivate ? '🔒' : '🔓';
            const stat = prop.isStatic ? ' (static)' : '';
            lines.push(`- ${vis} \`${prop.name}\`: \`${prop.type || 'any'}\`${stat}`);
        }
        lines.push('');
    }
    // Methods
    if (cls.methods.length > 0) {
        lines.push('**Methods:**\n');
        for (const method of cls.methods) {
            const params = method.params.map(p => p.name).join(', ');
            const ret = method.returnType ? ` → \`${method.returnType}\`` : '';
            const asyncStr = method.isAsync ? 'async ' : '';
            lines.push(`- \`${asyncStr}${method.name}(${params})\`${ret}`);
        }
        lines.push('');
    }
    lines.push(`📍 Defined at line ${cls.startLine}–${cls.endLine}\n`);
    lines.push('---\n');
    return lines.join('\n');
}
/** Clean up JSDoc/docstring formatting */
function cleanDoc(doc) {
    return doc
        .replace(/^\s*\*\s?/gm, '') // Remove JSDoc * prefixes
        .replace(/@\w+/g, '') // Remove @tags (handled separately)
        .trim();
}
//# sourceMappingURL=functions.js.map