"use strict";
/**
 * Parser Registry — routes files to the correct language parser.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePythonFile = exports.parseJavaScriptFile = void 0;
exports.parseFile = parseFile;
exports.canParse = canParse;
exports.getSupportedLanguages = getSupportedLanguages;
const javascript_1 = require("./javascript");
const python_1 = require("./python");
const helpers_1 = require("../../utils/helpers");
const logger_1 = require("../../utils/logger");
const log = logger_1.logger.child('Parser');
const PARSERS = {
    javascript: javascript_1.parseJavaScriptFile,
    typescript: javascript_1.parseJavaScriptFile,
    python: python_1.parsePythonFile,
};
function parseFile(filePath, rootDir) {
    const language = (0, helpers_1.detectLanguage)(filePath);
    const parser = PARSERS[language];
    if (!parser) {
        log.debug(`No parser for: ${language}`, { filePath });
        return null;
    }
    try {
        return parser(filePath, (0, helpers_1.readFileContent)(filePath), rootDir);
    }
    catch (err) {
        log.error(`Parse failed: ${filePath}`, { error: err.message });
        return null;
    }
}
function canParse(filePath) {
    return (0, helpers_1.detectLanguage)(filePath) in PARSERS;
}
function getSupportedLanguages() {
    return Object.keys(PARSERS);
}
var javascript_2 = require("./javascript");
Object.defineProperty(exports, "parseJavaScriptFile", { enumerable: true, get: function () { return javascript_2.parseJavaScriptFile; } });
var python_2 = require("./python");
Object.defineProperty(exports, "parsePythonFile", { enumerable: true, get: function () { return python_2.parsePythonFile; } });
//# sourceMappingURL=registry.js.map