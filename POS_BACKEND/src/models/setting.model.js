// backend/src/models/setting.model.js

const db = require('../db/connect');

/**
 * Lấy một cài đặt cụ thể từ cơ sở dữ liệu bằng key.
 * @param {string} key - The key of the setting to retrieve (e.g., 'printSettings').
 * @returns {object | null} The parsed JSON value of the setting, or null if not found.
 */
function getSetting(key) {
  try {
    const stmt = db.prepare('SELECT value FROM Settings WHERE key = ?');
    const row = stmt.get(key);
    if (row && row.value) {
      // Giá trị được lưu dưới dạng chuỗi JSON, cần parse lại thành object
      return JSON.parse(row.value);
    }
    return null;
  } catch (error) {
    console.error(`Error getting setting for key ${key}:`, error);
    return null;
  }
}

/**
 * Lấy tất cả các cài đặt từ cơ sở dữ liệu.
 * @returns {object} An object containing all settings, with keys being the setting keys.
 */
function getAllSettings() {
  try {
    const stmt = db.prepare('SELECT key, value FROM Settings');
    const rows = stmt.all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = JSON.parse(row.value);
    }
    return settings;
  } catch (error) {
    console.error('Error getting all settings:', error);
    return {};
  }
}

/**
 * Cập nhật hoặc tạo mới một cài đặt.
 * @param {string} key - The key of the setting to update or create.
 * @param {object} value - The new value for the setting (will be stringified to JSON).
 * @returns {object} An object indicating the result of the operation.
 */
function updateSetting(key, value) {
  try {
    const jsonValue = JSON.stringify(value);
    const now = new Date().toISOString();
    
    const stmt = db.prepare(
      'INSERT INTO Settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
    );
    
    const info = stmt.run(key, jsonValue, now);
    return { changes: info.changes };
  } catch (error) {
    console.error(`Error updating setting for key ${key}:`, error);
    return { error: error.message };
  }
}

module.exports = {
  getSetting,
  getAllSettings,
  updateSetting,
};