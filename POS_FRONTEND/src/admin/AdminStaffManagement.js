// src/admin/AdminStaffManagement.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import useStaffManagement from '../hooks/useStaffManagement';
import AlertDialog from '../components/common/AlertDialog';

const StaffDialog = ({ staff, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: staff?.name || '',
    email: staff?.email || '',
    pin: staff?.pin || '',
    username: staff?.username || '',
  });

  const handleSave = () => {
    if (formData.name && formData.email && formData.username && formData.pin.length === 4 && /^\d+$/.test(formData.pin)) {
      onSave(formData);
      onClose();
    } else {
      alert('Vui lòng điền đầy đủ thông tin. Tên đăng nhập không được trống và Mã PIN phải là 4 chữ số.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-main rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-primary-headline mb-4">
          {staff ? 'Sửa thông tin Nhân viên' : 'Thêm Nhân viên mới'}
        </h3>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Tên hiển thị" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            className="w-full p-3 bg-primary-secondary rounded-xl" 
          />
          <input 
            type="text" 
            placeholder="Tên đăng nhập (không dấu, không cách)" 
            value={formData.username} 
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
            className="w-full p-3 bg-primary-secondary rounded-xl"
            disabled={!!staff}
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            className="w-full p-3 bg-primary-secondary rounded-xl" 
          />
          <input 
            type="text" 
            placeholder="Mã PIN (4 chữ số)" 
            value={formData.pin} 
            onChange={(e) => setFormData({ ...formData, pin: e.target.value })} 
            maxLength="4" 
            className="w-full p-3 bg-primary-secondary rounded-xl" 
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} className="flex-1 bg-primary-button text-primary-main py-2 rounded-xl font-bold">
            {staff ? 'Cập nhật' : 'Thêm'}
          </button>
          <button onClick={onClose} className="flex-1 bg-primary-secondary text-primary-button py-2 rounded-xl font-bold">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminStaffManagement = () => {
  const { staffList, fetchStaff, addStaff, updateStaff, deleteStaff } = useStaffManagement();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: ''});

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleOpenDialog = (staff = null) => {
    setSelectedStaff(staff);
    setShowDialog(true);
  };

  const handleSave = async (data) => {
    const result = selectedStaff
      ? await updateStaff(selectedStaff.id, data)
      : await addStaff(data);
    
    if (result.success) {
        // Có thể thêm thông báo thành công ở đây nếu muốn
    } else {
        alert(`Lỗi: ${result.message}`);
    }
    setShowDialog(false);
  };

  const handleDelete = (staff) => {
    setAlertConfig({
        title: `Xóa nhân viên "${staff.name}"?`,
        message: 'Hành động này không thể hoàn tác.',
        onConfirm: async () => {
            const result = await deleteStaff(staff.id);
            if (!result.success) alert(`Lỗi: ${result.message}`);
            setIsAlertOpen(false);
        }
    });
    setIsAlertOpen(true);
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-primary-bg">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-headline mb-3">Quản lý Nhân viên</h1>
          <p className="text-primary-paragraph text-lg">Thêm, sửa, xóa tài khoản nhân viên.</p>
        </div>
        <button 
          onClick={() => handleOpenDialog()} 
          className="bg-primary-button text-primary-main px-4 py-2 mt-4 md:mt-0 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-highlight transition-colors shadow-lg self-start md:self-center"
        >
          <Plus size={20} /> Thêm Nhân viên
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.map(staff => (
          <div key={staff.id} className="bg-primary-main rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-primary-headline">{staff.name}</h3>
                <p className="text-sm text-primary-paragraph">{staff.email}</p>
                <p className="text-sm text-primary-paragraph mt-1">PIN: {staff.pin}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenDialog(staff)} className="p-2 text-primary-button hover:bg-primary-secondary rounded-lg"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(staff)} className="p-2 text-primary-tertiary hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDialog && (
        <StaffDialog
          staff={selectedStaff}
          onSave={handleSave}
          onClose={() => setShowDialog(false)}
        />
      )}

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

export default AdminStaffManagement;