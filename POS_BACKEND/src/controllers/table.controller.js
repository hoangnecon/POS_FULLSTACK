// backend/src/controllers/table.controller.js

const tableModel = require('../models/table.model');

async function createTable(req, res) {
    const { name, is_special, id } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Tên bàn là bắt buộc.' });
    }
    try {
        const result = tableModel.create({ id, name, is_special });
        if (result.error) {
            return res.status(400).json({ message: result.error });
        }
        res.status(201).json({ message: 'Tạo bàn thành công.', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ khi tạo bàn.' });
    }
}

async function updateTable(req, res) {
    const { id } = req.params;
    const { name, is_special, icon_name } = req.body;
     if (!name) {
        return res.status(400).json({ message: 'Tên bàn là bắt buộc.' });
    }
    try {
        const result = tableModel.update(id, { name, is_special, icon_name });
        if (result.changes === 0) {
            return res.status(404).json({ message: `Không tìm thấy bàn với ID: ${id}` });
        }
        res.status(200).json({ message: 'Cập nhật bàn thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật bàn.' });
    }
}

async function deleteTable(req, res) {
    const { id } = req.params;
    try {
        const result = tableModel.remove(id);
        if (result.error) {
            return res.status(404).json({ message: result.error });
        }
        res.status(200).json({ message: 'Xóa bàn thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa bàn.' });
    }
}

module.exports = {
    createTable,
    updateTable,
    deleteTable,
};