// backend/src/controllers/dashboard.controller.js

const dashboardModel = require('../models/dashboard.model');

async function getDashboardData(req, res) {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Cần có ngày bắt đầu và ngày kết thúc.' });
    }

    try {
        const orders = dashboardModel.getCompletedOrdersByDateRange(startDate, endDate);
        // Có thể thêm các logic tổng hợp khác ở đây nếu cần
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error in getDashboardData controller:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy dữ liệu dashboard.' });
    }
}

module.exports = {
    getDashboardData,
};