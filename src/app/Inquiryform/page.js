"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase";

const MAX_MESSAGE_CHARS = 200;

const InquiryPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ จำกัดข้อความไม่เกิน 200 ตัวอักษร
    if (name === "message") {
      setFormData((prev) => ({
        ...prev,
        message: value.slice(0, MAX_MESSAGE_CHARS),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ กันหลุดอีกชั้น เผื่อมีการ paste/แก้ค่าแปลกๆ
    const trimmedMessage = (formData.message || "").slice(0, MAX_MESSAGE_CHARS);

    setIsLoading(true);

    try {
      const { error } = await supabase.from("inquiries").insert([
        {
          full_name: formData.name,
          email: formData.email,
          topic: formData.topic,
          message: trimmedMessage,
        },
      ]);

      if (error) throw error;

      alert("ส่งข้อความเรียบร้อยแล้ว! เราจะติดต่อกลับหาคุณโดยเร็วที่สุด");

      setFormData({
        name: "",
        email: "",
        topic: "สนใจผลงานเซรามิกประยุกต์",
        message: "",
      });
      e.target.reset();
    } catch (error) {
      console.error("Error sending data:", error.message);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-12 font-sans">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">สอบถามข้อมูล</h2>
          <p className="text-sm text-gray-500 mt-2">ทิ้งข้อความไว้ แล้วเราจะติดต่อกลับโดยเร็วที่สุด</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
              placeholder="ระบุชื่อของคุณ"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
              placeholder="อีเมล"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              สิ่งที่ต้องการสอบถาม
            </label>
            <select
              name="topic"
              required
              value={formData.topic}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-base appearance-none"
              onChange={handleChange}
            >
              <option value="" disabled hidden>
                เลือกหัวข้อสอบถาม
              </option>
              <option value="สนใจผลงานเซรามิกประยุกต์">สนใจผลงานเซรามิกประยุกต์</option>
              <option value="สอบถามราคา/ค่าจัดส่ง">สอบถามราคา/ค่าจัดส่ง</option>
              <option value="สั่งทำพิเศษ (Custom)">สั่งทำพิเศษ (Custom)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              name="message"
              rows="4"
              required
              maxLength={MAX_MESSAGE_CHARS} // ✅ จำกัดจากตัว input ด้วย
              value={formData.message}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
              placeholder="เขียนรายละเอียดที่นี่..."
              onChange={handleChange}
            ></textarea>

            {/* ✅ ตัวนับจำนวนตัวอักษร */}
            <div className="mt-1 text-right text-xs text-gray-400">
              {formData.message.length}/{MAX_MESSAGE_CHARS}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 font-bold rounded-[30px] shadow-lg active:scale-[0.98] transition-all mt-4 ${
              isLoading ? "bg-gray-300 cursor-not-allowed" : "bg-[#FFEE91] hover:bg-[#f7e366] text-black"
            }`}
          >
            {isLoading ? "กำลังส่งข้อมูล..." : "ส่งข้อความสอบถาม"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← ย้อนกลับไปหน้าเดิม
          </button>
        </div>
      </div>
    </div>
  );
};

export default InquiryPage;