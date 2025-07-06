// backend/src/controllers/expense.controller.js
const expenseModel = require('../models/expense.model');

async function getExpenses(req, res) {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Cần có ngày bắt đầu và ngày kết thúc.' });
    }
    try {
        const expenses = expenseModel.getByDateRange(startDate, endDate);
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error in getExpenses controller:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu chi tiêu.' });
    }
}

async function createExpense(req, res) {
    const { name, amount, expense_date, recorded_by_user_id } = req.body;
    if (!name || !amount || !expense_date) {
        return res.status(400).json({ message: 'Tên, số tiền và ngày chi là bắt buộc.' });
    }
    try {
        const newExpense = expenseModel.create({ name, amount, expense_date, recorded_by_user_id });
        if (newExpense.error) {
            return res.status(400).json({ message: newExpense.error });
        }
        res.status(201).json({ message: 'Tạo chi tiêu thành công.', data: newExpense });
    } catch (error) {
        console.error('Error in createExpense controller:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi tạo chi tiêu.' });
    }
}

module.exports = {
    getExpenses,
    createExpense,
};