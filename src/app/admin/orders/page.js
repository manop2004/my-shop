export const dynamic = "force-dynamic"; // บังคับให้โหลดข้อมูลใหม่เสมอ ไม่จำแคช

import { supabase } from '@/utils/supabase';

// ฟังก์ชันแปลงรูปแบบวันที่ให้ดูง่ายขึ้น
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('th-TH', options);
};

export default async function OrdersPage() {
  // ดึงข้อมูลออเดอร์ทั้งหมด เรียงจากวันที่สั่งล่าสุด (descending)
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-md shadow-sm">
        เกิดข้อผิดพลาด: {error.message}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
      
      {/* 🌟 ส่วนหัวข้อ */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF37] drop-shadow-sm">
          📋 รายการคำสั่งซื้อ (Orders)
        </h1>
      </div>

      {/* 📱 1. มุมมองแบบ "การ์ด" สำหรับจอมือถือ (ซ่อนในจอคอม) */}
      <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
        {orders?.map((order) => (
          <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200 flex flex-col gap-2">
            
            {/* Header ของการ์ด: ID และ วันที่ */}
            <div className="flex justify-between items-start border-b border-yellow-100 pb-3 mb-2">
              <div>
                <span className="text-[11px] text-gray-500 block mb-0.5 uppercase tracking-wider">ออเดอร์ ID</span>
                <span className="font-bold text-yellow-600 text-sm">#{order.id}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gray-500 block mb-0.5 uppercase tracking-wider">วันที่สั่งซื้อ</span>
                <span className="text-xs text-gray-600">{formatDate(order.created_at)}</span>
              </div>
            </div>
            
            {/* รายละเอียดลูกค้าและสินค้า */}
            <div className="space-y-2">
              <div>
                <span className="text-[11px] text-gray-500 block uppercase tracking-wider">ชื่อลูกค้า</span>
                <span className="font-medium text-gray-800 text-sm">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 block uppercase tracking-wider">สินค้าที่สั่ง</span>
                <span className="text-gray-700 text-sm">{order.product_name}</span>
              </div>
            </div>
            
            {/* Footer ของการ์ด: จำนวน และ ยอดรวม */}
            <div className="flex justify-between items-center mt-2 pt-3 border-t border-yellow-100">
              <div>
                <span className="text-[11px] text-gray-500 block uppercase tracking-wider">จำนวน</span>
                <span className="font-medium text-gray-800 bg-gray-50 px-2 py-0.5 rounded text-sm">{order.quantity} ชิ้น</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gray-500 block uppercase tracking-wider">ยอดรวม</span>
                <span className="font-bold text-[#D4AF37] text-lg drop-shadow-sm">฿{order.total_amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}

        {/* กรณีไม่มีออเดอร์เลย (มือถือ) */}
        {orders?.length === 0 && (
          <div className="p-10 text-center bg-white rounded-xl border border-yellow-100 text-gray-500 shadow-sm">
            <span className="text-4xl block mb-2 grayscale opacity-50">📭</span>
            <p className="text-sm">ยังไม่มีรายการคำสั่งซื้อเข้ามา</p>
          </div>
        )}
      </div>

      {/* 💻 2. มุมมองแบบ "ตาราง" สำหรับหน้าจอคอมพิวเตอร์ (ซ่อนในมือถือ) */}
      <div className="hidden md:block overflow-hidden bg-white rounded-xl shadow-sm border border-yellow-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#FFFDF5] border-b-2 border-yellow-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-yellow-800">ออเดอร์ ID</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">ชื่อลูกค้า</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">สินค้าที่สั่ง</th>
              <th className="px-6 py-4 font-semibold text-yellow-800 text-center">จำนวน</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">ยอดรวม</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">วันที่สั่งซื้อ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-100">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-[#FFFDF5] transition-colors duration-200">
                
                {/* ID ออเดอร์ (เน้นสีทองอ่อน) */}
                <td className="px-6 py-4 font-semibold text-yellow-600">
                  #{order.id}
                </td>
                
                <td className="px-6 py-4 font-medium text-gray-800">
                  {order.customer_name}
                </td>
                
                <td className="px-6 py-4 text-gray-700">
                  {order.product_name}
                </td>
                
                <td className="px-6 py-4 text-center font-medium text-gray-800">
                  {order.quantity}
                </td>
                
                {/* ยอดรวม (เปลี่ยนเป็นสีทองตัวหนา) */}
                <td className="px-6 py-4 font-bold text-[#D4AF37] text-base drop-shadow-sm">
                  ฿{order.total_amount?.toLocaleString()}
                </td>
                
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {formatDate(order.created_at)}
                </td>
                
              </tr>
            ))}
            
            {/* กรณีไม่มีออเดอร์ (คอมพิวเตอร์) */}
            {orders?.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-gray-400 bg-gray-50/50">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-5xl mb-3">📭</span>
                    <p className="text-lg text-gray-500 font-medium">ยังไม่มีรายการคำสั่งซื้อเข้ามา</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}