export const dynamic = "force-dynamic";

import { supabase } from "@/utils/supabase";
import Link from "next/link";

export default async function AdminInquiriesPage({ searchParams }) {
  const page = Number(searchParams?.page) || 1;
  const itemsPerPage = 10;

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data: inquiries, error, count } = await supabase
    .from("inquiries")
    .select("id, created_at, full_name, email, topic, message", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-md shadow-sm">
          เกิดข้อผิดพลาด: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* หัวข้อ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF37] drop-shadow-sm">
          ✉️ ข้อความสอบถาม
        </h1>

        <Link
          href="/admin"
          className="bg-white border border-yellow-200 text-yellow-700 px-5 py-2.5 rounded-lg shadow-sm hover:bg-yellow-50 transition-all font-medium whitespace-nowrap"
        >
          ← กลับหน้าสินค้า
        </Link>
      </div>

      {/* 📱 Mobile Card */}
      <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
        {inquiries?.map((x) => (
          <div key={x.id} className="bg-white p-4 rounded-xl shadow-sm border border-yellow-100 flex flex-col gap-3">
            <div>
              <h3 className="font-bold text-gray-800 text-base">{x.full_name}</h3>
              <p className="text-xs text-gray-500">{x.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                {x.created_at ? new Date(x.created_at).toLocaleString("th-TH") : "-"}
              </p>
            </div>

            <div className="text-sm">
              <p className="text-gray-700 font-medium">
                หัวข้อ: <span className="font-normal text-gray-600">{x.topic}</span>
              </p>
              <p className="text-gray-500 text-xs mt-2 bg-gray-50 p-2 rounded-md whitespace-pre-wrap">
                {x.message}
              </p>
            </div>
          </div>
        ))}

        {inquiries?.length === 0 && (
          <div className="p-10 text-center bg-white rounded-xl border border-yellow-100 text-gray-500 shadow-sm">
            <span className="text-4xl block mb-2 grayscale opacity-50">📩</span>
            ยังไม่มีข้อความ
          </div>
        )}
      </div>

      {/* 💻 Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-yellow-100 mb-6 w-full overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#fcf8f2] border-b border-yellow-100 whitespace-nowrap">
            <tr>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[14%]">เวลา</th>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[16%]">ชื่อ</th>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[18%]">อีเมล</th>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[16%]">หัวข้อ</th>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[36%]">ข้อความ</th>
            </tr>
          </thead>

          <tbody key={page} className="divide-y divide-gray-100">
            {inquiries?.map((x) => (
              <tr key={x.id} className="hover:bg-yellow-50/40 transition-colors">
                <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                  {x.created_at ? new Date(x.created_at).toLocaleString("th-TH") : "-"}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800 whitespace-nowrap">
                  {x.full_name}
                </td>
                <td className="px-4 py-4 text-gray-600">{x.email}</td>
                <td className="px-4 py-4 text-gray-700">{x.topic}</td>
                <td className="px-4 py-4 text-gray-500">
                  <div className="line-clamp-2 whitespace-pre-wrap" title={x.message}>
                    {x.message}
                  </div>
                </td>
              </tr>
            ))}

            {inquiries?.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center bg-gray-50/30">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-5xl mb-4 grayscale opacity-50">📩</span>
                    <p className="text-lg text-gray-500 font-medium">ยังไม่มีข้อความในระบบ</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-2">
          {page > 1 ? (
            <Link
              href={`?page=${page - 1}`}
              className="px-4 py-2 bg-white border border-[#D4AF37] text-[#D4AF37] rounded-lg shadow-sm hover:bg-yellow-50 transition-colors font-medium text-sm"
            >
              &laquo; ก่อนหน้า
            </Link>
          ) : (
            <div className="px-4 py-2 border border-gray-200 text-gray-300 rounded-lg shadow-sm bg-gray-50 cursor-not-allowed font-medium text-sm">
              &laquo; ก่อนหน้า
            </div>
          )}

          <span className="text-gray-600 font-medium text-sm">
            หน้า {page} จาก {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`?page=${page + 1}`}
              className="px-4 py-2 bg-white border border-[#D4AF37] text-[#D4AF37] rounded-lg shadow-sm hover:bg-yellow-50 transition-colors font-medium text-sm"
            >
              ถัดไป &raquo;
            </Link>
          ) : (
            <div className="px-4 py-2 border border-gray-200 text-gray-300 rounded-lg shadow-sm bg-gray-50 cursor-not-allowed font-medium text-sm">
              ถัดไป &raquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}