"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // รับค่าจาก URL ที่ส่งมาจากหน้า Checkout
  const method = searchParams.get("method") || "promptpay";
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? Number(amountParam) : 0;

  return (
    // เพิ่ม font-sans เพื่อให้ฟอนต์เหมือนหน้าอื่น
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 font-sans text-zinc-800">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border border-gray-100">
        
        {/* หัวข้อใช้ font-serif เพื่อความหรูหรา */}
        <h1 className="text-2xl font-sans text-[#C5A059] mb-2 tracking-wide">
          {method === "promptpay" ? "สแกน QR Code เพื่อชำระเงิน" : "ชำระเงินด้วยบัตรเครดิต"}
        </h1>
        <p className="text-gray-500 mb-6 text-sm">กรุณาชำระเงินภายใน 15 นาที</p>

        {/* ยอดเงินที่ต้องชำระ */}
        <div className="bg-[#FAF8F5] p-4 rounded-md mb-6 border border-gray-50">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">ยอดชำระสุทธิ</p>
          <p className="text-3xl font-semibold text-[#C5A059]">
            ฿{amount.toLocaleString()}
          </p>
        </div>

        {/* แสดงส่วนของการชำระเงินตามที่ลูกค้าเลือกมา */}
        {method === "promptpay" ? (
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-gray-50 mb-4 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md p-2 overflow-hidden">
              {/* เปลี่ยนจากข้อความเป็นแท็ก img */}
              <img src="/qr-code.jpg" alt="QR Code สำหรับชำระเงิน" className="w-full h-full object-contain" />
            </div>
            <p className="text-sm text-gray-600 mb-1 font-medium">บัญชี: บริษัท พัฒนา เจมส์ จำกัด</p>
            <p className="text-sm text-gray-500">ธนาคารกสิกรไทย: 123-4-56789-0</p>
          </div>
        ) : (
          <div className="text-left space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">หมายเลขบัตร</label>
              <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full border border-gray-200 p-2 rounded-sm focus:outline-none focus:border-[#C5A059] transition" />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm text-gray-600 mb-1">วันหมดอายุ</label>
                <input type="text" placeholder="MM/YY" className="w-full border border-gray-200 p-2 rounded-sm focus:outline-none focus:border-[#C5A059] transition" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm text-gray-600 mb-1">CVV</label>
                <input type="text" placeholder="123" className="w-full border border-gray-200 p-2 rounded-sm focus:outline-none focus:border-[#C5A059] transition" />
              </div>
            </div>
          </div>
        )}

        <hr className="my-8 border-gray-100" />

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              router.push(`/success?amount=${amount}`);
            }}
            className="w-full bg-[#C5A059] text-white py-3 rounded-sm font-medium hover:bg-[#B38E46] transition-colors shadow-sm"
          >
            แจ้งชำระเงินเรียบร้อย
          </button>
          
          <button 
            onClick={() => router.back()}
            className="w-full text-gray-400 py-2 hover:text-[#C5A059] transition-colors text-sm font-medium underline underline-offset-4 decoration-gray-200 hover:decoration-[#C5A059]"
          >
            ย้อนกลับไปแก้ไขข้อมูล
          </button>
        </div>

      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#C5A059] bg-[#FAF8F5]">กำลังโหลด...</div>}>
      <PaymentContent />
    </Suspense>
  );
}