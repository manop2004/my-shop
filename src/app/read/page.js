"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ใช้ FadeIn ตัวเดิม
function FadeIn({ children, delay = 0, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function ReadMore() {
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // จุดที่ 1: เพิ่มเวลาหน่วง 500ms ให้โหลด Asset นิ่งก่อน
    const timer = setTimeout(() => setIsEntering(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#fdfbf7] min-h-screen text-gray-800 font-sans relative">
      
      {/* 1. ENTRANCE TRANSITION OVERLAY - คงไว้ 2500ms ช้าๆ สมู้ทๆ */}
      <div 
        className={`fixed inset-0 bg-black z-[9999] pointer-events-none transition-opacity 
          duration-[2500ms] ease-in-out 
          ${isEntering ? 'opacity-100' : 'opacity-0'}`} 
      />

      {/* TOP NAV */}
      <div className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#e8dcc4] px-6 py-4 flex justify-between items-center shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#8c6a2f] rotate-45"></div>
          <span className="text-[#8c6a2f] font-sans text-lg font-bold">ศูนย์ศิลปาชีพบางไทร</span>
        </Link>
        <Link href="/" className="text-sm tracking-widest uppercase hover:text-[#b48a3c] transition flex items-center gap-2">
          ปิดหน้าอ่าน <span>✕</span>
        </Link>
      </div>

      {/* BACKGROUND (พื้นหลังกระดานเทา ที่คุณชอบ) */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
          <Image src="/BC.jpg" alt="bg" fill className="object-cover grayscale" />
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-10 px-4 flex flex-col items-center z-10">
        <FadeIn delay={800} className="text-center mb-8">
            <span className="text-[#b48a3c] text-xs tracking-[5px] uppercase font-bold block mb-4 border-b border-[#b48a3c] inline-block pb-1">
              Est. 2527
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-medium leading-[1.20] tracking-tight mb-6 text-black [text-shadow:3px_3px_0px_rgba(0,0,0,0.15)]">
                จากอุดมคติ <br /> <span className="text-[#8c6a2f]">สู่ประวัติศาสตร์ที่มีชีวิต</span>
            </h1>
            <div className="w-16 h-[1px] bg-[#b48a3c] mx-auto"></div>
        </FadeIn>
      </section>

      {/* MAIN CONTENT AREA */}
      <section className="relative z-10 px-4 flex flex-col items-center pb-24">
        
        {/* ================= กล่องพื้นหลังสีขาว (เฉพาะส่วนที่ 1 และ 2) ================= */}
        <FadeIn delay={1200} className="w-full max-w-5xl bg-white/95 backdrop-blur-md p-8 md:p-16 lg:p-24 shadow-2xl border border-white/50 mb-16">
            
            {/* ส่วนที่ 1: เกริ่นนำ */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-light mb-16 relative">
                <div className="absolute -top-10 -left-6 text-8xl text-[#e8dcc4] opacity-30 font-sans font-bold pointer-events-none">๑</div>
                
                <p className="mb-6 indent-12 text-justify">
                    ศูนย์ศิลปาชีพบางไทร โรงเรียนฝึกเกษตรกรและผู้ด้อยโอกาส สู่การเป็นช่างศิลป์ไทย สร้างรายได้เลี้ยงชีพพร้อมสืบสานภูมิปัญญาไทย มรดกล้ำค่าในสมเด็จพระพันปีหลวง
                    สมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง ทรงติดตามเคียงข้างพระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร 
                    เสด็จพระราชดำเนินเยี่ยมเยียนราษฎรในทุกหนแห่งทั่วประเทศ ดำเนินพระราชกรณียกิจในโครงการต่างๆ เพื่อบำบัดทุกข์และบำรุงสุขแก่พสกนิกรของพระองค์ สร้างความเป็นอยู่ที่ดีขึ้นแก่ปวงชนชาวไทยทุกหมู่เหล่า ตลอดหลายทศวรรษที่ผ่านมา...
                </p>
            </div>

            {/* ส่วนที่ 2: ประวัติการก่อตั้ง */}
            <div>
                <h3 className="text-2xl font-sans text-[#8c6a2f] mb-6 flex items-center gap-4 border-b border-gray-100 pb-4">
                    <span className="w-2 h-2 bg-[#b48a3c] rotate-45"></span>
                    จุดกำเนิดแห่งพระมหากรุณาธิคุณ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div>
                        <p className="mb-4 text-justify font-light text-gray-700 leading-relaxed">
                            ศูนย์ศิลปาชีพบางไทร ก่อตั้งขึ้นเมื่อวันที่ <strong>๗ ธันวาคม พ.ศ. ๒๕๒๗</strong> ด้วยพระมหากรุณาธิคุณของ <strong>สมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง</strong>
                        </p>
                        <p className="mb-4 text-justify font-light text-gray-700 leading-relaxed">
                            พระองค์ทรงมีพระราชดำริให้จัดตั้งศูนย์แห่งนี้ขึ้นบนพื้นที่กว่า ๑,๐๐๐ ไร่ ในอำเภอบางไทร จังหวัดพระนครศรีอยุธยา ใกล้กับพระราชวังบางปะอิน มีวัตถุประสงค์ในการรับเกษตรกรรวมถึงลูกหลานที่มีฐานะยากจนจากจังหวัดต่างๆ 
                            เข้ามาฝึกอบรมในด้านศิลปาชีพสาขาต่างๆ โดยไม่มีค่าใช้จ่าย เป็นสถานที่ท่องเที่ยวและแหล่งเรียนรู้ ที่เปิดให้ประชาชนทั่วไปเข้ามาเยี่ยมชมผลงานของช่างศิลป์ การจัดแสดงด้านศิลปหัตถกรรมของไทย 
                            และเลือกซื้อผลิตภัณฑ์จากอาจารย์และนักเรียนของศูนย์ศิลปาชีพได้ 
                        </p>
                    </div>
                    {/* กรอบรูปประวัติศาสตร์ */}
                    <div className="relative p-2 bg-white border border-gray-200 shadow-md">
                        <div className="relative h-64 overflow-hidden border border-gray-100">
                            <Image src="/B6.jpg" fill className="object-cover grayscale hover:grayscale-0 transition duration-700" alt="Foundation" />
                        </div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center mt-2">Historical Archive • 2527</p>
                    </div>
                </div>
            </div>
        </FadeIn>


        {/* ================= ส่วนที่ไม่มีพื้นหลัง (ส่วนที่ 3, 4 และปุ่ม) ================= */}
        <FadeIn delay={1400} className="w-full max-w-5xl">
            
{/* ส่วนที่ 3: แผนที่และการเดินทาง */}
            <div className="mb-24">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-sans text-[#8c6a2f] mb-4 flex items-center justify-center gap-4">
                        <span className="w-8 h-[1px] bg-[#b48a3c]"></span>
                        การเดินทางและที่ตั้ง
                        <span className="w-8 h-[1px] bg-[#b48a3c]"></span>
                    </h3>
                    <p className="text-sm tracking-widest text-gray-500 uppercase font-light">
                        Location & Information
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white/70 backdrop-blur-md border border-[#e8dcc4] shadow-xl">
                    
                    {/* ฝั่งซ้าย: แผนที่ (Google Maps) */}
                    <div className="relative w-full h-[350px] lg:h-[450px] p-3 md:p-4 bg-white border-r border-[#e8dcc4]/50">
                        {/* กรอบด้านในแผนที่ */}
                        <div className="relative w-full h-full bg-gray-100 overflow-hidden border border-gray-200">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1626.584332015081!2d100.51997865969867!3d14.154236415635845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e27b003d4ff85b%3A0x7352a68d6a487ccc!2z4Lio4Li54LiZ4Lii4LmM4Lio4Li04Lil4Lib4Liy4LiK4Li14Lie4Lia4Liy4LiH4LmE4LiX4Lij!5e0!3m2!1sen!2sth!4v1772137822730!5m2!1sen!2sth"
                                width="100%" 
                                height="100%" 
                                style={{ border: 0, filter: "grayscale(25%) contrast(1.05)" }} // ปรับลดสีให้เข้ากับโทนเว็บ
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0"
                            ></iframe>
                        </div>
                    </div>

                    {/* ฝั่งขวา: ข้อมูลติดต่อ */}
                    <div className="flex flex-col justify-center px-8 py-10 lg:px-12 lg:py-12">
                        <h4 className="text-2xl font-sans text-[#111] mb-8 relative">
                            ศูนย์ศิลปาชีพบางไทร
                            <div className="absolute -left-6 top-2 w-2 h-2 bg-[#8c6a2f] rotate-45 hidden lg:block"></div>
                        </h4>
                        
                        <div className="space-y-8 text-gray-700 font-light">
                            {/* ที่อยู่ */}
                            <div>
                                <p className="text-[#b48a3c] text-xs tracking-[2px] uppercase font-bold mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Address
                                </p>
                                <p className="leading-relaxed text-[15px] pl-6">
                                    หมู่ที่ ๔ ตำบลช้างใหญ่ อำเภอบางไทร<br />
                                    จังหวัดพระนครศรีอยุธยา ๑๓๒๙๐
                                </p>
                            </div>

                            {/* เวลาเปิด-ปิด */}
                            <div>
                                <p className="text-[#b48a3c] text-xs tracking-[2px] uppercase font-bold mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Opening Hours
                                </p>
                                <p className="leading-relaxed text-[15px] pl-6">
                                    เปิดทำการ: อังคาร - อาทิตย์ (หยุดวันจันทร์)<br />
                                    เวลา ๐๘:๓๐ - ๑๖:๓๐ น.
                                </p>
                            </div>

                            {/* ติดต่อ */}
                            <div>
                                <p className="text-[#b48a3c] text-xs tracking-[2px] uppercase font-bold mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    Contact
                                </p>
                                <p className="leading-relaxed text-[15px] pl-6">
                                    โทรศัพท์: ๐๓๕-๓๖๖-๐๙๒
                                </p>
                            </div>
                        </div>
                        
                        {/* ปุ่มเปิดในแผนที่ */}
                        <div className="mt-10 pt-8 border-t border-gray-200 border-dashed">
                            <a 
                                href="https://maps.app.goo.gl/3QWzQjP9w9bY2qWw5" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-2 px-6 py-3 border border-[#2c3e35] text-[#2c3e35] text-xs tracking-widest uppercase hover:bg-[#2c3e35] hover:text-white transition-colors duration-300"
                            >
                                ขอเส้นทาง (Get Directions)
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
</FadeIn>

{/* ส่วนที่ 4: MODERN EDITORIAL GALLERY - Bold & Luxury Style */}
            <div className="mt-40 mb-32 w-full max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="relative">
                        <span className="text-[#b48a3c] font-bold tracking-[0.5em] text-xs uppercase mb-2 block"></span>
                        <h3 className="text-4xl md:text-5xl font-sans text-[#111] leading-none">
                            ศิลป์แห่ง <span className="text-[#b48a3c] italic">ความทรงจำ</span>
                        </h3>
                    </div>
                    <div className="text-right border-r-2 border-[#b48a3c] pr-6">
                        <p className="text-gray-400 text-sm font-light"></p>
                    </div>
                </div>

                {/* Grid แบบ Asymmetric (สลับใหญ่เล็ก) */}
                <div className="grid grid-cols-12 gap-4 md:gap-8">
                    {/* ภาพหลัก ใหญ่ฝั่งซ้าย */}
                    <div className="col-span-12 md:col-span-7 group relative h-[500px] overflow-hidden bg-[#111]">
                        <Image src="/B5.jpg" fill className="object-cover opacity-80 group-hover:opacity-100 transition duration-1000 group-hover:scale-105" alt="Hero" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                            <p className="text-[#b48a3c] text-xs tracking-[4px] font-bold mb-2"></p>
                            <h4 className="text-2xl font-sans tracking-wide"></h4>
                        </div>
                    </div>

                    {/* สองภาพเล็กฝั่งขวา */}
                    <div className="col-span-12 md:col-span-5 flex flex-col gap-4 md:gap-8">
                        <div className="relative h-[234px] group overflow-hidden border-t-4 border-[#b48a3c]">
                            <Image src="/B9.jpg" fill className="object-cover group-hover:scale-110 transition duration-700" alt="Small 1" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-500"></div>
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] text-[#b48a3c] font-bold tracking-widest uppercase"></div>
                        </div>
                        <div className="relative h-[234px] group overflow-hidden">
                            <Image src="/B8.jpg" fill className="object-cover group-hover:scale-110 transition duration-700" alt="Small 2" />
                            <div className="absolute inset-0 border-[1px] border-white/30 m-4 group-hover:m-2 transition-all duration-500"></div>
                            <div className="absolute bottom-4 right-4 text-white text-right">
                                <p className="text-[10px] opacity-70 italic font-sans"></p>
                                <p className="text-sm tracking-widest font-bold"></p>
                            </div>
                        </div>
                    </div>

                    {/* ภาพยาวแนวนอนด้านล่าง */}
                    <div className="col-span-12 relative h-[300px] mt-4 group overflow-hidden">
                        <Image src="/BB.jpg" fill className="object-cover transition duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0" alt="Wide" />
                        <div className="absolute inset-0 bg-[#b48a3c]/10 mix-blend-multiply group-hover:bg-transparent transition duration-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[calc(100%-4rem)] h-[calc(100%-4rem)] border border-white/40 flex items-center justify-center">
                                <span className="text-white text-3xl md:text-5xl font-sans italic tracking-[0.2em] opacity-80 group-hover:opacity-100 transition duration-500"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Quote & Button - ออกแบบใหม่ให้แพงขึ้น */}
                <div className="mt-40 text-center relative">
                    {/* วงกลมตกแต่งสีทองจางๆ */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-[#b48a3c]/10 rounded-full -z-10 animate-pulse"></div>
                    
                    <div className="inline-block mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-[1px] bg-[#b48a3c]"></div>
                            <p className="text-[#b48a3c] text-xs tracking-[5px] uppercase font-bold"></p>
                            <div className="w-12 h-[1px] bg-[#b48a3c]"></div>
                        </div>
                    </div>
                    
            <h2 className="text-3xl md:text-5xl font-sans text-[#111] leading-relaxed mb-10 max-w-4xl mx-auto">
                "สถาปัตยกรรมทุกชิ้น งานปั้นทุกตัว และผ้าทอทุกผืน ไม่ใช่แค่สิ่งของ <br/>
                <span className="text-[#8c6a2f] italic">แต่เป็นบันทึกทางประวัติศาสตร์ที่ยังมีชีวิต</span>"
            </h2>

                    <Link href="/" className="group relative inline-flex items-center gap-6">
                        <span className="text-sm tracking-[5px] uppercase font-bold text-[#111] group-hover:text-[#b48a3c] transition-colors">
                            กลับสู่หน้าหลัก
                        </span>
                        <div className="w-16 h-16 rounded-full border border-[#b48a3c] flex items-center justify-center group-hover:bg-[#b48a3c] transition-all duration-500">
                             <svg className="w-6 h-6 text-[#b48a3c] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                             </svg>
                        </div>
                    </Link>
                </div>
            </div>
      </section>
    </div>
  );
}