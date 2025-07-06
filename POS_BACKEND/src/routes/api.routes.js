// backend/src/routes/api.routes.js



const express = require('express');

const router = express.Router();



// Import controllers

const settingController = require('../controllers/setting.controller');

const menuController = require('../controllers/menu.controller');

const userController = require('../controllers/user.controller');

const orderController = require('../controllers/order.controller');

const dashboardController = require('../controllers/dashboard.controller');

const expenseController = require('../controllers/expense.controller');

const categoryController = require('../controllers/category.controller');

const menuItemController = require('../controllers/menuItem.controller');

const tableController = require('../controllers/table.controller');

const authController = require('../controllers/auth.controller'); // Import auth controller



router.get('/status', (req, res) => res.status(200).json({ status: 'API is up and running' }));



// ----- Auth Routes -----

router.post('/auth/admin/login', authController.adminLogin);



// ----- Settings Routes -----

router.get('/settings', settingController.getAllSettings);

router.put('/settings/:key', settingController.updateSetting);



// ----- Data Loading Route -----

router.get('/menu-data', menuController.getFullMenuData);



// ----- User (Staff) Management Routes -----

router.get('/staff', userController.getAllStaff);

router.post('/staff', userController.addStaff);

router.put('/staff/:id', userController.updateStaff);

router.delete('/staff/:id', userController.deleteStaff);



// ----- Category Management Routes -----

router.get('/categories', categoryController.getAllCategories);

router.post('/categories', categoryController.createCategory);

router.put('/categories/:id', categoryController.updateCategory);

router.delete('/categories/:id', categoryController.deleteCategory);



// ----- Table Management Routes -----

router.post('/tables', tableController.createTable);

router.put('/tables/:id', tableController.updateTable);

router.delete('/tables/:id', tableController.deleteTable);



// ----- Menu Item & Inventory Management Routes -----

router.post('/menu-items', menuItemController.createMenuItem);

router.put('/menu-items/:id', menuItemController.updateMenuItem);

router.put('/menu-items/:id/inventory', menuItemController.updateItemInventory);

router.delete('/menu-items/:id', menuItemController.deleteMenuItem);



// ----- Order Routes -----

router.get('/orders/active', orderController.getActiveOrders);

router.put('/orders/active/:table_id', orderController.saveOrUpdateActiveOrder);

router.post('/orders', orderController.createOrder);

router.post('/orders/merge', orderController.mergeTables);

router.post('/orders/partial-payment', orderController.processPartialPayment);



// ----- Dashboard Route -----

router.get('/dashboard', dashboardController.getDashboardData);



// ----- Expenses Routes -----

router.get('/expenses', expenseController.getExpenses);

router.post('/expenses', expenseController.createExpense);



module.exports = router;