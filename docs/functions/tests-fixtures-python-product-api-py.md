# tests/__fixtures__/python/product-api.py

**Language:** python | **Lines:** 168

**External imports:** `fastapi`, `pydantic`, `typing`, `datetime`, `os`
**Internal imports:** `.database`, `.auth`, `.cache`

## Functions

### `async list_products(category: Optional[str]? = None, min_price: Optional[float]? = None, max_price: Optional[float]? = None, page: int? = Query(1, ge? = 1), limit: int? = Query(DEFAULT_PAGE_SIZE, ge? = 1, le? = 100), db: Database? = Depends(get_db), )`

**Decorators:** @router.get("/", response_model=List[ProductResponse]), @cache_response(ttl=30)

Async function `list_products(category: Optional[str], min_price: Optional[float], max_price: Optional[float], page: int, ge, limit: int, ge, le, db: Database, )`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `category` | `Optional[str]` | ✓ | None | — |
| `min_price` | `Optional[float]` | ✓ | None | — |
| `max_price` | `Optional[float]` | ✓ | None | — |
| `page` | `int` | ✓ | Query(1 | — |
| `ge` | `any` | ✓ | 1) | — |
| `limit` | `int` | ✓ | Query(DEFAULT_PAGE_SIZE | — |
| `ge` | `any` | ✓ | 1 | — |
| `le` | `any` | ✓ | 100) | — |
| `db` | `Database` | ✓ | Depends(get_db) | — |
| `` | `any` | — | — | — |

📍 Defined at line 98–104

---

### `async get_product(product_id: str, db: Database? = Depends(get_db))`

**Decorators:** @router.get("/{product_id}", response_model=ProductResponse)

Get a single product by ID.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `product_id` | `str` | — | — | — |
| `db` | `Database` | ✓ | Depends(get_db) | — |

📍 Defined at line 116–123

---

### `async create_product(product: ProductCreate, current_user: User? = Depends(get_current_user), db: Database? = Depends(get_db), )`

**Decorators:** @router.post("/", response_model=ProductResponse, status_code=201)

Async function `create_product(product: ProductCreate, current_user: User, db: Database, )`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `product` | `ProductCreate` | — | — | — |
| `current_user` | `User` | ✓ | Depends(get_current_user) | — |
| `db` | `Database` | ✓ | Depends(get_db) | — |
| `` | `any` | — | — | — |

📍 Defined at line 125–128

---

### `async update_product(product_id: str, updates: ProductUpdate, current_user: User? = Depends(get_current_user), db: Database? = Depends(get_db), )`

**Decorators:** @router.put("/{product_id}", response_model=ProductResponse)

Async function `update_product(product_id: str, updates: ProductUpdate, current_user: User, db: Database, )`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `product_id` | `str` | — | — | — |
| `updates` | `ProductUpdate` | — | — | — |
| `current_user` | `User` | ✓ | Depends(get_current_user) | — |
| `db` | `Database` | ✓ | Depends(get_db) | — |
| `` | `any` | — | — | — |

📍 Defined at line 140–144

---

### `async delete_product(product_id: str, current_user: User? = Depends(get_current_user), db: Database? = Depends(get_db), )`

**Decorators:** @router.delete("/{product_id}", status_code=204)

Async function `delete_product(product_id: str, current_user: User, db: Database, )`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `product_id` | `str` | — | — | — |
| `current_user` | `User` | ✓ | Depends(get_current_user) | — |
| `db` | `Database` | ✓ | Depends(get_db) | — |
| `` | `any` | — | — | — |

📍 Defined at line 157–160

---

### `async check_stock(product_id: str, db: Database? = Depends(get_db))`

**Decorators:** @router.get("/{product_id}/stock")

Check inventory for a product.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `product_id` | `str` | — | — | — |
| `db` | `Database` | ✓ | Depends(get_db) | — |

📍 Defined at line 169–174

---

### `async restock_product(product_id: str, quantity: int? = Query(..., gt? = 0), current_user: User? = Depends(get_current_user), db: Database? = Depends(get_db), )`

**Decorators:** @router.post("/{product_id}/restock")

Async function `restock_product(product_id: str, quantity: int, gt, current_user: User, db: Database, )`.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `product_id` | `str` | — | — | — |
| `quantity` | `int` | ✓ | Query(... | — |
| `gt` | `any` | ✓ | 0) | — |
| `current_user` | `User` | ✓ | Depends(get_current_user) | — |
| `db` | `Database` | ✓ | Depends(get_db) | — |
| `` | `any` | — | — | — |

📍 Defined at line 176–180

---

### `calculate_discount(price: float, discount_percent: float)`

**Returns:** `float`

Apply a percentage discount to a price.

Args:
price: Original price
discount_percent: Discount as a percentage (0-100)

Returns:
Discounted price, never below zero

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `price` | `float` | — | — | — |
| `discount_percent` | `float` | — | — | — |

📍 Defined at line 187–201

---

### `format_price(amount: float, currency: str? = "USD")`

**Returns:** `str`

Format a price with currency symbol.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `amount` | `float` | — | — | — |
| `currency` | `str` | ✓ | "USD" | — |

📍 Defined at line 202–207

---

## Classes

### `class ProductCreate`

**Extends:** `BaseModel`

Schema for creating a new product.

📍 Defined at line 22–31

---

### `class ProductUpdate`

**Extends:** `BaseModel`

Schema for partial product updates.

📍 Defined at line 32–40

---

### `class ProductResponse`

**Extends:** `BaseModel`

API response model for a product.

📍 Defined at line 41–50

---

### `class InventoryManager`

Manages product inventory levels and restocking.

Connects to the warehouse API for real-time stock data
and handles automatic reorder triggers.

**Properties:**

- 🔒 `_db`: `any`
- 🔒 `_warehouse_url`: `any`
- 🔒 `_reorder_threshold`: `any`

**Methods:**

- `__init__(db, warehouse_url)`
- `async check_stock(product_id)` → `dict`
- `async restock(product_id, quantity)` → `dict`
- `_should_reorder(current_stock)` → `bool`
- `async get_low_stock_products()` → `List[dict]`

📍 Defined at line 51–95

---
