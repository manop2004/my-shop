"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // 1. เพิ่ม useRouter
import { useState } from 'react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter(); // 2. ประกาศตัวแปร router
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🌟 ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    // ลบ Cookie โดยตั้งวันหมดอายุให้เป็นอดีต
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    // เด้งกลับไปหน้า Login (เช็ค URL หน้า Login ของคุณให้ตรงนะครับ)
    router.push("/loginadmin");
  };

  const getMenuClass = (path) => {
    const isActive = pathname === path || (path === '/admin' && pathname.startsWith('/admin/product'));
    return isActive
      ? "flex items-center px-6 py-3 bg-gradient-to-r from-yellow-100/50 to-transparent text-yellow-700 border-l-4 border-yellow-500 shadow-sm transition-all" 
      : "flex items-center px-6 py-3 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 border-l-4 border-transparent transition-all duration-200"; 
  };

  return (
    <div className="flex h-screen bg-[#fdfbf7] font-sans overflow-hidden">
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar (เหมือนเดิม) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-yellow-100 shadow-xl transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="h-20 flex items-center px-8 border-b border-yellow-50">
          <span className="text-2xl mr-2"></span>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-yellow-600">
            MUSEUM SHOP
          </span>
        </div>
        <nav className="mt-6">
          <ul>
            <li><Link href="/admin" className={getMenuClass('/admin')} onClick={() => setIsMobileMenuOpen(false)}><span className="mr-3 text-lg">📦</span> สินค้าทั้งหมด</Link></li>
            <li><Link href="/admin/orders" className={getMenuClass('/admin/orders')} onClick={() => setIsMobileMenuOpen(false)}><span className="mr-3 text-lg">📜</span> ออเดอร์</Link></li>
            <li><Link href="/admin/members" className={getMenuClass('/admin/members')} onClick={() => setIsMobileMenuOpen(false)}><span className="mr-3 text-lg">👥</span> สมาชิก</Link></li>
            <li><Link href="/admin/reports" className={getMenuClass('/admin/reports')} onClick={() => setIsMobileMenuOpen(false)}><span className="mr-3 text-lg">📊</span> รายงาน</Link></li>
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-yellow-100 flex items-center justify-between px-4 md:px-6 shadow-sm z-30">
          
          <button className="md:hidden p-2 text-yellow-700" onClick={() => setIsMobileMenuOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            {/* 🌟 ปุ่มออกจากระบบ */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              ออกจากระบบ
            </button>

            <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white shadow-sm font-bold border-2 border-white">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#fdfbf7]">
          {children}
        </main>
      </div>
    </div>
  );
}