// backend/app.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import các modules route
const authRoutes = require('./src/routes/auth.routes');
const apiRoutes = require('./src/routes/api.routes');

// Import middleware xử lý lỗi
const errorHandler = require('./src/middleware/error.middleware'); // ** ĐÃ THÊM: Import error handler **

// Khởi tạo kết nối database để đảm bảo nó được thiết lập khi server bắt đầu
const db = require('./src/db/connect');

const app = express();
const PORT = process.env.PORT || 3001;

// ----- Cấu hình Middleware -----

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ----- Đăng ký Routes -----

// Route cơ bản để kiểm tra server
app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng bạn đến với Backend POS API!' });
});

// Gắn các routes đã định nghĩa vào ứng dụng Express
// Tất cả các route trong 'auth.routes.js' sẽ có tiền tố '/api/auth'
app.use('/api/auth', authRoutes);
// Tất cả các route trong 'api.routes.js' sẽ có tiền tố '/api'
app.use('/api', apiRoutes);

// ** ĐÃ SỬA: Kích hoạt error handler **
app.use(errorHandler);


// ----- Khởi động Server -----

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Backend Express server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;