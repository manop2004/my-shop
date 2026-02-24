"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 1. State สำหรับเก็บข้อมูลข้อความ
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: ""
  });

  // 2. State สำหรับเก็บ "ไฟล์รูปภาพ" ที่ผู้ใช้เลือกจากเครื่อง
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันจัดการเมื่อมีการกดเลือกไฟล์รูป
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      // 3. ถ้ามีการเลือกรูปภาพ ให้ทำการอัปโหลดขึ้น Supabase Storage ก่อน
      if (imageFile) {
        // สร้างชื่อไฟล์ใหม่ไม่ให้ซ้ำกัน (เช่น 16987654321.jpg)
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // ทำการอัปโหลดไปที่ Bucket ชื่อ 'products'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products') 
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // เมื่ออัปโหลดเสร็จ ให้ขอ URL แบบ Public ของรูปนั้นมา
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // 4. บันทึกข้อมูลสินค้า พร้อมกับลิงก์รูป (ที่เพิ่งอัปโหลดเสร็จ) ลงตาราง products
      const { error } = await supabase
        .from("products")
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            stock: Number(formData.stock),
            image_url: imageUrl // จะเป็นลิงก์รูป หรือเป็น null ถ้าไม่ได้อัปรูป
          }
        ]);

      if (error) throw error;

      alert("เพิ่มสินค้าและอัปโหลดรูปสำเร็จ! 🎉");
      router.push("/admin"); 
      router.refresh(); 

    } catch (error) {
      console.error("Error adding product:", error.message);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-yellow-100 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">เพิ่มสินค้าใหม่ 📦</h1>
        <Link href="/admin" className="text-gray-500 hover:text-yellow-600 font-medium transition">
          กลับไปหน้าจัดการ
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* ชื่อสินค้า */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="name"
            required 
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
            placeholder="เช่น แหวนเพชรคอลเลกชันใหม่"
          />
        </div>

        {/* รายละเอียดสินค้า */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า</label>
          <textarea 
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition resize-y"
            placeholder="พิมพ์รายละเอียดของสินค้าที่นี่..."
          ></textarea>
        </div>

        {/* ราคา & สต็อก */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท) <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              name="price"
              required 
              min="0"
              value={formData.price}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนสต็อก <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              name="stock"
              required 
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              placeholder="ระบุจำนวน"
            />
          </div>
        </div>

        {/* 👈 อัปโหลดรูปภาพ (เปลี่ยนเป็นแบบเลือกไฟล์) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">อัปโหลดรูปภาพ</label>
          <input 
            type="file" 
            accept="image/*" // บังคับให้เลือกได้เฉพาะไฟล์รูปภาพ
            onChange={handleFileChange}
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition text-sm bg-gray-50 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
          />
        </div>

        {/* ปุ่ม Submit */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#C5A059] text-white py-3 rounded-lg hover:bg-[#B38E46] transition font-bold disabled:bg-gray-300 disabled:cursor-not-allowed mt-4 shadow-sm"
        >
          {loading ? "กำลังบันทึกและอัปโหลดรูป..." : "บันทึกสินค้า"}
        </button>

      </form>
    </div>
  );
}