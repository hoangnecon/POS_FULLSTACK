// src/admin/AdminStaffPerformance.js
import React, { useMemo } from 'react';

const AdminStaffPerformance = ({
  staffList,
  aggregatedOrdersForDisplay = [],
}) => {

  const staffPerformance = useMemo(() => {
    if (!staffList || staffList.length === 0) {
        return [];
    }

    return staffList.map(staff => {
      let totalRevenue = 0;
      let orderCount = 0;
      
      (aggregatedOrdersForDisplay || []).forEach(order => {
        // So sánh bằng ID để đảm bảo tính chính xác
        if (order.cashier_id && Number(order.cashier_id) === Number(staff.id)) {
          totalRevenue += order.total_amount;
          orderCount++;
        }
      });

      return {
        id: staff.id,
        name: staff.name,
        revenue: totalRevenue,
        orders: orderCount,
      };
    }).sort((a, b) => b.revenue - a.revenue);

  }, [staffList, aggregatedOrdersForDisplay]);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-primary-bg">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-headline mb-3">
                Hiệu suất Nhân viên
            </h1>
            <p className="text-primary-paragraph text-lg">
                Đánh giá doanh thu và số lượng đơn hàng theo từng nhân viên.
            </p>
        </div>
        
        <div className="bg-primary-main rounded-3xl p-4 md:p-6 shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead>
                        <tr className="border-b">
                            <th className="p-4">#</th>
                            <th className="p-4">Tên nhân viên</th>
                            <th className="p-4">Số đơn hàng</th>
                            <th className="p-4 text-right">Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffPerformance.map((staff, index) => (
                            <tr key={staff.id} className="border-b">
                                <td className="p-4 font-bold">{index + 1}</td>
                                <td className="p-4 font-medium text-primary-headline">{staff.name}</td>
                                <td className="p-4">{staff.orders}</td>
                                <td className="p-4 text-right font-bold text-primary-button">{staff.revenue.toLocaleString('vi-VN')}đ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AdminStaffPerformance;