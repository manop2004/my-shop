"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import generatePayload from "promptpay-qr";
import { QRCodeSVG } from "qrcode.react";

export default function PaymentPage() {
  const router = useRouter();

  const [formData, setFormData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [slipImage, setSlipImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const PROMPTPAY_ID = "0639930853";
  const EASYSLIP_API_KEY = "e7efa221-5427-4cd1-876d-6c6962d4c778";

  useEffect(() => {
    const savedForm = sessionStorage.getItem("checkoutFormData");
    const savedCart = localStorage.getItem("cartItems");

    if (!savedForm || !savedCart) {
      router.push("/checkout");
      return;
    }

    const parsedCart = JSON.parse(savedCart);
    setFormData(JSON.parse(savedForm));
    setCartItems(parsedCart);

    const total = parsedCart.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    setTotalPrice(total);
  }, [router]);

  const qrPayload = generatePayload(PROMPTPAY_ID, { amount: totalPrice });

  const normalizeName = (name) =>
    String(name || "")
      .replace(/\s+/g, "")
      .replace(/นาย|นาง|น\.ส\.|ด\.ช\.|ด\.ญ\./g, "");

  const handleConfirmPayment = async () => {
    if (!slipImage) {
      alert("กรุณาอัปโหลดสลิปโอนเงินครับ");
      return;
    }

    setIsProcessing(true);

    try {
      // =============================
      // 1. ตรวจสลิป
      // =============================
      const apiFormData = new FormData();
      apiFormData.append("file", slipImage);

      const response = await fetch(
        "https://developer.easyslip.com/api/v1/verify",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${EASYSLIP_API_KEY}`,
          },
          body: apiFormData,
        }
      );

      const slipResult = await response.json();

      if (slipResult.status !== 200) {
        alert("❌ สแกนสลิปไม่ผ่าน");
        return;
      }

      const slipAmount =
        slipResult?.data?.amount?.amount ??
        slipResult?.data?.amount;

      const transactionId =
        slipResult?.data?.transRef ??
        slipResult?.data?.transactionId ??
        slipResult?.data?.referenceNo;

      let receiverName =
        slipResult?.data?.receiver?.account?.name?.th ??
        slipResult?.data?.receiver?.account?.name ??
        slipResult?.data?.receiver?.name ??
        "";

      if (typeof receiverName === "object") {
        receiverName = receiverName?.th ?? receiverName?.value ?? "";
      }

      const cleanReceiver = normalizeName(receiverName);
      const cleanShop = normalizeName("มนพ น้อยถนอม");

      if (!slipAmount || isNaN(Number(slipAmount))) {
        alert("❌ ไม่สามารถอ่านยอดเงินจากสลิปได้");
        return;
      }

      if (!transactionId) {
        alert("❌ ไม่พบ Transaction ID");
        return;
      }

      // =============================
      // 2. ตรวจยอดตรงเป๊ะ
      // =============================
      if (Number(slipAmount) !== Number(totalPrice)) {
        alert(
          `❌ ยอดเงินไม่ถูกต้อง\nยอดสั่งซื้อ: ${totalPrice}\nยอดที่โอน: ${slipAmount}`
        );
        return;
      }

      // =============================
      // 3. ตรวจชื่อผู้รับ
      // =============================
      if (
        !cleanReceiver.includes(cleanShop) &&
        !cleanShop.includes(cleanReceiver)
      ) {
        alert(
          `❌ ชื่อผู้รับเงินไม่ถูกต้อง\n(สลิปโอนไปที่: ${receiverName})`
        );
        return;
      }

      // =============================
      // 4. ตรวจสลิปซ้ำ
      // =============================
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("transaction_id")
        .eq("transaction_id", transactionId)
        .maybeSingle();

      if (existingOrder) {
        alert("❌ สลิปนี้ถูกใช้งานแล้ว");
        return;
      }

      // =============================
      // 5. อัปโหลดสลิป
      // =============================
      const fileExt = slipImage.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("slips")
        .upload(`public/${fileName}`, slipImage);

      if (uploadError) {
        alert("❌ อัปโหลดสลิปไม่สำเร็จ");
        return;
      }

      const slipUrl = supabase.storage
        .from("slips")
        .getPublicUrl(`public/${fileName}`).data.publicUrl;

      // =============================
      // 6. บันทึก Order (ยังไม่ตัดสต็อก)
      // =============================
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          total_price: totalPrice,
          slip_url: slipUrl,
          transaction_id: transactionId,
          status: "paid_pending", // 🔥 ยังไม่ตัด stock
        })
        .select()
        .single();

      if (orderError || !orderData) {
        console.error("Supabase Error (orders):", orderError);
        alert(`❌ บันทึกบิลไม่สำเร็จ: ${orderError?.message || "ไม่ทราบสาเหตุ"}`);
        return;
      }

      // =============================
      // 6.5 บันทึกสินค้าลง order_items 🌟 (โค้ดที่เพิ่มมาใหม่)
      // =============================
      // เตรียมข้อมูลสินค้าเพื่อเตรียมบันทึก
      const orderItemsData = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id || item.id, // เผื่อไว้ทั้งสองแบบ หมดห่วงเรื่องชื่อคีย์ไม่ตรง
        product_name: item.name || item.title || "ไม่ระบุชื่อสินค้า",
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        console.error("Supabase Error (order_items):", itemsError);
        alert(`❌ บันทึกรายการสินค้าไม่สำเร็จ: ${itemsError.message}`);
        return; // หยุดการทำงาน ไม่ให้เด้งไปหน้า Success ถ้าบันทึกสินค้าไม่ครบ
      }

      // =============================
      // 7. ไปหน้า success ก่อน
      // =============================
      router.push(`/success?order_id=${orderData.id}`);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!formData) return null;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#C5A059]">
        ชำระเงิน (PromptPay)
      </h1>

      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl mb-6 border">
        <QRCodeSVG value={qrPayload} size={200} />
        <p className="mt-4 font-medium text-lg">
          ยอดที่ต้องชำระ:{" "}
          <span className="text-[#C5A059] font-bold">
            ฿{totalPrice.toLocaleString()}
          </span>
        </p>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSlipImage(e.target.files[0])}
      />

      <button
        onClick={handleConfirmPayment}
        disabled={isProcessing}
        className="w-full mt-4 py-3 rounded-lg font-bold text-white bg-[#C5A059]"
      >
        {isProcessing ? "กำลังตรวจสอบสลิป..." : "แจ้งชำระเงินเรียบร้อย"}
      </button>
    </div>
  );
}