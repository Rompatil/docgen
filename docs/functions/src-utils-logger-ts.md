# src/utils/logger.ts

**Language:** typescript | **Lines:** 65

**External imports:** `fs`, `path`

## Functions

### `setLogLevel(level: string)`

**Returns:** `void`

Function `setLogLevel(level: string)`. Returns `void`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `level` | `string` | — | — | — |

📍 Defined at line 71–73

---

### `createModuleLogger(moduleName: string)`

**Returns:** `Logger`

Function `createModuleLogger(moduleName: string)`. Returns `Logger`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `moduleName` | `string` | — | — | — |

📍 Defined at line 75–77

---

### `enableFileLogging(outputDir: string)`

**Returns:** `void`

Function `enableFileLogging(outputDir: string)`. Returns `void`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `outputDir` | `string` | — | — | — |

📍 Defined at line 79–81

---

## Classes

### `class Logger`

**Properties:**

- 🔒 `level`: `LogLevel`
- 🔒 `prefix`: `string`
- 🔒 `logFile`: `string`

**Methods:**

- `constructor(level, prefix)`
- `shouldLog(level)` → `boolean`
- `write(level, message, context)` → `void`
- `debug(msg, ctx)`
- `info(msg, ctx)`
- `warn(msg, ctx)`
- `error(msg, ctx)`
- `child(prefix)` → `Logger`
- `setLevel(level)`
- `enableFileLogging(dir)`

📍 Defined at line 23–65

---
