# Module: config

> **Role:** config

## Overview

[No API key configured — summaries unavailable]

## Files

- `src/config/loader.ts` — 2 functions

## Public API

- `variable` **DEFAULT_CONFIG**
- `function` **loadConfig**
- `function` **generateConfigFile**

## Key Functions

### `loadConfig(projectRoot: string, overrides: Partial)`

**Returns:** `DocgenConfig`

Function `loadConfig(projectRoot: string, overrides: Partial)`. Returns `DocgenConfig`. ⚠️ High complexity.

### `generateConfigFile(projectRoot: string)`

**Returns:** `string`

Function `generateConfigFile(projectRoot: string)`. Returns `string`.

## Dependencies

This module depends on:

- [`types`](./modules/types.md)

## Used By

- [`cli`](./modules/cli.md)
