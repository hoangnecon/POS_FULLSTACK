// backend/src/controllers/menu.controller.js

const menuModel = require('../models/menu.model');
const { v4: uuidv4 } = require('uuid');

function getFullMenuData(req, res) {
  try {
    const menuItems = menuModel.getAllMenuItems();
    const categories = menuModel.getAllCategories();
    const menuTypes = menuModel.getAllMenuTypes();
    const tables = menuModel.getAllTables();
    
    res.status(200).json({
      menuItems,
      categories,
      menuTypes,
      tables,
    });
  } catch (error) {
    console.error('Error in getFullMenuData controller:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
}

async function updateMenuItem(req, res) {
    const { id } = req.params;
    const itemData = req.body;
    try {
        const result = menuModel.updateMenuItem(id, itemData);
        if (result.error) throw new Error(result.error);
        res.status(200).json({ message: 'Cập nhật món ăn thành công.' });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ message: `Lỗi khi cập nhật món ăn: ${error.message}` });
    }
}

async function addMenuItem(req, res) {
  try {
    const itemData = { ...req.body };
    if (!itemData.id) {
        itemData.id = uuidv4(); 
    }
    const result = menuModel.createMenuItem(itemData);
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    res.status(201).json({ message: 'Thêm món ăn thành công', data: result });
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi thêm món ăn: ${error.message}` });
  }
}

async function deleteMenuItem(req, res) {
  try {
    const { id } = req.params;
    const result = menuModel.deleteMenuItem(id);
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    if (result.changes > 0) {
      res.status(200).json({ message: 'Xóa mềm món ăn thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi xóa món ăn: ${error.message}` });
  }
}

async function addMenuType(req, res) {
  try {
    const menuTypeData = { ...req.body };
    if (!menuTypeData.id || !menuTypeData.name) {
      return res.status(400).json({ message: 'ID và tên là bắt buộc' });
    }
    const result = menuModel.createMenuType(menuTypeData);
    if (result.error) {
      if (result.error.includes('SQLITE_CONSTRAINT')) {
        return res.status(409).json({ message: 'ID loại menu đã tồn tại' });
      }
      return res.status(500).json({ message: result.error });
    }
    res.status(201).json({ message: 'Thêm loại menu thành công', data: result });
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi thêm loại menu: ${error.message}` });
  }
}

async function deleteMenuType(req, res) {
  try {
    const { id } = req.params;
    const result = menuModel.deleteMenuType(id);
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    if (result.changes > 0) {
      res.status(200).json({ message: 'Xóa loại menu thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy loại menu' });
    }
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi xóa loại menu: ${error.message}` });
  }
}

async function addTable(req, res) {
  try {
    const tableData = { ...req.body };
    if (!tableData.name) {
      return res.status(400).json({ message: 'Tên bàn là bắt buộc' });
    }
    const result = menuModel.createTable(tableData);
    if (result.error) {
      if (result.error.includes('SQLITE_CONSTRAINT')) {
        return res.status(409).json({ message: 'ID bàn đã tồn tại' });
      }
      return res.status(500).json({ message: result.error });
    }
    res.status(201).json({ message: 'Thêm bàn thành công', data: result });
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi thêm bàn: ${error.message}` });
  }
}

async function updateTable(req, res) {
  try {
    const { id } = req.params;
    const tableData = { ...req.body };
    if (!tableData.name) {
      return res.status(400).json({ message: 'Tên là bắt buộc để cập nhật' });
    }
    const result = menuModel.updateTable(id, tableData);
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    if (result.changes > 0) {
      res.status(200).json({ message: 'Cập nhật bàn thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy bàn' });
    }
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi cập nhật bàn: ${error.message}` });
  }
}

async function deleteTable(req, res) {
  try {
    const { id } = req.params;
    const result = menuModel.deleteTable(id);
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    if (result.changes > 0) {
      res.status(200).json({ message: 'Xóa bàn thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy bàn' });
    }
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi xóa bàn: ${error.message}` });
  }
}

async function updateTableStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Trạng thái là bắt buộc để cập nhật.' });
    }
    const result = menuModel.updateTableStatus(id, status);
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    if (result.changes > 0) {
      res.status(200).json({ message: 'Cập nhật trạng thái bàn thành công.' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy bàn.' });
    }
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi cập nhật trạng thái bàn: ${error.message}` });
  }
}

async function getTablesByStatus(req, res) {
  try {
    const { status } = req.params;
    if (!status) {
      return res.status(400).json({ message: 'Trạng thái là bắt buộc.' });
    }
    const result = menuModel.getTablesByStatus(status);
    if (result.error) {
      return res.status(500).json({ message: result.error });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi lấy bàn theo trạng thái: ${error.message}` });
  }
}


module.exports = {
  getFullMenuData,
  updateMenuItem,
  addMenuItem,
  deleteMenuItem,
  addMenuType,
  deleteMenuType,
  addTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  getTablesByStatus,
};