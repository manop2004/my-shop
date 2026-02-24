"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from '@/utils/supabase';

function CheckoutContent() {
  const router = useRouter();
  
  // เปลี่ยนจากดึง product ตัวเดียว เป็นดึงตะกร้าสินค้า
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // โหลดข้อมูลเก่ามาแสดง (ถ้ามี) แล้วเคลียร์ทิ้งทันที
  useEffect(() => {
    const savedFormData = sessionStorage.getItem("checkoutFormData");
    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
        // ลบทิ้งทันที เพื่อที่เวลากดกลับหน้าหลัก ข้อมูลจะได้ไม่ตามไปด้วย
        sessionStorage.removeItem("checkoutFormData");
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, []);

  // โหลดข้อมูลสินค้าจากตะกร้า (localStorage)
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Error parsing cart data:", error);
      }
    }
    setIsLoading(false);
  }, []);

  // ปรับปรุงฟังก์ชันให้กรองเฉพาะตัวเลขสำหรับเบอร์โทรศัพท์
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // แทนที่ตัวอักษรที่ไม่ใช่ตัวเลขด้วยค่าว่าง (รับเฉพาะ 0-9)
      const numericValue = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // เซฟข้อมูลเฉพาะตอนกำลังจะข้ามไปหน้า Payment
    sessionStorage.setItem("checkoutFormData", JSON.stringify(formData));
    
    // รวม ID สินค้าทั้งหมดสำหรับอ้างอิงออเดอร์ (กรณีมีหลายชิ้น)
    const orderIds = cartItems.map(item => item.id).join(',');
    
    router.push(`/payment?method=promptpay&amount=${totalPrice}&order=${orderIds}`); 
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[#C5A059] bg-[#FAF8F5]">กำลังโหลดข้อมูลคำสั่งซื้อ...</div>;
  }

  // ถ้าไม่มีสินค้าในตะกร้า
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5]">
        <h2 className="text-xl mb-4 text-gray-800">ไม่พบข้อมูลสินค้าในตะกร้า</h2>
        <button onClick={() => router.push('/')} className="text-[#C5A059] underline">กลับไปเลือกซื้อสินค้า</button>
      </div>
    );
  }

  // คำนวณราคาสินค้ารวมทั้งหมดในตะกร้า
  const totalProductPrice = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = 0; 
  const totalPrice = totalProductPrice + shippingFee;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-zinc-800 font-sans py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* หัวข้อหน้า */}
        <div className="mb-8 text-center sm:text-left">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-3 text-gray-400 hover:text-[#C5A059] transition-all duration-300"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 group-hover:border-[#C5A059] group-hover:bg-[#C5A059]/5 transition-all">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            
            <span className="text-sm font-medium relative py-1">
              กลับไปหน้าก่อนหน้า
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C5A059] transition-all duration-300 group-hover:w-full"></span>
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* --- ฝั่งซ้าย: สรุปคำสั่งซื้อ --- */}
          <div className="bg-white p-6 sm:p-8 rounded-md shadow-sm border border-gray-100">
            <h2 className="text-xl font-medium mb-6 border-b pb-4">สรุปคำสั่งซื้อ</h2>
            
            {/* วนลูปแสดงสินค้าทุกชิ้นในตะกร้า */}
            <div className="max-h-[350px] overflow-y-auto pr-2 mb-6 space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-sm border border-gray-200 overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image_url || "/placeholder.jpg"} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-medium line-clamp-2">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">จำนวน: {item.quantity} ชิ้น</p>
                  </div>
                  <div className="text-right font-medium text-gray-800">
                    ฿{(Number(item.price) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-100 mb-4" />

            <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า ({totalQuantity} ชิ้น)</span>
                <span>฿{totalProductPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง</span>
                <span className="text-green-600">ฟรี</span>
              </div>
            </div>

            <hr className="border-gray-200 mb-4" />

            <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
              <span>ยอดชำระสุทธิ</span>
              <span className="text-[#C5A059] text-2xl">฿{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* --- ฝั่งขวา: ฟอร์มกรอกข้อมูลจัดส่ง --- */}
          <div className="bg-white p-6 sm:p-8 rounded-md shadow-sm border border-gray-100 order-last lg:order-none">
            <h2 className="text-xl font-medium mb-6 border-b pb-4">ข้อมูลการจัดส่ง</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-sm px-4 py-2 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition"
                  placeholder="กรุณากรอกชื่อ-นามสกุล"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10} 
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-sm px-4 py-2 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition"
                  placeholder="08X-XXX-XXXX"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">ที่อยู่จัดส่ง</label>
                <textarea
                  name="address"
                  required
                  rows="4"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-sm px-4 py-2 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition resize-none"
                  placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                ></textarea>
              </div>

              <button
                type="submit"
                className="mt-6 bg-[#C5A059] hover:bg-[#B38E46] text-white py-3 rounded-sm text-lg font-medium transition-colors shadow-sm w-full"
              >
                ยืนยันการสั่งซื้อ
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#C5A059]">กำลังโหลด...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}