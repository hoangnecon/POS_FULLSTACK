// backend/src/controllers/auth.controller.js

const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'a-very-secret-key-that-should-be-in-env-file';

/**
 * Xử lý đăng nhập cho Business Owner (mở ca)
 * Cho phép cả vai trò 'business' và 'admin' đăng nhập
 */
async function businessLogin(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp thông tin đăng nhập.' });
    }
    try {
        const user = userModel.findByLoginIdentifier(username);
        // Admin cũng có thể mở ca
        if (!user || (user.role !== 'business' && user.role !== 'admin')) {
            return res.status(401).json({ message: 'Tài khoản không có quyền truy cập.' });
        }
        const isPasswordMatch = (password === user.hashed_password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
        }
        // Token này chỉ dùng để xác nhận đã mở ca, không chứa thông tin chi tiết
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ message: 'Đăng nhập doanh nghiệp thành công!', token });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
}

/**
 * Xử lý đăng nhập cho Admin (chỉ vào trang quản trị)
 */
async function adminLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp thông tin đăng nhập.' });
  }
  try {
    const user = userModel.findByLoginIdentifier(username);
    // Chỉ vai trò 'admin' mới được vào đây
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
    }
    const isPasswordMatch = (password === user.hashed_password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const { hashed_password, pin, ...userToReturn } = user;
    res.status(200).json({ message: 'Đăng nhập Admin thành công!', token, user: userToReturn });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
}

/**
 * Xử lý đăng nhập cho nhân viên bằng mã PIN.
 */
async function staffLogin(req, res) {
    const { userId, pin } = req.body;
    if (!userId || !pin) {
        return res.status(400).json({ message: 'Vui lòng cung cấp ID nhân viên và mã PIN.' });
    }
    try {
        const user = userModel.findById(Number(userId));
        if (!user || user.role !== 'cashier') {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
        }
        const isPinMatch = (String(user.pin) === String(pin));
        if (!isPinMatch) {
            return res.status(401).json({ message: 'Mã PIN không chính xác.' });
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '12h' });
        const { hashed_password, ...userToReturn } = user;
        res.status(200).json({ message: 'Đăng nhập nhân viên thành công!', token, user: userToReturn });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
}

module.exports = {
  businessLogin,
  adminLogin,
  staffLogin,
};