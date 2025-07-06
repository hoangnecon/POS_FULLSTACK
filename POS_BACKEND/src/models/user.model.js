// backend/src/models/user.model.js

const db = require('../db/connect');

/**
 * Tìm một người dùng bằng username HOẶC email.
 * @param {string} loginIdentifier - Tên đăng nhập hoặc email của người dùng.
 * @returns {object | null} Thông tin người dùng hoặc null nếu không tìm thấy.
 */
function findByLoginIdentifier(loginIdentifier) {
  try {
    // Sửa câu lệnh SQL để tìm kiếm ở cả hai cột username và email
    const stmt = db.prepare('SELECT * FROM Users WHERE username = ? OR email = ?');
    const user = stmt.get(loginIdentifier, loginIdentifier);
    return user;
  } catch (error) {
    console.error(`Error finding user by login identifier ${loginIdentifier}:`, error);
    return null;
  }
}

/**
 * Tìm một người dùng bằng ID.
 * @param {number} id - ID của người dùng.
 * @returns {object | null} Thông tin người dùng hoặc null nếu không tìm thấy.
 */
function findById(id) {
  try {
    const stmt = db.prepare('SELECT id, username, name, email, role, pin FROM Users WHERE id = ?');
    const user = stmt.get(id);
    return user;
  } catch (error) {
    console.error(`Error finding user by id ${id}:`, error);
    return null;
  }
}

/**
 * Lấy tất cả người dùng (hữu ích cho trang quản lý nhân viên).
 */
function getAll() {
    try {
        const stmt = db.prepare("SELECT id, username, name, email, pin, role FROM Users WHERE role = 'cashier'");
        return stmt.all();
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
}

/**
 * Tạo một người dùng mới (nhân viên).
 * @param {object} user - Đối tượng chứa thông tin người dùng.
 * @returns {object} Thông tin về kết quả thêm mới.
 */
function create(user) {
  const { username, name, email, pin, role } = user;
  try {
    const stmt = db.prepare(
      'INSERT INTO Users (username, name, email, pin, role) VALUES (?, ?, ?, ?, ?)'
    );
    const info = stmt.run(username, name, email, pin, role);
    return { id: info.lastInsertRowid, ...user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { error: error.message };
  }
}

/**
 * Cập nhật thông tin người dùng.
 */
function update(id, user) {
    const { name, email, pin } = user;
    try {
        const stmt = db.prepare(
            'UPDATE Users SET name = ?, email = ?, pin = ? WHERE id = ?'
        );
        const info = stmt.run(name, email, pin, id);
        return { changes: info.changes };
    } catch (error) {
        console.error(`Error updating user ${id}:`, error);
        return { error: error.message };
    }
}

/**
 * Xóa một người dùng.
 */
function remove(id) {
    try {
        const stmt = db.prepare('DELETE FROM Users WHERE id = ?');
        const info = stmt.run(id);
        return { changes: info.changes };
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        return { error: error.message };
    }
}


module.exports = {
  findByLoginIdentifier, // Đổi tên hàm export
  findById,
  getAll,
  create,
  update,
  remove,
};