// backend/src/models/category.model.js

const db = require('../db/connect');

/**
 * Lấy tất cả các danh mục.
 * @returns {Array} Mảng các đối tượng danh mục.
 */
function getAll() {
    try {
        const stmt = db.prepare('SELECT * FROM Categories ORDER BY created_at DESC');
        return stmt.all();
    } catch (error) {
        console.error('Error getting all categories:', error);
        return [];
    }
}

/**
 * Tạo một danh mục mới.
 * @param {object} category - Dữ liệu danh mục { id, name, icon_name }.
 * @returns {object} Danh mục vừa được tạo hoặc thông tin lỗi.
 */
function create(category) {
    const { id, name, icon_name } = category;
    try {
        const stmt = db.prepare(
            'INSERT INTO Categories (id, name, icon_name) VALUES (?, ?, ?)'
        );
        const info = stmt.run(id, name, icon_name);
        return { changes: info.changes, id, name, icon_name };
    } catch (error) {
        console.error('Error creating category:', error);
        return { error: error.message };
    }
}

/**
 * Cập nhật một danh mục.
 * @param {string} id - ID của danh mục cần cập nhật.
 * @param {object} categoryData - Dữ liệu mới { name, icon_name }.
 * @returns {object} Thông tin về kết quả cập nhật.
 */
function update(id, categoryData) {
    const { name, icon_name } = categoryData;
    try {
        const stmt = db.prepare(
            'UPDATE Categories SET name = ?, icon_name = ? WHERE id = ?'
        );
        const info = stmt.run(name, icon_name, id);
        return { changes: info.changes };
    } catch (error) {
        console.error(`Error updating category ${id}:`, error);
        return { error: error.message };
    }
}

/**
 * Xóa một danh mục và tất cả các món ăn liên quan.
 * @param {string} id - ID của danh mục cần xóa.
 * @returns {object} Thông tin về kết quả xóa.
 */
function remove(id) {
    const transaction = db.transaction(() => {
        // Bước 1: Xóa các món ăn thuộc danh mục này trước
        const deleteItemsStmt = db.prepare('DELETE FROM MenuItems WHERE category_id = ?');
        deleteItemsStmt.run(id);

        // Bước 2: Xóa chính danh mục đó
        const deleteCategoryStmt = db.prepare('DELETE FROM Categories WHERE id = ?');
        const info = deleteCategoryStmt.run(id);
        
        return { changes: info.changes };
    });

    try {
        return transaction();
    } catch (error) {
        console.error(`Error deleting category and its items ${id}:`, error);
        return { error: error.message };
    }
}

module.exports = {
    getAll,
    create,
    update,
    remove,
};