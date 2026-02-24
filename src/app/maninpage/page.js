"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation"; 

export default function ShopPage() {
  const router = useRouter(); 

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- เพิ่ม State สำหรับ Sidebar เมนูด้านซ้าย ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- เพิ่ม State สำหรับตะกร้าสินค้า (Cart) ---
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  // --- ดึงข้อมูลตะกร้าที่เคยเซฟไว้ใน localStorage มาแสดง ---
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart data:", error);
      }
    }
    setIsCartLoaded(true); 
  }, []);

  // --- อัปเดตตะกร้าลง localStorage อัตโนมัติ ---
  useEffect(() => {
    if (isCartLoaded) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, isCartLoaded]);

  // --- ฟังก์ชันจัดการตะกร้า ---
  const updateCartItemQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeCartItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    router.push('/checkout');
  };

  // คำนวณจำนวนสินค้าและราคารวมในตะกร้า
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- ดึงข้อมูลสินค้าเดิม ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("id", { ascending: false });

        if (error) throw error;
        
        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error("ดึงข้อมูลสินค้าล้มเหลว:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-[#fdfbf7] min-h-screen font-sans text-gray-800 relative overflow-x-hidden">
      
      {/* =========================================
          SIDEBAR MENU (เมนูด้านซ้าย - สำหรับหน้าหลัก/ทั่วไป)
      ========================================= */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      <aside className={`fixed top-0 left-0 h-full w-80 bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* ส่วนหัวเมนู */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-[#C5A059] font-serif text-lg tracking-widest">MENU</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-[#C5A059] transition-colors p-2 -mr-2 rounded-full hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* ส่วนเนื้อหาเมนู */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-white">
          
          {/* 1. เมนูหลัก (ใส่ไอคอนเพิ่มความน่าสนใจ) */}
          <div>
            <div className="text-[10px] text-gray-400 tracking-[0.2em] mb-4 font-semibold uppercase">Navigation</div>
            <nav className="flex flex-col gap-2">
              <div onClick={() => { /* router.push('/'); */ setIsSidebarOpen(false); }} className="group flex items-center gap-4 text-gray-700 hover:text-[#C5A059] cursor-pointer py-2 transition-all rounded-lg hover:bg-gray-50 px-2 -mx-2">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#C5A059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span className="font-medium">หน้าแรก</span>
              </div>
              <div onClick={() => { /* router.push('/products'); */ setIsSidebarOpen(false); }} className="group flex items-center gap-4 text-gray-700 hover:text-[#C5A059] cursor-pointer py-2 transition-all rounded-lg hover:bg-gray-50 px-2 -mx-2">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#C5A059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                <span className="font-medium">สินค้าทั้งหมด</span>
              </div>
            </nav>
          </div>

          <hr className="border-gray-100" />

          {/* 2. หมวดหมู่สินค้า (จำลองขึ้นมาเพื่อเติมพื้นที่) */}
          <div>
            <div className="text-[10px] text-gray-400 tracking-[0.2em] mb-4 font-semibold uppercase">Categories</div>
            <nav className="flex flex-col gap-4 text-[15px] text-gray-600 pl-3 border-l-2 border-gray-100">
              <div className="hover:text-[#C5A059] cursor-pointer transition-colors flex justify-between items-center group">
                <span>งานเซรามิก</span>
                <span className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pr-2">&rarr;</span>
              </div>
              <div className="hover:text-[#C5A059] cursor-pointer transition-colors flex justify-between items-center group">
                <span>งานไม้ประยุกต์</span>
                <span className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pr-2">&rarr;</span>
              </div>
              <div className="hover:text-[#C5A059] cursor-pointer transition-colors flex justify-between items-center group">
                <span>งานจักสาน</span>
                <span className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pr-2">&rarr;</span>
              </div>
              <div className="hover:text-[#C5A059] cursor-pointer transition-colors flex justify-between items-center group">
                <span>ของที่ระลึก</span>
                <span className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pr-2">&rarr;</span>
              </div>
            </nav>
          </div>

          <hr className="border-gray-100" />

          {/* 3. ข้อมูลอื่นๆ */}
          <div>
            <div className="text-[10px] text-gray-400 tracking-[0.2em] mb-4 font-semibold uppercase">Information</div>
            <nav className="flex flex-col gap-3 text-[14px] text-gray-500 pl-3 border-l-2 border-gray-100">
              <a href="#" className="hover:text-[#C5A059] transition-colors">เกี่ยวกับศูนย์ศิลปาชีพฯ</a>
              <a href="#" className="hover:text-[#C5A059] transition-colors">วิธีการสั่งซื้อและจัดส่ง</a>
              <a href="#" className="hover:text-[#C5A059] transition-colors">ติดต่อเรา</a>
            </nav>
          </div>

        </div>

        {/* ส่วนท้ายเมนู (Footer) เติมเต็มพื้นที่ด้านล่างสุด */}
        <div className="p-6 border-t border-gray-100 bg-[#faf9f7]">
          <div className="text-center text-xs text-gray-400 mb-4 font-serif tracking-widest">
            MUSEUM SHOP
          </div>
          <div className="flex justify-center gap-6 text-gray-400">
            <svg className="w-5 h-5 hover:text-[#C5A059] cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            <svg className="w-5 h-5 hover:text-[#C5A059] cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </div>
        </div>
      </aside>

      {/* =========================================
          CART SIDEBAR (ตะกร้าสินค้าด้านขวา)
      ========================================= */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsCartOpen(false)}
      />

      <aside className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Cart Header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-xl font-sans text-[#C5A059] tracking-wider">ตะกร้าของคุณ</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-gray-50/50">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              <p>ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm relative transition-all hover:shadow-md">
                <h3 className="font-bold text-gray-800 mb-2 leading-tight pr-6">{item.name}</h3>
                
                <div className="text-sm text-gray-500 space-y-1 mb-4">
                  <p>จำนวน: {item.quantity} ชิ้น</p>
                  <p>ราคา: {Number(item.price).toLocaleString()} บาท</p>
                  <p className="text-[#C5A059] font-medium pt-1">รวม: {(item.price * item.quantity).toLocaleString()} บาท</p>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9 w-24">
                    <button onClick={() => updateCartItemQuantity(item.id, -1)} className="w-8 h-full hover:bg-gray-50 text-gray-600 flex items-center justify-center transition-colors">-</button>
                    <span className="flex-1 text-center font-medium text-sm text-gray-800">{item.quantity}</span>
                    <button onClick={() => updateCartItemQuantity(item.id, 1)} className="w-8 h-full hover:bg-gray-50 text-gray-600 flex items-center justify-center transition-colors">+</button>
                  </div>
                  <button onClick={() => removeCartItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="ลบสินค้า">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Cart Footer / Checkout */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-5">
              <span className="text-gray-600 font-medium">ราคารวมทั้งหมด</span>
              <span className="font-bold text-xl text-[#1a2b4b]">
                ฿{totalCartPrice.toLocaleString()}
              </span>
            </div>
            <button 
              onClick={handleCheckout} 
              className="w-full bg-[#BCA88E] hover:bg-[#A9937E] text-white font-medium py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg transition-all"
            >
              ชำระเงิน
            </button>
          </div>
        )}
      </aside>

      {/* =========================================
          NAVBAR (แถบด้านบน)
      ========================================= */}
      <nav className="bg-white border-b border-[#e8dcc4] sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1300px] mx-auto px-6 h-[70px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 👇 เพิ่มไอคอนสามขีด (Hamburger Menu) ตรงนี้ 👇 */}
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-800 hover:text-[#C5A059] transition-colors mr-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>

            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-[0.15em] text-[#C5A059] drop-shadow-sm">MUSEUM SHOP</h1>
            <span className="text-gray-300 hidden md:inline">|</span>
            <span className="text-sm font-medium tracking-wide text-gray-500 hidden md:inline">ช้อปปิ้งออนไลน์</span>
          </div>
          <div className="flex items-center gap-6">
            
            {/* 👇 เปลี่ยนตรงนี้เป็นไอคอนรูปคน (User) 👇 */}
            <Link href="/" className="text-gray-800 hover:text-[#C5A059] transition-colors" title="บัญชีผู้ใช้">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </Link>
            
            {/* --- ไอคอนตะกร้าบน Navbar --- */}
            <button onClick={() => setIsCartOpen(true)} className="relative hover:text-[#C5A059] transition-colors text-gray-800" title="ตะกร้าสินค้า">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#C5A059] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================
          MAIN CONTENT (เนื้อหาหลัก)
      ========================================= */}
      <section className="py-16 px-6">
        <div className="max-w-[1300px] mx-auto">
          <div className="mb-12 flex justify-between items-end border-b border-[#e8dcc4] pb-4">
            <div>
              <h2 className="text-3xl font-sans text-gray-900 font-bold">สินค้าทั้งหมด</h2>
              <p className="text-gray-500 mt-2 text-sm">เลือกชมงานฝีมือสุดประณีตจากช่างศิลป์</p>
            </div>
            <div className="text-sm text-gray-500 hidden sm:block">
              พบ {products.length} รายการ
            </div>
          </div>

          {/* ส่วนแสดงผลข้อมูล */}
          {loading ? (
            <div className="text-center py-20 text-gray-500 font-medium text-lg">
              กำลังโหลดสินค้า... ⏳
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl font-medium mb-2">ยังไม่มีสินค้าในระบบ</p>
              <p className="text-sm">ลองเพิ่มสินค้าจากระบบหลังบ้านดูนะครับ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map((product) => (
                <Link 
                  href={`/ProductDetail/${product.id}`} 
                  key={product.id} 
                  className="bg-white group cursor-pointer border border-[#f0ebd8] hover:border-[#C6A64A] transition-all duration-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md flex flex-col h-[320px]"
                >
                  <div className="h-[180px] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={product.image_url || "/shop-item.jpg"} 
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-4 text-center flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                        สินค้าแนะนำ
                      </p>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm line-clamp-2">
                        {product.name}
                      </h4>
                    </div>
                    <div>
                      <p className="text-[#C6A64A] font-bold mb-3">
                        ฿ {product.price?.toLocaleString()}
                      </p>
                      <div className="w-full py-2 bg-transparent border border-[#C6A64A] text-[#C6A64A] rounded-full text-xs font-semibold group-hover:bg-[#C6A64A] group-hover:text-white transition">
                        ดูรายละเอียด
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] text-gray-400 py-8 border-t border-[#333]">
        <div className="max-w-[1300px] mx-auto px-6 text-center text-xs">
          <p>© 2024 ศูนย์ศิลปาชีพบางไทร. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}