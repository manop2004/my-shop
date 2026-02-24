"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // 🌟 ฟังก์ชันรีเซ็ตปุ่มกลับเป็นปกติ ถ้ากดแล้วเปลี่ยนใจไม่ลบใน 3 วินาที
  useEffect(() => {
    let timeout;
    if (isConfirming) {
      timeout = setTimeout(() => {
        setIsConfirming(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isConfirming]);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 🌟 ถ้ายืนยันครั้งแรก ให้เปลี่ยนสถานะปุ่มเป็น "รอการยืนยัน"
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    // 🌟 ถ้ากดครั้งที่สอง (ยืนยันแล้ว) ให้ลบได้เลย
    setLoading(true);

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      router.refresh(); 

    } catch (error) {
      console.error("Error deleting product:", error.message);
      alert("❌ เกิดข้อผิดพลาดในการลบ: " + error.message);
    } finally {
      setLoading(false);
      setIsConfirming(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className={`
        relative z-50 cursor-pointer touch-manipulation w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border shadow-sm font-medium transition-all duration-200 text-sm
        ${loading
          ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-70"
          : isConfirming
          ? "bg-red-600 text-white border-red-700 hover:bg-red-700 active:bg-red-800 animate-pulse shadow-md" // 🌟 สไตล์ตอนรอการยืนยัน (สีแดงเข้ม)
          : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 active:bg-red-200" // 🌟 สไตล์ปกติ
        }
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="pointer-events-none">กำลังลบ...</span>
        </>
      ) : isConfirming ? (
         <>
          {/* 🌟 ไอคอนแจ้งเตือนตอนกดยืนยัน */}
          <span className="pointer-events-none text-base">⚠️</span>
          <span className="pointer-events-none font-bold">กดยืนยัน?</span>
         </>
      ) : (
        <>
          {/* 🌟 ไอคอนถังขยะ ตอนปกติ */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 pointer-events-none">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
          </svg>
          <span className="pointer-events-none">ลบ</span>
        </>
      )}
    </button>
  );
}