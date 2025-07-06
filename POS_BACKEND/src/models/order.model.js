// backend/src/models/order.model.js

const db = require('../db/connect');
const { v4: uuidv4 } = require('uuid');

const getPrice = (item) => item.price_at_order || item.price || 0;

function createPartialPayment(tableId, paymentData, cashierId) {
    const transaction = db.transaction(() => {
        const getActiveOrderStmt = db.prepare("SELECT * FROM Orders WHERE table_id = ? AND status = 'active'");
        const activeOrder = getActiveOrderStmt.get(tableId);

        if (!activeOrder) {
            throw new Error(`Không có đơn hàng đang hoạt động cho bàn ${tableId} để thanh toán.`);
        }

        const getOrderItemStmt = db.prepare("SELECT * FROM OrderItems WHERE order_id = ? AND menu_item_id = ?");

        for (const paidItem of paymentData.paidItems) {
            const existingItem = getOrderItemStmt.get(activeOrder.id, paidItem.id);
            if (!existingItem) {
                throw new Error(`Món "${paidItem.name}" không có trong đơn hàng.`);
            }
            if (existingItem.quantity < paidItem.quantity) {
                throw new Error(`Số lượng thanh toán cho món "${paidItem.name}" vượt quá số lượng trong đơn.`);
            }
        }
        
        const now = new Date();
        
        // ** SỬA LỖI Ở ĐÂY: Bỏ cột 'id' ra khỏi câu lệnh INSERT **
        const insertCompletedOrderStmt = db.prepare(
            'INSERT INTO Orders (table_id, order_date, order_time, cashier_id, payment_method, subtotal, discount_type, discount_value, discount_amount, total_amount, notes, status, sync_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        const info = insertCompletedOrderStmt.run(
            tableId, now.toISOString().split('T')[0], now.toTimeString().split(' ')[0].substring(0,8), cashierId,
            paymentData.paymentMethod, paymentData.subtotal, paymentData.discountType, paymentData.discountValue,
            paymentData.discountAmount, paymentData.total, 'Thanh toán một phần', 'completed', 'pending'
        );
        const completedOrderId = info.lastInsertRowid;
        
        const insertPaidItemStmt = db.prepare(
            'INSERT INTO OrderItems (order_id, menu_item_id, item_name, quantity, price_at_order, item_notes) VALUES (?, ?, ?, ?, ?, ?)'
        );
        for (const paidItem of paymentData.paidItems) {
            insertPaidItemStmt.run(completedOrderId, paidItem.id, paidItem.name || paidItem.item_name, paidItem.quantity, getPrice(paidItem), paidItem.item_notes || '');
        }

        const updateActiveItemStmt = db.prepare("UPDATE OrderItems SET quantity = quantity - ? WHERE order_id = ? AND menu_item_id = ?");
        for (const paidItem of paymentData.paidItems) {
            updateActiveItemStmt.run(paidItem.quantity, activeOrder.id, paidItem.id);
        }

        const deleteZeroQuantityItemsStmt = db.prepare("DELETE FROM OrderItems WHERE order_id = ? AND quantity <= 0");
        deleteZeroQuantityItemsStmt.run(activeOrder.id);
        
        const remainingItemsStmt = db.prepare("SELECT COUNT(*) as count FROM OrderItems WHERE order_id = ?");
        const remaining = remainingItemsStmt.get(activeOrder.id);
        if (remaining.count === 0) {
            const deleteActiveOrderStmt = db.prepare("DELETE FROM Orders WHERE id = ?");
            deleteActiveOrderStmt.run(activeOrder.id);
        }

        return { success: true, completedOrderId };
    });
    
    try {
        return transaction();
    } catch (error) {
        console.error('Error in createPartialPayment transaction:', error);
        return { error: error.message };
    }
}

function mergeOrders(sourceTableId, targetTableId) {
    const transaction = db.transaction(() => {
        const getOrderStmt = db.prepare("SELECT * FROM Orders WHERE table_id = ? AND status = 'active'");
        const sourceOrder = getOrderStmt.get(sourceTableId);
        let targetOrder = getOrderStmt.get(targetTableId);
        let targetOrderId;
        if (!sourceOrder) throw new Error(`Không tìm thấy đơn hàng đang hoạt động cho bàn nguồn: ${sourceTableId}`);
        const getItemsStmt = db.prepare("SELECT * FROM OrderItems WHERE order_id = ?");
        const sourceItems = getItemsStmt.all(sourceOrder.id);
        if (sourceItems.length === 0) {
             const deleteEmptyOrderStmt = db.prepare("DELETE FROM Orders WHERE id = ?");
             deleteEmptyOrderStmt.run(sourceOrder.id);
            return { success: true, message: 'Bàn nguồn không có món ăn để chuyển, đã dọn bàn.' };
        }
        if (!targetOrder) {
            const now = new Date();
            const insertOrderStmt = db.prepare("INSERT INTO Orders (table_id, order_date, order_time, status, sync_status, subtotal, total_amount) VALUES (?, ?, ?, 'active', 'pending', 0, 0)");
            const info = insertOrderStmt.run(targetTableId, now.toISOString().split('T')[0], now.toTimeString().split(' ')[0].substring(0,8));
            targetOrderId = info.lastInsertRowid;
            targetOrder = { id: targetOrderId, notes: '' };
        } else {
            targetOrderId = targetOrder.id;
        }
        const upsertItemStmt = db.prepare(`INSERT INTO OrderItems (order_id, menu_item_id, item_name, quantity, price_at_order, item_notes) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(order_id, menu_item_id) DO UPDATE SET quantity = quantity + excluded.quantity;`);
        for (const item of sourceItems) {
            upsertItemStmt.run(targetOrderId, item.menu_item_id, item.item_name, item.quantity, item.price_at_order, item.item_notes);
        }
        const newNotes = [targetOrder.notes, sourceOrder.notes].filter(Boolean).join(' | ');
        const updateNoteStmt = db.prepare("UPDATE Orders SET notes = ? WHERE id = ?");
        updateNoteStmt.run(newNotes, targetOrderId);
        const deleteOrderStmt = db.prepare("DELETE FROM Orders WHERE id = ?");
        deleteOrderStmt.run(sourceOrder.id);
        return { success: true, targetOrderId: targetOrderId };
    });
    try {
        return transaction();
    } catch (error) {
        console.error('Error in mergeOrders transaction:', error);
        return { error: error.message };
    }
}

function saveOrUpdateActiveOrder(tableId, orderContent) {
    const transaction = db.transaction(() => {
        const findStmt = db.prepare("SELECT id FROM Orders WHERE table_id = ? AND status = 'active'");
        let order = findStmt.get(tableId);
        let orderId;
        const now = new Date();
        const order_date = now.toISOString().split('T')[0];
        const order_time = now.toTimeString().split(' ')[0].substring(0, 8);
        if (order) {
            orderId = order.id;
            db.prepare("UPDATE Orders SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), notes = ? WHERE id = ?").run(orderContent.notes || '', orderId);
            db.prepare("DELETE FROM OrderItems WHERE order_id = ?").run(orderId);
        } else {
            const insertStmt = db.prepare("INSERT INTO Orders (table_id, order_date, order_time, status, notes) VALUES (?, ?, ?, 'active', ?)");
            const info = insertStmt.run(tableId, order_date, order_time, orderContent.notes || '');
            orderId = info.lastInsertRowid;
        }
        if (orderContent.items && orderContent.items.length > 0) {
            const itemStmt = db.prepare('INSERT OR REPLACE INTO OrderItems (order_id, menu_item_id, item_name, quantity, price_at_order, item_notes) VALUES (?, ?, ?, ?, ?, ?)');
            for (const item of orderContent.items) {
                const itemName = item.name || item.item_name;
                const itemPrice = item.price_at_order !== undefined ? item.price_at_order : item.price;
                itemStmt.run(orderId, item.id, itemName, item.quantity, itemPrice, item.item_notes || '');
            }
        }
        return { success: true, orderId: orderId };
    });
    try {
        return transaction();
    } catch (error) {
        console.error('Error in saveOrUpdateActiveOrder:', error);
        return { error: error.message };
    }
}

function getActiveOrders() {
    try {
        const stmt = db.prepare("SELECT * FROM Orders WHERE status = 'active'");
        const orders = stmt.all();
        const itemsStmt = db.prepare('SELECT * FROM OrderItems WHERE order_id = ?');
        for (const order of orders) {
            order.items = itemsStmt.all(order.id);
        }
        return orders;
    } catch (error) {
        console.error('Error getting active orders:', error);
        return [];
    }
}

function create(orderData) {
  const transaction = db.transaction((data) => {
    const { table_id, cashier_id, items, notes, payment_method, subtotal, discount_type, discount_value, discount_amount, total_amount } = data;
    const activeOrderStmt = db.prepare("SELECT id FROM Orders WHERE table_id = ? AND status = 'active'");
    const activeOrder = activeOrderStmt.get(table_id);
    if (activeOrder) {
        db.prepare("DELETE FROM Orders WHERE id = ?").run(activeOrder.id);
    }
    const now = new Date();
    const orderDate = now.toISOString().split('T')[0];
    const orderTime = now.toTimeString().split(' ')[0].substring(0, 8);
    const insertOrderStmt = db.prepare(`INSERT INTO Orders (table_id, order_date, order_time, cashier_id, payment_method, subtotal, discount_type, discount_value, discount_amount, total_amount, notes, status, sync_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'pending')`);
    const info = insertOrderStmt.run(table_id, orderDate, orderTime, cashier_id, payment_method, subtotal, discount_type, discount_value, discount_amount, total_amount, notes || '');
    const orderId = info.lastInsertRowid;
    const insertItemStmt = db.prepare(`INSERT INTO OrderItems (order_id, menu_item_id, item_name, quantity, price_at_order, item_notes) VALUES (?, ?, ?, ?, ?, ?)`);
    for (const item of items) {
        insertItemStmt.run(orderId, item.id, item.name, item.quantity, item.price, item.item_notes || '');
    }
    return { id: orderId, ...data };
  });
  try {
    return transaction(orderData);
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng hoàn chỉnh:", error);
    throw error;
  }
}

function findById(id) {
    try {
        const orderStmt = db.prepare('SELECT * FROM Orders WHERE id = ?');
        const order = orderStmt.get(id);
        if (!order) return null;
        const itemsStmt = db.prepare('SELECT * FROM OrderItems WHERE order_id = ?');
        order.items = itemsStmt.all(id);
        return order;
    } catch (error) {
        console.error(`Error finding order by id ${id}:`, error);
        return null;
    }
}

function findAllByDateRange(startDate, endDate) {
    try {
        const stmt = db.prepare("SELECT o.*, u.name as cashier_name FROM Orders o LEFT JOIN Users u ON o.cashier_id = u.id WHERE o.status = 'completed' AND o.order_date BETWEEN ? AND ? ORDER BY o.created_at DESC");
        const orders = stmt.all(startDate, endDate);
        const itemsStmt = db.prepare('SELECT * FROM OrderItems WHERE order_id = ?');
        for(const order of orders) {
            order.items = itemsStmt.all(order.id);
        }
        return orders;
    } catch (error) {
        console.error('Error finding all orders by date range:', error);
        return [];
    }
}

module.exports = {
  createPartialPayment,
  mergeOrders,
  saveOrUpdateActiveOrder,
  getActiveOrders,
  create,
  findById,
  findAllByDateRange,
};