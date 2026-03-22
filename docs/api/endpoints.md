# API Endpoints

This document describes the 13 API endpoints exposed by docgen-ai.

## Summary

| Method | Path | Handler | Auth Required |
|--------|------|---------|:-------------:|
| `GET` | `*` | `anonymous` | — |
| `GET` | `/users` | `anonymous` | ✅ |
| `GET` | `/users/:id` | `anonymous` | ✅ |
| `POST` | `/users` | `anonymous` | ✅ |
| `PUT` | `/users/:id` | `anonymous` | ✅ |
| `DELETE` | `/users/:id` | `anonymous` | ✅ |
| `GET` | `/` | `list_products` | — |
| `GET` | `/{product_id}` | `get_product` | — |
| `POST` | `/` | `create_product` | ✅ |
| `PUT` | `/{product_id}` | `update_product` | ✅ |
| `DELETE` | `/{product_id}` | `delete_product` | ✅ |
| `GET` | `/{product_id}/stock` | `check_stock` | — |
| `POST` | `/{product_id}/restock` | `restock_product` | ✅ |

## /*

### `GET *`

**Handler:** `anonymous`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/src/cli/commands.ts`:272

**Example:**

```bash
curl http://localhost:3000*
```

## /users

### `GET /users`

**Handler:** `anonymous`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/javascript/user-routes.js`:19

> 🔒 **Authentication required**

**Middleware:** `authenticate`

**Example:**

```bash
curl http://localhost:3000/users
```

### `POST /users`

**Handler:** `anonymous`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/javascript/user-routes.js`:33

> 🔒 **Authentication required**

**Middleware:** `authenticate` → `validate`

**Example:**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{}'
```

## /users/:id

### `GET /users/:id`

**Handler:** `anonymous`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/javascript/user-routes.js`:26

> 🔒 **Authentication required**

**Middleware:** `authenticate`

**Example:**

```bash
curl http://localhost:3000/users/{id}
```

### `PUT /users/:id`

**Handler:** `anonymous`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/javascript/user-routes.js`:39

> 🔒 **Authentication required**

**Middleware:** `authenticate`

**Example:**

```bash
curl -X PUT http://localhost:3000/users/{id} \
  -H "Content-Type: application/json" \
  -d '{}'
```

### `DELETE /users/:id`

**Handler:** `anonymous`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/javascript/user-routes.js`:45

> 🔒 **Authentication required**

**Middleware:** `authenticate`

**Example:**

```bash
curl -X DELETE http://localhost:3000/users/{id} \
  -H "Content-Type: application/json" \
  -d '{}'
```

## /

### `GET /`

**Handler:** `list_products`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/python/product-api.py`:96

**Example:**

```bash
curl http://localhost:3000/
```

### `POST /`

**Handler:** `create_product`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/python/product-api.py`:124

> 🔒 **Authentication required**

**Example:**

```bash
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{}'
```

## /{product_id}

### `GET /{product_id}`

**Handler:** `get_product`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/python/product-api.py`:115

**Example:**

```bash
curl http://localhost:3000/{product_id}
```

### `PUT /{product_id}`

**Handler:** `update_product`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/python/product-api.py`:139

> 🔒 **Authentication required**

**Example:**

```bash
curl -X PUT http://localhost:3000/{product_id} \
  -H "Content-Type: application/json" \
  -d '{}'
```

### `DELETE /{product_id}`

**Handler:** `delete_product`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/python/product-api.py`:156

> 🔒 **Authentication required**

**Example:**

```bash
curl -X DELETE http://localhost:3000/{product_id} \
  -H "Content-Type: application/json" \
  -d '{}'
```

## /{product_id}/stock

### `GET /{product_id}/stock`

**Handler:** `check_stock`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/python/product-api.py`:168

**Example:**

```bash
curl http://localhost:3000/{product_id}/stock
```

## /{product_id}/restock

### `POST /{product_id}/restock`

**Handler:** `restock_product`  
**File:** `/home/runner/work/docgen-ai/docgen-ai/tests/__fixtures__/python/product-api.py`:175

> 🔒 **Authentication required**

**Example:**

```bash
curl -X POST http://localhost:3000/{product_id}/restock \
  -H "Content-Type: application/json" \
  -d '{}'
```
