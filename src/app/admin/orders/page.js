export const dynamic = "force-dynamic"; // บังคับให้โหลดข้อมูลใหม่เสมอ ไม่จำแคช

import { supabase } from "@/utils/supabase";

// ฟังก์ชันแปลงรูปแบบวันที่ให้ดูง่ายขึ้น
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleString("th-TH", options);
};

// ฟังก์ชัน format เงิน (รองรับ numeric ที่เป็น string จาก Supabase)
const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n.toLocaleString("th-TH") : String(value);
};

// โชว์ UUID ให้สั้นลง
const shortId = (id) => (id ? String(id).slice(0, 8) : "-");

export default async function OrdersPage() {
  // ดึงข้อมูลออเดอร์ทั้งหมด เรียงจากวันที่สั่งล่าสุด (descending)
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,customer_name, phone, address, total_price, slip_url, created_at")
    .order("created_at", { ascending: false });

  if (error)
    return (
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

      {/* 📱 1) การ์ดมือถือ */}
      <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
        {orders?.map((order) => (
          <div
            key={order.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200 flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-yellow-100 pb-3">
              <div>
                <span className="text-[11px] text-gray-500 block mb-0.5 uppercase tracking-wider">
                  ออเดอร์ ID
                </span>
                <span className="font-bold text-yellow-600 text-sm">
                  #{shortId(order.id)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gray-500 block mb-0.5 uppercase tracking-wider">
                  วันที่สั่งซื้อ
                </span>
                <span className="text-xs text-gray-600">{formatDate(order.created_at)}</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              
              </div>

              <div>
                <span className="text-[11px] text-gray-500 block uppercase tracking-wider">
                  ชื่อลูกค้า
                </span>
                <span className="font-medium text-gray-800 text-sm">{order.customer_name ?? "-"}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-gray-500 block uppercase tracking-wider">
                    โทรศัพท์
                  </span>
                  <span className="text-gray-800 text-sm">{order.phone ?? "-"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 block uppercase tracking-wider">
                    ยอดรวม
                  </span>
                  <span className="font-bold text-[#D4AF37] text-lg drop-shadow-sm">
                    ฿{formatMoney(order.total_price)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-gray-500 block uppercase tracking-wider">
                  ที่อยู่
                </span>
                <span className="text-gray-700 text-sm break-words">{order.address ?? "-"}</span>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-gray-500 block uppercase tracking-wider mb-1">
                  สลิป
                </span>
                {order.slip_url ? (
                  <a
                    href={order.slip_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-full bg-[#FFF7D6] text-yellow-900 border border-yellow-200 rounded-lg py-2 text-sm font-medium hover:bg-[#FFEFBC]"
                  >
                    ดูสลิป
                  </a>
                ) : (
                  <div className="text-sm text-gray-400">-</div>
                )}
              </div>
            </div>
          
        ))}
        

        {orders?.length === 0 && (
          <div className="p-10 text-center bg-white rounded-xl border border-yellow-100 text-gray-500 shadow-sm">
            <span className="text-4xl block mb-2 grayscale opacity-50">📭</span>
            <p className="text-sm">ยังไม่มีรายการคำสั่งซื้อเข้ามา</p>
          </div>
        )}
      </div>

      {/* 💻 2) ตารางคอม */}
      <div className="hidden md:block overflow-hidden bg-white rounded-xl shadow-sm border border-yellow-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#FFFDF5] border-b-2 border-yellow-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-yellow-800">Order ID</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">Customer</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">Phone</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">Address</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">Total</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">Slip</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">Created</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-yellow-100">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-[#FFFDF5] transition-colors duration-200">
                <td className="px-6 py-4 font-semibold text-yellow-600">
                  #{shortId(order.id)}
                </td>


                <td className="px-6 py-4 font-medium text-gray-800">{order.customer_name ?? "-"}</td>

                <td className="px-6 py-4 text-gray-700">{order.phone ?? "-"}</td>

                <td className="px-6 py-4 text-gray-700 max-w-[380px] break-words">
                  {order.address ?? "-"}
                </td>

                <td className="px-6 py-4 font-bold text-[#D4AF37] text-base drop-shadow-sm">
                  ฿{formatMoney(order.total_price)}
                </td>

                <td className="px-6 py-4">
                  {order.slip_url ? (
                    <a
                      href={order.slip_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-yellow-200 bg-[#FFF7D6] text-yellow-900 text-xs font-medium hover:bg-[#FFEFBC]"
                    >
                      ดูสลิป
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(order.created_at)}</td>
              </tr>
            ))}

            {orders?.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-16 text-center text-gray-400 bg-gray-50/50">
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