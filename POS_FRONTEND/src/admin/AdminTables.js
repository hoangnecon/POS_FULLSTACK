import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, GalleryVertical, ShoppingBag } from 'lucide-react';
import AlertDialog from '../components/common/AlertDialog';
import useTableManagement from '../hooks/useTableManagement';
import { useMenuData } from '../hooks/useMenuData';

const AdminTables = () => {
  const { tables, loading, error, addTable, updateTable, deleteTable, fetchTables } = useTableManagement();
  const { fetchAllMenuData } = useMenuData();

  const [showAddEditTableDialog, setShowAddEditTableDialog] = useState(false);
  const [selectedTableEdit, setSelectedTableEdit] = useState(null);
  const [newTableName, setNewTableName] = useState('');
  const [isNewTableSpecial, setIsNewTableSpecial] = useState(false);
  const [newTableId, setNewTableId] = useState('');

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: () => {}, confirmText: 'Đồng ý', cancelText: 'Hủy' });

  const handleShowAlert = useCallback((title, message, onConfirmCallback = () => {}) => {
    setAlertConfig({
      title,
      message,
      onConfirm: () => {
        setIsAlertOpen(false);
        onConfirmCallback();
      },
      confirmText: 'Đồng ý',
      cancelText: null
    });
    setIsAlertOpen(true);
  }, []);

  const handleShowConfirm = useCallback((title, message, onConfirmCallback, confirmText = 'Xác nhận', cancelText = 'Hủy') => {
    setAlertConfig({
      title,
      message,
      onConfirm: () => {
        setIsAlertOpen(false);
        onConfirmCallback();
      },
      confirmText,
      cancelText
    });
    setIsAlertOpen(true);
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const resetDialogState = () => {
    setShowAddEditTableDialog(false);
    setSelectedTableEdit(null);
    setNewTableName('');
    setNewTableId('');
    setIsNewTableSpecial(false);
  };

  const handleAddTable = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!newTableName.trim()) {
      handleShowAlert('Lỗi nhập liệu', 'Tên bàn không được để trống.');
      return;
    }
    if (!selectedTableEdit && !newTableId.trim()) {
      handleShowAlert('Lỗi nhập liệu', 'ID bàn không được để trống khi thêm bàn mới.');
      return;
    }

    // Debug: Kiểm tra giá trị và kiểu của newTableName
    console.log('DEBUG (AdminTables): Value of newTableName:', newTableName);
    console.log('DEBUG (AdminTables): Type of newTableName:', typeof newTableName);

    // Tạo đối tượng tableDataToSend
    const tableDataToSend = {
      id: selectedTableEdit ? selectedTableEdit.id : newTableId.trim().toLowerCase().replace(/\s+/g, '-'),
      name: newTableName.trim(), // Đảm bảo name là chuỗi
      is_special: isNewTableSpecial,
      icon_name: isNewTableSpecial ? 'ShoppingBag' : 'GalleryVertical'
    };

    console.log('DEBUG (AdminTables): tableDataToSend before calling addTable:', tableDataToSend);

    const result = await addTable(tableDataToSend);
    if (result.success) {
      handleShowAlert('Thêm bàn thành công', 'Bàn đã được thêm vào hệ thống.');
      await fetchAllMenuData();
      resetDialogState();
    } else {
      handleShowAlert('Lỗi khi thêm bàn', result.message);
    }
  };

  const handleUpdateTable = async () => {
    if (!newTableName.trim()) {
      handleShowAlert('Lỗi nhập liệu', 'Tên bàn không được để trống.');
      return;
    }
    if (!selectedTableEdit) {
      handleShowAlert('Lỗi', 'Không tìm thấy bàn để cập nhật.');
      return;
    }

    console.log('DEBUG (AdminTables): Value of newTableName (Update):', newTableName);
    console.log('DEBUG (AdminTables): Type of newTableName (Update):', typeof newTableName);

    const tableDataToSend = {
      name: newTableName.trim(), // Đảm bảo name là chuỗi
      is_special: isNewTableSpecial,
      icon_name: isNewTableSpecial ? 'ShoppingBag' : 'GalleryVertical'
    };

    console.log('DEBUG (AdminTables): tableDataToSend before calling updateTable:', tableDataToSend);

    const result = await updateTable(selectedTableEdit.id, tableDataToSend);
    if (result.success) {
      handleShowAlert('Cập nhật bàn thành công', 'Bàn đã được cập nhật.');
      await fetchAllMenuData();
      resetDialogState();
    } else {
      handleShowAlert('Lỗi khi cập nhật bàn', result.message);
    }
  };

  const handleDeleteTable = (tableId, tableName) => {
    handleShowConfirm(
      `Xác nhận xóa bàn "${tableName}"?`,
      'Hành động này không thể hoàn tác.',
      async () => {
        const result = await deleteTable(tableId);
        if (result.success) {
          handleShowAlert('Xóa bàn thành công', 'Bàn đã được xóa.');
          await fetchAllMenuData();
        } else {
          handleShowAlert('Lỗi khi xóa bàn', result.message);
        }
      },
      'Vẫn xóa',
      'Hủy'
    );
  };

  const openAddDialog = () => {
    resetDialogState();
    setShowAddEditTableDialog(true);
  };

  const openEditDialog = (table) => {
    setSelectedTableEdit(table);
    setNewTableName(table.name);
    setNewTableId(table.id);
    setIsNewTableSpecial(table.is_special);
    setShowAddEditTableDialog(true);
  };

  const sortedTables = [...tables].sort((a, b) => {
    if (a.is_special && !b.is_special) return -1;
    if (!a.is_special && b.is_special) return 1;
    return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
  });

  return (
    <div className="bg-primary-bg pt-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary-headline mb-3">Quản lý Bàn</h1>
          <p className="text-primary-paragraph text-lg">Thêm, sửa, xóa các loại bàn và số bàn</p>
        </div>
        <button onClick={openAddDialog} className="bg-primary-button text-primary-main px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-highlight transition-colors shadow-lg">
          <Plus size={20} /> Thêm Bàn
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTables.map((table) => {
          const IconComponent = table.is_special ? ShoppingBag : GalleryVertical;
          return (
            <div key={table.id} className="bg-primary-main rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {IconComponent && <IconComponent className="text-primary-button" size={24} />}
                  <h3 className="text-xl font-bold text-primary-headline">{table.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditDialog(table)} className="p-2 text-primary-button hover:bg-primary-secondary rounded-lg"><Edit3 size={16} /></button>
                  <button onClick={() => handleDeleteTable(table.id, table.name)} className="p-2 text-primary-tertiary hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-sm text-primary-paragraph">ID: {table.id}</p>
              <p className="text-sm text-primary-paragraph">Loại: {table.is_special ? 'Đặc biệt' : 'Thường'}</p>
              <p className="text-sm text-primary-paragraph">Trạng thái: {table.status}</p>
            </div>
          );
        })}
      </div>

      {showAddEditTableDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-main rounded-2xl p-6 m-4 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-primary-headline mb-4">
              {selectedTableEdit ? 'Sửa Bàn' : 'Thêm Bàn Mới'}
            </h3>
            <div className="space-y-4">
              {!selectedTableEdit && (
                <div>
                  <label className="block text-sm font-medium text-primary-paragraph mb-2">ID Bàn (vd: 1, takeaway, VIP)</label>
                  <input type="text" value={newTableId} onChange={(e) => setNewTableId(e.target.value)} className="w-full p-3 bg-primary-secondary rounded-xl" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-primary-paragraph mb-2">Tên Bàn (vd: Bàn 1, Bàn Mang về)</label>
                <input type="text" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} className="w-full p-3 bg-primary-secondary rounded-xl" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isSpecialTable" checked={isNewTableSpecial} onChange={(e) => setIsNewTableSpecial(e.target.checked)} className="w-5 h-5 text-primary-button rounded" />
                <label htmlFor="isSpecialTable" className="text-sm font-medium text-primary-paragraph">Bàn đặc biệt (xuất hiện đầu tiên)</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={selectedTableEdit ? handleUpdateTable : handleAddTable} className="flex-1 bg-primary-button text-primary-main py-2 rounded-xl font-bold">
                {selectedTableEdit ? 'Cập nhật' : 'Thêm'}
              </button>
              <button onClick={resetDialogState} className="flex-1 bg-primary-secondary text-primary-button py-2 rounded-xl font-bold">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </div>
  );
};

export default AdminTables;