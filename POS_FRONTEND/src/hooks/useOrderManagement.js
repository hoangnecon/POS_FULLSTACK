// src/hooks/useOrderManagement.js
import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

const useOrderManagement = (tables, menuItems, addNotification) => {
    const [selectedTable, setSelectedTable] = useState(null);
    const [orders, setOrders] = useState({});
    const [recentItems, setRecentItems] = useState(() => {
        const saved = localStorage.getItem('recentItems');
        return saved ? JSON.parse(saved) : [1, 3, 4, 7, 8];
    });
    const [tableNotes, setTableNotes] = useState({});
    const [itemNotes, setItemNotes] = useState({});
    const [showNoteDialog, setShowNoteDialog] = useState(false);
    const [currentNoteType, setCurrentNoteType] = useState('table');
    const [currentNoteTarget, setCurrentNoteTarget] = useState(null);
    const [noteInput, setNoteInput] = useState('');
    const [showChangeTableDialog, setShowChangeTableDialog] = useState(false);
    const [autoOpenMenu, setAutoOpenMenu] = useState(false);
    const [tableFilter, setTableFilter] = useState('all');
    
    const saveActiveOrder = useCallback(async (tableId, currentOrdersState, currentTableNotesState, currentItemNotesState) => {
        if (!tableId) return;
        
        const payload = {
            items: (currentOrdersState[tableId] || []).map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                item_notes: currentItemNotesState[`${tableId}-${item.id}`] || ''
            })),
            notes: currentTableNotesState[tableId] || ''
        };

        try {
            const response = await fetch(`${API_URL}/orders/active/${String(tableId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if(!response.ok) throw new Error("Server error on saving order");
        } catch (error) {
            console.error(`Lỗi khi lưu đơn hàng cho bàn ${tableId}:`, error);
            addNotification({ id: `save-error-${tableId}`, type: 'error', message: 'Không thể lưu trạng thái đơn hàng.' });
        }
    }, [addNotification]);
    
    const debouncedSave = useCallback(debounce(saveActiveOrder, 1000), [saveActiveOrder]);

    const fetchActiveOrders = useCallback(async () => {
        try {
            if (!menuItems || menuItems.length === 0) return;
            const response = await fetch(`${API_URL}/orders/active`);
            const activeOrders = await response.json();
            
            const newOrdersState = {};
            const newTableNotesState = {};
            const newItemNotesState = {};

            activeOrders.forEach(order => {
                newOrdersState[order.table_id] = order.items.map(item => {
                    if (item.item_notes) {
                        newItemNotesState[`${order.table_id}-${item.menu_item_id}`] = item.item_notes;
                    }
                    const menuItemDetails = menuItems.find(mi => mi.id === item.menu_item_id) || {};
                    return {
                        ...menuItemDetails,
                        id: item.menu_item_id,
                        name: item.item_name,
                        price: item.price_at_order,
                        quantity: item.quantity,
                    };
                });
                if(order.notes) {
                   newTableNotesState[order.table_id] = order.notes;
                }
            });
            
            setOrders(newOrdersState);
            setTableNotes(newTableNotesState);
            setItemNotes(newItemNotesState);
            console.log("Đã tải và chuẩn hóa các đơn hàng đang hoạt động.");

        } catch (error) {
            console.error("Lỗi khi tải đơn hàng đang hoạt động:", error);
        }
    }, [menuItems]);

    useEffect(() => {
        fetchActiveOrders();
    }, [fetchActiveOrders]);

    useEffect(() => {
        localStorage.setItem('recentItems', JSON.stringify(recentItems));
    }, [recentItems]);


    const getRemainingStock = (itemId, currentOrders) => {
        const menuItem = menuItems.find(mi => mi.id === itemId);
        if (!menuItem || !menuItem.inventory_enabled) return Infinity;
        const inOrderCount = Object.values(currentOrders).flat().reduce((acc, orderItem) => (orderItem.id === itemId ? acc + orderItem.quantity : acc), 0);
        return menuItem.inventory_count - inOrderCount;
    };

    const addToOrder = (item) => {
        if (!selectedTable) return;
        setOrders(currentOrders => {
            const remainingStock = getRemainingStock(item.id, currentOrders);
            if (remainingStock <= 0) {
                alert(`Món "${item.name}" đã hết hàng.`);
                return currentOrders;
            }
            const tableOrders = currentOrders[selectedTable] || [];
            const existingItem = tableOrders.find((orderItem) => orderItem.id === item.id);
            let newTableOrders;
            if (existingItem) {
                newTableOrders = tableOrders.map((orderItem) =>
                    orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem
                );
            } else {
                newTableOrders = [...tableOrders, { ...item, quantity: 1 }];
            }
            const newOrdersState = { ...currentOrders, [selectedTable]: newTableOrders };
            debouncedSave(selectedTable, newOrdersState, tableNotes, itemNotes);
            return newOrdersState;
        });
        setRecentItems((prev) => {
            const filtered = prev.filter((id) => id !== item.id);
            return [item.id, ...filtered].slice(0, 8);
        });
    };
    
    const updateQuantity = (itemId, newQuantity) => {
        if (!selectedTable) return;
        setOrders(currentOrders => {
            let newTableOrders;
            if (newQuantity <= 0) {
                newTableOrders = (currentOrders[selectedTable] || []).filter((item) => item.id !== itemId);
            } else {
                newTableOrders = (currentOrders[selectedTable] || []).map((item) => item.id === itemId ? { ...item, quantity: newQuantity } : item);
            }
            const newOrdersState = { ...currentOrders, [selectedTable]: newTableOrders };
            debouncedSave(selectedTable, newOrdersState, tableNotes, itemNotes);
            return newOrdersState;
        });
    };

    const clearTable = () => {
        if (!selectedTable) return;
        const newOrdersState = { ...orders, [selectedTable]: [] };
        const newTableNotesState = { ...tableNotes };
        delete newTableNotesState[selectedTable];
        setOrders(newOrdersState);
        setTableNotes(newTableNotesState);
        saveActiveOrder(selectedTable, newOrdersState, newTableNotesState, itemNotes);
    };

    const handleNoteSubmit = () => {
        let newTableNotesState = tableNotes;
        let newItemNotesState = itemNotes;
        if (currentNoteType === 'table') {
            newTableNotesState = { ...tableNotes, [selectedTable]: noteInput };
            setTableNotes(newTableNotesState);
        } else if (currentNoteType === 'item') {
            const itemKey = `${selectedTable}-${currentNoteTarget}`;
            newItemNotesState = { ...itemNotes, [itemKey]: noteInput };
            setItemNotes(newItemNotesState);
        }
        debouncedSave(selectedTable, orders, newTableNotesState, newItemNotesState);
        setNoteInput('');
        setShowNoteDialog(false);
    };
    
    const openTableNoteDialog = () => { setCurrentNoteType('table'); setNoteInput(tableNotes[selectedTable] || ''); setShowNoteDialog(true); };
    const openItemNoteDialog = (itemId) => { setCurrentNoteType('item'); setCurrentNoteTarget(itemId); const itemKey = `${selectedTable}-${itemId}`; setNoteInput(itemNotes[itemKey] || ''); setShowNoteDialog(true); };

    const handleChangeTable = async (targetTableId) => {
        if (!selectedTable) return;
        await saveActiveOrder(selectedTable, orders, tableNotes, itemNotes);
        try {
            const response = await fetch(`${API_URL}/orders/merge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceTableId: selectedTable,
                    targetTableId: targetTableId,
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Lỗi khi gộp bàn.');
            await fetchActiveOrders();
            addNotification({ id: `merge-success-${Date.now()}`, type: 'success', message: `Đã gộp bàn ${selectedTable} vào bàn ${targetTableId} thành công.` });
            setShowChangeTableDialog(false);
            setSelectedTable(targetTableId);
        } catch (error) {
            console.error('Lỗi khi gộp bàn:', error);
            addNotification({ id: `merge-error-${Date.now()}`, type: 'error', message: error.message });
        }
    };

    const handleAutoOpenMenuToggle = () => setAutoOpenMenu((prev) => !prev);

    return {
        selectedTable, setSelectedTable,
        orders, setOrders,
        recentItems, setRecentItems,
        tableNotes, setTableNotes,
        itemNotes, setItemNotes,
        tableFilter, setTableFilter,
        showNoteDialog, setShowNoteDialog,
        currentNoteType, setCurrentNoteType,
        currentNoteTarget, setCurrentNoteTarget,
        noteInput, setNoteInput,
        showChangeTableDialog, setShowChangeTableDialog,
        autoOpenMenu, handleAutoOpenMenuToggle,
        addToOrder,
        updateQuantity,
        clearTable,
        handleNoteSubmit,
        openTableNoteDialog,
        openItemNoteDialog,
        handleChangeTable,
        fetchActiveOrders,
        saveActiveOrder,
    };
};

export default useOrderManagement;