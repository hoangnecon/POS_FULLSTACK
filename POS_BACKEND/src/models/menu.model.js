// backend/src/models/menu.model.js

const db = require('../db/connect');

// ----- MenuItems -----

function getAllMenuItems() {
  try {
    const stmt = db.prepare('SELECT * FROM MenuItems WHERE deleted_at IS NULL');
    return stmt.all();
  } catch (error) {
    console.error('Error getting all menu items:', error);
    return [];
  }
}

function createMenuItem(item) {
  const { id, name, price, category_id, menu_type_id, image_url, is_active, is_popular, inventory_enabled, inventory_count, cost_price } = item;
  try {
    const sql = `
      INSERT INTO MenuItems (id, name, price, category_id, menu_type_id, image_url, is_active, is_popular, inventory_enabled, inventory_count, cost_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id, name, price, category_id, menu_type_id, image_url,
      is_active ? 1 : 0, is_popular ? 1 : 0, inventory_enabled ? 1 : 0, inventory_count, cost_price
    ];
    const stmt = db.prepare(sql);
    const info = stmt.run(...params);
    return { id: info.lastInsertRowid || id, ...item };
  } catch (error) {
    return { error: error.message };
  }
}

// ** SỬA LỖI Ở ĐÂY: Loại bỏ cột "description" **
function updateMenuItem(id, item) {
    const { name, price, category_id, menu_type_id, image_url, is_active, is_popular, inventory_enabled, inventory_count, cost_price } = item;
    try {
        const sql = `
            UPDATE MenuItems SET 
                name = ?, price = ?, category_id = ?, menu_type_id = ?, 
                image_url = ?, is_active = ?, is_popular = ?, inventory_count = ?, 
                cost_price = ?, inventory_enabled = ? 
            WHERE id = ?
        `;
        const params = [
          name, price, category_id, menu_type_id, image_url,
          is_active ? 1 : 0, is_popular ? 1 : 0, inventory_count, cost_price, inventory_enabled ? 1 : 0,
          id
        ];
        const stmt = db.prepare(sql);
        const info = stmt.run(...params);
        return { changes: info.changes };
    } catch (error) {
        return { error: error.message };
    }
}

function deleteMenuItem(id) {
    try {
        const sql = "UPDATE MenuItems SET deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?";
        const stmt = db.prepare(sql);
        const info = stmt.run(id);
        return { changes: info.changes };
    } catch (error) {
        return { error: error.message };
    }
}

// ----- Categories, MenuTypes, Tables -----

function getAllCategories() {
    try {
        const stmt = db.prepare('SELECT * FROM Categories');
        return stmt.all();
    } catch (error) {
        console.error('Error getting all categories:', error);
        return [];
    }
}

function getAllMenuTypes() {
    try {
        const stmt = db.prepare('SELECT * FROM MenuTypes');
        return stmt.all();
    } catch (error) {
        console.error('Error getting all menu types:', error);
        return [];
    }
}

function createMenuType(menuType) {
  const { id, name } = menuType;
  try {
    const sql = 'INSERT INTO MenuTypes (id, name) VALUES (?, ?)';
    const stmt = db.prepare(sql);
    const info = stmt.run(id, name);
    return { id: info.lastInsertRowid || id, ...menuType };
  } catch (error) {
    return { error: error.message };
  }
}

function deleteMenuType(id) {
  try {
    const sql = 'DELETE FROM MenuTypes WHERE id = ?';
    const stmt = db.prepare(sql);
    const info = stmt.run(id);
    return { changes: info.changes };
  } catch (error) {
    return { error: error.message };
  }
}

function getAllTables() {
    try {
        const stmt = db.prepare('SELECT id, name, is_special, icon_name, status FROM Tables ORDER BY is_special DESC, id ASC');
        return stmt.all();
    } catch (error) {
        console.error('Error getting all tables:', error);
        return [];
    }
}

function createTable(table) {
    const { id, name, is_special, icon_name, status = 'vacant' } = table;
    try {
        const sql = 'INSERT INTO Tables (id, name, is_special, icon_name, status) VALUES (?, ?, ?, ?, ?)';
        const stmt = db.prepare(sql);
        const info = stmt.run(id, name, is_special ? 1 : 0, icon_name, status);
        return { id: info.lastInsertRowid || id, ...table };
    } catch (error) {
        console.error('Error creating table:', error);
        return { error: error.message };
    }
}

function updateTable(id, table) {
    const { name, is_special, icon_name, status } = table;
    try {
        const sql = 'UPDATE Tables SET name = ?, is_special = ?, icon_name = ?, status = ? WHERE id = ?';
        const stmt = db.prepare(sql);
        const info = stmt.run(name, is_special ? 1 : 0, icon_name, status, id);
        return { changes: info.changes };
    } catch (error) {
        return { error: error.message };
    }
}

function deleteTable(id) {
    try {
        const sql = 'DELETE FROM Tables WHERE id = ?';
        const stmt = db.prepare(sql);
        const info = stmt.run(id);
        return { changes: info.changes };
    } catch (error) {
        return { error: error.message };
    }
}

function updateTableStatus(id, status) {
    try {
        const sql = 'UPDATE Tables SET status = ? WHERE id = ?';
        const stmt = db.prepare(sql);
        const info = stmt.run(status, id);
        return { changes: info.changes };
    } catch (error) {
        return { error: error.message };
    }
}

function getTablesByStatus(status) {
    try {
        const sql = 'SELECT id, name, is_special, icon_name, status FROM Tables WHERE status = ? ORDER BY is_special DESC, id ASC';
        const stmt = db.prepare(sql);
        return stmt.all(status);
    } catch (error) {
        return { error: error.message };
    }
}


module.exports = {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllCategories,
  getAllMenuTypes,
  createMenuType,
  deleteMenuType,
  getAllTables,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  getTablesByStatus,
};