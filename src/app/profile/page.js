"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  // 🌟 เพิ่ม State สำหรับเก็บชื่อ
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  
  // State เช็กว่าเป็นบัญชี Google หรือไม่
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ดึงข้อมูลผู้ใช้เมื่อโหลดหน้า
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = "/mainpage";
        return;
      }

      setUser(session.user);
      setEmail(session.user.email);
      setAvatarUrl(session.user.user_metadata?.avatar_url || null);
      
      // 🌟 ดึงชื่อจาก User Metadata มาแสดง (ถ้ามี)
      let currentName = session.user.user_metadata?.full_name || "";

      // 🌟 (ทางเลือกเสริม) พยายามดึงชื่อล่าสุดจากตาราง members ด้วย
      try {
        const { data: memberData } = await supabase
          .from('members')
          .select('full_name') // 📌 ถ้าในตารางใช้ชื่อคอลัมน์อื่น ให้แก้ตรงนี้ครับ เช่น .select('name')
          .eq('email', session.user.email)
          .single();
        
        if (memberData && memberData.full_name) { // 📌 และแก้ตรงนี้ให้ตรงกันครับ
          currentName = memberData.full_name;
        }
      } catch (error) {
        console.log("Could not fetch from members table:", error);
      }
      setFullName(currentName);

      // เช็กว่า Provider ที่ล็อกอินเข้ามามี Google หรือไม่
      const providers = session.user.app_metadata?.providers || [];
      setIsGoogleUser(providers.includes('google'));

      setLoading(false);
    };

    fetchUser();
  }, []);

  // ฟังก์ชันอัปโหลดรูปภาพ (เหมือนเดิม)
  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      setMessage({ type: "", text: "" });

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("กรุณาเลือกรูปภาพ");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      if (updateAuthError) throw updateAuthError;

      // 🌟 อัปเดตรูปในตาราง members ด้วย
      await supabase
        .from('members')
        .update({ avatar_url: publicUrl })
        .eq('email', user.email); 

      setAvatarUrl(publicUrl);
      setMessage({ type: "success", text: "อัปโหลดรูปโปรไฟล์สำเร็จ!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "อัปโหลดรูปภาพไม่สำเร็จ: " + error.message });
    } finally {
      setUploading(false);
    }
  };

  // ฟังก์ชันลบรูปโปรไฟล์ (เหมือนเดิม)
  const handleDeleteAvatar = async () => {
    try {
      setUploading(true);
      setMessage({ type: "", text: "" });

      if (avatarUrl) {
        const filePath = avatarUrl.split('/avatars/')[1];
        if (filePath) {
          await supabase.storage.from('avatars').remove([filePath]);
        }
      }

      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });
      if (updateAuthError) throw updateAuthError;

      // 🌟 ลบรูปในตาราง members ด้วย
      await supabase
        .from('members')
        .update({ avatar_url: null })
        .eq('email', user.email); 

      setAvatarUrl(null);
      setMessage({ type: "success", text: "ลบรูปโปรไฟล์สำเร็จ!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "ลบรูปโปรไฟล์ไม่สำเร็จ: " + error.message });
    } finally {
      setUploading(false);
    }
  };

  // 🌟 ฟังก์ชันอัปเดตโปรไฟล์ (รวมการแก้ชื่อและรหัสผ่าน)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);

    try {
      // 1. เตรียมข้อมูลสำหรับอัปเดต Auth ของ Supabase
      const authUpdateData = {
        data: { full_name: fullName } // อัปเดตชื่อใน metadata
      };

      // ถ้ายูสเซอร์กรอกรหัสผ่านใหม่มาด้วย ให้เพิ่มเข้าไป
      if (password) {
        authUpdateData.password = password;
      }

      // อัปเดตระบบ Auth
      const { error: authError } = await supabase.auth.updateUser(authUpdateData);
      if (authError) throw authError;

      // 2. เตรียมข้อมูลสำหรับอัปเดตตาราง members
      // 📌 หมายเหตุ: เช็กชื่อคอลัมน์ในตาราง members ของคุณอีกครั้งนะครับ ถ้าใช้ 'name' ให้แก้ 'full_name' เป็น 'name' ครับ
      const dbUpdateData = { 
        full_name: fullName 
      }; 
      
      if (password) {
        dbUpdateData.password = password;
      }

      // อัปเดตลงตาราง members
      const { error: dbError } = await supabase
        .from('members')
        .update(dbUpdateData)
        .eq('email', email);

      if (dbError) throw dbError;

      setMessage({ type: "success", text: "บันทึกข้อมูลสำเร็จแล้ว!" });
      if (password) setPassword(""); // เคลียร์ช่องรหัสผ่าน

    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันออกจากระบบ (เหมือนเดิม)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/mainpage";
  };

  if (loading && !user) return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;

  return (
    // 🌟 ใช้ดีไซน์เดิมของคุณลูกค้า (bg-[#FAF8F5])
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-zinc-800 py-12 px-6">
      <div className="max-w-md mx-auto">
        
        {/* 🌟 ปุ่มกลับหน้าหลัก (เวอร์ชันบังคับให้อยู่บรรทัดเดียวกัน 100%) 🌟 */}
        <div className="mb-8">
          <Link 
            href="/mainpage" 
            className="w-max flex flex-row items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:text-[#C5A059] hover:border-[#C5A059] hover:shadow-md transition-all active:scale-95"
          >
            <svg 
              className="w-5 h-5 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span className="whitespace-nowrap">กลับไปหน้าหลักร้านค้า</span>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-8 font-serif tracking-wide">จัดการโปรไฟล์</h2>

          {/* ส่วนรูปโปรไฟล์ (ดีไซน์เดิม) */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-28 h-28 rounded-full bg-gray-200 overflow-hidden mb-4 border-2 border-[#C5A059]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-full h-full text-gray-400 p-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            
            {/* แสดงปุ่มเปลี่ยนรูปเฉพาะคนที่ไม่ได้ล็อกอินด้วย Google */}
            {!isGoogleUser && (
              <div className="flex items-center gap-4">
                <label className={`cursor-pointer text-sm font-medium ${uploading ? 'text-gray-400' : 'text-[#C5A059] hover:text-[#b08e4d]'} transition-colors`}>
                  {uploading ? 'กำลังดำเนินการ...' : 'เปลี่ยนรูปโปรไฟล์'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                  />
                </label>

                {avatarUrl && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={uploading}
                    className={`text-sm font-medium transition-colors ${uploading ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}`}
                  >
                    ลบรูป
                  </button>
                )}
              </div>
            )}
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg mb-6 text-sm text-center ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message.text}
            </div>
          )}

          {/* ฟอร์มข้อมูลผู้ใช้ */}
          <form onSubmit={handleUpdateProfile} className="space-y-5">
            
            {/* 🌟 เพิ่มช่องกรอกชื่อ-นามสกุล โดยใช้ดีไซน์เดิม */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุลของคุณ"
                // ถ้าเป็น Google User อาจจะให้ readonly หรือไม่ก็ได้ตามต้องการครับ (ในที่นี้ให้แก้ได้)
                readOnly={isGoogleUser} 
                className={`w-full border rounded-lg px-4 py-3 outline-none transition-shadow ${
                  isGoogleUser 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                    : 'focus:ring-2 focus:ring-[#C5A059]'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมลผู้ใช้ {isGoogleUser && "(บัญชี Google)"}
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
              />
            </div>

            {/* ถ้าเป็นบัญชี Google จะซ่อนช่องรหัสผ่าน และโชว์กล่องข้อความแทน */}
            {!isGoogleUser ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เปลี่ยนรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่ที่ต้องการ"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#C5A059] outline-none transition-shadow"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  // 🌟 ใช้สีปุ่มเดิม (bg-[#1a1a1a])
                  className={`w-full py-3 rounded-[30px] font-medium transition-colors ${loading ? 'bg-gray-300 text-gray-500' : 'bg-[#1a1a1a] hover:bg-[#333] text-white'}`}
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </>
            ) : (
              <div className="p-4 bg-gray-50 text-gray-500 rounded-lg text-sm text-center border border-gray-200">
                คุณเข้าสู่ระบบด้วย Google ไม่สามารถแก้ไขรูปโปรไฟล์และรหัสผ่านได้
              </div>
            )}
          </form>

          {/* ปุ่มออกจากระบบ (ดีไซน์เดิม) */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-[30px] font-medium border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}