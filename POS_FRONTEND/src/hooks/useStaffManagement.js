// src/hooks/useStaffManagement.js
import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

const useStaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  
  const fetchStaff = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/staff`);
      if (!response.ok) throw new Error('Lỗi khi tải danh sách nhân viên.');
      const data = await response.json();
      setStaffList(data);
    } catch (error) {
      console.error(error.message);
    }
  }, []);

  const addStaff = async (staffData) => {
    try {
      const response = await fetch(`${API_URL}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await fetchStaff();
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // ** SỬA LỖI Ở ĐÂY: Đảm bảo gửi đủ dữ liệu khi cập nhật **
  const updateStaff = async (id, updatedData) => {
    try {
        const response = await fetch(`${API_URL}/staff/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData), // Gửi cả tên, email và pin
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        await fetchStaff();
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
  };

  const deleteStaff = async (id) => {
     try {
        const response = await fetch(`${API_URL}/staff/${id}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        await fetchStaff();
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
  };

  return { staffList, fetchStaff, addStaff, updateStaff, deleteStaff };
};

export default useStaffManagement;