// backend/src/db/connect.js

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', '..', 'pos.db');
const db = new Database(dbPath);

function initializeDatabase() {
  try {
    const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema);

    // Bọc TẤT CẢ các lệnh chèn dữ liệu vào trong một giao dịch duy nhất
    const seedTransaction = db.transaction(() => {
        const now = new Date().toISOString();

        // 1. Chèn Users
        const insertUser = db.prepare('INSERT OR IGNORE INTO Users (username, name, email, hashed_password, pin, role) VALUES (?, ?, ?, ?, ?, ?)');
        insertUser.run('admin', 'Admin Full Control', 'admin@example.com', 'admin', null, 'admin'); 
        insertUser.run('business', 'Business Owner', 'business@example.com', 'business', null, 'business');
        insertUser.run('staff1', 'Nguyễn Văn A', 'nhanvien_a@email.com', null, '1234', 'cashier');
        insertUser.run('staff2', 'Trần Thị B', 'nhanvien_b@email.com', null, '5678', 'cashier');
        console.log('✅ Default users seeded.');

        // 2. Chèn Settings
        const insertSetting = db.prepare('INSERT OR REPLACE INTO Settings (key, value, updated_at) VALUES (?, ?, ?)');
        const initialPrintSettings = {"fontFamily":"Courier New","lineSpacing":2,"useSeparatorLine":true,"restaurantName":"Nhà hàng ABC","address":"123 Đường XYZ, Q.1, TP.HCM","phone":"0909 123 456","showStoreName":true,"headerStyle":{"fontSize":14,"fontWeight":"bold","fontStyle":"normal"},"subHeaderStyle":{"fontSize":8,"fontWeight":"normal","fontStyle":"normal"},"showDateTime":true,"showCashier":false,"orderInfoStyle":{"fontSize":9,"fontWeight":"normal","fontStyle":"normal"},"itemsHeaderStyle":{"fontSize":9,"fontWeight":"bold","fontStyle":"normal"},"itemsBodyStyle":{"fontSize":9,"fontWeight":"normal","fontStyle":"normal"},"totalLabel":"TỔNG CỘNG:","thankYouMessage":"Cảm ơn quý khách!","showQrCode":true,"totalStyle":{"fontSize":10,"fontWeight":"bold","fontStyle":"normal"},"footerStyle":{"fontSize":8,"fontWeight":"normal","fontStyle":"italic"},"showWifi":true,"wifiPassword":"your_wifi_password","kitchenOrderHeader":"PHIẾU GỌI MÓN","showKitchenStoreName":false,"kitchenRestaurantName":"Nhà hàng ABC","kitchenAddress":"123 Đường XYZ, Q.1, TP.HCM","kitchenPhone":"0909 123 456","kitchenHeaderStyle":{"fontSize":12,"fontWeight":"bold","fontStyle":"normal"},"kitchenOrderInfoStyle":{"fontSize":9,"fontWeight":"normal","fontStyle":"normal"},"kitchenItemsHeaderStyle":{"fontSize":9,"fontWeight":"bold","fontStyle":"normal"},"kitchenItemsBodyStyle":{"fontSize":9,"fontWeight":"normal","fontStyle":"normal"},"kitchenFooterMessage":"--- YÊU CẦU BẾP CHUẨN BỊ ---","showKitchenCashier":true};
        const defaultDiscounts = [{"id":1,"type":"percent","value":10,"label":"10%"},{"id":2,"type":"percent","value":20,"label":"20%"},{"id":3,"type":"amount","value":50000,"label":"50k"},{"id":4,"type":"amount","value":100000,"label":"100k"}];
        const initialBankSettings = {"bin":"","accountNumber":"","accountName":""};
        insertSetting.run('printSettings', JSON.stringify(initialPrintSettings), now);
        insertSetting.run('theme', JSON.stringify({"name":"Mặc định"}), now);
        insertSetting.run('quickDiscountOptions', JSON.stringify(defaultDiscounts), now);
        insertSetting.run('bankSettings', JSON.stringify(initialBankSettings), now);
        console.log('✅ Default settings seeded.');

        // 3. Chèn Categories
        const insertCategory = db.prepare('INSERT OR IGNORE INTO Categories (id, name, icon_name) VALUES (?, ?, ?)');
        insertCategory.run('pho', 'Phở', 'Coffee');
        insertCategory.run('bun', 'Bún', 'ChefHat');
        insertCategory.run('com', 'Cơm', 'UtensilsCrossed');
        insertCategory.run('banh', 'Bánh', 'Cake');
        insertCategory.run('khai-vi', 'Khai vị', 'Heart');
        insertCategory.run('do-uong', 'Đồ uống', 'GlassWater');
        console.log('✅ Default categories seeded.');

        // 4. Chèn MenuTypes
        const insertMenuType = db.prepare('INSERT OR IGNORE INTO MenuTypes (id, name) VALUES (?, ?)');
        insertMenuType.run('regular', 'Thực đơn thường ngày');
        insertMenuType.run('holiday', 'Thực đơn Tết');
        console.log('✅ Default menu types seeded.');

        // 5. Chèn MenuItems
        const insertMenuItem = db.prepare('INSERT OR IGNORE INTO MenuItems (id, name, category_id, price, image_url, is_popular, menu_type_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
        insertMenuItem.run(1, 'Phở Bò Đặc Biệt', 'pho', 89000, 'https://images.unsplash.com/photo-1533787761082-492a5b83e614?w=300&h=200&fit=crop', 1, 'regular');
        insertMenuItem.run(2, 'Phở Gà Hà Nội', 'pho', 75000, 'https://images.unsplash.com/photo-1590420882553-4f9150b71f92?w=300&h=200&fit=crop', 0, 'regular');
        insertMenuItem.run(3, 'Bún Bò Huế', 'bun', 79000, 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?w=300&h=200&fit=crop', 1, 'regular');
        insertMenuItem.run(4, 'Bún Chả Hà Nội', 'bun', 85000, 'https://images.pexels.com/photos/2059153/pexels-photo-2059153.jpeg?w=300&h=200&fit=crop', 1, 'regular');
        insertMenuItem.run(5, 'Bánh Mì Thịt Nướng', 'banh', 35000, 'https://images.unsplash.com/photo-1600454309261-3dc9b7597637?w=300&h=200&fit=crop', 0, 'regular');
        insertMenuItem.run(6, 'Gỏi Cuốn Tôm Thịt', 'khai-vi', 45000, 'https://images.pexels.com/photos/6646082/pexels-photo-6646082.jpeg?w=300&h=200&fit=crop', 0, 'regular');
        insertMenuItem.run(7, 'Cơm Tấm Sài Gòn', 'com', 95000, 'https://images.pexels.com/photos/6646037/pexels-photo-6646037.jpeg?w=300&h=200&fit=crop', 1, 'regular');
        insertMenuItem.run(8, 'Cà Phê Đen Đá', 'do-uong', 25000, 'https://images.unsplash.com/photo-1641440615059-42c8ed3af8c8?w=300&h=200&fit=crop', 1, 'regular');
        console.log('✅ Default menu items seeded.');

        // 6. Chèn Tables
        const insertTable = db.prepare('INSERT OR IGNORE INTO Tables (id, name, is_special, icon_name) VALUES (?, ?, ?, ?)');
        insertTable.run('takeaway', 'Mang về', 1, 'ShoppingBag');
        for (let i = 1; i <= 30; i++) {
            insertTable.run(i.toString(), `Bàn ${i}`, 0, 'GalleryVertical');
        }
        console.log('✅ Default tables seeded.');
    });

    seedTransaction();
    console.log('Database initialized successfully with full seed data.');

  } catch (error) {
    console.error('Failed to initialize the database:', error);
  }
}

const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = 'Users'").get();
if (!tableCheck) {
  console.log('First run detected, initializing database...');
  initializeDatabase();
} else {
  console.log('Database already initialized.');
}

module.exports = db;