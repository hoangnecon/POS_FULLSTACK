// src/admin/AdminMenus.js
import React, { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import AlertDialog from '../components/common/AlertDialog';

const CategoryDialog = ({ category, onSave, onClose }) => {
  const [name, setName] = useState(category?.name || '');
  const [id, setId] = useState(category?.id || '');
  const [icon, setIcon] = useState(category?.icon_name || 'UtensilsCrossed');

  const handleSave = () => {
    if (name && id) {
      onSave(id, name, icon);
      onClose();
    } else {
        alert('Vui lòng điền đầy đủ ID và Tên danh mục.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-main rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-primary-headline mb-4">
          {category ? 'Sửa Danh mục' : 'Thêm Danh mục'}
        </h3>
        <div className="space-y-4">
            <input type="text" value={id} onChange={(e) => setId(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="ID (vd: pho, do-uong)" className="w-full p-3 bg-primary-secondary rounded-xl" disabled={!!category} />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên danh mục (vd: Phở, Đồ uống)" className="w-full p-3 bg-primary-secondary rounded-xl" />
            <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Tên Icon từ Lucide (vd: Coffee)" className="w-full p-3 bg-primary-secondary rounded-xl" />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} className="flex-1 bg-primary-button text-primary-main py-2 rounded-xl font-bold">Lưu</button>
          <button onClick={onClose} className="flex-1 bg-primary-secondary text-primary-button py-2 rounded-xl font-bold">Hủy</button>
        </div>
      </div>
    </div>
  );
};

const MenuTypeDialog = ({ menuType, onSave, onClose }) => {
  const [name, setName] = useState(menuType?.name || '');
  const [id, setId] = useState(menuType?.id || '');

  const handleSave = () => {
    if (name && id) {
      onSave(id, name);
      onClose();
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-main rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-primary-headline mb-4">
          {menuType ? 'Sửa Loại Menu' : 'Thêm Loại Menu'}
        </h3>
        <div className="space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên loại menu (ví dụ: Menu Tết)" className="w-full p-3 bg-primary-secondary rounded-xl" />
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} placeholder="ID loại menu (ví dụ: holiday)" className="w-full p-3 bg-primary-secondary rounded-xl" disabled={!!menuType} />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} className="flex-1 bg-primary-button text-primary-main py-2 rounded-xl font-bold">Lưu</button>
          <button onClick={onClose} className="flex-1 bg-primary-secondary text-primary-button py-2 rounded-xl font-bold">Hủy</button>
        </div>
      </div>
    </div>
  );
};

const TableDialog = ({ table, onSave, onClose }) => {
    const [name, setName] = useState(table?.name || '');
    const [id, setId] = useState(table?.id || '');
    const [isSpecial, setIsSpecial] = useState(table ? table.is_special === 1 : false);

    const handleSave = () => {
        if (!name.trim()) {
            alert('Tên bàn không được để trống.');
            return;
        }
        // ID chỉ bắt buộc khi là bàn đặc biệt và đang ở chế độ thêm mới
        if (!table && isSpecial && !id.trim()) {
            alert('ID là bắt buộc cho bàn đặc biệt.');
            return;
        }
        onSave({ id: isSpecial ? id : undefined, name, is_special: isSpecial ? 1 : 0 });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary-main rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-primary-headline mb-4">{table ? 'Sửa Bàn' : 'Thêm Bàn'}</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tên bàn (ví dụ: Bàn 1, Mang về)"
                        className="w-full p-3 bg-primary-secondary rounded-xl"
                    />
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isSpecialTable"
                            checked={isSpecial}
                            onChange={(e) => setIsSpecial(e.target.checked)}
                            className="w-5 h-5 text-primary-button rounded"
                        />
                        <label htmlFor="isSpecialTable" className="text-sm font-medium text-primary-paragraph">Bàn đặc biệt (vd: Mang về, Giao hàng)</label>
                    </div>
                    {isSpecial && (
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            placeholder="ID bàn đặc biệt (vd: take-away)"
                            className="w-full p-3 bg-primary-secondary rounded-xl"
                            disabled={!!table} // Không cho sửa ID
                        />
                    )}
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={handleSave} className="flex-1 bg-primary-button text-primary-main py-2 rounded-xl font-bold">Lưu</button>
                    <button onClick={onClose} className="flex-1 bg-primary-secondary text-primary-button py-2 rounded-xl font-bold">Hủy</button>
                </div>
            </div>
        </div>
    );
};


const AdminMenus = ({
  menuTypes, addMenuType, deleteMenuType,
  categories, addCategory, updateCategory, deleteCategory,
  tables, addTable, updateTable, deleteTable,
}) => {
  const [activeTab, setActiveTab] = useState('categories');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showMenuTypeDialog, setShowMenuTypeDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMenuType, setSelectedMenuType] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: () => {} });

  const handleOpenCategoryDialog = (category = null) => { setSelectedCategory(category); setShowCategoryDialog(true); };
  const handleOpenMenuTypeDialog = (menuType = null) => { setSelectedMenuType(menuType); setShowMenuTypeDialog(true); };
  const handleOpenTableDialog = (table = null) => { setSelectedTable(table); setShowTableDialog(true); };

  const handleSaveCategory = (id, name, icon) => {
    if(selectedCategory) {
      updateCategory(id, name, icon);
    } else {
      addCategory(id, name, icon);
    }
  };

  const handleDeleteCategory = (id, name) => {
    setAlertConfig({
        title: `Xóa danh mục "${name}"?`,
        message: "Hành động này sẽ xóa vĩnh viễn danh mục và TẤT CẢ các món ăn bên trong nó. Bạn không thể hoàn tác.",
        onConfirm: () => {
            deleteCategory(id);
            setIsAlertOpen(false);
        }
    });
    setIsAlertOpen(true);
  };
  
  const handleDeleteTable = (id, name) => {
    setAlertConfig({
        title: `Xóa bàn "${name}"?`,
        message: "Hành động này sẽ xóa vĩnh viễn bàn này. Bạn có chắc chắn?",
        onConfirm: () => {
            deleteTable(id);
            setIsAlertOpen(false);
        }
    });
    setIsAlertOpen(true);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-primary-bg">
      <div className="flex-shrink-0">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-headline mb-3">Quản lý Menu & Bàn</h1>
            <p className="text-primary-paragraph text-lg">Tùy chỉnh các loại menu, danh mục món ăn và sơ đồ bàn.</p>
          </div>
          <div className="mt-4 md:mt-0 self-start md:self-center">
            {activeTab === 'categories' &&
              <div className="flex gap-2">
                <button onClick={() => handleOpenCategoryDialog()} className="bg-primary-button text-primary-main px-4 py-2 rounded-xl font-bold">Thêm Danh mục</button>
                <button onClick={() => handleOpenMenuTypeDialog()} className="bg-primary-button text-primary-main px-4 py-2 rounded-xl font-bold">Thêm Loại Menu</button>
              </div>
            }
            {activeTab === 'tables' &&
              <button onClick={() => handleOpenTableDialog()} className="bg-primary-button text-primary-main px-4 py-2 rounded-xl font-bold">Thêm Bàn</button>
            }
          </div>
        </div>
        <div className="flex gap-3 mb-8">
          <button onClick={() => setActiveTab('categories')} className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md ${activeTab === 'categories' ? 'bg-primary-button text-primary-main shadow-lg' : 'bg-primary-main text-primary-headline'}`}>Loại menu & Danh mục</button>
          <button onClick={() => setActiveTab('tables')} className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md ${activeTab === 'tables' ? 'bg-primary-button text-primary-main shadow-lg' : 'bg-primary-main text-primary-headline'}`}>Quản lý Bàn</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-0 md:pr-4">
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-primary-main rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-primary-headline mb-4">Danh mục món ăn</h3>
              <div className="space-y-3">
                {categories.filter(c => c.id !== 'all' && c.id !== 'popular').map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-3 bg-primary-secondary rounded-lg">
                    <span>{cat.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenCategoryDialog(cat)} className="text-primary-button hover:bg-primary-button/10 rounded p-1 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="text-primary-tertiary hover:bg-primary-tertiary/10 rounded p-1 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary-main rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold text-primary-headline mb-4">Loại menu</h3>
              <div className="space-y-3">
                {menuTypes.map(mt => (
                  <div key={mt.id} className="flex justify-between items-center p-3 bg-primary-secondary rounded-lg">
                    <span>{mt.name}</span>
                    <button onClick={() => deleteMenuType(mt.id)} className="text-primary-tertiary hover:bg-primary-tertiary/10 rounded p-1 transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'tables' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {tables.map(table => (
              <div key={table.id} className="relative bg-primary-main rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center min-h-[120px]">
                <span className="text-2xl font-bold text-primary-headline mb-2">{table.name}</span>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                    <button onClick={() => handleOpenTableDialog(table)} className="text-primary-button hover:bg-primary-button/10 rounded-full p-2 transition-colors"><Edit3 size={20} /></button>
                    <button onClick={() => handleDeleteTable(table.id, table.name)} className="text-primary-tertiary hover:bg-primary-tertiary/10 rounded-full p-2 transition-colors"><Trash2 size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCategoryDialog && <CategoryDialog category={selectedCategory} onSave={handleSaveCategory} onClose={() => setShowCategoryDialog(false)} />}
      {showMenuTypeDialog && <MenuTypeDialog menuType={selectedMenuType} onSave={addMenuType} onClose={() => setShowMenuTypeDialog(false)} />}
      {showTableDialog && <TableDialog table={selectedTable} onSave={(tableData) => selectedTable ? updateTable(selectedTable.id, tableData) : addTable(tableData)} onClose={() => setShowTableDialog(false)} />}
      
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText="Vẫn xóa"
      />
    </div>
  );
};

export default AdminMenus;