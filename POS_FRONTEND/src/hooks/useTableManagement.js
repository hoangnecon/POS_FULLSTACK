// src/hooks/useTableManagement.js
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ShoppingBag, GalleryVertical } from 'lucide-react';
import { INITIAL_TABLES_DATA } from '../data/mockData';

const API_BASE_URL = 'http://localhost:3001/api';

const useTableManagement = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTables = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/menu-data`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            const fetchedTables = (data.tables || []).map(table => ({
                ...table,
                icon: table.is_special ? ShoppingBag : GalleryVertical
            }));
            setTables(fetchedTables);
            
            return { success: true, message: "Tải dữ liệu bàn thành công." };
        } catch (err) {
            console.error("Error fetching tables:", err);
            setError(err);
            return { success: false, message: `Lỗi khi tải dữ liệu bàn: ${err.message}` };
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    const addTable = useCallback(async (tableData) => {
        setLoading(true);
        setError(null);
        try {
            const tableToSend = { ...tableData };
            if (!tableToSend.id) {
                tableToSend.id = uuidv4();
            }
            tableToSend.is_special = !!tableToSend.is_special; 

            console.log('Object before JSON.stringify in useTableManagement:', tableToSend); // ** LOG ĐỂ DEBUG **

            const response = await fetch(`${API_BASE_URL}/tables`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tableToSend),
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 409 && result.message.includes('ID bàn đã tồn tại')) {
                    setError(new Error(result.message));
                    return { success: false, message: result.message };
                }
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            setTables(prevTables => [...prevTables, { ...tableToSend, id: result.id, icon: tableToSend.is_special ? ShoppingBag : GalleryVertical }]);
            return { success: true, message: "Thêm bàn thành công!" };
        } catch (err) {
            console.error("Error adding table:", err);
            setError(err);
            return { success: false, message: `Lỗi khi thêm bàn: ${err.message}` };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTable = useCallback(async (id, updatedData) => {
        setLoading(true);
        setError(null);
        try {
            updatedData.is_special = !!updatedData.is_special;

            const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            setTables(prevTables => prevTables.map(table =>
                table.id === id ? { ...table, ...updatedData, icon: updatedData.is_special ? ShoppingBag : GalleryVertical } : table
            ));
            return { success: true, message: "Cập nhật bàn thành công!" };
        } catch (err) {
            console.error(`Error updating table ${id}:`, err);
            setError(err);
            return { success: false, message: `Lỗi khi cập nhật bàn: ${err.message}` };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTable = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/tables/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            setTables(prevTables => prevTables.filter(table => table.id !== id));
            return { success: true, message: "Xóa bàn thành công!" };
        } catch (err) {
            console.error(`Error deleting table ${id}:`, err);
            setError(err);
            return { success: false, message: `Lỗi khi xóa bàn: ${err.message}` };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTableStatus = useCallback(async (id, status) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/tables/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            setTables(prevTables => prevTables.map(table =>
                table.id === id ? { ...table, status } : table
            ));
            return { success: true, message: "Cập nhật trạng thái bàn thành công!" };
        } catch (err) {
            console.error(`Error updating table status ${id}:`, err);
            setError(err);
            return { success: false, message: `Lỗi khi cập nhật trạng thái bàn: ${err.message}` };
        } finally {
            setLoading(false);
        }
    }, []);

    const getTablesByStatus = useCallback(async (status) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/tables/status/${status}`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const fetchedTables = (data || []).map(table => ({
                ...table,
                icon: table.is_special ? ShoppingBag : GalleryVertical
            }));
            return { success: true, data: fetchedTables, message: `Tải bàn theo trạng thái "${status}" thành công.` };
        } catch (err) {
            console.error(`Error fetching tables by status ${status}:`, err);
            setError(err);
            return { success: false, message: `Lỗi khi tải bàn theo trạng thái: ${err.message}` };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        tables,
        loading,
        error,
        fetchTables,
        addTable,
        updateTable,
        deleteTable,
        updateTableStatus,
        getTablesByStatus
    };
};

export default useTableManagement;