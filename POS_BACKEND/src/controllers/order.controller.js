// backend/src/controllers/order.controller.js

const orderModel = require('../models/order.model');

async function processPartialPayment(req, res) {
    const { tableId, paymentData } = req.body;
    const cashierId = req.body.cashierId || null;

    if (!tableId || !paymentData || !Array.isArray(paymentData.paidItems)) {
        return res.status(400).json({ message: 'Dữ liệu thanh toán một phần không hợp lệ.' });
    }
    
    try {
        const result = orderModel.createPartialPayment(String(tableId), paymentData, cashierId);
        if (result.error) {
            return res.status(400).json({ message: result.error });
        }
        res.status(200).json({ message: 'Thanh toán một phần thành công.', data: result });
    } catch (error) {
        console.error('Error in processPartialPayment controller:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi thanh toán một phần.' });
    }
}

async function mergeTables(req, res) {
    const { sourceTableId, targetTableId } = req.body;
    if (!sourceTableId || !targetTableId) {
        return res.status(400).json({ message: 'Cần có ID bàn nguồn và bàn đích.' });
    }
    try {
        const result = orderModel.mergeOrders(String(sourceTableId), String(targetTableId));
        if (result.error) {
            return res.status(400).json({ message: result.error });
        }
        res.status(200).json({ message: 'Gộp bàn thành công.', data: result });
    } catch (error) {
        console.error('Error in mergeTables controller:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi gộp bàn.' });
    }
}

async function getActiveOrders(req, res) {
    try {
        const activeOrders = orderModel.getActiveOrders();
        res.status(200).json(activeOrders);
    } catch (error) {
        console.error('Error in getActiveOrders controller:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy đơn hàng đang hoạt động.' });
    }
}

async function saveOrUpdateActiveOrder(req, res) {
    const { table_id } = req.params;
    const orderContent = req.body;

    if (!table_id || !orderContent) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
    }

    try {
        const result = orderModel.saveOrUpdateActiveOrder(String(table_id), orderContent);
        if (result.error) {
            return res.status(400).json({ message: result.error });
        }
        res.status(200).json({ message: 'Đã lưu trạng thái đơn hàng.' });
    } catch (error) {
        console.error('Error in saveOrUpdateActiveOrder controller:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lưu đơn hàng.' });
    }
}

async function createOrder(req, res) {
  const orderData = req.body;

  if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    return res.status(400).json({ message: 'Dữ liệu đơn hàng không hợp lệ.' });
  }
  
  if (orderData.table_id) {
    orderData.table_id = String(orderData.table_id);
  }

  try {
    const result = orderModel.create(orderData);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.status(201).json({ message: 'Tạo đơn hàng thành công!', data: result });
  } catch (error) {
    console.error('Unhandled error in createOrder controller:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ khi tạo đơn hàng.' });
  }
}

module.exports = {
    processPartialPayment,
    mergeTables,
    getActiveOrders,
    saveOrUpdateActiveOrder,
    createOrder,
};