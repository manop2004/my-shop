"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '@/utils/supabase';
import generatePayload from 'promptpay-qr';
import { QRCodeSVG } from 'qrcode.react';

export default function PaymentPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const [slipImage, setSlipImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ข้อมูลพร้อมเพย์ของคุณ
  const PROMPTPAY_ID = "0639930853"; 

  // 🔑 นำ API Key ของ EasySlip มาใส่ตรงนี้ครับ
  const EASYSLIP_API_KEY = "8c52aa84-fdd8-4696-b3bb-fb03822f9af8"; 

  useEffect(() => {
    const savedForm = sessionStorage.getItem("checkoutFormData");
    const savedCart = localStorage.getItem("cartItems");
    
    if (!savedForm || !savedCart) {
      alert("ไม่พบข้อมูลคำสั่งซื้อ กรุณาทำรายการใหม่");
      router.push("/checkout");
      return;
    }

    const parsedCart = JSON.parse(savedCart);
    setFormData(JSON.parse(savedForm));
    setCartItems(parsedCart);
    
    const total = parsedCart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    setTotalPrice(total);
  }, [router]);

  const qrPayload = generatePayload(PROMPTPAY_ID, { amount: totalPrice });

  const handleConfirmPayment = async () => {
    if (!slipImage) {
      alert("กรุณาอัปโหลดสลิปโอนเงินครับ");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. ยิง API ตรวจสลิปด้วย EasySlip
      const apiFormData = new FormData();
      apiFormData.append('file', slipImage);

      const response = await fetch('https://developer.easyslip.com/api/v1/verify', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${EASYSLIP_API_KEY}` 
        },
        body: apiFormData
      });
      
      const slipResult = await response.json();

      if (slipResult.status !== 200) {
        alert(`❌ สแกนสลิปไม่ผ่าน: ${slipResult.message || 'กรุณาลองอัปโหลดรูปใหม่อีกครั้ง'}`);
        setIsProcessing(false);
        return;
      }

      // 2. ตรวจสอบเงื่อนไข: ยอดเงินตรงไหม? 
      const slipAmount = slipResult.data.amount; 
      const transactionId = slipResult.data.transRef; 

      if (slipAmount < totalPrice) {
        alert(`❌ ยอดเงินไม่ถูกต้อง (ยอดสั่งซื้อ ${totalPrice} บาท แต่สลิปโอนมา ${slipAmount} บาท)`);
        setIsProcessing(false);
        return;
      }

      // 3. ตรวจสอบสลิปซ้ำ 
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('transaction_id')
        .eq('transaction_id', transactionId)
        .single();

      if (existingOrder) {
        alert("❌ สลิปนี้ถูกใช้งานไปแล้วในระบบ กรุณาใช้สลิปที่โอนใหม่ครับ");
        setIsProcessing(false);
        return;
      }

      // 4. อัปโหลดรูปสลิปลง Supabase Storage ('slips' bucket)
      const fileExt = slipImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('slips')
        .upload(`public/${fileName}`, slipImage);

      if (uploadError) throw uploadError;
      const slipUrl = supabase.storage.from('slips').getPublicUrl(`public/${fileName}`).data.publicUrl;

      // 5. บันทึกข้อมูลลงตาราง orders 
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          total_price: totalPrice,
          slip_url: slipUrl,
          transaction_id: transactionId, 
          status: 'paid' 
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 6. บันทึกสินค้ารายชิ้นลงตาราง order_items
      const orderItemsData = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
      if (itemsError) throw itemsError;

      // 7. ตัดสต็อกสินค้าในตาราง products 
      for (const item of cartItems) {
        const { data: currentProduct, error: fetchError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();

        if (currentProduct && !fetchError) {
          const newStock = currentProduct.stock - item.quantity;
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock < 0 ? 0 : newStock })
            .eq('id', item.id);

          if (updateError) {
            console.error(`ไม่สามารถตัดสต็อกสินค้า ID: ${item.id} ได้`, updateError);
          }
        }
      }

      // 8. ล้างตะกร้าและข้อมูลทิ้ง
      localStorage.removeItem("cartItems");
      sessionStorage.removeItem("checkoutFormData");
      
      // 9. ส่งไปหน้า Success 
      router.push(`/success?order_id=${orderData.id}`);

    } catch (error) {
      console.error("Payment Error:", error);
      alert("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!formData) return <div className="min-h-screen flex items-center justify-center text-[#C5A059]">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#C5A059]">ชำระเงิน (PromptPay)</h1>
      
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl mb-6 border border-gray-200">
        <QRCodeSVG value={qrPayload} size={200} />
        <p className="mt-4 font-medium text-lg">ยอดที่ต้องชำระ: <span className="text-[#C5A059] font-bold">฿{totalPrice.toLocaleString()}</span></p>
        <p className="text-sm text-gray-500 mt-2">แสกนด้วยแอปธนาคารใดก็ได้</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">อัปโหลดสลิปโอนเงิน</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setSlipImage(e.target.files[0])}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C5A059] file:text-white hover:file:bg-[#b38e46]"
        />
      </div>

      {/* 🌟 ปุ่มกดสีทองอร่ามอยู่ตรงนี้ครับ! อย่าลืมก๊อปปี้ให้ถึงบรรทัดล่างสุดนะครับ 🌟 */}
      <button 
        onClick={handleConfirmPayment}
        disabled={isProcessing}
        className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
          isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C5A059] hover:bg-[#b38e46]'
        }`}
      >
        {isProcessing ? 'กำลังตรวจสอบสลิปและบันทึก...' : 'แจ้งชำระเงินเรียบร้อย'}
      </button>

    </div>
  );
}