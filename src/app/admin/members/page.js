export const dynamic = "force-dynamic"; // กันระบบจำข้อมูลเก่า เพื่อให้อัปเดตทันที

import { supabase } from "@/utils/supabase";
import Link from "next/link";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const shortId = (id) => (id ? String(id).slice(0, 8) : "-");

const getInitials = (name) => {
  if (!name) return "U";
  const parts = String(name).trim().split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

function Avatar({ full_name, avatar_url }) {
  if (avatar_url) {
    return (
      <img
        src={avatar_url}
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover border border-yellow-200"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#FFF7D6] border border-yellow-200 flex items-center justify-center text-yellow-900 font-bold text-sm">
      {getInitials(full_name)}
    </div>
  );
}

export default async function MembersPage() {
  const { data: members, error } = await supabase
    .from("members")
    .select("id, full_name, email, password, created_at, avatar_url")
    .order("created_at", { ascending: false });

  if (error)
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-md shadow-sm">
          เกิดข้อผิดพลาด: {error.message}
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
      {/* 🌟 ส่วนหัวข้อ */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF37] drop-shadow-sm">
          👥 รายชื่อสมาชิกทั้งหมด
        </h1>
        <p className="text-gray-500 mt-2 font-medium text-sm md:text-base">
          ข้อมูลสมาชิกที่สมัครเข้ามาในระบบ
        </p>
      </div>

      {/* 📱 มือถือ: โปรไฟล์แบบการ์ด */}
      <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
        {members?.map((m) => (
          <div
            key={m.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200 flex flex-col gap-3"
          >
            {/* Header: avatar + name/email */}
            <div className="flex items-center gap-3 border-b border-yellow-100 pb-3">
  <Avatar full_name={m.full_name} avatar_url={m.avatar_url} />
  <div className="min-w-0 flex-1">
    <div className="font-bold text-gray-800 truncate">
      {m.full_name || "ไม่มีชื่อ"}
    </div>
  </div>

  {/* ✅ เอา email มาแทน ID */}
  <span className="text-[11px] text-gray-500 max-w-[160px] truncate text-right">
    {m.email || "ไม่ระบุอีเมล"}
  </span>
</div>

            {/* Body: password + created + avatar url */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">
                  รหัสผ่าน
                </div>
                <div className="font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 break-all">
                  {m.password || "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">
                  วันที่สมัครสมาชิก
                </div>
                <div className="text-gray-600 text-xs font-medium">
                  {formatDate(m.created_at)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
                รูปโปรไฟล์
              </div>
              {m.avatar_url ? (
                <a
                  href={m.avatar_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-yellow-700 underline break-all"
                >
                  {m.avatar_url}
                </a>
                
              ) : (
                <div className="text-xs text-gray-400">NULL</div>
              )}
            </div>

            {/* ถ้าคุณมีหน้าแก้ไขอยู่แล้ว เปลี่ยนลิงก์ให้ตรง route ของคุณได้ */}
            <div className="pt-2">
              
            </div>
          </div>
        ))}

        {members?.length === 0 && (
          <div className="p-10 text-center bg-white rounded-xl border border-yellow-100 text-gray-500 shadow-sm">
            <span className="text-4xl block mb-2 grayscale opacity-50">👤</span>
            <p className="text-sm">ยังไม่มีข้อมูลสมาชิกในระบบ</p>
          </div>
        )}
      </div>

      {/* 💻 คอม: ตารางโปรไฟล์ */}
      <div className="hidden md:block overflow-hidden bg-white rounded-xl shadow-sm border border-yellow-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#FFFDF5] border-b-2 border-yellow-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-yellow-800">โปรไฟล์</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">อีเมล</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">รหัสผ่าน</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">วันที่สมัครสมาชิก</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">รูปโปรไฟล์</th>
              
            </tr>
          </thead>

          <tbody className="divide-y divide-yellow-100">
            {members?.map((m) => (
              <tr key={m.id} className="hover:bg-[#FFFDF5] transition-colors duration-200">
                {/* Profile */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar full_name={m.full_name} avatar_url={m.avatar_url} />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {m.full_name || "ไม่มีชื่อ"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* ID */}
                <td className="px-6 py-4 text-gray-700">
  {m.email || "ไม่ระบุอีเมล"}
</td>

                {/* Password */}
                <td className="px-6 py-4 text-gray-600">
                  <span className="bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 font-medium break-all">
                    {m.password || "—"}
                  </span>
                </td>

                {/* Created */}
                <td className="px-6 py-4 text-gray-500 font-medium">
                  {formatDate(m.created_at)}
                </td>

                {/* Avatar URL */}
                <td className="px-6 py-4">
                  {m.avatar_url ? (
                      <a
                        href={m.avatar_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-2 rounded-md border border-yellow-200 bg-[#FFF7D6] text-yellow-900 text-xs font-medium hover:bg-[#FFEFBC]"
                      >
                        ดูรูป
                            </a>
                                ) : (
                              <span className="text-gray-400">ไม่มีรูป</span>
                      )}
                </td>

                
              </tr>
            ))}

            {members?.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-gray-400 bg-gray-50/50">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-5xl mb-3">👤</span>
                    <p className="text-lg text-gray-500 font-medium">ยังไม่มีข้อมูลสมาชิกในระบบ</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}