// backend/src/models/table.model.js

const db = require('../db/connect');

function getAll() {
    try {
        const stmt = db.prepare("SELECT * FROM Tables ORDER BY is_special DESC, CAST(id AS INTEGER), name");
        return stmt.all();
    } catch (error) {
        console.error('Error getting all tables:', error);
        return [];
    }
}

function create(tableData) {
    const { id, name, is_special = 0, icon_name = 'GalleryVertical' } = tableData;
    let newId = id;

    try {
        // Nếu là bàn thường (is_special = 0) và không có ID được cung cấp, tự động tạo ID
        if (!is_special && !id) {
            const stmt = db.prepare("SELECT MAX(CAST(id AS INTEGER)) as maxId FROM Tables WHERE id GLOB '[0-9]*'");
            const result = stmt.get();
            newId = (result.maxId || 0) + 1;
        }

        if (!newId) {
            throw new Error("ID bàn là bắt buộc cho bàn đặc biệt.");
        }

        const insertStmt = db.prepare(
            'INSERT INTO Tables (id, name, is_special, icon_name) VALUES (?, ?, ?, ?)'
        );
        const info = insertStmt.run(String(newId), name, is_special, icon_name);
        return { id: newId, ...tableData };

    } catch (error) {
        console.error('Error creating table:', error);
        return { error: error.message };
    }
}


function update(id, tableData) {
    const { name, is_special, icon_name } = tableData;
    try {
        const stmt = db.prepare(
            'UPDATE Tables SET name = ?, is_special = ?, icon_name = ? WHERE id = ?'
        );
        const info = stmt.run(name, is_special, icon_name, id);
        return { changes: info.changes };
    } catch (error) {
        console.error(`Error updating table ${id}:`, error);
        return { error: error.message };
    }
}

function remove(id) {
    try {
        const stmt = db.prepare('DELETE FROM Tables WHERE id = ?');
        const info = stmt.run(id);
        if (info.changes === 0) {
            return { error: 'Không tìm thấy bàn để xóa.' };
        }
        return { changes: info.changes };
    } catch (error) {
        console.error(`Error deleting table ${id}:`, error);
        return { error: error.message };
    }
}

module.exports = {
    getAll,
    create,
    update,
    remove,
};  