// backend/src/models/menuItem.model.js
const db = require('../db/connect');

/**
 * Tạo một món ăn mới.
 */
function create(itemData) {
    const { name, category_id, price, image_url, is_popular, menu_type_id, cost_price = 0 } = itemData;
    try {
        const stmt = db.prepare(`
            INSERT INTO MenuItems (name, category_id, price, image_url, is_popular, menu_type_id, cost_price, inventory_enabled, inventory_count, deleted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, NULL)
        `);
        const info = stmt.run(name, category_id, price, image_url, is_popular ? 1 : 0, menu_type_id, cost_price);
        return { id: info.lastInsertRowid, ...itemData };
    } catch (error) {
        console.error('Error creating menu item:', error);
        return { error: error.message };
    }
}

/**
 * Cập nhật thông tin một món ăn.
 */
function update(id, itemData) {
    const { name, category_id, price, image_url, is_popular, menu_type_id } = itemData;
    try {
        const stmt = db.prepare(`
            UPDATE MenuItems 
            SET name = ?, category_id = ?, price = ?, image_url = ?, is_popular = ?, menu_type_id = ?
            WHERE id = ?
        `);
        const info = stmt.run(name, category_id, price, image_url, is_popular ? 1 : 0, menu_type_id, id);
        if (info.changes === 0) {
            return { error: 'Không tìm thấy món ăn để cập nhật.' };
        }
        return { changes: info.changes };
    } catch (error) {
        console.error(`Error updating menu item ${id}:`, error);
        return { error: error.message };
    }
}

/**
 * Cập nhật thông tin tồn kho cho một món ăn.
 */
function updateInventory(id, inventoryData) {
    const { inventory_enabled, inventory_count, cost_price } = inventoryData;
    try {
        const stmt = db.prepare(`
            UPDATE MenuItems
            SET inventory_enabled = ?, inventory_count = ?, cost_price = ?
            WHERE id = ?
        `);
        const info = stmt.run(inventory_enabled ? 1 : 0, inventory_count, cost_price, id);
        if (info.changes === 0) {
            return { error: 'Không tìm thấy món ăn để cập nhật tồn kho.' };
        }
        return { changes: info.changes };
    } catch (error) {
        console.error(`Error updating inventory for item ${id}:`, error);
        return { error: error.message };
    }
}

/**
 * Xóa mềm một món ăn (đánh dấu đã xóa).
 */
function remove(id) {
    try {
        const stmt = db.prepare("UPDATE MenuItems SET deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?");
        const info = stmt.run(id);
        if (info.changes === 0) {
            return { error: 'Không tìm thấy món ăn để xóa.' };
        }
        return { changes: info.changes };
    } catch (error) {
        console.error(`Error deleting menu item ${id}:`, error);
        return { error: error.message };
    }
}


module.exports = {
    create,
    update,
    updateInventory,
    remove,
};