# src/core/parsers/registry.ts

**Language:** typescript | **Lines:** 42

**Internal imports:** `../../types/definitions`, `./javascript`, `./python`, `../../utils/helpers`, `../../utils/logger`

## Functions

### `parseFile(filePath: string, rootDir: string)`

**Returns:** `unknown`

Function `parseFile(filePath: string, rootDir: string)`. Returns `unknown`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `filePath` | `string` | — | — | — |
| `rootDir` | `string` | — | — | — |

📍 Defined at line 19–29

---

### `canParse(filePath: string)`

**Returns:** `boolean`

Function `canParse(filePath: string)`. Returns `boolean`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `filePath` | `string` | — | — | — |

📍 Defined at line 31–33

---

### `getSupportedLanguages()`

**Returns:** `array`

Function `getSupportedLanguages()`. Returns `array`.

📍 Defined at line 35–37

---

### `async warmup()`

**Returns:** `Promise`

Async function `warmup()`. Returns `Promise`.

📍 Defined at line 46–50

---
