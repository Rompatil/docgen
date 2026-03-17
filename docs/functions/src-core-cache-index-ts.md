# src/core/cache/index.ts

**Language:** typescript | **Lines:** 60

**External imports:** `fs`, `path`
**Internal imports:** `../../types`, `../../utils/logger`

## Classes

### `class AnalysisCache`

**Properties:**

- 🔒 `cacheDir`: `string`
- 🔒 `enabled`: `boolean`
- 🔒 `ttl`: `number`
- 🔒 `hits`: `any`
- 🔒 `misses`: `any`

**Methods:**

- `constructor(config, projectRoot)`
- `get(contentHash)` → `unknown`
- `set(contentHash, result)` → `void`
- `clear()` → `void`
- `getStats()`

📍 Defined at line 17–68

---
