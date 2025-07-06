// src/hooks/useDashboardData.js
import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

const getDatesForRange = (startDateStr, rangeType) => {
    const start = new Date(startDateStr + 'T00:00:00');
    if (rangeType === 'day') return { startDate: startDateStr, endDate: startDateStr };
    if (rangeType === 'week') {
        const dayOfWeek = (start.getDay() + 6) % 7;
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() - dayOfWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return { startDate: weekStart.toISOString().split('T')[0], endDate: weekEnd.toISOString().split('T')[0] };
    }
    if (rangeType === 'month') {
        const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
        const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        return { startDate: monthStart.toISOString().split('T')[0], endDate: monthEnd.toISOString().split('T')[0] };
    }
    return { startDate: startDateStr, endDate: startDateStr };
};


const useDashboardData = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('day');
  const [expenses, setExpenses] = useState({});
  const [completedOrders, setCompletedOrders] = useState([]);

  const fetchCompletedOrders = useCallback(async () => {
    const { startDate, endDate } = getDatesForRange(selectedDate, dateRange);
    try {
      const response = await fetch(`${API_URL}/dashboard?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Lỗi tải dữ liệu dashboard");
      setCompletedOrders(data.orders || []);
      console.log(`Dashboard data reloaded for range: ${startDate} to ${endDate}`);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
      setCompletedOrders([]);
    }
  }, [selectedDate, dateRange]);

  useEffect(() => {
    fetchCompletedOrders();
  }, [fetchCompletedOrders]);

  const addExpense = (expense) => {
    const date = new Date().toISOString().split('T')[0];
    setExpenses((prev) => ({
      ...prev,
      [date]: [...(prev[date] || []), { ...expense, id: Date.now() }],
    }));
  };

  return {
    selectedDate, setSelectedDate,
    paymentFilter, setPaymentFilter,
    dateRange, setDateRange,
    aggregatedOrdersForDisplay: completedOrders,
    expenses, addExpense,
    fetchCompletedOrders, // Cung cấp hàm này ra ngoài
  };
};

export default useDashboardData;