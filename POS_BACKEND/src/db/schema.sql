-- backend/src/db/schema.sql

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    hashed_password TEXT,
    pin TEXT,
    role TEXT NOT NULL CHECK(role IN ('admin', 'cashier', 'business')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS Categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon_name TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS MenuTypes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS MenuItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id TEXT,
    price REAL NOT NULL,
    cost_price REAL DEFAULT 0,
    image_url TEXT,
    is_popular INTEGER DEFAULT 0,
    menu_type_id TEXT,
    inventory_enabled INTEGER DEFAULT 0,
    inventory_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    deleted_at TEXT,
    sync_status TEXT DEFAULT 'synced',
    FOREIGN KEY (category_id) REFERENCES Categories (id) ON DELETE SET NULL,
    FOREIGN KEY (menu_type_id) REFERENCES MenuTypes (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Tables (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_special INTEGER DEFAULT 0,
    icon_name TEXT,
    status TEXT NOT NULL DEFAULT 'vacant', -- ** MỚI: Thêm cột trạng thái bàn **
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS Orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id TEXT,
    order_date TEXT,
    order_time TEXT,
    cashier_id INTEGER,
    payment_method TEXT,
    subtotal REAL,
    discount_type TEXT,
    discount_value REAL,
    discount_amount REAL,
    total_amount REAL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    sync_status TEXT DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (table_id) REFERENCES Tables (id) ON DELETE SET NULL,
    FOREIGN KEY (cashier_id) REFERENCES Users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS OrderItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_order REAL NOT NULL,
    item_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (order_id) REFERENCES Orders (id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES MenuItems (id) ON DELETE SET NULL,
    UNIQUE (order_id, menu_item_id) 
);

CREATE TABLE IF NOT EXISTS Expenses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    expense_date TEXT NOT NULL,
    recorded_by_user_id INTEGER,
    sync_status TEXT DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (recorded_by_user_id) REFERENCES Users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER IF NOT EXISTS update_users_updated_at AFTER UPDATE ON Users FOR EACH ROW BEGIN UPDATE Users SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id; END;
CREATE TRIGGER IF NOT EXISTS update_menu_items_updated_at AFTER UPDATE ON MenuItems FOR EACH ROW BEGIN UPDATE MenuItems SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id; END;
CREATE TRIGGER IF NOT EXISTS update_orders_updated_at AFTER UPDATE ON Orders FOR EACH ROW BEGIN UPDATE Orders SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id; END;
CREATE TRIGGER IF NOT EXISTS update_settings_updated_at AFTER UPDATE ON Settings FOR EACH ROW BEGIN UPDATE Settings SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = OLD.key; END;