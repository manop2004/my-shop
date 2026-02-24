export const dynamic = "force-dynamic";

import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import DeleteButton from './DeleteButton';

export default async function AdminDashboard({ searchParams }) {
  const params = await searchParams; 
  const page = Number(params?.page) || 1; 
  const itemsPerPage = 5; 
  
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const { data: products, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('id', { ascending: true })
    .range(from, to); 

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  if (error) return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded-md shadow-sm">
        เกิดข้อผิดพลาด: {error.message}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full">
      
      {/* ส่วนหัวข้อและปุ่มเพิ่มสินค้า */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF37] drop-shadow-sm">
          ✨ ระบบจัดการหลังบ้าน
        </h1>
        <Link 
          href="/admin/add-product" 
          className="bg-gradient-to-r from-[#D4AF37] to-yellow-500 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all font-medium flex items-center gap-2 whitespace-nowrap"
        >
          <span className="text-xl">+</span> เพิ่มสินค้าใหม่
        </Link>
      </div>

      {/* 📱 1. มุมมองแบบ "การ์ด" สำหรับจอมือถือ */}
      <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
        {products?.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-yellow-100 flex flex-col gap-3 relative">
            <div className="flex gap-4 items-start">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-lg border border-gray-100 shadow-sm" />
              ) : (
                <div className="w-20 h-20 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400">ไม่มีรูป</div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-base line-clamp-1">{product.name}</h3>
                <p className="text-[#D4AF37] font-semibold text-sm mb-1">฿{product.price?.toLocaleString()}</p>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium inline-block text-center ${
                  product.stock > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {product.stock > 0 ? `สต็อก: ${product.stock} ชิ้น` : 'หมด!'}
                </span>
              </div>
            </div>
            
            <p className="text-gray-500 text-xs line-clamp-2 bg-gray-50 p-2 rounded-md">{product.description || 'ไม่มีรายละเอียดสินค้า'}</p>
            
            {/* 🌟 ปุ่มจัดการ (แก้ให้กดง่ายขึ้น และไม่โดนบัง) 🌟 */}
            <div className="flex items-center gap-3 mt-2 pt-3 border-t border-gray-100 relative z-10">
              <Link 
                href={`/admin/product/${product.id}`} 
                className="flex-1 text-center text-yellow-700 font-medium bg-yellow-50 px-4 py-2.5 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors text-sm"
              >
                แก้ไข
              </Link>
              {/* ดัน DeleteButton ให้มีพื้นที่กดกว้างขึ้น */}
              <div className="flex-1 flex justify-center items-center [&>*]:w-full">
                <DeleteButton id={product.id} />
              </div>
            </div>
          </div>
        ))}
        {products?.length === 0 && (
          <div className="p-10 text-center bg-white rounded-xl border border-yellow-100 text-gray-500 shadow-sm">
            <span className="text-4xl block mb-2 grayscale opacity-50">📦</span>
            ยังไม่มีข้อมูลสินค้า
          </div>
        )}
      </div>

      {/* 💻 2. มุมมองแบบ "ตาราง" สำหรับหน้าจอคอมพิวเตอร์ */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-yellow-100 mb-6 w-full overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#fcf8f2] border-b border-yellow-100 whitespace-nowrap">
            <tr>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[15%]">รูปภาพ</th>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[20%]">ชื่อสินค้า</th>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[30%]">รายละเอียด</th>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[12%]">ราคา</th>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[10%]">สต็อก</th>
              <th className="px-4 py-4 font-semibold text-gray-800 w-[13%]">จัดการ</th>
            </tr>
          </thead>
          <tbody key={page} className="divide-y divide-gray-100">
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-yellow-50/40 transition-colors group">
                <td className="px-4 py-4">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-14 h-14 object-cover rounded-lg border border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-14 h-14 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400">ไม่มีรูป</div>
                  )}
                </td>
                <td className="px-4 py-4 font-medium text-gray-800">{product.name}</td>
                <td className="px-4 py-4 text-gray-500 text-sm">
                  <div className="line-clamp-2" title={product.description}>{product.description || '-'}</div>
                </td>
                <td className="px-4 py-4 font-semibold text-[#D4AF37]">฿{product.price?.toLocaleString()}</td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block text-center ${
                    product.stock > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {product.stock > 0 ? `${product.stock} ชิ้น` : 'หมด!'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/product/${product.id}`} className="text-yellow-700 hover:text-[#D4AF37] font-medium transition-colors bg-yellow-50 px-3 py-1.5 rounded-md border border-yellow-200 hover:bg-yellow-100 shadow-sm text-sm">แก้ไข</Link>
                    <DeleteButton id={product.id} />
                  </div>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center bg-gray-50/30">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-5xl mb-4 grayscale opacity-50">📦</span>
                    <p className="text-lg text-gray-500 font-medium">ยังไม่มีข้อมูลสินค้าในระบบ</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ปุ่มเลื่อนหน้า */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-2">
          {page > 1 ? (
            <Link href={`?page=${page - 1}`} className="px-4 py-2 bg-white border border-[#D4AF37] text-[#D4AF37] rounded-lg shadow-sm hover:bg-yellow-50 transition-colors font-medium text-sm">
              &laquo; ก่อนหน้า
            </Link>
          ) : (
            <div className="px-4 py-2 border border-gray-200 text-gray-300 rounded-lg shadow-sm bg-gray-50 cursor-not-allowed font-medium text-sm">
              &laquo; ก่อนหน้า
            </div>
          )}

          <span className="text-gray-600 font-medium text-sm">หน้า {page} จาก {totalPages}</span>

          {page < totalPages ? (
            <Link href={`?page=${page + 1}`} className="px-4 py-2 bg-white border border-[#D4AF37] text-[#D4AF37] rounded-lg shadow-sm hover:bg-yellow-50 transition-colors font-medium text-sm">
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