# Module: tests/__fixtures__

> **Role:** test

## Overview

[No API key configured — summaries unavailable]

## Files

- `tests/__fixtures__/javascript/user-routes.js` — 2 functions
- `tests/__fixtures__/python/product-api.py` — 9 functions, 4 classes
- `tests/__fixtures__/python/utils.py` — 3 functions, 2 classes
- `tests/__fixtures__/typescript/barrel-exports.ts` — 10 lines
- `tests/__fixtures__/typescript/task-service.ts` — 2 functions, 1 classes

## Public API

- `function` **list_products**
- `function` **get_product**
- `function` **create_product**
- `function` **update_product**
- `function` **delete_product**
- `function` **check_stock**
- `function` **restock_product**
- `function` **calculate_discount**
- `function` **format_price**
- `class` **ProductCreate**
- `class` **ProductUpdate**
- `class` **ProductResponse**
- `class` **InventoryManager**
- `function` **slugify**
- `function` **truncate**
- `function` **chunk_list**
- `class` **TextProcessor**
- `variable` **TaskService**
- `variable` **CacheService**
- `type` **ServiceName**
- `type` **ServiceConfig**
- `variable` **DEFAULT_TIMEOUT**
- `variable` **MAX_RETRIES**
- `type` **TaskQueryOptions**
- `type` **PaginatedResult**
- `class` **TaskService**
- `function` **isOverdue**
- `function` **formatTaskResponse**

## Key Functions

### `list_products(category: Optional[str], min_price: Optional[float], max_price: Optional[float], page: int, ge, limit: int, ge, le, db: Database, )`

Async function `list_products(category: Optional[str], min_price: Optional[float], max_price: Optional[float], page: int, ge, limit: int, ge, le, db: Database, )`.

### `get_product(product_id: str, db: Database)`

Async function `get_product(product_id: str, db: Database)`.

### `create_product(product: ProductCreate, current_user: User, db: Database, )`

Async function `create_product(product: ProductCreate, current_user: User, db: Database, )`.

### `update_product(product_id: str, updates: ProductUpdate, current_user: User, db: Database, )`

Async function `update_product(product_id: str, updates: ProductUpdate, current_user: User, db: Database, )`.

### `delete_product(product_id: str, current_user: User, db: Database, )`

Async function `delete_product(product_id: str, current_user: User, db: Database, )`.

### `check_stock(product_id: str, db: Database)`

Async function `check_stock(product_id: str, db: Database)`.

### `restock_product(product_id: str, quantity: int, gt, current_user: User, db: Database, )`

Async function `restock_product(product_id: str, quantity: int, gt, current_user: User, db: Database, )`.

### `calculate_discount(price: float, discount_percent: float)`

**Returns:** `float`

Function `calculate_discount(price: float, discount_percent: float)`. Returns `float`.

### `format_price(amount: float, currency: str)`

**Returns:** `str`

Function `format_price(amount: float, currency: str)`. Returns `str`.

### `slugify(text: str, separator: str)`

**Returns:** `str`

Function `slugify(text: str, separator: str)`. Returns `str`.

### `truncate(text: str, max_length: int, suffix: str)`

**Returns:** `str`

Function `truncate(text: str, max_length: int, suffix: str)`. Returns `str`.

### `chunk_list(items: List, size: int)`

**Returns:** `List[List]`

Function `chunk_list(items: List, size: int)`. Returns `List[List]`.

### `isOverdue(task: Task)`

**Returns:** `boolean`

Function `isOverdue(task: Task)`. Returns `boolean`.

### `formatTaskResponse(task: Task, includeDetails)`

**Returns:** `Record`

Function `formatTaskResponse(task: Task, includeDetails)`. Returns `Record`.

## Classes

### `ProductCreate`

**Extends:** `BaseModel`

### `ProductUpdate`

**Extends:** `BaseModel`

### `ProductResponse`

**Extends:** `BaseModel`

### `InventoryManager`

**Methods:**

- 🔒 `__init__(db, warehouse_url)`
- 🔓 `check_stock(product_id)` → `dict`
- 🔓 `restock(product_id, quantity)` → `dict`
- 🔒 `_should_reorder(current_stock)` → `bool`
- 🔓 `get_low_stock_products()` → `List[dict]`

### `TextProcessor`

**Methods:**

- 🔒 `__init__(locale)`
- 🔓 `clean(text)` → `str`
- 🔓 `extract_emails(text)` → `List[str]`
- 🔓 `word_count(text)` → `int`
- 🔒 `_load_stop_words()` → `set`

### `_InternalHelper`

**Methods:**

- 🔓 `do_something()`

### `TaskService`

**Methods:**

- 🔓 `constructor(unknown, unknown)`
- 🔓 `findByUser(userId, options)` → `Promise`
- 🔓 `findById(id)` → `Promise`
- 🔓 `create(data, userId)` → `Promise`
- 🔓 `update(id, data)` → `Promise`
- 🔓 `delete(id)` → `Promise`
- 🔓 `assign(taskId, assigneeId)` → `Promise`
- 🔓 `markComplete(taskId)` → `Promise`
- 🔓 `getStats(userId)` → `Promise`
- 🔓 `onEvent(event, handler)` → `void`
