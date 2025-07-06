// backend/src/models/expense.model.js
const db = require('../db/connect');
const { v4: uuidv4 } = require('uuid');

/**
 * Lấy tất cả các khoản chi trong một khoảng ngày.
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD).
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD).
 * @returns {Array} Mảng các khoản chi.
 */
function getByDateRange(startDate, endDate) {
    try {
        const stmt = db.prepare(`
            SELECT e.*, u.name as user_name 
            FROM Expenses e
            LEFT JOIN Users u ON e.recorded_by_user_id = u.id
            WHERE e.expense_date BETWEEN ? AND ?
            ORDER BY e.created_at DESC
        `);
        return stmt.all(startDate, endDate);
    } catch (error) {
        console.error('Error getting expenses by date range:', error);
        return [];
    }
}

/**
 * Tạo một khoản chi mới.
 * @param {object} expenseData - Dữ liệu khoản chi { name, amount, expense_date, recorded_by_user_id }.
 * @returns {object} Khoản chi đã được tạo.
 */
function create(expenseData) {
    const { name, amount, expense_date, recorded_by_user_id } = expenseData;
    try {
        const id = uuidv4(); // Tạo ID duy nhất cho khoản chi
        const stmt = db.prepare(
            'INSERT INTO Expenses (id, name, amount, expense_date, recorded_by_user_id) VALUES (?, ?, ?, ?, ?)'
        );
        const info = stmt.run(id, name, amount, expense_date, recorded_by_user_id);
        return { id: id, ...expenseData };
    } catch (error) {
        console.error('Error creating expense:', error);
        return { error: error.message };
    }
}

module.exports = {
    getByDateRange,
    create,
};