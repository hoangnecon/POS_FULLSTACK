// src/cashier/CashierExpenses.js
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const CashierExpenses = ({ loggedInStaff }) => {
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchTodaysExpenses = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await fetch(`${API_URL}/expenses?startDate=${today}&endDate=${today}`);
      if (!response.ok) {
        throw new Error('Không thể tải danh sách chi tiêu.');
      }
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Lỗi tải chi tiêu:", error);
    }
  }, []);

  useEffect(() => {
    fetchTodaysExpenses();
  }, [fetchTodaysExpenses]);

  const handleAddExpense = async () => {
    if (newExpense.name && newExpense.amount > 0) {
      const payload = {
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        expense_date: newExpense.date,
        recorded_by_user_id: loggedInStaff?.id,
      };
      try {
        const response = await fetch(`${API_URL}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Lỗi khi thêm chi tiêu');
        
        await fetchTodaysExpenses();

        setShowAddExpenseDialog(false);
        setNewExpense({
          name: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
        });
      } catch (error) {
        alert(`Lỗi: ${error.message}`);
      }
    } else {
      alert('Vui lòng nhập tên và số tiền chi tiêu.');
    }
  };

  const todayExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [expenses]);
  
  const totalTodayExpenses = useMemo(() => {
      return todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [todayExpenses]);

  return (
    <div className="p-8 h-full flex flex-col bg-primary-bg">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary-headline mb-3">Thêm Chi Tiêu</h1>
          <p className="text-primary-paragraph text-lg">Ghi lại các khoản chi trong ngày.</p>
        </div>
        <button
          onClick={() => setShowAddExpenseDialog(true)}
          className="bg-primary-button text-primary-main px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-highlight transition-colors shadow-lg"
        >
          <Plus size={20} /> Thêm Mới
        </button>
      </div>

      <div className="bg-primary-main rounded-3xl p-6 shadow-xl flex-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-primary-headline">Các khoản chi hôm nay</h3>
            <p className="text-lg font-bold text-red-500">Tổng chi: {totalTodayExpenses.toLocaleString('vi-VN')}đ</p>
        </div>
        <div className="space-y-3">
          {todayExpenses.length > 0 ? (
            todayExpenses.map(expense => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-primary-secondary rounded-xl">
                <div>
                    <span className="font-medium">{expense.name}</span>
                    <span className="text-xs text-primary-paragraph ml-2">({expense.user_name || 'N/A'})</span>
                </div>
                <span className="font-bold text-red-500">{expense.amount.toLocaleString('vi-VN')}đ</span>
              </div>
            ))
          ) : (
            <p className="text-primary-paragraph text-center py-8">Chưa có khoản chi nào hôm nay.</p>
          )}
        </div>
      </div>

      {showAddExpenseDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-main rounded-2xl p-6 m-4 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-primary-headline mb-4">Thêm Chi Tiêu Mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-paragraph mb-2">Tên khoản chi</label>
                <input
                  type="text"
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                  className="w-full p-3 bg-primary-secondary rounded-xl"
                  placeholder="ví dụ: Mua rau củ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-paragraph mb-2">Số tiền</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full p-3 bg-primary-secondary rounded-xl"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-paragraph mb-2">Ngày</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full p-3 bg-primary-secondary rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddExpense} className="flex-1 bg-primary-button text-primary-main py-2 rounded-xl font-bold">Thêm</button>
              <button onClick={() => setShowAddExpenseDialog(false)} className="flex-1 bg-primary-secondary text-primary-button py-2 rounded-xl font-bold">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierExpenses;