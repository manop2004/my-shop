"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from '@/utils/supabase'; // 🌟 นำเข้า Supabase

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // รับค่าจาก URL ที่ส่งมาจากหน้า Checkout
  const method = searchParams.get("method") || "promptpay";
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? Number(amountParam) : 0;

  // 🌟 เพิ่ม State สำหรับจัดการข้อมูลตะกร้าและสถานะการประมวลผล
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🌟 ดึงข้อมูลตะกร้าสินค้าจาก localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart:", error);
      }
    }
  }, []);

  // 🌟 ฟังก์ชันยืนยันการชำระเงิน พร้อมเช็กและตัดสต็อก
  const handlePaymentConfirm = async () => {
    if (cartItems.length === 0) {
      alert("ไม่พบข้อมูลสินค้าให้ตัดสต็อก แต่จะพาไปหน้าถัดไป");
      router.push(`/success?amount=${amount}`);
      return;
    }

    setIsProcessing(true);

    try {
      // 1️⃣ เช็กสต็อกล่าสุดอีกครั้ง ป้องกันคนซื้อตัดหน้าตอนกำลังโอนเงิน
      for (const item of cartItems) {
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("stock, name")
          .eq("id", item.id)
          .single();

        if (fetchError || !product) {
          throw new Error(`ไม่พบข้อมูลสินค้า: ${item.name}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`ขออภัย สินค้า "${item.name}" มีสต็อกไม่พอ (เหลือเพียง ${product.stock} ชิ้น) กรุณาแก้ไขคำสั่งซื้อ`);
        }
      }

      // 2️⃣ ถ้าสต็อกพอทุกชิ้น ให้ทำการ "ตัดสต็อก" ในฐานข้อมูล
      for (const item of cartItems) {
        // ดึงสต็อกล่าสุดเพื่อความชัวร์ที่สุด
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();
          
        const newStock = product.stock - item.quantity;
        
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.id);

        if (updateError) {
          throw new Error(`เกิดข้อผิดพลาดในการตัดสต็อก: ${item.name}`);
        }
      }

      // 3️⃣ ล้างตะกร้าสินค้าออกเมื่อจ่ายเงินและตัดสต็อกสำเร็จ
      localStorage.removeItem('cartItems');

      // 4️⃣ ดำเนินการไปหน้า Success 
      router.push(`/success?amount=${amount}`);
      
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 font-sans text-zinc-800">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border border-gray-100">
        
        <h1 className="text-2xl font-sans text-[#C5A059] mb-2 tracking-wide">
          {method === "promptpay" ? "สแกน QR Code เพื่อชำระเงิน" : "ชำระเงินด้วยบัตรเครดิต"}
        </h1>
        <p className="text-gray-500 mb-6 text-sm">กรุณาชำระเงินภายใน 15 นาที</p>

        {/* ยอดเงินที่ต้องชำระ */}
        <div className="bg-[#FAF8F5] p-4 rounded-md mb-6 border border-gray-50">
          <p className="text-sm text-gray-600 mb-1">ยอดชำระสุทธิ</p>
          <p className="text-3xl font-bold text-[#C5A059]">฿{amount.toLocaleString()}</p>
        </div>

        {method === "promptpay" ? (
          <div className="flex justify-center mb-6">
            <div className="w-48 h-48 bg-gray-100 border border-gray-200 flex items-center justify-center rounded-md p-2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                alt="PromptPay QR Code"
                className="w-full h-full object-cover mix-blend-multiply opacity-80" 
              />
            </div>
          </div>
        ) : (
          <div className="text-left space-y-4 mb-6">
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
          {/* 🌟 ปรับปรุงปุ่มแจ้งชำระเงิน */}
          <button 
            onClick={handlePaymentConfirm}
            disabled={isProcessing}
            className={`w-full flex justify-center items-center py-3 rounded-sm font-medium transition-colors shadow-sm ${
              isProcessing 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-[#C5A059] text-white hover:bg-[#B38E46]'
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังดำเนินการ...
              </>
            ) : (
              'แจ้งชำระเงินเรียบร้อย'
            )}
          </button>
          
          <button 
            onClick={() => router.back()}
            disabled={isProcessing}
            className="w-full text-gray-400 py-2 hover:text-[#C5A059] transition-colors text-sm font-medium underline underline-offset-4 decoration-gray-200 hover:decoration-[#C5A059] disabled:opacity-50"
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