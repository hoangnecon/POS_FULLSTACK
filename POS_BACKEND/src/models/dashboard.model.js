// backend/src/models/dashboard.model.js

const db = require('../db/connect');

/**
 * Lấy tất cả các đơn hàng đã hoàn thành trong một khoảng ngày.
 * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD).
 * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD).
 * @returns {Array} Một mảng các đơn hàng đã hoàn thành.
 */
function getCompletedOrdersByDateRange(startDate, endDate) {
  try {
    // ** SỬA LỖI Ở ĐÂY: Thêm o.cashier_id vào câu lệnh SELECT một cách chính xác **
    const stmt = db.prepare(`
        SELECT 
            o.id,
            o.table_id,
            o.order_date,
            o.order_time,
            o.cashier_id, 
            u.name as cashier_name,
            o.payment_method,
            o.subtotal,
            o.discount_type,
            o.discount_value,
            o.discount_amount,
            o.total_amount,
            o.notes,
            o.status
        FROM Orders o
        LEFT JOIN Users u ON o.cashier_id = u.id
        WHERE o.status = 'completed' AND o.order_date BETWEEN ? AND ?
        ORDER BY o.created_at DESC
    `);
    const orders = stmt.all(startDate, endDate);
    
    const itemsStmt = db.prepare('SELECT * FROM OrderItems WHERE order_id = ?');
    for(const order of orders) {
        order.items = itemsStmt.all(order.id);
    }
    return orders;
  } catch (error) {
    console.error('Error finding all completed orders by date range:', error);
    return [];
  }
}

module.exports = {
  getCompletedOrdersByDateRange,
};