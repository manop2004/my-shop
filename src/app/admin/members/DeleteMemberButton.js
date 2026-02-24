"use client";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export default function DeleteMemberButton({ id }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmDelete = confirm("คุณแน่ใจหรือไม่ที่จะลบสมาชิกท่านนี้?");
    if (!confirmDelete) return;

    // คำสั่งลบสมาชิกจากตาราง members
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", id);

    if (error) {
      alert("เกิดข้อผิดพลาดในการลบ: " + error.message);
    } else {
      alert("ลบสมาชิกเรียบร้อยแล้ว!");
      router.refresh(); // รีเฟรชตารางใหม่
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-500 hover:text-red-700 font-medium">
      ลบ
    </button>
  );
}