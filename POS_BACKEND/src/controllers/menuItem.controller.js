// backend/src/controllers/menuItem.controller.js
const menuItemModel = require('../models/menuItem.model');

async function createMenuItem(req, res) {
    try {
        const result = menuItemModel.create(req.body);
        if (result.error) return res.status(400).json({ message: result.error });
        res.status(201).json({ message: 'Tạo món ăn thành công.', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ khi tạo món ăn.' });
    }
}

async function updateMenuItem(req, res) {
    const { id } = req.params;
    try {
        const result = menuItemModel.update(id, req.body);
        if (result.error) return res.status(404).json({ message: result.error });
        res.status(200).json({ message: 'Cập nhật món ăn thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật món ăn.' });
    }
}

async function updateItemInventory(req, res) {
    const { id } = req.params;
    try {
        const result = menuItemModel.updateInventory(id, req.body);
        if (result.error) return res.status(404).json({ message: result.error });
        res.status(200).json({ message: 'Cập nhật tồn kho thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật tồn kho.' });
    }
}

async function deleteMenuItem(req, res) {
    const { id } = req.params;
    try {
        const result = menuItemModel.remove(id);
        if (result.error) return res.status(404).json({ message: result.error });
        res.status(200).json({ message: 'Xóa món ăn thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa món ăn.' });
    }
}

module.exports = {
    createMenuItem,
    updateMenuItem,
    updateItemInventory,
    deleteMenuItem,
};