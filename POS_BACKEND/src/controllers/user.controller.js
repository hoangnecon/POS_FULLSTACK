// backend/src/controllers/user.controller.js

const userModel = require('../models/user.model');

/**
 * Lấy danh sách tất cả nhân viên.
 */
function getAllStaff(req, res) {
  try {
    const staffList = userModel.getAll();
    res.status(200).json(staffList);
  } catch (error) {
    console.error('Error in getAllStaff controller:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
}

/**
 * Thêm một nhân viên mới.
 */
function addStaff(req, res) {
  const { username, name, email, pin } = req.body;

  if (!username || !name || !pin) {
    return res.status(400).json({ message: 'Username, name, và pin là bắt buộc.' });
  }

  try {
    const newUser = { username, name, email, pin, role: 'cashier' };
    const result = userModel.create(newUser);

    if (result.error) {
      // Kiểm tra lỗi UNIQUE constraint
      if (result.error.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ message: 'Username hoặc Email đã tồn tại.' });
      }
      return res.status(500).json({ message: result.error });
    }
    
    res.status(201).json({ message: 'Thêm nhân viên thành công.', data: result });
  } catch (error) {
    console.error('Error in addStaff controller:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
}

/**
 * Cập nhật thông tin một nhân viên.
 */
function updateStaff(req, res) {
  const { id } = req.params;
  const { name, email, pin } = req.body;

  if (!name || !pin) {
    return res.status(400).json({ message: 'Name và pin là bắt buộc.' });
  }

  try {
    const result = userModel.update(id, { name, email, pin });
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    if (result.changes === 0) {
      return res.status(404).json({ message: `Không tìm thấy nhân viên với ID: ${id}` });
    }
    res.status(200).json({ message: 'Cập nhật thông tin nhân viên thành công.' });
  } catch (error) {
    console.error('Error in updateStaff controller:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
}

/**
 * Xóa một nhân viên.
 */
function deleteStaff(req, res) {
  const { id } = req.params;
  try {
    const result = userModel.remove(id);
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    if (result.changes === 0) {
      return res.status(404).json({ message: `Không tìm thấy nhân viên với ID: ${id}` });
    }
    res.status(200).json({ message: 'Xóa nhân viên thành công.' });
  } catch (error) {
    console.error('Error in deleteStaff controller:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
}

module.exports = {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
};