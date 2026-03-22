# tests/__fixtures__/typescript/task-service.ts

**Language:** typescript | **Lines:** 117

**External imports:** `@nestjs/common`, `typeorm`, `events`
**Internal imports:** `../utils/logger`, `../models/task`, `./cache-service`

## Functions

### `isOverdue(task: Task)`

**Returns:** `boolean`

Function `isOverdue(task: Task)`. Returns `boolean`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `task` | `Task` | — | — | — |

📍 Defined at line 127–130

---

### `formatTaskResponse(task: Task, includeDetails? = complex)`

**Returns:** `Record`

Function `formatTaskResponse(task: Task, includeDetails)`. Returns `Record`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `task` | `Task` | — | — | — |
| `includeDetails` | `any` | ✓ | complex | — |

📍 Defined at line 132–136

---

## Classes

### `class TaskService`

**Decorators:** @Injectable(...)

**Properties:**

- 🔒 `logger`: `Logger`
- 🔒 `events`: `EventEmitter`

**Methods:**

- `constructor(unknown, unknown)`
- `async findByUser(userId, options)` → `Promise`
- `async findById(id)` → `Promise`
- `async create(data, userId)` → `Promise`
- `async update(id, data)` → `Promise`
- `async delete(id)` → `Promise`
- `async assign(taskId, assigneeId)` → `Promise`
- `async markComplete(taskId)` → `Promise`
- `async getStats(userId)` → `Promise`
- `onEvent(event, handler)` → `void`

📍 Defined at line 26–125

---
