// backend/src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Route mới cho Đăng nhập Doanh nghiệp (mở ca)
// POST /api/auth/business/login
router.post('/business/login', authController.businessLogin);

// Route cho Admin đăng nhập (vào trang quản trị)
// POST /api/auth/admin/login
router.post('/admin/login', authController.adminLogin);

// Route cho nhân viên đăng nhập bằng mã PIN
// POST /api/auth/staff/login
router.post('/staff/login', authController.staffLogin);

module.exports = router;