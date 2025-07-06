// src/App.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import useAuth from './hooks/useAuth';
import useTableManagement from './hooks/useTableManagement';
import useOrderManagement from './hooks/useOrderManagement';
import useMenuData from './hooks/useMenuData';
import useDashboardData from './hooks/useDashboardData';
import usePrinting from './hooks/usePrinting';
import useTheme from './hooks/useTheme';
import useDiscountSettings from './hooks/useDiscountSettings';
import useBankSettings from './hooks/useBankSettings';
import useBankList from './hooks/useBankList';
import useStaffManagement from './hooks/useStaffManagement';
import LoginPage from './components/auth/LoginPage';
import StaffPinLoginPage from './components/auth/StaffPinLoginPage';
import AdminPage from './admin/AdminPage';
import Sidebar from './components/common/Sidebar';
import MobileHeader from './components/common/MobileHeader';
import TableGrid from './components/tables/TableGrid';
import MenuSection from './components/menu/MenuSection';
import Dashboard from './components/dashboard/Dashboard';
import CashierExpenses from './cashier/CashierExpenses';
import OrderPanel from './components/order/OrderPanel';
import ChangeTableDialog from './components/order/ChangeTableDialog';
import PrintReceipt from './components/order/PrintReceipt';
import { X, AlertCircle } from 'lucide-react';
import { initialPrintSettings } from './data/initialPrintSettings';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [activeSection, setActiveSection] = useState('tables');
  const [adminSection, setAdminSection] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [receiptToPrint, setReceiptToPrint] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileOrderPanelOpen, setIsMobileOrderPanelOpen] = useState(false);

  const { theme, setTheme } = useTheme();
  const { quickDiscountOptions, addDiscountOption, updateDiscountOption, deleteDiscountOption } = useDiscountSettings();
  const { bankSettings, setBankSettings } = useBankSettings();
  const { banks, loading: bankListLoading } = useBankList();
  const { staffList, addStaff, updateStaff, deleteStaff } = useStaffManagement();
  const { tables, setTables, addTable, updateTable, deleteTable } = useTableManagement();
  const {
    menuItems, setMenuItems,
    menuTypes, setMenuTypes,
    categories, setCategories,
    addMenuType, deleteMenuType,
    addMenuItem, updateMenuItem, deleteMenuItem,
    updateItemInventory,
    addCategory, updateCategory, deleteCategory,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedMenuType, setSelectedMenuType,
    fetchAllMenuData,
  } = useMenuData();
  const {
    selectedDate, setSelectedDate, paymentFilter, setPaymentFilter,
    dateRange, setDateRange, aggregatedOrdersForDisplay,
    fetchCompletedOrders,
  } = useDashboardData();

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i));
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== notification.id)), 5000);
  }, []);

  const {
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
  }= useOrderManagement(tables, menuItems, addNotification);

  const { getReceiptData } = usePrinting(orders, selectedTable, tables, bankSettings, banks);

  const {
    authLevel, loggedInStaff, loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    handleLogin, handleAdminLogin, handleStaffLogin, handleStaffLogout, handleBusinessLogout,
  } = useAuth(staffList, (isAdminFlag) => {
    setActiveSection('tables');
    if (isAdminFlag) setAdminSection('dashboard');
  }, () => {
    setActiveSection('tables');
    setAdminSection('dashboard');
    setSelectedTable(null);
    setOrders({});
    setTableNotes({});
    setItemNotes({});
  });

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    if (selectedTable && autoOpenMenu) setActiveSection('menu');
  }, [selectedTable, autoOpenMenu]);

  const componentRef = useRef();
  
  const processPaymentAndOrders = useCallback(async (paymentData, printType) => {
    const currentOrderItems = orders[selectedTable] || [];
    if (currentOrderItems.length === 0) return false;

    await saveActiveOrder(selectedTable, orders, tableNotes, itemNotes);

    if (printType === 'full') {
        const orderPayload = {
            table_id: String(selectedTable),
            cashier_id: loggedInStaff?.id,
            items: currentOrderItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                item_notes: itemNotes[`${selectedTable}-${item.id}`] || ''
            })),
            notes: tableNotes[selectedTable] || '',
            payment_method: paymentData.paymentMethod,
            subtotal: paymentData.subtotal,
            discount_type: paymentData.discountType,
            discount_value: paymentData.discountValue,
            discount_amount: paymentData.discountAmount,
            total_amount: paymentData.total,
        };
        try {
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Lỗi khi tạo đơn hàng');
            addNotification({ id: `order-success-${Date.now()}`, type: 'success', message: 'Đã lưu đơn hàng thành công!' });
            await fetchCompletedOrders();
            clearTable();
            return true;
        } catch (error) {
            console.error('Lỗi khi gửi đơn hàng:', error);
            addNotification({ id: `order-error-${Date.now()}`, type: 'error', message: `Lỗi lưu đơn hàng: ${error.message}` });
            return false;
        }
    } else if (printType === 'partial') {
        const partialPayload = {
            tableId: selectedTable,
            cashierId: loggedInStaff?.id,
            paymentData: paymentData,
        };
        try {
            const response = await fetch(`${API_URL}/orders/partial-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(partialPayload)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Lỗi khi thanh toán một phần');
            addNotification({ id: `partial-success-${Date.now()}`, type: 'success', message: 'Thanh toán một phần thành công!' });
            await fetchActiveOrders();
            await fetchCompletedOrders();
            return true;
        } catch (error) {
            console.error('Lỗi khi thanh toán một phần:', error);
            addNotification({ id: `partial-error-${Date.now()}`, type: 'error', message: `Lỗi: ${error.message}` });
            return false;
        }
    }
    return true;
    
  }, [orders, selectedTable, loggedInStaff, itemNotes, tableNotes, saveActiveOrder, clearTable, addNotification, fetchActiveOrders, fetchCompletedOrders]);


  return (
    <>
      {(() => {
          switch (authLevel) {
            case 'admin_auth':
              return (
                <AdminPage
                  adminSection={adminSection}
                  setAdminSection={setAdminSection}
                  handleLogout={handleBusinessLogout}
                  loggedInStaff={loggedInStaff}
                  staffList={staffList}
                  addStaff={addStaff}
                  updateStaff={updateStaff}
                  deleteStaff={deleteStaff}
                  menuItems={menuItems}
                  addMenuItem={addMenuItem}
                  updateMenuItem={updateMenuItem}
                  deleteMenuItem={deleteMenuItem}
                  updateItemInventory={updateItemInventory}
                  menuTypes={menuTypes}
                  setMenuTypes={setMenuTypes}
                  addMenuType={addMenuType}
                  deleteMenuType={deleteMenuType}
                  categories={categories}
                  addCategory={addCategory}
                  updateCategory={updateCategory}
                  deleteCategory={deleteCategory}
                  orders={orders}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  paymentFilter={paymentFilter}
                  setPaymentFilter={setPaymentFilter}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  aggregatedOrdersForDisplay={aggregatedOrdersForDisplay}
                  tables={tables}
                  setTables={setTables}
                  addTable={addTable}
                  updateTable={updateTable}
                  deleteTable={deleteTable}
                  initialSettings={initialPrintSettings}
                  currentTheme={theme}
                  onThemeChange={setTheme}
                  quickDiscountOptions={quickDiscountOptions}
                  addDiscountOption={addDiscountOption}
                  updateDiscountOption={updateDiscountOption}
                  deleteDiscountOption={deleteDiscountOption}
                  bankSettings={bankSettings}
                  setBankSettings={setBankSettings}
                  bankList={banks}
                  bankListLoading={bankListLoading}
                  fetchCompletedOrders={fetchCompletedOrders}
                />
              );
            case 'staff_auth':
              const currentOrderItems = orders[selectedTable] || [];
              const orderItemCount = currentOrderItems.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <div className="h-screen bg-primary-bg flex flex-col md:flex-row md:overflow-hidden">
                  <MobileHeader
                    onToggleSidebar={() => setIsMobileSidebarOpen(true)}
                    onToggleOrderPanel={() => setIsMobileOrderPanelOpen(true)}
                    orderItemCount={orderItemCount}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                  />
                  <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar
                      activeSection={activeSection}
                      setActiveSection={(section) => {
                        setActiveSection(section);
                        setIsMobileSidebarOpen(false);
                      }}
                      handleStaffLogout={handleStaffLogout}
                      handleBusinessLogout={handleBusinessLogout}
                      loggedInStaff={loggedInStaff}
                    />
                  </div>
                  <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                      {activeSection === 'tables' && (
                        <TableGrid
                          tables={tables}
                          selectedTable={selectedTable}
                          setSelectedTable={setSelectedTable}
                          orders={orders}
                          tableFilter={tableFilter}
                          setTableFilter={setTableFilter}
                          recentItems={recentItems}
                          menuItems={menuItems}
                          addToOrder={addToOrder}
                          autoOpenMenu={autoOpenMenu}
                          handleAutoOpenMenuToggle={handleAutoOpenMenuToggle}
                        />
                      )}
                      {activeSection === 'menu' && (
                        <MenuSection
                          selectedTable={selectedTable}
                          searchTerm={searchTerm}
                          setSearchTerm={setSearchTerm}
                          selectedCategory={selectedCategory}
                          setSelectedCategory={setSelectedCategory}
                          selectedMenuType={selectedMenuType}
                          setSelectedMenuType={setSelectedMenuType}
                          menuItems={menuItems}
                          menuTypes={menuTypes}
                          categories={categories}
                          addToOrder={addToOrder}
                          orders={orders}
                        />
                      )}
                      {activeSection === 'dashboard' && (
                        <Dashboard
                          selectedDate={selectedDate}
                          setSelectedDate={setSelectedDate}
                          paymentFilter={paymentFilter}
                          setPaymentFilter={setPaymentFilter}
                          dateRange={dateRange}
                          setDateRange={setDateRange}
                          aggregatedOrdersForDisplay={aggregatedOrdersForDisplay}
                        />
                      )}
                      {activeSection === 'expenses' && (
                        <CashierExpenses loggedInStaff={loggedInStaff} />
                      )}
                    </div>
                    <div className="hidden md:flex">
                      <OrderPanel
                        selectedTable={selectedTable}
                        orders={orders}
                        itemNotes={itemNotes}
                        tableNotes={tableNotes}
                        updateQuantity={updateQuantity}
                        clearTable={clearTable}
                        processPayment={processPaymentAndOrders}
                        openTableNoteDialog={openTableNoteDialog}
                        openItemNoteDialog={openItemNoteDialog}
                        openChangeTableDialog={() => setShowChangeTableDialog(true)}
                        handlePrint={(type) => processPaymentAndOrders({}, type)}
                        quickDiscountOptions={quickDiscountOptions}
                        bankSettings={bankSettings}
                        banks={banks}
                      />
                    </div>
                  </div>
                  {isMobileOrderPanelOpen && <div onClick={() => setIsMobileOrderPanelOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden"></div>}
                  <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transform transition-transform duration-300 ease-in-out md:hidden ${isMobileOrderPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <OrderPanel
                      selectedTable={selectedTable}
                      orders={orders}
                      itemNotes={itemNotes}
                      tableNotes={tableNotes}
                      updateQuantity={updateQuantity}
                      clearTable={clearTable}
                      processPayment={processPaymentAndOrders}
                      openTableNoteDialog={openTableNoteDialog}
                      openItemNoteDialog={openItemNoteDialog}
                      openChangeTableDialog={() => setShowChangeTableDialog(true)}
                      handlePrint={(type) => processPaymentAndOrders({}, type)}
                      quickDiscountOptions={quickDiscountOptions}
                      bankSettings={bankSettings}
                      banks={banks}
                    />
                  </div>
                </div>
              );
            case 'business_auth':
              return (
                <StaffPinLoginPage
                  staffList={staffList}
                  handleStaffLogin={handleStaffLogin}
                  handleBusinessLogout={handleBusinessLogout}
                />
              );
            case 'logged_out':
            default:
              return (
                <LoginPage
                  loginEmail={loginEmail}
                  setLoginEmail={setLoginEmail}
                  loginPassword={loginPassword}
                  setLoginPassword={setLoginPassword}
                  handleLogin={handleLogin}
                  handleAdminLogin={handleAdminLogin}
                />
              );
          }
      })()}
      <div className="absolute top-4 right-4 space-y-3 z-50">
        {notifications.map(n => (
          <div key={n.id} className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-lg shadow-lg flex items-center gap-3">
            <AlertCircle />
            <p>{n.message}</p>
            <button onClick={() => removeNotification(n.id)} className="ml-auto"><X size={18} /></button>
          </div>
        ))}
      </div>
      <div className="print-container-wrapper" style={{ display: receiptToPrint ? 'block' : 'none' }}>
        <PrintReceipt ref={componentRef} receiptData={receiptToPrint} />
      </div>
      {showNoteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-primary-main rounded-2xl p-6 m-4 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-primary-headline mb-4">
              {currentNoteType === 'table' ? 'Ghi chú đơn hàng' : 'Ghi chú món ăn'}
            </h3>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Nhập ghi chú..."
              className="w-full h-24 p-3 rounded-xl bg-primary-secondary text-primary-headline resize-none focus:ring-2 focus:ring-primary-highlight shadow-md"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleNoteSubmit}
                className="flex-1 bg-primary-button text-primary-main py-2 rounded-xl font-bold shadow-md"
              >
                Lưu
              </button>
              <button
                onClick={() => { setShowNoteDialog(false); setNoteInput(''); }}
                className="flex-1 bg-primary-secondary text-primary-button py-2 rounded-xl font-bold shadow-md"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {showChangeTableDialog && selectedTable && (
        <ChangeTableDialog
          tables={tables}
          orders={orders}
          currentTable={selectedTable}
          onClose={() => setShowChangeTableDialog(false)}
          onTableSelect={handleChangeTable}
        />
      )}
    </>
  );
}

export default App;