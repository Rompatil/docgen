/**
 * ============================================================================
 * DOCGEN — CORE TYPE DEFINITIONS
 * ============================================================================
 * Every module speaks this language. Analyzers produce these types,
 * generators consume them. This decouples all components.
 */
export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'rust';
export type SupportedFramework = 'express' | 'nestjs' | 'nextjs' | 'fastapi' | 'flask' | 'django' | 'react' | 'vue' | 'angular' | 'generic';
export interface AnalyzedFile {
    filePath: string;
    relativePath: string;
    language: SupportedLanguage;
    lineCount: number;
    contentHash: string;
    functions: FunctionInfo[];
    classes: ClassInfo[];
    imports: ImportInfo[];
    exports: ExportInfo[];
    apiEndpoints: APIEndpoint[];
    comments: CommentInfo[];
    parseErrors: ParseError[];
}
export interface FunctionInfo {
    name: string;
    className?: string;
    params: ParameterInfo[];
    returnType?: string;
    isExported: boolean;
    isAsync: boolean;
    startLine: number;
    endLine: number;
    complexity: number;
    existingDoc?: string;
    body?: string;
    decorators: string[];
}
export interface ParameterInfo {
    name: string;
    type?: string;
    defaultValue?: string;
    isOptional: boolean;
    description?: string;
}
export interface ClassInfo {
    name: string;
    superClass?: string;
    implements: string[];
    methods: FunctionInfo[];
    properties: PropertyInfo[];
    isExported: boolean;
    startLine: number;
    endLine: number;
    existingDoc?: string;
    decorators: string[];
}
export interface PropertyInfo {
    name: string;
    type?: string;
    isStatic: boolean;
    isPrivate: boolean;
    defaultValue?: string;
}
export interface ImportInfo {
    source: string;
    specifiers: string[];
    isRelative: boolean;
    defaultImport?: string;
}
export interface ExportInfo {
    name: string;
    type: 'function' | 'class' | 'variable' | 'type' | 'default' | 'namespace';
    isDefault: boolean;
}
export interface APIEndpoint {
    method: string;
    path: string;
    handler: string;
    middleware: string[];
    requestSchema?: SchemaInfo;
    responseSchema?: SchemaInfo;
    requiresAuth: boolean;
    filePath: string;
    line: number;
}
export interface SchemaInfo {
    type: string;
    properties?: Record<string, {
        type: string;
        required?: boolean;
        description?: string;
    }>;
    example?: unknown;
}
export interface CommentInfo {
    type: 'line' | 'block' | 'jsdoc' | 'docstring';
    text: string;
    line: number;
    associatedEntity?: string;
}
export interface ModuleInfo {
    name: string;
    path: string;
    description?: string;
    files: AnalyzedFile[];
    dependencies: string[];
    dependents: string[];
    publicAPI: ExportInfo[];
    totalLines: number;
    role?: 'api' | 'service' | 'model' | 'utility' | 'config' | 'test' | 'ui' | 'middleware';
}
export interface ProjectAnalysis {
    name: string;
    rootPath: string;
    version?: string;
    description?: string;
    languages: LanguageStats[];
    frameworks: FrameworkDetection[];
    files: AnalyzedFile[];
    modules: ModuleInfo[];
    dependencyGraph: DependencyEdge[];
    externalDependencies: ExternalDependency[];
    apiEndpoints: APIEndpoint[];
    configFiles: ConfigFile[];
    envVariables: EnvVariable[];
    analyzedAt: Date;
    analysisDuration: number;
    errors: ParseError[];
}
export interface LanguageStats {
    language: string;
    fileCount: number;
    lineCount: number;
    percentage: number;
}
export interface FrameworkDetection {
    framework: string;
    confidence: number;
    evidence: string[];
}
export interface DependencyEdge {
    from: string;
    to: string;
    type: 'import' | 'extends' | 'implements' | 'uses' | 'calls';
    symbols: string[];
}
export interface ExternalDependency {
    name: string;
    version?: string;
    category: string;
    isDev: boolean;
}
export interface ConfigFile {
    path: string;
    type: string;
    description?: string;
}
export interface EnvVariable {
    name: string;
    usedIn: string[];
    hasDefault: boolean;
    isRequired: boolean;
    description?: string;
}
export interface ParseError {
    filePath: string;
    line?: number;
    message: string;
    severity: 'warning' | 'error';
}
export interface DocgenConfig {
    projectRoot: string;
    outputDir: string;
    include: string[];
    exclude: string[];
    generators: GeneratorName[];
    ai: AIConfig;
    cache: CacheConfig;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    insertInlineDoc: boolean;
    overwriteExistingDocs: boolean;
    concurrency: number;
}
export type GeneratorName = 'readme' | 'architecture' | 'modules' | 'api' | 'functions' | 'integrations' | 'setup' | 'all';
export interface AIConfig {
    enabled: boolean;
    provider: string;
    apiKey?: string;
    model: string;
    maxTokens: number;
    temperature: number;
}
export interface CacheConfig {
    enabled: boolean;
    directory: string;
    ttl: number;
}
export interface GeneratedDoc {
    filePath: string;
    content: string;
    generator: GeneratorName;
    generatedAt: Date;
    inputHash: string;
}
export interface DocgenPlugin {
    name: string;
    version: string;
    init?(config: DocgenConfig): Promise<void>;
    analyzers?: PluginAnalyzer[];
    generators?: PluginGenerator[];
}
export interface PluginAnalyzer {
    extensions: string[];
    analyze(filePath: string, content: string): Promise<AnalyzedFile>;
}
export interface PluginGenerator {
    name: string;
    generate(analysis: ProjectAnalysis, config: DocgenConfig): Promise<GeneratedDoc[]>;
}
//# sourceMappingURL=definitions.d.ts.map