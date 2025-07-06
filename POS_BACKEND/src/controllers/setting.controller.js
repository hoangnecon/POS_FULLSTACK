// backend/src/controllers/setting.controller.js

const settingModel = require('../models/setting.model');

/**
 * Lấy tất cả cài đặt.
 */
async function getAllSettings(req, res) {
  try {
    const settings = settingModel.getAllSettings();
    if (!settings) {
      return res.status(404).json({ message: 'Không tìm thấy cài đặt nào.' });
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error in getAllSettings controller:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
}

/**
 * Cập nhật một cài đặt cụ thể.
 */
async function updateSetting(req, res) {
  const { key } = req.params;
  const { value } = req.body;

  if (!value) {
    return res.status(400).json({ message: 'Giá trị (value) là bắt buộc.' });
  }

  try {
    const result = settingModel.updateSetting(key, value);
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    if (result.changes === 0) {
      // Mặc dù `INSERT ... ON CONFLICT` sẽ luôn có changes > 0 nếu thành công,
      // việc kiểm tra này vẫn tốt để phòng ngừa.
      return res.status(404).json({ message: `Không tìm thấy cài đặt với key: ${key}` });
    }
    res.status(200).json({ message: `Cài đặt '${key}' đã được cập nhật.`, data: value });
  } catch (error) {
    console.error(`Error in updateSetting controller for key ${key}:`, error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
}

module.exports = {
  getAllSettings,
  updateSetting,
};