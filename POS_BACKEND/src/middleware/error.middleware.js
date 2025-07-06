// src/middleware/error.middleware.js
function errorHandler(err, req, res, next) {
  console.error(err.stack); // In stack trace ra console để debug

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ không xác định.';

  res.status(statusCode).json({
    message: message,
    // Chỉ gửi stack trace trong môi trường phát triển
    // stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
}

module.exports = errorHandler;