// src/admin/AdminItems.js
import React, { useState, useMemo } from 'react';
import { Plus, Star, Search, Edit3, Trash2 } from 'lucide-react';
import InventoryManagement from './InventoryManagement';
import AlertDialog from '../components/common/AlertDialog';

const ItemDialog = ({ mode, item, onSave, onClose, menuTypes, categories }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category_id: item?.category_id || categories.find(c => c.id !== 'all' && c.id !== 'popular')?.id || '',
    price: item?.price || '',
    image_url: item?.image_url || '',
    is_popular: item?.is_popular === 1 ? true : false,
    menu_type_id: item?.menu_type_id || menuTypes[0]?.id || 'regular',
  });

  const handleSave = () => {
    if (formData.name && formData.category_id && formData.price > 0) {
      onSave({ ...formData, price: parseFloat(formData.price) });
      onClose();
    } else {
      alert('Vui lòng điền đầy đủ thông tin tên, danh mục và giá.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-main rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <h3 className="text-lg font-bold text-primary-headline mb-4">{mode === 'add' ? 'Thêm Món Mới' : 'Sửa Món Ăn'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-primary-paragraph mb-2">Tên món</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-primary-secondary rounded-xl" /></div>
            <div><label className="block text-sm font-medium text-primary-paragraph mb-2">Danh mục</label><select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full p-3 bg-primary-secondary rounded-xl">{categories.filter(cat => cat.id !== 'all' && cat.id !== 'popular').map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-primary-paragraph mb-2">Giá (VND)</label><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full p-3 bg-primary-secondary rounded-xl"/></div>
          </div>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-primary-paragraph mb-2">URL Hình ảnh</label><input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="w-full p-3 bg-primary-secondary rounded-xl"/></div>
            <div><label className="block text-sm font-medium text-primary-paragraph mb-2">Loại menu</label><select value={formData.menu_type_id} onChange={(e) => setFormData({ ...formData, menu_type_id: e.target.value })} className="w-full p-3 bg-primary-secondary rounded-xl">{menuTypes.map(menu => (<option key={menu.id} value={menu.id}>{menu.name}</option>))}</select></div>
            <div className="flex items-center gap-3 pt-2"><input type="checkbox" id="isPopular" checked={formData.is_popular} onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })} className="w-5 h-5 text-primary-button rounded" /><label htmlFor="isPopular" className="text-sm font-medium text-primary-paragraph">Món phổ biến</label></div>
            {formData.image_url && <div><label className="block text-sm font-medium text-primary-paragraph mb-2">Xem trước</label><img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded-xl"/></div>}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} className="flex-1 bg-primary-button text-primary-main py-3 rounded-xl font-bold hover:bg-primary-highlight transition-colors shadow-md">{mode === 'add' ? 'Thêm' : 'Cập nhật'}</button>
          <button onClick={onClose} className="flex-1 bg-primary-secondary text-primary-button py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors shadow-md">Hủy</button>
        </div>
      </div>
    </div>
  );
};

const AdminItems = ({
  menuItems,
  menuTypes,
  categories,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateItemInventory,
}) => {
  const [activeTab, setActiveTab] = useState('items');
  const [itemFilter, setItemFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inventorySort, setInventorySort] = useState('name_asc');
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: () => {}, confirmText: 'Đồng ý', cancelText: null });
  
  const handleShowAlert = (title, message) => { setAlertConfig({ title, message, onConfirm: () => setIsAlertOpen(false), cancelText: null, confirmText: 'Đã hiểu' }); setIsAlertOpen(true); };
  const handleShowConfirm = (title, message, onConfirmCallback) => { setAlertConfig({ title, message, onConfirm: () => { onConfirmCallback(); setIsAlertOpen(false); }, cancelText: "Hủy", confirmText: 'Vẫn xóa' }); setIsAlertOpen(true); };

  const handleSaveItem = async (data) => {
    const result = selectedMenuItem ? await updateMenuItem(selectedMenuItem.id, data) : await addMenuItem(data);
    if (result.success) {
        handleShowAlert('Thành công', result.message);
    } else {
        handleShowAlert('Lỗi', result.message);
    }
    setShowItemDialog(false);
    setSelectedMenuItem(null);
  };
  
  const handleDeleteItem = (id, name) => {
    handleShowConfirm(
        `Xóa món "${name}"?`,
        'Hành động này sẽ đánh dấu món ăn là đã xóa và không thể hoàn tác.',
        async () => {
            const result = await deleteMenuItem(id);
            if (result.success) {
                handleShowAlert('Thành công', result.message);
            } else {
                handleShowAlert('Lỗi', result.message);
            }
        }
    );
  };

  const processedItems = useMemo(() => {
    return menuItems
      .filter(item => {
        const matchesFilter = itemFilter === 'all' || item.menu_type_id === itemFilter;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => {
        if (activeTab === 'inventory' && inventorySort === 'remaining_asc') {
          const aStock = a.inventory_enabled ? a.inventory_count : Infinity;
          const bStock = b.inventory_enabled ? b.inventory_count : Infinity;
          return aStock - bStock;
        }
        return a.name.localeCompare(b.name);
      });
  }, [menuItems, itemFilter, searchTerm, activeTab, inventorySort]);
  
  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-primary-bg">
      <div className="flex-shrink-0">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-headline mb-3">Quản lý Món ăn</h1>
            <p className="text-primary-paragraph text-lg">
              Thêm, sửa, xóa các món ăn và quản lý tồn kho.
            </p>
          </div>
          <div className="mt-4 md:mt-0 self-start md:self-center">
            {activeTab === 'items' && <button onClick={() => { setSelectedMenuItem(null); setShowItemDialog(true); }} className="bg-primary-button text-primary-main px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-highlight transition-colors shadow-lg"><Plus size={20} /> Thêm Món Mới</button>}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6"><div className="flex-1 relative"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-paragraph" size={20} /><input type="text" placeholder="Tìm kiếm món ăn theo tên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3 bg-primary-main rounded-2xl focus:ring-2 focus:ring-primary-highlight transition-all duration-300 shadow-md"/></div>{activeTab === 'inventory' && (<select value={inventorySort} onChange={(e) => setInventorySort(e.target.value)} className="px-4 py-3 bg-primary-main rounded-2xl text-primary-headline focus:ring-2 focus:ring-primary-highlight shadow-md"><option value="name_asc">Sắp xếp: Tên A-Z</option><option value="remaining_asc">Sắp xếp: Số lượng còn lại</option></select>)}</div>
        <div className="flex gap-3 mb-8"><button onClick={() => setActiveTab('items')} className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md ${activeTab === 'items' ? 'bg-primary-button text-primary-main shadow-lg' : 'bg-primary-main text-primary-headline hover:bg-primary-highlight'}`}>Danh sách món</button><button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md ${activeTab === 'inventory' ? 'bg-primary-button text-primary-main shadow-lg' : 'bg-primary-main text-primary-headline hover:bg-primary-highlight'}`}>Hàng tồn kho</button></div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-0 md:pr-4">
        {activeTab === 'items' && (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={() => setItemFilter('all')} className={`px-4 py-2 rounded-xl font-medium transition-colors shadow-md ${itemFilter === 'all' ? 'bg-primary-button text-primary-main' : 'bg-primary-main'}`}>Tất cả ({menuItems.length})</button>
              {menuTypes.map((menu) => (<button key={menu.id} onClick={() => setItemFilter(menu.id)} className={`px-4 py-2 rounded-xl font-medium transition-colors shadow-md ${itemFilter === menu.id ? 'bg-primary-button text-primary-main' : 'bg-primary-main'}`}>{menu.name} ({menuItems.filter((item) => item.menu_type_id === menu.id).length})</button>))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {processedItems.map((item) => (<div key={item.id} className="bg-primary-main rounded-3xl p-4 shadow-xl"><div className="relative mb-4"><img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded-2xl" />{item.is_popular === 1 && (<div className="absolute top-2 right-2 bg-yellow-400 text-white p-1 rounded-full"><Star size={12} className="fill-current" /></div>)}</div><h3 className="font-bold text-primary-headline mb-1">{item.name}</h3><p className="text-sm text-primary-paragraph mb-2">{(categories.find(c => c.id === item.category_id) || {}).name}</p><p className="text-lg font-bold text-primary-headline mb-3">{item.price.toLocaleString('vi-VN')}đ</p><div className="flex gap-2"><button onClick={() => { setSelectedMenuItem(item); setShowItemDialog(true); }} className="flex-1 bg-primary-button text-primary-main py-2 rounded-lg font-medium hover:bg-primary-highlight transition-colors shadow-md"><Edit3 size={16} className="inline-block mr-1"/>Sửa</button><button onClick={() => handleDeleteItem(item.id, item.name)} className="flex-1 bg-primary-tertiary text-white py-2 rounded-lg font-medium hover:bg-red-600 shadow-md"><Trash2 size={16} className="inline-block mr-1"/>Xóa</button></div></div>))}
            </div>
          </>
        )}
        {activeTab === 'inventory' && <InventoryManagement menuItems={processedItems} categories={categories} updateItemInventory={updateItemInventory} />}
      </div>

      {showItemDialog && (<ItemDialog mode={selectedMenuItem ? 'edit' : 'add'} item={selectedMenuItem} onSave={handleSaveItem} onClose={() => setShowItemDialog(false)} menuTypes={menuTypes} categories={categories}/>)}
      <AlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} onConfirm={alertConfig.onConfirm} title={alertConfig.title} message={alertConfig.message} confirmText={alertConfig.confirmText} cancelText={alertConfig.cancelText}/>
    </div>
  );
};

export default AdminItems;