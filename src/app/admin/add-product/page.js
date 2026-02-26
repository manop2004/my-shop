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

  // 2. State สำหรับเก็บ "ไฟล์รูปภาพ"
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]); // 🌟 เพิ่ม State เก็บรูปรายละเอียด (หลายรูป)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันจัดการเมื่อมีการกดเลือกไฟล์รูปหลัก
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  // 🌟 ฟังก์ชันจัดการเมื่อมีการกดเลือกไฟล์รูปรายละเอียด (หลายรูป)
  const handleGalleryChange = (e) => {
    if (e.target.files) {
      setGalleryFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      let galleryUrlsToSave = []; // 🌟 เตรียม Array ไว้เก็บลิงก์รูปรายละเอียด

      // 3. อัปโหลดรูปภาพหลัก ขึ้น Supabase Storage ก่อน
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products') 
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("อัปโหลดรูปภาพหลักไม่สำเร็จ: " + uploadError.message);
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      // 🌟 3.5 อัปโหลดรูปภาพรายละเอียด (ถ้ามี) 🌟
      if (galleryFiles && galleryFiles.length > 0) {
        for (let i = 0; i < galleryFiles.length; i++) {
          const file = galleryFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `gallery_${Date.now()}_${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

          if (uploadError) {
            alert("❌ อัปโหลดรูปรายละเอียดไม่ผ่าน!\nสาเหตุ: " + uploadError.message);
            setLoading(false);
            return;
          }

          const { data: publicUrlData } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);

          // ดันลิงก์ที่อัปโหลดเสร็จแล้วเข้า Array
          galleryUrlsToSave.push(`${publicUrlData.publicUrl}?t=${Date.now()}`);
        }
      }

      // 4. นำข้อมูลทั้งหมดไปบันทึกลงตาราง products
      const { data, error } = await supabase.from("products").insert([
        {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          stock: Number(formData.stock),
          image_url: imageUrl,
          gallery: galleryUrlsToSave // 🌟 บันทึก Array รูปลงคอลัมน์ gallery
        }
      ]);

      if (error) {
        console.error("Insert error:", error);
        alert("เพิ่มสินค้าไม่สำเร็จ: " + error.message);
      } else {
        alert("🎉 เพิ่มสินค้าเรียบร้อยแล้ว!");
        router.push("/admin"); 
        router.refresh(); 
      }

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">เพิ่มสินค้าใหม่ 📦</h1>
        <Link href="/admin" className="text-gray-500 hover:text-yellow-600 font-medium transition">
          กลับไปหน้าจัดการ
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
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
            placeholder="เช่น เสื้อยืดลายแมว"
          />
        </div>

        {/* รายละเอียด */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า</label>
          <textarea 
            name="description"
            rows="3" 
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition resize-y"
            placeholder="อธิบายรายละเอียดสินค้า..."
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* ราคา */}
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
              placeholder="ระบุราคา"
            />
          </div>

          {/* สต็อก */}
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

        {/* อัปโหลดรูปภาพหลัก */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพสินค้า (รูปหลัก)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition text-sm bg-gray-50 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
          />
        </div>

        {/* 🌟 อัปโหลดรูปภาพรายละเอียด (เพิ่มมาใหม่ สไตล์เดิม) 🌟 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพรายละเอียดสินค้า (เลือกได้หลายรูป)</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple // บังคับให้เลือกได้หลายไฟล์
            onChange={handleGalleryChange}
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition text-sm bg-gray-50 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
          />
        </div>

        {/* ปุ่ม Submit */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#C5A059] text-white py-3 rounded-lg hover:bg-[#B38E46] transition font-bold disabled:bg-gray-300 disabled:cursor-not-allowed mt-4 shadow-sm"
        >
          {loading ? "กำลังบันทึก..." : "บันทึกสินค้า"}
        </button>
      </form>
    </div>
  );
}