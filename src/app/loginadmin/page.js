"use client";

import { supabase } from "@/utils/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  // 🌟 กลับมาใช้ตัวแปร email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      // 🌟 สั่งให้ไปค้นหาในตาราง admins โดยใช้อีเมล
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single(); // ดึงมาแค่รายการเดียว

      // ถ้าไม่เจอข้อมูล หรือ เกิดข้อผิดพลาด
      if (error || !data) {
        setErrorMessage("❌ อีเมล หรือ รหัสผ่านไม่ถูกต้อง");
        setIsLoading(false);
        return;
      }

      // ในหน้า Login (page.js) ก่อนสั่ง router.push("/admin")
document.cookie = `admin_token=true; path=/; max-age=86400; SameSite=Lax; ${window.location.protocol === 'https:' ? 'Secure' : ''}`;

// จากนั้นค่อยสั่งเด้งหน้า
router.push("/admin");

    } catch (err) {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#fdfbf7] p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-yellow-100 w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-3xl">👑</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">เข้าสู่ระบบจัดการหลังบ้าน</p>
        </div>
        
        {/* ช่องกรอกอีเมล */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="อีเมลแอดมิน (เช่น admin@gmail.com)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition bg-gray-50 focus:bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* ช่องกรอกรหัสผ่าน */}
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="รหัสผ่าน"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition bg-gray-50 focus:bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition"
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        {/* แสดงข้อความแจ้งเตือนเมื่อ Error */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-sm p-3 rounded-md">
            {errorMessage}
          </div>
        )}

        {/* ปุ่มเข้าสู่ระบบ */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full bg-gradient-to-r from-[#D4AF37] to-yellow-500 text-white py-3.5 rounded-xl font-bold text-lg shadow-md hover:shadow-lg hover:from-yellow-500 hover:to-yellow-400 transition transform hover:-translate-y-0.5 ${
            isLoading ? "opacity-70 cursor-not-allowed transform-none" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังเข้าสู่ระบบ...
            </span>
          ) : (
            "เข้าสู่ระบบ"
          )}
        </button>

      </div>
    </div>
  );
}