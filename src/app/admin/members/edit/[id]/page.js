"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // เก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: ""
  });

  // ดึงข้อมูลสมาชิกเดิมมาแสดง
  useEffect(() => {
    const fetchMember = async () => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", memberId)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          email: data.email || "",
          password: data.password || ""
        });
      } else if (error) {
        console.error("ดึงข้อมูลไม่สำเร็จ:", error);
      }
      setFetching(false);
    };

    if (memberId) fetchMember();
  }, [memberId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // อัปเดตข้อมูลลงตาราง members
      const { error: updateError } = await supabase
        .from("members")
        .update({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
        })
        .eq("id", memberId);

      if (updateError) throw updateError;

      alert("อัปเดตข้อมูลสมาชิกสำเร็จ!");
      router.push("/admin/members"); 
      router.refresh();

    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-yellow-100 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">แก้ไขข้อมูลสมาชิก</h1>
        <Link href="/admin/members" className="text-gray-500 hover:text-yellow-600 font-medium">
          กลับไปหน้าสมาชิก
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
          <input 
            type="text" 
            required 
            value={formData.full_name}
            className="w-full border p-3 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 bg-gray-50"
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
          <input 
            type="email" 
            required 
            value={formData.email}
            className="w-full border p-3 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 bg-gray-50"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={formData.password}
              className="w-full border p-3 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 bg-gray-50"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-3 text-gray-500 hover:text-gray-700"
            > 
              {showPassword ? "🙈" : "👁"} 
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1"></p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition font-bold disabled:bg-gray-400 mt-6"
        >
          {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </form>
    </div>
  );
}