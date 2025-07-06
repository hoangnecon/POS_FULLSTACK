// src/admin/AdminPage.js
import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminMenus from './AdminMenus';
import AdminItems from './AdminItems';
import AdminExpenses from './AdminExpenses';
import AdminSettingsPage from './AdminSettingsPage';
import AdminStaffManagement from './AdminStaffManagement';
import AdminStaffPerformance from './AdminStaffPerformance';
import MobileAdminHeader from './MobileAdminHeader';

const AdminPage = ({
  adminSection,
  setAdminSection,
  handleLogout,
  loggedInStaff,
  staffList,
  addStaff,
  updateStaff,
  deleteStaff,
  menuTypes,
  setMenuTypes,
  addMenuType,
  deleteMenuType,
  menuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateItemInventory,
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
  orders,
  selectedDate,
  setSelectedDate,
  paymentFilter,
  setPaymentFilter,
  dateRange,
  setDateRange,
  aggregatedOrdersForDisplay,
  fetchCompletedOrders,
  tables,
  setTables,
  addTable,
  updateTable,
  deleteTable,
  initialSettings,
  currentTheme,
  onThemeChange,
  quickDiscountOptions,
  addDiscountOption,
  updateDiscountOption,
  deleteDiscountOption,
  bankSettings,
  setBankSettings,
  bankList,
  bankListLoading,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const getSectionName = () => {
    switch (adminSection) {
      case 'dashboard': return 'Dashboard';
      case 'staff_performance': return 'Hiệu suất';
      case 'expenses': return 'Thu Chi';
      case 'menus': return 'Menu & Bàn';
      case 'items': return 'Món ăn';
      case 'staff': return 'Nhân viên';
      case 'settings': return 'Cài đặt';
      default: return 'Admin';
    }
  };

  const renderSection = () => {
    switch (adminSection) {
      case 'dashboard':
        return (
          <AdminDashboard
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            paymentFilter={paymentFilter}
            setPaymentFilter={setPaymentFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            aggregatedOrdersForDisplay={aggregatedOrdersForDisplay}
            menuItems={menuItems}
            menuTypes={menuTypes}
          />
        );
      case 'staff_performance':
        return (
          // ** SỬA LỖI Ở ĐÂY: Truyền đúng prop chứa dữ liệu đơn hàng **
          <AdminStaffPerformance
            staffList={staffList}
            aggregatedOrdersForDisplay={aggregatedOrdersForDisplay}
          />
        );
      case 'expenses':
        return (
          <AdminExpenses
            aggregatedOrdersForDisplay={aggregatedOrdersForDisplay}
            loggedInStaff={loggedInStaff}
          />
        );
      case 'menus':
        return (
          <AdminMenus
            menuTypes={menuTypes}
            addMenuType={addMenuType}
            deleteMenuType={deleteMenuType}
            categories={categories}
            addCategory={addCategory}
            updateCategory={updateCategory}
            deleteCategory={deleteCategory}
            tables={tables}
            addTable={addTable}
            updateTable={updateTable}
            deleteTable={deleteTable}
          />
        );
      case 'items':
        return (
          <AdminItems
            menuItems={menuItems}
            categories={categories}
            menuTypes={menuTypes}
            addMenuItem={addMenuItem}
            updateMenuItem={updateMenuItem}
            deleteMenuItem={deleteMenuItem}
            updateItemInventory={updateItemInventory}
          />
        );
      case 'staff':
        return (
          <AdminStaffManagement
            staffList={staffList}
            addStaff={addStaff}
            updateStaff={updateStaff}
            deleteStaff={deleteStaff}
          />
        );
      case 'settings':
        return (
          <AdminSettingsPage
            initialSettings={initialSettings}
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
            quickDiscountOptions={quickDiscountOptions}
            addDiscountOption={addDiscountOption}
            updateDiscountOption={updateDiscountOption}
            deleteDiscountOption={deleteDiscountOption}
            bankSettings={bankSettings}
            setBankSettings={setBankSettings}
            bankList={bankList}
            bankListLoading={bankListLoading}
          />
        );
      default:
        return <AdminDashboard 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            paymentFilter={paymentFilter}
            setPaymentFilter={setPaymentFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            aggregatedOrdersForDisplay={aggregatedOrdersForDisplay}
            menuItems={menuItems}
            menuTypes={menuTypes}
        />;
    }
  };

  return (
    <div className="h-screen bg-primary-bg flex flex-col md:flex-row md:overflow-hidden">
        <MobileAdminHeader onToggleSidebar={() => setIsMobileSidebarOpen(true)} sectionName={getSectionName()} />
        {isMobileSidebarOpen && <div onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden"></div>}
        <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <AdminSidebar
            activeSection={adminSection}
            setAdminSection={(section) => {
                setAdminSection(section);
                setIsMobileSidebarOpen(false);
            }}
            handleLogout={handleLogout}
          />
        </div>
        <main className="flex-1 overflow-y-auto">
            {renderSection()}
        </main>
    </div>
  );
};

export default AdminPage;