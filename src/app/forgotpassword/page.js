"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function ForgotPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

 const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. 🌟 เช็กก่อนว่ามีอีเมลนี้ในระบบ (ตาราง members) หรือไม่
      const { data: member, error: fetchError } = await supabase
        .from('members')
        .select('email')
        .eq('email', email)
        .single();

      // ถ้าไม่พบข้อมูล หรือ error ว่าไม่เจอแถวข้อมูล
      if (fetchError || !member) {
        setMessage("ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีกครั้ง หรือสมัครสมาชิก");
        setLoading(false);
        return; // หยุดการทำงาน ไม่ส่ง OTP
      }

      // 2. ถ้าเจออีเมล ถึงจะทำการส่ง OTP สำหรับ Reset Password
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

      if (resetError) {
        setMessage("เกิดข้อผิดพลาด: " + resetError.message);
      } else {
        setMessage("ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว");
        setStep(2);
      }
    } catch (err) {
      setMessage("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery", 
    });

    if (error) {
      setMessage("รหัส OTP ไม่ถูกต้องหรือหมดอายุ: " + error.message);
    } else {
      setMessage("ยืนยันตัวตนสำเร็จ กรุณาตั้งรหัสผ่านใหม่");
      setStep(3);
    }
    setLoading(false);
  };

  // 🌟 ฟังก์ชันอัปเดตรหัสผ่าน (ปรับปรุงให้บันทึกลงตาราง members ด้วย)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. อัปเดตรหัสผ่านใหม่ในระบบ Auth ของ Supabase
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage("ไม่สามารถเปลี่ยนรหัสผ่านได้: " + error.message);
    } else {
      
      // 🌟 2. อัปเดตรหัสผ่านใหม่ลงในตาราง members
      await supabase
        .from('members')
        .update({ password: password })
        .eq('email', email);

      setMessage("เปลี่ยนรหัสผ่านสำเร็จแล้ว!");
      setTimeout(() => {
        router.push("/login"); 
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
          {step === 1 && "ลืมรหัสผ่าน?"}
          {step === 2 && "ยืนยันรหัส OTP"}
          {step === 3 && "ตั้งรหัสผ่านใหม่"}
        </h1>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              value={email}
              placeholder="อีเมล"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFEE91] hover:bg-[#F5C857] transition-colors py-3 rounded-[30px]"
            >
              {loading ? "กำลังส่ง..." : "ส่งรหัส OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-500 text-center">กรอกรหัส 6 หลักที่ได้รับในอีเมล</p>
            <input
              type="text"
              placeholder="รหัส OTP "
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-xl text-center text-l tracking-widest focus:ring-2 focus:ring-gray-400 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFEE91] hover:bg-[#f7e366] py-3 rounded-full font-semibold"
            >
              {loading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="w-full text-sm text-blue-600 hover:underline "
            >
              ย้อนกลับไปกรอกอีเมลใหม่
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h2 className="text-center font-semibold text-lg">ตั้งรหัสผ่านใหม่</h2>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-400 outline-none pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁" : "👁"}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFEE91] hover:bg-[#F5C857] transition-colors py-3 rounded-[30px] font-semibold mt-2"
            >
              {loading ? "กำลังบันทึก..." : "ยืนยันรหัสผ่านใหม่"}
            </button>
          </form>
        )}

        {message && (
          <div className={`mt-4 text-center text-sm font-medium ${
            message.includes("สำเร็จ") || message.includes("ส่งรหัส OTP")
              ? "text-blue-400" 
              : "text-[#FF4D4F]" 
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}