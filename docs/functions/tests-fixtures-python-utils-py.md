# tests/__fixtures__/python/utils.py

**Language:** python | **Lines:** 50

**External imports:** `re`, `typing`

## Functions

### `slugify(text: str, separator: str? = "-")`

**Returns:** `str`

Convert text to URL-friendly slug.

Args:
text: Input text
separator: Character to use between words

Returns:
Lowercased slug string

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `text` | `str` | — | — | — |
| `separator` | `str` | ✓ | "-" | — |

📍 Defined at line 7–21

---

### `truncate(text: str, max_length: int? = 100, suffix: str? = "...")`

**Returns:** `str`

Truncate text to max length with suffix.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `text` | `str` | — | — | — |
| `max_length` | `int` | ✓ | 100 | — |
| `suffix` | `str` | ✓ | "..." | — |

📍 Defined at line 22–28

---

### `chunk_list(items: List, size: int)`

**Returns:** `List[List]`

Split a list into chunks of given size.

**Parameters:**

| Name | Type | Optional | Default | Description |
|------|------|:--------:|---------|-------------|
| `items` | `List` | — | — | — |
| `size` | `int` | — | — | — |

📍 Defined at line 29–33

---

## Classes

### `class TextProcessor`

Processes and transforms text content.

Provides methods for cleaning, normalizing, and
extracting information from text strings.

**Properties:**

- 🔓 `locale`: `any`
- 🔒 `_stop_words`: `any`

**Methods:**

- `__init__(locale)`
- `clean(text)` → `str`
- `extract_emails(text)` → `List[str]`
- `word_count(text)` → `int`
- `_load_stop_words()` → `set`

📍 Defined at line 34–65

---
