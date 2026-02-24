"use client";

import { supabase } from "@/utils/supabase";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 🌟 ปริ้นท์ Error ลง Console (กด F12 ดูได้)
      console.error("Supabase Login Error:", error); 

      if (error.message === "Invalid login credentials") {
        setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (error.message === "Email not confirmed") {
        setErrorMessage("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
      } else {
        // 🌟 เปลี่ยนให้โชว์ข้อความ Error จริงๆ จาก Supabase ชั่วคราว
        setErrorMessage(`เกิดข้อผิดพลาด: ${error.message}`); 
      }
      return;
    }

    router.push("/mainpage");
  };
  const handleOAuthLogin = async (provider) => {
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "http://localhost:3000/mainpage",
      },
    });

    if (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-center text-2xl font-bold mb-6">
          เข้าสู่ระบบ
        </h1>

        <button
          onClick={() => handleOAuthLogin("google")}
          className="w-full bg-[#ffecb3] hover:bg-[#ffe082] text-black py-3 rounded-[30px] mb-3 transition"
        >
          เข้าสู่ระบบด้วย Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-gray-400 text-sm">หรือ</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>



<input
  type="email" // แนะนำให้ใส่ type="email" เพื่อความปลอดภัย
  placeholder="อีเมล"
  value={email} // 🌟 เพิ่มบรรทัดนี้
  className="w-full border rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-gray-400"
  onChange={(e) => setEmail(e.target.value)}
/>

<div className="relative mb-3">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="รหัสผ่าน"
    value={password} // 🌟 เพิ่มบรรทัดนี้
    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-400"
    onChange={(e) => setPassword(e.target.value)}
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-3 text-gray-500"
  >
     
  </button>
</div>



        {errorMessage && (
          <p className="text-red-500 text-sm text-center mt-3">
            {errorMessage}
          </p>
        )}

        <div className="text-right text-sm text-gray-600 mb-4 cursor-pointer hover:underline">
          <Link href="/forgotpassword">
            ลืมรหัสผ่าน?
          </Link>
        </div>

        <button
          onClick={handleLogin}
          className="bg-[#FFEE91] hover:bg-[#F5C857] w-full p-2 rounded-[30px]"
        >
          เข้าสู่ระบบ
        </button>

        <p className="text-center text-sm mt-4">
          ยังไม่เป็นสมาชิก?{" "}
          <Link href="/signup" className="underline text-blue-600">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}