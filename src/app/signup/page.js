"use client";

import { supabase } from "@/utils/supabase";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (password !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert("เกิดข้อผิดพลาด: " + error.message);
        return;
      }

      const user = data.user;

      if (user) {

        const { error: insertError } = await supabase
          .from("members")
          .insert([
  {
    id: user.id,
    full_name: fullName,
    email: email,
    password: password, // เพิ่มบรรทัดนี้
  },
]);

        if (insertError) {
          alert(insertError.message);
        } else {
          alert("สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมล");
          router.push("/login");
        }
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRegister = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "http://localhost:3000/login",
      },
    });

    if (error) {
      alert("เกิดข้อผิดพลาดในการสมัคร");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-center text-2xl font-bold mb-6">
          สมัครสมาชิก
        </h1>

        <button
          onClick={() => handleOAuthRegister("google")}
          className="w-full  bg-[#ffecb3] hover:bg-[#ffe082] text-black py-3 rounded-full mb-3 transition"
        >
          สมัครด้วย Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-400 text-sm">หรือ</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <input
          type="text"
          placeholder="ชื่อ - นามสกุล"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 mb-3"
        />

        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 mb-3"
        />

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3 text-gray-500"
          >
            👁
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="ยืนยันรหัสผ่าน"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-3 text-gray-500"
          >
            👁
          </button>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-[#FFEE91] hover:bg-[#F5C857] text-black py-3 rounded-full mb-4 transition font-medium"
        >
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </button>

        <p className="text-center text-sm">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="underline text-blue-600">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}