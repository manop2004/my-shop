"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from '@/utils/supabase';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ล้างข้อมูลตะกร้าใน LocalStorage และ SessionStorage ทิ้งเพื่อความชัวร์
    sessionStorage.removeItem("checkoutFormData");
    localStorage.removeItem("cart"); 
    localStorage.removeItem("cartItems");
    sessionStorage.removeItem("cart");

    // ดึงข้อมูลคำสั่งซื้อจาก Supabase
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // ดึงข้อมูลหลัก
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        // ดึงรายการสินค้า
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (orderData) setOrder(orderData);
        if (itemsData) setItems(itemsData);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // หน้าจอกำลังโหลด
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#C5A059] font-medium">
        กำลังโหลดข้อมูลคำสั่งซื้อ...
      </div>
    );
  }

  // กรณีไม่พบข้อมูล (เช่น เข้าหน้านี้โดยตรงไม่ได้ผ่านการซื้อ)
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F9F9]">
        <p className="text-gray-500 mb-4">ไม่พบข้อมูลคำสั่งซื้อ</p>
        <Link href="/mainpage" className="bg-[#C5A059] text-white px-6 py-2 rounded-md hover:bg-[#B38E46]">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  // แสดงหน้า Success แบบมีข้อมูลจริง!
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9F9F9] py-10">
      <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm border border-gray-100 max-w-md w-full mx-4">
        
        {/* ไอคอนติ๊กถูก */}
        <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">ชำระเงินสำเร็จ</h1>
        <p className="text-gray-500 mb-8 text-center">ขอบคุณที่สั่งซื้อสินค้ากับเรา ทางเราจะรีบจัดส่งให้เร็วที่สุด</p>

        {/* กล่องแสดงข้อมูลออเดอร์ */}
        <div className="bg-gray-50 p-5 rounded-md mb-8 text-left text-sm border border-gray-100">
          
          <div className="flex justify-between border-b border-gray-200 pb-3 mb-3">
            <span className="text-gray-500">รหัสคำสั่งซื้อ:</span>
            {/* ตัดเอาแค่ 8 ตัวแรกของ ID มาโชว์ให้ดูสวยงาม */}
            <span className="font-medium text-gray-800">#{order.id.toString().substring(0, 8).toUpperCase()}</span>
          </div>
          
          <div className="flex justify-between border-b border-gray-200 pb-3 mb-3">
            <span className="text-gray-500">ชื่อผู้รับ:</span>
            <span className="font-medium text-gray-800">{order.customer_name}</span>
          </div>

          <div className="mb-3">
            <span className="text-gray-500 block mb-2">สินค้าที่สั่งซื้อ:</span>
            <div className="space-y-2">
              {/* วนลูปแสดงสินค้าทุกชิ้นที่ซื้อ */}
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-start bg-white p-3 rounded border border-gray-100">
                  <span className="font-medium text-gray-700 w-3/4">{item.product_name}</span>
                  <span className="text-gray-500 whitespace-nowrap">x {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-4 mb-3">
            <span className="text-gray-500 mt-1">ยอดชำระสุทธิ:</span>
            <span className="font-semibold text-[#C5A059] text-xl">฿{order.total_price?.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between border-t border-gray-200 pt-3">
            <span className="text-gray-500">เวลาทำรายการ:</span>
            <span className="font-medium text-gray-800">
              {new Date(order.created_at).toLocaleString('th-TH', { 
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>
          
        </div>

        <Link 
          href="/mainpage" 
          className="block w-full bg-[#C5A059] hover:bg-[#B38E46] text-white py-3 rounded-md transition duration-300 font-medium mb-4 shadow-sm text-center"
        >
          กลับสู่หน้าหลัก
        </Link>
        
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#C5A059]">กำลังโหลดข้อมูล...</div>}>
      <SuccessContent />
    </Suspense>
  );
}