// backend/src/controllers/category.controller.js

const categoryModel = require('../models/category.model');

async function getAllCategories(req, res) {
    try {
        const categories = categoryModel.getAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách danh mục." });
    }
}

async function createCategory(req, res) {
    const { id, name, icon_name } = req.body;
    if (!id || !name) {
        return res.status(400).json({ message: 'ID và Tên danh mục là bắt buộc.' });
    }
    try {
        const result = categoryModel.create({ id, name, icon_name });
        if (result.error) {
            if (result.error.includes('UNIQUE')) {
                return res.status(409).json({ message: `ID danh mục '${id}' đã tồn tại.` });
            }
            return res.status(400).json({ message: result.error });
        }
        res.status(201).json({ message: 'Tạo danh mục thành công.', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ khi tạo danh mục.' });
    }
}

async function updateCategory(req, res) {
    const { id } = req.params;
    const { name, icon_name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' });
    }
    try {
        const result = categoryModel.update(id, { name, icon_name });
        if (result.changes === 0) {
            return res.status(404).json({ message: `Không tìm thấy danh mục với ID: ${id}` });
        }
        res.status(200).json({ message: 'Cập nhật danh mục thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật danh mục.' });
    }
}

async function deleteCategory(req, res) {
    const { id } = req.params;
    try {
        const result = categoryModel.remove(id);
        if (result.changes === 0) {
            return res.status(404).json({ message: `Không tìm thấy danh mục với ID: ${id}` });
        }
        res.status(200).json({ message: 'Xóa danh mục thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ khi xóa danh mục.' });
    }
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};