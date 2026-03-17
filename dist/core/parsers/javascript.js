"use strict";
/**
 * ============================================================================
 * JAVASCRIPT / TYPESCRIPT PARSER (Babel AST)
 * ============================================================================
 *
 * Parses JS/TS/JSX/TSX files into structured AnalyzedFile objects.
 * Uses Babel for AST, which handles all modern syntax including decorators,
 * optional chaining, JSX, and TypeScript.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJavaScriptFile = parseJavaScriptFile;
const parser = __importStar(require("@babel/parser"));
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const path = __importStar(require("path"));
const helpers_1 = require("../../utils/helpers");
const logger_1 = require("../../utils/logger");
const log = logger_1.logger.child('JSParser');
function parseJavaScriptFile(filePath, content, rootDir) {
    const relativePath = path.relative(rootDir, filePath);
    const language = (0, helpers_1.detectLanguage)(filePath);
    const result = {
        filePath, relativePath, language,
        lineCount: (0, helpers_1.countLines)(content),
        contentHash: (0, helpers_1.hashContent)(content),
        functions: [], classes: [], imports: [], exports: [],
        apiEndpoints: [], comments: [], parseErrors: [],
    };
    let ast;
    try {
        ast = parser.parse(content, {
            sourceType: 'module',
            plugins: [
                'typescript', 'jsx',
                ['decorators', { decoratorsBeforeExport: true }],
                'classProperties', 'classPrivateProperties',
                'optionalChaining', 'nullishCoalescingOperator',
                'dynamicImport', 'topLevelAwait',
            ],
            errorRecovery: true,
        });
    }
    catch (err) {
        result.parseErrors.push({ filePath: relativePath, message: `Parse error: ${err.message}`, severity: 'error' });
        return result;
    }
    try {
        (0, traverse_1.default)(ast, {
            FunctionDeclaration(nodePath) {
                const node = nodePath.node;
                if (node.id)
                    result.functions.push(extractFunction(node, content, nodePath));
            },
            VariableDeclarator(nodePath) {
                const node = nodePath.node;
                if (t.isIdentifier(node.id) && (t.isArrowFunctionExpression(node.init) || t.isFunctionExpression(node.init))) {
                    result.functions.push(extractArrowFunc(node.id.name, node.init, content));
                }
            },
            ClassDeclaration(nodePath) {
                if (nodePath.node.id)
                    result.classes.push(extractClass(nodePath.node, content));
            },
            ImportDeclaration(nodePath) {
                result.imports.push(extractImport(nodePath.node));
            },
            ExportNamedDeclaration(nodePath) {
                extractNamedExport(nodePath.node, result.exports);
            },
            ExportDefaultDeclaration(nodePath) {
                const decl = nodePath.node.declaration;
                result.exports.push({
                    name: t.isIdentifier(decl) ? decl.name : 'default',
                    type: 'default', isDefault: true,
                });
            },
            CallExpression(nodePath) {
                const ep = detectExpressEndpoint(nodePath.node, filePath);
                if (ep)
                    result.apiEndpoints.push(ep);
            },
        });
    }
    catch (err) {
        result.parseErrors.push({ filePath: relativePath, message: `Traversal error: ${err.message}`, severity: 'warning' });
    }
    // Extract comments
    if (ast.comments) {
        result.comments = ast.comments.map(c => ({
            type: c.type === 'CommentBlock' ? (c.value.startsWith('*') ? 'jsdoc' : 'block') : 'line',
            text: c.value.trim(),
            line: c.loc?.start.line || 0,
        }));
    }
    // Mark exports
    const exportedNames = new Set(result.exports.map(e => e.name));
    for (const f of result.functions)
        if (exportedNames.has(f.name))
            f.isExported = true;
    for (const c of result.classes)
        if (exportedNames.has(c.name))
            c.isExported = true;
    return result;
}
// ─── Extraction Helpers ──────────────────────────────────────────────────────
function extractFunction(node, content, nodePath) {
    const startLine = node.loc?.start.line || 0;
    const endLine = node.loc?.end.line || 0;
    const body = content.split('\n').slice(startLine - 1, endLine).join('\n');
    return {
        name: node.id?.name || 'anonymous',
        params: extractParams(node.params),
        returnType: getReturnType(node),
        isExported: false, isAsync: node.async || false,
        startLine, endLine,
        complexity: estimateComplexity(node.body),
        existingDoc: getLeadingDoc(nodePath),
        body: body.length < 2000 ? body : undefined,
        decorators: getDecorators(node),
    };
}
function extractArrowFunc(name, node, content) {
    return {
        name,
        params: extractParams(node.params),
        returnType: getReturnType(node),
        isExported: false, isAsync: node.async || false,
        startLine: node.loc?.start.line || 0,
        endLine: node.loc?.end.line || 0,
        complexity: t.isBlockStatement(node.body) ? estimateComplexity(node.body) : 1,
        decorators: [],
    };
}
function extractParams(params) {
    return params.map(param => {
        if (t.isIdentifier(param)) {
            return {
                name: param.name,
                type: param.typeAnnotation && t.isTSTypeAnnotation(param.typeAnnotation)
                    ? typeToString(param.typeAnnotation.typeAnnotation) : undefined,
                isOptional: param.optional || false,
            };
        }
        if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
            return {
                name: param.left.name,
                defaultValue: t.isStringLiteral(param.right) ? `"${param.right.value}"` :
                    t.isNumericLiteral(param.right) ? String(param.right.value) : 'complex',
                isOptional: true,
            };
        }
        if (t.isRestElement(param) && t.isIdentifier(param.argument)) {
            return { name: `...${param.argument.name}`, type: 'rest', isOptional: false };
        }
        return { name: 'unknown', isOptional: false };
    });
}
function typeToString(node) {
    if (t.isTSStringKeyword(node))
        return 'string';
    if (t.isTSNumberKeyword(node))
        return 'number';
    if (t.isTSBooleanKeyword(node))
        return 'boolean';
    if (t.isTSVoidKeyword(node))
        return 'void';
    if (t.isTSAnyKeyword(node))
        return 'any';
    if (t.isTSArrayType(node))
        return 'array';
    if (t.isTSTypeReference(node) && t.isIdentifier(node.typeName))
        return node.typeName.name;
    return 'unknown';
}
function getReturnType(node) {
    if (node.returnType && t.isTSTypeAnnotation(node.returnType)) {
        return typeToString(node.returnType.typeAnnotation);
    }
    return undefined;
}
function extractClass(node, content) {
    const methods = [];
    const properties = [];
    for (const member of node.body.body) {
        if (t.isClassMethod(member) && t.isIdentifier(member.key)) {
            methods.push({
                name: member.key.name,
                className: node.id?.name,
                params: extractParams(member.params),
                returnType: member.returnType && t.isTSTypeAnnotation(member.returnType)
                    ? typeToString(member.returnType.typeAnnotation) : undefined,
                isExported: false, isAsync: member.async || false,
                startLine: member.loc?.start.line || 0,
                endLine: member.loc?.end.line || 0,
                complexity: estimateComplexity(member.body),
                decorators: getDecorators(member),
            });
        }
        if (t.isClassProperty(member) && t.isIdentifier(member.key)) {
            properties.push({
                name: member.key.name,
                type: member.typeAnnotation && t.isTSTypeAnnotation(member.typeAnnotation)
                    ? typeToString(member.typeAnnotation.typeAnnotation) : undefined,
                isStatic: member.static || false,
                isPrivate: member.accessibility === 'private',
            });
        }
    }
    return {
        name: node.id?.name || 'Anonymous',
        superClass: node.superClass && t.isIdentifier(node.superClass) ? node.superClass.name : undefined,
        implements: (node.implements || [])
            .filter((impl) => t.isTSExpressionWithTypeArguments(impl))
            .map(impl => t.isIdentifier(impl.expression) ? impl.expression.name : 'unknown')
            .filter(n => n !== 'unknown'),
        methods, properties,
        isExported: false,
        startLine: node.loc?.start.line || 0,
        endLine: node.loc?.end.line || 0,
        decorators: getDecorators(node),
    };
}
function extractImport(node) {
    const specifiers = [];
    let defaultImport;
    for (const spec of node.specifiers) {
        if (t.isImportDefaultSpecifier(spec))
            defaultImport = spec.local.name;
        else if (t.isImportSpecifier(spec))
            specifiers.push(t.isIdentifier(spec.imported) ? spec.imported.name : spec.local.name);
        else if (t.isImportNamespaceSpecifier(spec))
            specifiers.push(`* as ${spec.local.name}`);
    }
    const source = node.source.value;
    return { source, specifiers, isRelative: source.startsWith('.') || source.startsWith('/'), defaultImport };
}
function extractNamedExport(node, exports) {
    const decl = node.declaration;
    if (!decl) {
        // Re-exports like: export { foo } from './bar'
        if (node.specifiers) {
            for (const spec of node.specifiers)
                if (t.isExportSpecifier(spec) && t.isIdentifier(spec.exported))
                    exports.push({ name: spec.exported.name, type: 'variable', isDefault: false });
        }
        return;
    }
    if (t.isFunctionDeclaration(decl) && decl.id)
        exports.push({ name: decl.id.name, type: 'function', isDefault: false });
    else if (t.isClassDeclaration(decl) && decl.id)
        exports.push({ name: decl.id.name, type: 'class', isDefault: false });
    else if (t.isVariableDeclaration(decl))
        for (const d of decl.declarations)
            if (t.isIdentifier(d.id))
                exports.push({ name: d.id.name, type: 'variable', isDefault: false });
            else if ('id' in decl && decl.id && t.isIdentifier(decl.id))
                exports.push({ name: decl.id.name, type: 'type', isDefault: false });
}
// ─── Express Endpoint Detection ──────────────────────────────────────────────
function detectExpressEndpoint(node, filePath) {
    if (!t.isMemberExpression(node.callee))
        return null;
    const method = t.isIdentifier(node.callee.property) ? node.callee.property.name : null;
    const httpMethods = ['get', 'post', 'put', 'delete', 'patch'];
    if (!method || !httpMethods.includes(method))
        return null;
    const pathArg = node.arguments[0];
    if (!t.isStringLiteral(pathArg))
        return null;
    const args = node.arguments.slice(1);
    const middleware = [];
    let handlerName = 'anonymous';
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (i === args.length - 1) {
            if (t.isIdentifier(arg))
                handlerName = arg.name;
        }
        else {
            if (t.isIdentifier(arg))
                middleware.push(arg.name);
        }
    }
    const authKeys = ['authenticate', 'auth', 'requireAuth', 'isAuthenticated', 'protect', 'verifyToken'];
    const requiresAuth = middleware.some(m => authKeys.some(a => m.toLowerCase().includes(a.toLowerCase())));
    return {
        method: method.toUpperCase(), path: pathArg.value,
        handler: handlerName, middleware, requiresAuth,
        filePath, line: node.loc?.start.line || 0,
    };
}
// ─── Utilities ───────────────────────────────────────────────────────────────
function estimateComplexity(body) {
    let c = 1;
    const walk = (node) => {
        if (!node || typeof node !== 'object')
            return;
        if (node.type) {
            if (['IfStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement',
                'WhileStatement', 'DoWhileStatement', 'SwitchCase',
                'ConditionalExpression', 'CatchClause'].includes(node.type))
                c++;
            if (node.type === 'LogicalExpression' && (node.operator === '&&' || node.operator === '||'))
                c++;
        }
        for (const key of Object.keys(node)) {
            if (['type', 'loc', 'start', 'end', 'leadingComments', 'trailingComments'].includes(key))
                continue;
            const child = node[key];
            if (Array.isArray(child))
                child.forEach(walk);
            else if (child && typeof child === 'object' && child.type)
                walk(child);
        }
    };
    walk(body);
    return c;
}
function getDecorators(node) {
    if (!node.decorators)
        return [];
    return node.decorators.map((dec) => {
        if (t.isIdentifier(dec.expression))
            return `@${dec.expression.name}`;
        if (t.isCallExpression(dec.expression) && t.isIdentifier(dec.expression.callee))
            return `@${dec.expression.callee.name}(...)`;
        return '@unknown';
    });
}
function getLeadingDoc(nodePath) {
    try {
        const comments = nodePath.node.leadingComments;
        if (comments?.length) {
            const last = comments[comments.length - 1];
            if (last.type === 'CommentBlock' && last.value.startsWith('*'))
                return last.value;
        }
    }
    catch { }
    return undefined;
}
//# sourceMappingURL=javascript.js.map