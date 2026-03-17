# src/utils/helpers.ts

**Language:** typescript | **Lines:** 115

**External imports:** `fs`, `path`, `crypto`

## Functions

### `findFiles(rootDir: string, includePatterns: array, excludePatterns: array)`

**Returns:** `array`

**Complexity:** 8 ⚠️ (consider refactoring)

Function `findFiles(rootDir: string, includePatterns: array, excludePatterns: array)`. Returns `array`. ⚠️ High complexity.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `rootDir` | `string` | — | — | — |
| `includePatterns` | `array` | — | — | — |
| `excludePatterns` | `array` | — | — | — |

📍 Defined at line 13–42

---

### `hashContent(content: string)`

**Returns:** `string`

Function `hashContent(content: string)`. Returns `string`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `content` | `string` | — | — | — |

📍 Defined at line 46–48

---

### `hashFile(filePath: string)`

**Returns:** `string`

Function `hashFile(filePath: string)`. Returns `string`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `filePath` | `string` | — | — | — |

📍 Defined at line 50–52

---

### `detectLanguage(filePath: string)`

**Returns:** `string`

Function `detectLanguage(filePath: string)`. Returns `string`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `filePath` | `string` | — | — | — |

📍 Defined at line 62–64

---

### `readFileContent(filePath: string)`

**Returns:** `string`

Function `readFileContent(filePath: string)`. Returns `string`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `filePath` | `string` | — | — | — |

📍 Defined at line 68–70

---

### `fileExists(filePath: string)`

**Returns:** `boolean`

Function `fileExists(filePath: string)`. Returns `boolean`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `filePath` | `string` | — | — | — |

📍 Defined at line 72–74

---

### `ensureDir(dirPath: string)`

**Returns:** `void`

Function `ensureDir(dirPath: string)`. Returns `void`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `dirPath` | `string` | — | — | — |

📍 Defined at line 76–78

---

### `inferModuleName(relativePath: string, depth? = 2)`

**Returns:** `string`

Function `inferModuleName(relativePath: string, depth)`. Returns `string`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `relativePath` | `string` | — | — | — |
| `depth` | `any` | ✓ | 2 | — |

📍 Defined at line 82–88

---

### `countLines(content: string)`

**Returns:** `number`

Function `countLines(content: string)`. Returns `number`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `content` | `string` | — | — | — |

📍 Defined at line 92–94

---

### `truncate(text: string, maxLength: number)`

**Returns:** `string`

Function `truncate(text: string, maxLength: number)`. Returns `string`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `text` | `string` | — | — | — |
| `maxLength` | `number` | — | — | — |

📍 Defined at line 96–99

---

### `detectFrameworks(rootDir: string)`

**Returns:** `Array`

**Complexity:** 7 ⚠️ (consider refactoring)

Function `detectFrameworks(rootDir: string)`. Returns `Array`. ⚠️ High complexity.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `rootDir` | `string` | — | — | — |

📍 Defined at line 103–136

---

### `parsePackageJson(rootDir: string)`

**Returns:** `unknown`

Function `parsePackageJson(rootDir: string)`. Returns `unknown`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `rootDir` | `string` | — | — | — |

📍 Defined at line 140–144

---
