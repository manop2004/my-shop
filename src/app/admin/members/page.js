export const dynamic = "force-dynamic"; // กันระบบจำข้อมูลเก่า เพื่อให้อัปเดตทันที

import { supabase } from '@/utils/supabase';

export default async function MembersPage() {
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return (
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
        <p className="text-gray-500 mt-2 font-medium text-sm md:text-base">ข้อมูลสมาชิกที่สมัครเข้ามาในระบบ</p>
      </div>

      {/* 📱 1. มุมมองแบบ "การ์ด" สำหรับจอมือถือ (ซ่อนในจอคอม) */}
      <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
        {members?.map((member) => (
          <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200 flex flex-col gap-3">
            
            {/* ส่วนหัวการ์ด: ชื่อ (ใช้ full_name) และ อีเมล */}
            <div className="border-b border-yellow-100 pb-3">
              {member.full_name ? (
                <h3 className="font-bold text-gray-800 text-base truncate">{member.full_name}</h3>
              ) : (
                <h3 className="font-medium text-gray-400 text-sm italic truncate">ไม่มีชื่อ</h3>
              )}
              <p className="text-gray-500 text-xs truncate mt-0.5">{member.email || 'ไม่ระบุอีเมล'}</p>
            </div>
            
            {/* ส่วนรายละเอียดการ์ด: รหัสผ่าน และ วันที่ */}
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-[11px] text-gray-500 block uppercase tracking-wider mb-0.5">รหัสผ่าน</span>
                {member.password ? (
                  <span className="font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">{member.password}</span>
                ) : (
                  <span className="text-gray-400 italic bg-gray-50 px-2 py-1 rounded border border-gray-100 text-xs">🔒 เข้ารหัสไว้</span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-gray-500 block uppercase tracking-wider mb-0.5">วันที่สมัคร</span>
                <span className="text-gray-600 text-xs font-medium">
                  {new Date(member.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* กรณีไม่มีข้อมูลสมาชิก (มือถือ) */}
        {members?.length === 0 && (
          <div className="p-10 text-center bg-white rounded-xl border border-yellow-100 text-gray-500 shadow-sm">
            <span className="text-4xl block mb-2 grayscale opacity-50">👤</span>
            <p className="text-sm">ยังไม่มีข้อมูลสมาชิกในระบบ</p>
          </div>
        )}
      </div>

      {/* 💻 2. มุมมองแบบ "ตาราง" สำหรับหน้าจอคอมพิวเตอร์ (ซ่อนในมือถือ) */}
      <div className="hidden md:block overflow-hidden bg-white rounded-xl shadow-sm border border-yellow-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#FFFDF5] border-b-2 border-yellow-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-yellow-800">ชื่อสมาชิก / อีเมล</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">รหัสผ่าน</th>
              <th className="px-6 py-4 font-semibold text-yellow-800">วันที่สมัคร</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-100">
            {members?.map((member) => (
              <tr key={member.id} className="hover:bg-[#FFFDF5] transition-colors duration-200">
                
                {/* คอลัมน์ชื่อ (ใช้ full_name) และอีเมล */}
                <td className="px-6 py-4">
                  {member.full_name ? (
                    <div className="font-medium text-gray-800 text-base">{member.full_name}</div>
                  ) : (
                    <div className="font-medium text-gray-400 text-sm italic">ไม่มีชื่อ</div>
                  )}
                  <div className="text-gray-500 text-xs mt-0.5">{member.email || 'ไม่ระบุอีเมล'}</div>
                </td>
                
                {/* คอลัมน์รหัสผ่าน */}
                <td className="px-6 py-4 text-gray-600">
                  {member.password ? (
                    <span className="bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 font-medium tracking-wide">{member.password}</span>
                  ) : (
                    <span className="text-gray-400 italic bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100 text-xs shadow-sm">
                      🔒 เข้ารหัสไว้
                    </span>
                  )}
                </td>
                
                {/* คอลัมน์วันที่สมัคร */}
                <td className="px-6 py-4 text-gray-500 font-medium">
                  {new Date(member.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
            
            {/* กรณีไม่มีข้อมูลสมาชิก (คอมพิวเตอร์) */}
            {members?.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-16 text-center text-gray-400 bg-gray-50/50">
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