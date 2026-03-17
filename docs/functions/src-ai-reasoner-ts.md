# src/ai/reasoner.ts

**Language:** typescript | **Lines:** 218

**External imports:** `https`
**Internal imports:** `../types/definitions`, `../utils/logger`, `../utils/helpers`

## Functions

### `async summarizeProject(analysis: ProjectAnalysis, config: AIConfig)`

**Returns:** `Promise`

Async function `summarizeProject(analysis: ProjectAnalysis, config: AIConfig)`. Returns `Promise`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `analysis` | `ProjectAnalysis` | — | — | — |
| `config` | `AIConfig` | — | — | — |

📍 Defined at line 130–148

---

### `async summarizeModule(module: ModuleInfo, config: AIConfig)`

**Returns:** `Promise`

Async function `summarizeModule(module: ModuleInfo, config: AIConfig)`. Returns `Promise`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `module` | `ModuleInfo` | — | — | — |
| `config` | `AIConfig` | — | — | — |

📍 Defined at line 153–174

---

### `async summarizeFunction(func: FunctionInfo, config: AIConfig)`

**Returns:** `Promise`

**Complexity:** 10 ⚠️ (consider refactoring)

Async function `summarizeFunction(func: FunctionInfo, config: AIConfig)`. Returns `Promise`. ⚠️ High complexity.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `func` | `FunctionInfo` | — | — | — |
| `config` | `AIConfig` | — | — | — |

📍 Defined at line 179–202

---

### `async explainArchitecture(analysis: ProjectAnalysis, config: AIConfig)`

**Returns:** `Promise`

Async function `explainArchitecture(analysis: ProjectAnalysis, config: AIConfig)`. Returns `Promise`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `analysis` | `ProjectAnalysis` | — | — | — |
| `config` | `AIConfig` | — | — | — |

📍 Defined at line 207–233

---

### `staticModuleSummary(module: ModuleInfo)`

**Returns:** `string`

**Complexity:** 6 ⚠️ (consider refactoring)

Function `staticModuleSummary(module: ModuleInfo)`. Returns `string`. ⚠️ High complexity.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `module` | `ModuleInfo` | — | — | — |

📍 Defined at line 239–248

---

### `staticFunctionSummary(func: FunctionInfo)`

**Returns:** `string`

Function `staticFunctionSummary(func: FunctionInfo)`. Returns `string`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `func` | `FunctionInfo` | — | — | — |

📍 Defined at line 250–257

---
