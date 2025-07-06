// src/components/common/AlertDialog.js
import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'; // ** ĐÃ SỬA: Import thêm icons **

const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "info", // ** MỚI: Thêm prop type với giá trị mặc định **
}) => {
  if (!isOpen) {
    return null;
  }

  // ** MỚI: Định nghĩa icons và màu sắc dựa trên type **
  const iconMap = {
    success: { icon: CheckCircle, bgColor: 'bg-green-100', iconColor: 'text-green-500' },
    error: { icon: XCircle, bgColor: 'bg-red-100', iconColor: 'text-red-500' },
    warning: { icon: AlertTriangle, bgColor: 'bg-orange-100', iconColor: 'text-orange-500' },
    info: { icon: Info, bgColor: 'bg-blue-100', iconColor: 'text-blue-500' },
    confirm: { icon: AlertTriangle, bgColor: 'bg-orange-100', iconColor: 'text-orange-500' }, // Cho xác nhận
  };

  const { icon: IconComponent, bgColor, iconColor } = iconMap[type] || iconMap.info; // Chọn icon/màu sắc, mặc định là info

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 dialog-overlay">
      <div className="bg-primary-main rounded-2xl p-6 m-4 w-full max-w-md shadow-2xl dialog-content">
        <div className="flex items-start gap-4">
          {/* ** ĐÃ SỬA: Sử dụng dynamic icon và màu sắc ** */}
          <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
            {IconComponent && <IconComponent className={iconColor} size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-headline mb-2">
              {title}
            </h3>
            <p className="text-primary-paragraph text-sm">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold bg-primary-secondary text-primary-button hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl font-bold ${type === 'error' || type === 'warning' || type === 'confirm' ? 'bg-primary-tertiary hover:bg-red-700' : 'bg-primary-button hover:bg-primary-highlight'} text-white transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;