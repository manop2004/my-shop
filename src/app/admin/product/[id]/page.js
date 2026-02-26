"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id; 

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    stock: "", 
    image_url: "",
    gallery: [] // 🌟 เพิ่มสำหรับเก็บรูปรายละเอียดเดิม
  });
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]); // 🌟 เพิ่มสำหรับเก็บไฟล์รูปรายละเอียดใหม่

  // 1. ดึงข้อมูลเดิมมาแสดง
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(productId)) // 👈 แปลง ID เป็นตัวเลขกันเหนียว
        .single();

      if (data) {
        setFormData(data);
      } else if (error) {
        console.error("ดึงข้อมูลไม่สำเร็จ:", error);
      }
      setFetching(false);
    };

    fetchProduct();
  }, [productId]);

  // 2. ฟังก์ชันกดบันทึก
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrlToSave = formData.image_url; 
      let galleryUrlsToSave = formData.gallery || []; // เตรียมเก็บรูประดับรายละเอียด

      // --- ขั้นตอนที่ 1: อัปโหลดรูปภาพหลัก (ถ้ามี) ---
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `edit_${Date.now()}.${fileExt}`; 

        const { error: uploadError } = await supabase.storage
          .from('products') 
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false // ใช้รูปชื่อใหม่ไปเลย ไม่ต้องทับของเดิม
          });

        // 🚨 ถ้าอัปรูปไม่ผ่าน ให้เด้งบอกทันที!
        if (uploadError) {
          alert("❌ อัปโหลดรูปลง Storage ไม่ผ่าน!\nสาเหตุ: " + uploadError.message);
          setLoading(false);
          return; // หยุดการทำงานแค่นี้
        }

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        imageUrlToSave = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      // --- ขั้นตอนที่ 1.5: อัปโหลดรูปภาพรายละเอียด (ถ้ามีการเลือกใหม่) 🌟 ---
      if (galleryFiles && galleryFiles.length > 0) {
        const uploadedGallery = [];
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

          uploadedGallery.push(`${publicUrlData.publicUrl}?t=${Date.now()}`);
        }
        galleryUrlsToSave = uploadedGallery; // ถ้ามีการอัปรูปใหม่ จะเอาไปแทนที่รูปเก่า
      }

      // --- ขั้นตอนที่ 2: อัปเดตข้อมูลลงตาราง Products ---
      const { error: dbError } = await supabase
        .from("products")
        .update({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          stock: Number(formData.stock),
          image_url: imageUrlToSave,
          gallery: galleryUrlsToSave // 🌟 อัปเดต array รูปลงคอลัมน์ gallery
        })
        .eq("id", Number(productId)); // 👈 อัปเดตตาม ID ที่เป็นตัวเลข

      // 🚨 ถ้าเซฟลงตารางไม่ผ่าน ให้เด้งบอกทันที!
      if (dbError) {
         alert("❌ บันทึกข้อมูลลงตารางไม่ผ่าน!\nสาเหตุ: " + dbError.message);
         setLoading(false);
         return; // หยุดการทำงานแค่นี้
      }

      // --- ถ้าผ่านหมด ---
      alert("✅ อัปเดตข้อมูลสินค้าและรูปภาพสำเร็จ! 🎉");
      router.push("/admin"); 
      router.refresh(); 

    } catch (error) {
      alert("เกิดข้อผิดพลาดที่ไม่คาดคิด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-yellow-100 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">แก้ไขสินค้า 📝</h1>
        <Link href="/admin" className="text-gray-500 hover:text-yellow-600 font-medium transition">
          กลับไปหน้าจัดการ
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
          <input 
            type="text" required value={formData.name || ""}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า</label>
          <textarea 
            rows="4" value={formData.description || ""}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none resize-y"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="พิมพ์รายละเอียดของสินค้าที่นี่..."
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท) <span className="text-red-500">*</span></label>
            <input 
              type="number" required min="0" value={formData.price || ""}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนสต็อก <span className="text-red-500">*</span></label>
            <input 
              type="number" required min="0" value={formData.stock || ""}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพสินค้าหลัก</label>
          {formData.image_url && !imageFile && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">รูปปัจจุบัน:</p>
              <img src={formData.image_url} alt="Current" className="w-24 h-24 object-cover rounded border" />
            </div>
          )}
          <input 
            type="file" accept="image/*"
            className="w-full border border-gray-300 p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-yellow-500 outline-none"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        {/* 🌟 ส่วนที่เพิ่มขึ้นมาใหม่ สำหรับรูปรายละเอียด (Gallery) 🌟 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพรายละเอียดสินค้า (เลือกได้หลายรูป)</label>
          
          {/* แสดงรูปลายละเอียดเดิม ถ้ายังไม่ได้เลือกรูปใหม่ */}
          {formData.gallery && formData.gallery.length > 0 && galleryFiles.length === 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">รูปรายละเอียดปัจจุบัน:</p>
              <div className="flex gap-2 overflow-x-auto">
                {formData.gallery.map((url, index) => (
                  <img key={index} src={url} alt={`Gallery ${index}`} className="w-16 h-16 object-cover rounded border flex-shrink-0" />
                ))}
              </div>
            </div>
          )}
          
          <input 
            type="file" accept="image/*" multiple // 👈 multiple ทำให้เลือกลากคลุมได้หลายไฟล์
            className="w-full border border-gray-300 p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-yellow-500 outline-none"
            onChange={(e) => setGalleryFiles(Array.from(e.target.files))} // แปลงเป็น Array เพื่อให้วนลูปง่าย
          />
          <p className="text-xs text-gray-400 mt-1">* หากเลือกไฟล์ใหม่ ระบบจะนำไปแทนที่รูปรายละเอียดชุดเดิมทั้งหมด</p>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-[#C5A059] text-white py-3 rounded-lg hover:bg-[#B38E46] transition font-bold disabled:bg-gray-300 disabled:cursor-not-allowed mt-4 shadow-sm"
        >
          {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </form>
    </div>
  );
}