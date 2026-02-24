import { supabase } from '@/utils/supabase';

export default async function ReportsPage() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-md shadow-sm">
        เกิดข้อผิดพลาด: {error.message}
      </div>
    </div>
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let todayTotalAmount = 0;
  const todayItems = [];
  const bestSellers = {};
  const monthlySales = {};

  orders?.forEach((order) => {
    const orderDate = new Date(order.created_at);
    const amount = Number(order.total_amount) || 0;
    const qty = Number(order.quantity) || 0;
    const productName = order.product_name || 'ไม่ระบุชื่อสินค้า';

    const compareDate = new Date(order.created_at);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      todayTotalAmount += amount;
      todayItems.push({
        name: productName,
        qty: qty,
        price: amount,
        time: orderDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      });
    }

    const monthYear = orderDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
    monthlySales[monthYear] = (monthlySales[monthYear] || 0) + amount;
    bestSellers[productName] = (bestSellers[productName] || 0) + qty;
  });

  const bestSellersArray = Object.entries(bestSellers).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const monthlySalesArray = Object.entries(monthlySales).reverse();

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
      
      {/* 🌟 หัวข้อสไตล์หน้าสมาชิก */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#D4AF37] drop-shadow-sm">
          📊 รายงานสรุปยอดขาย
        </h1>
        <p className="text-gray-500 mt-2 font-medium">ข้อมูลวิเคราะห์การขายและภาพรวมรายได้</p>
      </div>

      {/* 🌟 Row บน: สองกล่องขนาดเท่ากัน */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* กล่อง 1: ยอดขายรวมวันนี้ */}
        <div className="bg-gradient-to-br from-[#D4AF37] to-yellow-600 rounded-2xl p-8 shadow-lg text-white flex flex-col justify-center min-h-[200px]">
          <h3 className="text-xl font-medium opacity-90 mb-2">ยอดขายวันนี้</h3>
          <div className="text-5xl font-bold">
            ฿{todayTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="mt-4 text-sm bg-white/20 inline-block px-3 py-1 rounded-full w-fit">
            ประจำวันที่ {new Date().toLocaleDateString('th-TH')}
          </p>
        </div>

        {/* กล่อง 2: สินค้าที่ขายได้วันนี้ (ขนาดเท่าอันซ้าย) */}
        <div className="bg-white border border-yellow-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[200px]">
          <div className="px-6 py-4 bg-[#FFFDF5] border-b border-yellow-200">
            <h3 className="font-bold text-yellow-800 flex items-center gap-2">
              🛍️ สินค้าที่ขายได้วันนี้ <span className="text-xs bg-yellow-200 px-2 py-0.5 rounded-full">{todayItems.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[140px] divide-y divide-yellow-50">
            {todayItems.length > 0 ? todayItems.map((item, idx) => (
              <div key={idx} className="px-6 py-3 flex justify-between items-center hover:bg-yellow-50/30">
                <div>
                  <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-[10px] text-gray-400">{item.time} น. • {item.qty} ชิ้น</p>
                </div>
                <span className="text-sm font-bold text-yellow-700">฿{item.price.toLocaleString()}</span>
              </div>
            )) : (
              <div className="flex items-center justify-center h-full text-gray-400 italic text-sm py-8">
                วันนี้ยังไม่มีรายการขาย
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🌟 Row ล่าง: ตารางสรุปรายเดือน */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ตารางยอดขายรายเดือน (กว้าง 2 ส่วน) */}
        <div className="lg:col-span-2 bg-white border border-yellow-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-[#FFFDF5] border-b border-yellow-200">
            <h3 className="font-bold text-yellow-800">📅 สรุปยอดขายรายเดือน</h3>
          </div>
          <table className="min-w-full text-left">
            <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">เดือน / ปี</th>
                <th className="px-6 py-4 text-right">ยอดรายได้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100">
              {monthlySalesArray.map(([month, total]) => (
                <tr key={month} className="hover:bg-[#FFFDF5] transition-colors">
                  <td className="px-6 py-4 text-gray-700 font-medium">{month}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600 text-lg">
                    ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5 อันดับขายดี (กว้าง 1 ส่วน) */}
        <div className="bg-white border border-yellow-200 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-[#D4AF37] border-b border-yellow-100 pb-4 mb-4">🏆 5 อันดับขายดีที่สุด</h3>
          <div className="space-y-4">
            {bestSellersArray.map(([name, qty], index) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 font-medium line-clamp-1">{name}</span>
                </div>
                <span className="text-sm font-bold text-yellow-800">{qty} ชิ้น</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}