"use client";

import { supabase } from '@/utils/supabase';
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link"; 

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams(); 
  
  // --- States ---
  const [product, setProduct] = useState(null); 
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(""); 
  const [gallery, setGallery] = useState([]); 
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // State สำหรับเปิด/ปิด Sidebar เมนูซ้าย
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- เพิ่ม State สำหรับตะกร้าสินค้า (Cart) ด้านขวา ---
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false); 
  
  // --- State สำหรับ Popup แจ้งเตือนเพิ่มลงตะกร้า ---
  const [showToast, setShowToast] = useState(false);

  // 🌟 เพิ่ม State สำหรับ User 🌟
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");

  // 🌟 ดึงข้อมูล User และชื่อเมื่อโหลดหน้า 🌟
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        let name = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
        
        if (!name) {
          try {
            const { data } = await supabase
              .from('members')
              .select('full_name') 
              .eq('email', session.user.email)
              .single();
            if (data && data.full_name) name = data.full_name;
          } catch (error) {
            console.log("Could not fetch name from members");
          }
        }
        setUserName(name || session.user.email);
      }
    };
    fetchUser();
  }, []);

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

  // --- ดึงข้อมูลสินค้าจาก Supabase ---
  useEffect(() => {
    async function fetchProduct() {
      try {
        const productId = params?.id;
        if (!productId) return;

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', Number(productId))
          .maybeSingle(); 

        if (data) {
          setProduct(data); 
          setSelectedImage(data.image_url); 
          setGallery(data.gallery && data.gallery.length > 0 ? data.gallery : [data.image_url]);
        } else {
          // เพิ่ม stock: 5 เข้าไปใน mock เผื่อไว้ทดสอบ
          const mockProduct = {
            id: 1,
            name: "ชื่อเฉพาะ (จากป้ายด้านล่าง): มีการระบุชื่อ \"Siamese Coqu Culture Crafts\"",
            price: 2500,
            stock: 5, 
            image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop", 
            description: "พานประดับมุก (บนแท่น): เป็นพานทรงแปดเหลี่ยม 2 ขนาด ภายในบุด้วยผ้าสีแดง สำหรับใช้ใส่ของมงคลหรือเครื่องใช้สำคัญ\n\nกล่องไม้หรือตลับประดับมุก (ด้านหน้า): กล่องทรงสี่เหลี่ยมผืนผ้าประดับลวดลายดอกไม้และเถาวัลย์อย่างละเอียด"
          };
          setProduct(mockProduct);
          setSelectedImage(mockProduct.image_url);
          setGallery([mockProduct.image_url, mockProduct.image_url, mockProduct.image_url, mockProduct.image_url]);
        }
      } catch (error) {
        console.error("Catch Error:", error);
      }
    }
    fetchProduct();
  }, [params?.id]);

  // 🌟 บังคับไม่ให้กดเกินสต็อก และไม่ให้กดต่ำกว่า 1
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };
  const decreaseQuantity = () => { 
    if (quantity > 1) {
      setQuantity((prev) => prev - 1); 
    }
  };

  // 🌟 ฟังก์ชันเช็กก่อนเปิดตะกร้า 🌟
  const handleOpenCart = () => {
    if (user) {
      setIsCartOpen(true);
    } else {
      alert("กรุณาเข้าสู่ระบบก่อนใช้งานตะกร้าสินค้านะครับ");
      router.push("/login");
    }
  };
  
  // --- ฟังก์ชันจัดการตะกร้า ---
  const handleAddToCart = () => {
    // 🌟 เช็กการล็อกอิน: ถ้ายังไม่ล็อกอินให้ไปหน้า Login ทันที
    if (!user) {
      alert("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้านะครับ");
      router.push("/login");
      return;
    }

    // 🌟 เช็กสต็อก: ถ้าสินค้าหมดให้หยุดทันที
    if (!product || product.stock === 0) return;

    // 🌟 เช็กจำนวน: รวมกับของที่มีในตะกร้าแล้วเกินสต็อกไหม?
    const existingItem = cartItems.find((item) => item.id === product.id);
    let totalQuantityWanted = quantity;
    if (existingItem) {
      totalQuantityWanted += existingItem.quantity;
    }

    if (totalQuantityWanted > product.stock) {
      alert(`ไม่สามารถเพิ่มลงตะกร้าได้! มีสินค้าในสต็อกเพียง ${product.stock} ชิ้น`);
      return;
    }

    setCartItems((prev) => {
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    
    // เปลี่ยนจากเปิดหน้าตะกร้า เป็นการโชว์ Popup ชั่วคราว
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000); // Popup จะหายไปเองใน 2 วินาที
  };

  const updateCartItemQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          // 🌟 เช็กสต็อกในหน้าตะกร้า: ถ้ากด + เกินสต็อกให้เด้งเตือน
          if (delta > 0 && item.stock !== undefined && newQty > item.stock) {
             alert(`มีสินค้าในสต็อกเพียง ${item.stock} ชิ้น`);
             return item;
          }
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

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center text-[#C5A059]">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-white text-zinc-800 pb-28 md:pb-0 relative overflow-x-hidden">
      
      {/* --- Popup แจ้งเตือนเมื่อเพิ่มสินค้าลงตะกร้า --- */}
      <div 
        className={`fixed top-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-[100] transition-all duration-300 flex items-center gap-3 ${showToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
      >
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        <span className="font-medium text-sm">เพิ่มสินค้าลงตะกร้าแล้ว</span>
      </div>

      {/* --- Sidebar Overlay --- */}
      <div 
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      {/* =========================================
          SIDEBAR MENU (เมนูด้านซ้าย - ปรับดีไซน์ใหม่)
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

        {/* ส่วนลิงก์ต่างๆ (ไถขึ้นลงได้ถ้ายาว) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-white">
          
          {/* เมนูหลัก */}
          <nav className="flex flex-col gap-1">
            <div onClick={() => { router.push('/'); setIsSidebarOpen(false); }} className="group flex items-center gap-4 text-gray-700 hover:text-[#C5A059] cursor-pointer py-3 transition-all rounded-lg hover:bg-gray-50 px-2 -mx-2">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#C5A059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span className="font-medium">หน้าแรก</span>
            </div>
            <div onClick={() => { router.back(); setIsSidebarOpen(false); }} className="group flex items-center gap-4 text-gray-700 hover:text-[#C5A059] cursor-pointer py-3 transition-all rounded-lg hover:bg-gray-50 px-2 -mx-2">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-[#C5A059] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              <span className="font-medium">สินค้าทั้งหมด</span>
            </div>
          </nav>

          <hr className="border-gray-100" />

          {/* ส่วนแสดงสินค้าที่กำลังดูอยู่ */}
          <div>
            <div className="text-[10px] text-gray-400 tracking-[0.2em] mb-4 font-semibold uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
              กำลังเปิดดู
            </div>
            <div className="bg-[#faf9f7] border border-[#f0eade] rounded-xl p-3 flex gap-3 items-start shadow-sm">
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-white">
                <img src={product.image_url} alt="thumbnail" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#C5A059] font-medium text-sm leading-snug line-clamp-3" title={product.name}>
                  {product.name}
                </p>
              </div>
            </div>
          </div>
          
          {/* ข้อมูลอื่นๆ ให้ Sidebar ดูไม่โล่ง */}
          <div className="mt-2">
            <div className="text-[10px] text-gray-400 tracking-[0.2em] mb-3 font-semibold uppercase">Information</div>
            <nav className="flex flex-col gap-4 text-[15px] text-gray-500 pl-2 border-l-2 border-gray-100">
              <a href="#" className="hover:text-[#C5A059] transition-colors">เกี่ยวกับศูนย์ศิลปาชีพฯ</a>
              <a href="#" className="hover:text-[#C5A059] transition-colors">เงื่อนไขการจัดส่ง</a>
              <a href="#" className="hover:text-[#C5A059] transition-colors">ติดต่อสอบถาม</a>
            </nav>
          </div>

        </div>

        {/* ส่วนท้ายเมนู (Footer) */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="text-center text-xs text-gray-400 mb-4 font-serif tracking-wide">
            MUSEUM SHOP
          </div>
          <div className="flex justify-center gap-5 text-gray-400">
            <svg className="w-5 h-5 hover:text-[#C5A059] cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            <svg className="w-5 h-5 hover:text-[#C5A059] cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </div>
        </div>
      </aside>
      
      {/* --- Cart Overlay --- */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* =========================================
          CART SIDEBAR (ตะกร้าสินค้าด้านขวา)
      ========================================= */}
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

      {/* --- Header --- */}
      <header className="bg-white py-4 md:py-6 sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center relative h-8">
          <div className="flex items-center gap-4 text-gray-800">
            <button onClick={() => setIsSidebarOpen(true)} className="hover:text-[#C5A059] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap">
            <h1 className="text-xl md:text-2xl font-serif font-semibold tracking-[0.25em] text-[#C5A059] drop-shadow-sm">MUSEUM SHOP</h1>
          </div>
          <div className="flex items-center gap-4 text-gray-800">
            {/* 🌟 แสดงชื่อผู้ใช้ และลิงก์ไปหน้า Profile/Login */}
            {user && <span className="text-sm text-gray-600 font-medium hidden md:inline">{userName}</span>}
            <Link href={user ? "/profile" : "/login"} className="hover:text-[#C5A059] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </Link>
            
            {/* --- ไอคอนตะกร้า + ตัวเลขแจ้งเตือน (สีทองตามแบบ) --- */}
            <button onClick={handleOpenCart} className="relative hover:text-[#C5A059] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              {totalCartItems > 0 && user && (
                <span className="absolute -top-1.5 -right-2 bg-[#C5A059] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          
          {/* ฝั่งซ้าย: รูปภาพ */}
          <div className="w-full md:w-1/2">
            <div 
              className="relative aspect-square bg-white border border-gray-100 flex items-center justify-center overflow-hidden rounded-xl shadow-sm mb-4"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img src={selectedImage} alt={product.name} className="object-cover w-full h-full transition-transform duration-150"
                style={{ transform: isZoomed ? "scale(2.5)" : "scale(1)", transformOrigin: `${mousePosition.x}% ${mousePosition.y}%` }}
              />
            </div>
            {/* 🌟 แสดงรูปย่อย (รวมรูปหลักไว้รูปแรก) 🌟 */}
            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
              
              {/* 1. ปุ่มสำหรับ "รูปหลัก" (รูปแรกเสมอ) */}
              {product?.image_url && (
                <button
                  onClick={() => setSelectedImage(product.image_url)} 
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === product.image_url ? "border-[#C5A059] opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={product.image_url}
                    alt="Main Product"
                    className="object-cover w-full h-full"
                  />
                </button>
              )}

              {/* 2. แสดงรูปรายละเอียด (Gallery) ถัดมา */}
              {gallery && gallery.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === imgUrl ? "border-[#C5A059] opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`gallery-${index}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ฝั่งขวา: รายละเอียด */}
          <div className="w-full md:w-1/2 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-[#1E293B] leading-tight">{product.name}</h1>
            
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-[#1a2b4b]">฿{Number(product.price).toLocaleString()}</span>
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* 🌟 ส่วนแก้ไข: ระบุจำนวนที่ต้องการ และ แสดงสต็อก 🌟 */}
            <div className="mb-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-gray-700 font-medium">ระบุจำนวนที่ต้องการ</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-10 w-32">
                  <button 
                    onClick={decreaseQuantity} 
                    disabled={quantity <= 1 || product?.stock === 0}
                    className={`w-10 h-full text-xl flex items-center justify-center transition-colors ${
                      quantity <= 1 || product?.stock === 0 ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-bold text-sm bg-white flex items-center justify-center">
                    {product?.stock === 0 ? 0 : quantity}
                  </div>
                  <button 
                    onClick={increaseQuantity} 
                    disabled={quantity >= product?.stock || product?.stock === 0}
                    className={`w-10 h-full text-xl flex items-center justify-center transition-colors ${
                      quantity >= product?.stock || product?.stock === 0 ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* ข้อความแสดงสต็อก */}
              <div className="mt-2 text-right text-sm">
                {product?.stock > 0 ? (
                  <span className="text-gray-500">มีสินค้าทั้งหมด <span className="text-[#C5A059] font-medium">{product.stock}</span> ชิ้น</span>
                ) : (
                  <span className="text-red-500 font-medium">สินค้าหมด</span>
                )}
              </div>
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* ปุ่มสอบถาม/แชร์ */}
            <div className="grid grid-cols-2 gap-0 border-b border-gray-100 mb-8">
              <button className="flex flex-col items-center gap-2 py-4 border-r border-gray-100 text-gray-500 hover:text-[#C5A059]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <span className="text-sm">สอบถามเพิ่มเติม</span>
              </button>
              <button className="flex flex-col items-center gap-2 py-4 text-gray-500 hover:text-[#C5A059]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                <span className="text-sm">แชร์ผลงาน</span>
              </button>
            </div>

            {/* รายละเอียดผลงาน */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                รายละเอียดผลงาน
              </h3>
              <div className="text-gray-600 text-[15px] leading-relaxed bg-[#f9fafb] p-6 rounded-2xl whitespace-pre-line border border-gray-50">
                {product.description}
              </div>
            </div>

            {/* 🌟 ปุ่มเพิ่มลงตะกร้า (หน้าจอ Desktop) 🌟 */}
            <button 
              onClick={handleAddToCart} 
              disabled={product?.stock === 0}
              className={`hidden md:flex font-medium h-14 w-full rounded-xl items-center justify-center gap-2 transition-all text-lg ${
                product?.stock === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-[#BCA88E] hover:bg-[#A9937E] text-white shadow-lg'
              }`}
            >
              {product?.stock === 0 ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
            </button>
          </div>
        </div>
      </main>

      {/* 🌟 ปุ่มเพิ่มลงตะกร้า (Mobile Footer) 🌟 */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t p-4 z-40 pb-8">
        <button 
          onClick={handleAddToCart} 
          disabled={product?.stock === 0}
          className={`w-full h-[50px] rounded-full font-bold transition-colors text-[16px] flex justify-center items-center ${
            product?.stock === 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-[#A38A6A] hover:bg-[#8B735A] text-white shadow-md'
          }`}
        >
          {product?.stock === 0 ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
        </button>
      </div>

    </div>
  );
}