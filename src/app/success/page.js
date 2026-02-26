"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import { supabase } from '@/utils/supabase';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ใช้ useRef เพื่อป้องกันไม่ให้ useEffect รันตัดสต็อกซ้ำซ้อน 2 รอบ
  const hasDeducted = useRef(false);

  useEffect(() => {
    // ล้างข้อมูลตะกร้าทิ้งเมื่อชำระเงินสำเร็จ
    sessionStorage.removeItem("checkoutFormData");
    localStorage.removeItem("cartItems");

    const fetchOrderAndDeductStock = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // 1. ดึงข้อมูลคำสั่งซื้อหลัก
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        // 2. ดึงรายการสินค้าที่ซื้อในบิลนี้
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (orderData) setOrder(orderData);
        if (itemsData) setItems(itemsData);

        // ==========================================
        // 🌟 3. ระบบตัดสต็อก (เช็กจาก status ป้องกันการตัดซ้ำ)
        // ==========================================
        if (orderData?.status === 'paid_pending' && itemsData && itemsData.length > 0 && !hasDeducted.current) {
          hasDeducted.current = true; 
          console.log("กำลังเริ่มตัดสต็อก...", itemsData);

          for (const item of itemsData) {
            const { data: currentProduct, error: fetchError } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .maybeSingle();

            if (fetchError) {
              console.error("❌ ดึงข้อมูลสต็อกล้มเหลว:", fetchError);
            }

            if (currentProduct) {
              const newStock = currentProduct.stock - item.quantity;
              console.log(`กำลังปรับสต็อกสินค้า ID: ${item.product_id} จาก ${currentProduct.stock} -> ${newStock}`);
              
              const { error: updateError } = await supabase
                .from('products')
                .update({ stock: newStock < 0 ? 0 : newStock })
                .eq('id', item.product_id);

              if (updateError) {
                console.error("❌ ตัดสต็อกล้มเหลว (อาจติด RLS Policy):", updateError);
                alert(`ตัดสต็อกไม่สำเร็จ! ติด Error: ${updateError.message}`); 
              } else {
                console.log("✅ ตัดสต็อกสำเร็จ!");
              }
            }
          }

          // 4. อัปเดตสถานะบิลเป็น 'paid' เพื่อล็อคไม่ให้มันตัดสต็อกซ้ำอีก
          await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', orderId);
            
          // อัปเดต state เพื่อให้ข้อมูลในหน้าเว็บเป็นปัจจุบัน
          setOrder(prev => ({ ...prev, status: 'paid' }));
        }

      } catch (error) {
        console.error("Error in success page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndDeductStock();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#C5A059] font-medium">
        กำลังประมวลผลคำสั่งซื้อและตัดสต็อก...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F9F9]">
        <p className="text-gray-500 mb-4">ไม่พบข้อมูลคำสั่งซื้อ หรืออาจโหลดข้อมูลไม่สำเร็จ</p>
        <Link href="/" className="bg-[#C5A059] text-white px-6 py-2 rounded-md hover:bg-[#B38E46]">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9F9F9] py-10">
      <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm border border-gray-100 max-w-md w-full mx-4">
        
        <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">ชำระเงินสำเร็จ</h1>
        <p className="text-gray-500 mb-8 text-center">ขอบคุณที่สั่งซื้อสินค้ากับเรา ทางเราจะรีบจัดส่งให้เร็วที่สุด</p>

        <div className="bg-gray-50 p-5 rounded-md mb-8 text-left text-sm border border-gray-100">
          <div className="flex justify-between border-b border-gray-200 pb-3 mb-3">
            <span className="text-gray-500">รหัสคำสั่งซื้อ:</span>
            <span className="font-medium text-gray-800">#{order.id.toString().substring(0, 8).toUpperCase()}</span>
          </div>
          
          <div className="flex justify-between border-b border-gray-200 pb-3 mb-3">
            <span className="text-gray-500">ชื่อผู้รับ:</span>
            <span className="font-medium text-gray-800">{order.customer_name}</span>
          </div>

          <div className="mb-3">
            <span className="text-gray-500 block mb-2">สินค้าที่สั่งซื้อ:</span>
            <div className="space-y-2">
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
        </div>

        <Link 
          href="/" 
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#C5A059]">กำลังโหลด...</div>}>
      <SuccessContent />
    </Suspense>
  );
}