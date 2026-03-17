# src/core/pipeline.ts

**Language:** typescript | **Lines:** 65

**External imports:** `fs`, `path`
**Internal imports:** `../types/definitions`, `./analyzers/project`, `./generators/registry`, `../utils/logger`, `../utils/helpers`

## Functions

### `async runPipeline(config: DocgenConfig)`

**Returns:** `Promise`

**Complexity:** 6 ⚠️ (consider refactoring)

Async function `runPipeline(config: DocgenConfig)`. Returns `Promise`. ⚠️ High complexity.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `config` | `DocgenConfig` | — | — | — |

📍 Defined at line 27–74

---

### `async runAnalysisOnly(config: DocgenConfig)`

**Returns:** `Promise`

Async function `runAnalysisOnly(config: DocgenConfig)`. Returns `Promise`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `config` | `DocgenConfig` | — | — | — |

📍 Defined at line 76–78

---
