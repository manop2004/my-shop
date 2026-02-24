"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  
  // แก้ไขส่วนนี้เพื่อรีเซ็ตค่าตะกร้า
  useEffect(() => {
    sessionStorage.removeItem("checkoutFormData");
    
    // ล้างข้อมูลตะกร้าใน LocalStorage และ SessionStorage
    localStorage.removeItem("cart"); 
    localStorage.removeItem("cartItems");
    sessionStorage.removeItem("cart");
  }, []);
  
  // รับค่าต่างๆ ที่ส่งมาจากหน้าสแกน QR Code
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? Number(amountParam).toLocaleString() : "0";
  
  const customerName = searchParams.get("name") || "คุณลูกค้า (จำลอง)";
  const productName = searchParams.get("product") || "แหวนเพชร Classic (จำลอง)";
  const quantity = searchParams.get("qty") || "1";

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9F9F9]">
      <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 max-w-md w-full text-center mx-4">
        
        <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-sans text-[#C5A059] mb-2">ทำรายการสำเร็จ</h1>
        <p className="text-gray-500 mb-6 text-sm">
          ระบบได้รับแจ้งการชำระเงินของคุณเรียบร้อยแล้ว<br />
          และกำลังดำเนินการตรวจสอบ
        </p>

        <div className="bg-[#FAF8F5] p-5 rounded-md mb-8 text-sm text-left shadow-sm">
          <div className="flex justify-between mb-3">
            <span className="text-gray-500">หมายเลขคำสั่งซื้อ:</span>
            <span className="font-medium text-gray-800">#PTN-889012</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-500">ชื่อลูกค้า:</span>
            <span className="font-medium text-gray-800">{customerName}</span>
          </div>

          <div className="border-t border-gray-200 py-3 mb-1">
            <span className="text-gray-500 block mb-2 font-medium">รายการสินค้า:</span>
            <div className="flex justify-between items-start bg-white p-3 rounded border border-gray-100">
              <span className="font-medium text-gray-700 w-3/4">{productName}</span>
              <span className="text-gray-500 whitespace-nowrap">x {quantity}</span>
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-4 mb-3">
            <span className="text-gray-500 mt-1">ยอดชำระสุทธิ:</span>
            <span className="font-semibold text-[#C5A059] text-xl">฿{amount}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-3">
            <span className="text-gray-500">วันที่ทำรายการ:</span>
            <span className="font-medium text-gray-800">
              {new Date().toLocaleDateString('th-TH', { 
                year: 'numeric', month: 'short', day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <Link 
          href="/" 
          className="block w-full bg-[#C5A059] hover:bg-[#B38E46] text-white py-3 rounded-md transition duration-300 font-medium mb-4 shadow-sm text-center"
        >
          เสร็จสิ้น
        </Link>
        
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#C5A059]">กำลังโหลดข้อมูล...</div>}>
      <SuccessContent />
    </Suspense>
  );
}