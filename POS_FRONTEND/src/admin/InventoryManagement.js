// src/admin/InventoryManagement.js
import React from 'react';

const InventoryManagement = ({ menuItems, categories, updateItemInventory }) => {
  
  const handleUpdate = (itemId, field, value) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;
    
    const payload = {
      inventory_enabled: field === 'inventory_enabled' ? value : item.inventory_enabled,
      inventory_count: field === 'inventory_count' ? value : item.inventory_count,
      cost_price: field === 'cost_price' ? value : item.cost_price,
    };
    updateItemInventory(itemId, payload);
  };
  
  return (
    <div className="bg-primary-main rounded-3xl p-4 md:p-6 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="border-b-2 border-primary-stroke">
            <tr>
              <th className="p-4">Món ăn</th>
              <th className="p-4 text-center">Giá vốn</th>
              <th className="p-4 text-center">Bật/Tắt Tồn Kho</th>
              <th className="p-4 text-center">Số lượng trong kho</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
                <tr key={item.id} className="border-b border-primary-secondary hover:bg-primary-secondary transition-colors">
                  <td className="p-4 flex items-center gap-4">
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                    <div>
                      <p className="font-bold text-primary-headline">{item.name}</p>
                      <p className="text-sm text-primary-paragraph">
                        {/* ** SỬA LỖI Ở ĐÂY: Lấy tên danh mục từ ID ** */}
                        {(categories.find(c => c.id === item.category_id) || {}).name || 'Không có'}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                     <input
                        type="number"
                        defaultValue={item.cost_price || 0}
                        onBlur={(e) => handleUpdate(item.id, 'cost_price', parseFloat(e.target.value) || 0)}
                        className="w-28 p-2 text-center bg-white border border-primary-stroke rounded-lg"
                        />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleUpdate(item.id, 'inventory_enabled', !item.inventory_enabled)}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${
                        item.inventory_enabled ? 'bg-primary-button' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                          item.inventory_enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="number"
                      defaultValue={item.inventory_count || 0}
                      onBlur={(e) => handleUpdate(item.id, 'inventory_count', parseInt(e.target.value, 10) || 0)}
                      disabled={!item.inventory_enabled}
                      className="w-24 p-2 text-center bg-primary-secondary border border-transparent rounded-lg focus:ring-2 focus:ring-primary-button focus:border-transparent disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManagement;