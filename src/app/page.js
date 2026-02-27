"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Palette,
  Gift,
  Brush,
  Coffee,
  Camera
} from "lucide-react";
// ================= FADE-IN COMPONENT =================
function FadeIn({ children, delay = 0, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target); 
          }
        });
      },
      { threshold: 0.1 } 
    );

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
function FloatingStack({ selectedWorkshop, onClose }) {
  const images = selectedWorkshop.images || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setRotation((Math.random() * 10 - 5).toFixed(2));
  }, [currentIndex]);

  const nextImage = () => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">

      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-6xl rounded-3xl z-10">

        {/* Glow background */}
        <div className="absolute -inset-4 bg-gradient-to-br from-[#C6A64A]/20 via-transparent to-[#2c3e35]/20 blur-3xl opacity-40 rounded-[40px]" />

        <div className="relative bg-gradient-to-br from-[#f4f1ea] via-[#f8f6f1] to-[#ece7dd] rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.35)] border border-white/40 p-14 overflow-hidden">

          <button
            className="absolute top-6 right-8 text-gray-400 text-3xl hover:text-[#C6A64A] transition"
            onClick={onClose}
          >
            &times;
          </button>

          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* LEFT */}
            <div className="relative flex flex-col items-center justify-center">

              <button
                onClick={prevImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg hover:scale-110 transition"
              >
                ←
              </button>

              <button
                onClick={nextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg hover:scale-110 transition"
              >
                →
              </button>

              {images.length > 0 && (
                <DraggableCard
                  key={currentIndex}
                  img={images[currentIndex]}
                  rotation={rotation}
                />
              )}

              <div className="mt-10 flex gap-4 justify-center">
                {images.slice(0, 6).map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative w-[70px] h-[70px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                    ${currentIndex === index
                      ? "ring-2 ring-[#C6A64A] scale-110 shadow-md"
                      : "opacity-50 hover:opacity-100"}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div>

              <span className="text-xs tracking-[6px] uppercase text-[#C6A64A] mb-6 block">
                Workshop Experience
              </span>

              <h3 className="text-4xl md:text-5xl font-serif mb-6 leading-tight bg-gradient-to-r from-[#2c3e35] to-[#6b5a3b] bg-clip-text text-transparent">
                {selectedWorkshop.title}
              </h3>

              <div className="w-16 h-[2px] bg-[#C6A64A] mb-6"></div>

              <p className="text-gray-600 leading-relaxed mb-10">
                {selectedWorkshop.fullDesc}
              </p>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C6A64A]/60 to-transparent"></div>
                <span className="text-[10px] tracking-[6px] uppercase text-[#C6A64A]">
                  Experience Details
                </span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#C6A64A]/60 to-transparent"></div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <DetailItem icon={<Clock size={20} />} title="ระยะเวลา" desc="ใช้เวลาประมาณ 2–3 ชั่วโมง" />
                <DetailItem icon={<Palette size={20} />} title="เหมาะสำหรับทุกระดับ" desc="ไม่จำเป็นต้องมีพื้นฐาน" />
                <DetailItem icon={<Gift size={20} />} title="ของที่ระลึก" desc="รับผลงานกลับบ้านได้ทันที" />
                <DetailItem icon={<Brush size={20} />} title="อุปกรณ์ครบครัน" desc="พร้อมผู้สอนดูแลใกล้ชิด" />
                <DetailItem icon={<Coffee size={20} />} title="บรรยากาศผ่อนคลาย" desc="พักผ่อนเชิงศิลปะ" />
                <DetailItem icon={<Camera size={20} />} title="มุมถ่ายภาพ" desc="จัดแสดงผลงานสวยงาม" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function DraggableCard({ img, rotation }) {
  return (
    <div
      className="relative w-[75%] aspect-[3/4] bg-white p-4 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] cursor-grab active:cursor-grabbing transition duration-500 hover:scale-105"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        <Image src={img} alt="" fill className="object-cover" />
      </div>

      <div className="text-center mt-4 text-xs tracking-[4px] text-gray-400 uppercase">
        Bang Sai Archive
      </div>
    </div>
  );
}
function DetailItem({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm border border-[#C6A64A]/20 rounded-xl hover:shadow-[0_4px_20px_rgba(198,166,74,0.15)] transition-all duration-300">
      {icon}
      <div>
        <p className="font-medium text-[#2c3e35]">{title}</p>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

  export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);


  const historyGallery = [
    "/BA.jpg", 
    "/gallery1.jpg", 
    "/gallery2.jpg",
    "/gallery3.jpg",
  ];

  const products = Array.from({ length: 20 }).map((_, index) => ({
    id: index + 1,
    name: `งานศิลปหัตถกรรม ชิ้นที่ ${index + 1}`,
    price: (Math.floor(Math.random() * 50) + 10) * 100,
    category: "สินค้าแนะนำ",
    image: "/shop-item.jpg", 
  }));

  // ✅ เพิ่มตรงนี้เท่านั้น
  const workshops = [
    {
      id: 1,
      title: "งานปั้นตุ๊กตาชาววัง",
      shortDesc:
        "เป็นงานหัตถศิลป์ไทยที่สะท้อนวิถีชีวิต ขนบธรรมเนียม และการแต่งกายของคนในราชสำนักสมัยโบราณ โดยเฉพาะในยุค กรุงรัตนโกสินทร์ ช่างจะปั้นจากดินหรือวัสดุเนื้อละเอียด แล้วตกแต่งรายละเอียดอย่างประณีต ทั้งทรงผม เครื่องประดับ และชุดไทย เพื่อถ่ายทอดภาพลักษณ์ของ “ชาววัง” ให้มีความอ่อนช้อย สง่างาม และสมจริง",
      fullDesc:
        "ผลงานนี้มักแสดงฉากกิจกรรมต่าง ๆ เช่น การรำไทย การทำขนม การละเล่น หรือพิธีการในราชสำนัก จึงมีคุณค่าไม่เพียงด้านความงาม แต่ยังเป็นสื่อการเรียนรู้ทางประวัติศาสตร์และวัฒนธรรมไทย งานปั้นตุ๊กตาชาววังจึงถือเป็นมรดกภูมิปัญญาที่ควรค่าแก่การอนุรักษ์และสืบสานต่อไป ช่างจะใช้ดินเหนียวเนื้อละเอียดในการปั้นขึ้นรูป จากนั้นเก็บรายละเอียดเล็ก ๆ เช่น นิ้วมือ เครื่องประดับ และลวดลายผ้า ก่อนนำไปผึ่งแห้งหรือเผาให้แข็งแรง แล้วจึงลงสีอย่างพิถีพิถัน โดยเน้นโทนสีสุภาพและลวดลายไทยโบราณ เพื่อให้เกิดความสมจริงและอ่อนช้อยเนื้อหาของผลงานมักจำลองกิจกรรมในราชสำนัก เช่น การรำไทย การทำขนมไทย การละเล่นพื้นบ้าน หรือพิธีการสำคัญ จึงไม่เพียงเป็นของตกแต่ง แต่ยังเป็นสื่อสะท้อนประวัติศาสตร์และวัฒนธรรมไทยอย่างมีคุณค่า โดยสรุป งานปั้นตุ๊กตาชาววังเป็นงานศิลป์ที่รวมทั้งความงาม ความละเอียด และภูมิปัญญาไทยไว้ในชิ้นงานเดียว แสดงให้เห็นถึงเอกลักษณ์ความอ่อนช้อยและความประณีตของศิลปะไทยที่ควรค่าแก่การอนุรักษ์และสืบสานต่อไป",
      images: [
        "/1.jpg","/2.jpg","/3.jpg","/19.jpg","/20.jpg","/21.jpg",
        "/22.jpg","/23.jpg","/24.jpg","/25.jpg","/4.jpg",
      ],
    },
    {
      id: 2,
      title: "งานเขียนภาพสีน้ำมัน",
      shortDesc:
        "เป็นศิลปกรรมที่ใช้สีซึ่งมีส่วนผสมของผงสี (Pigment) กับน้ำมันแห้งช้า เช่น น้ำมันลินสีด (Linseed Oil) ทำให้สีมีความเข้มข้น เงางาม และสามารถเกลี่ยผสมสีได้อย่างนุ่มนวล จุดเด่นของสีน้ำมันคือการให้มิติแสงเงา (Light & Shadow) และความลึกของภาพได้อย่างสมจริง",
      fullDesc:
        "กระบวนการทำงานเริ่มจากการเตรียมผ้าใบ (Canvas) รองพื้นด้วยสีรองพื้น (Gesso) จากนั้นร่างภาพ กำหนดโครงสร้าง แสง และองค์ประกอบ แล้วจึงค่อย ๆ ลงสีเป็นชั้น ๆ (Layer) โดยเริ่มจากโทนกว้างก่อน แล้วเก็บรายละเอียดภายหลัง เทคนิคสำคัญ ได้แก่ การผสมสีให้เกิดมิติ การสร้างแสงเงา การใช้พู่กันหรือเกรียงปาดสีเพื่อสร้างพื้นผิว (Texture) และการเคลือบเงา (Varnish) เมื่อผลงานแห้งสนิทเนื่องจากสีน้ำมันแห้งช้า ศิลปินจึงสามารถแก้ไข ปรับเกลี่ย และสร้างความละเอียดได้มากกว่าสีประเภทอื่น ส่งผลให้ผลงานมีความสมจริง มีมิติ และคงทนยาวนาน โดยสรุป งานเขียนภาพสีน้ำมันเป็นศิลปะที่แสดงถึงทักษะ ความอดทน และความประณีตของผู้สร้างสรรค์ อีกทั้งยังสะท้อนอารมณ์ ความรู้สึก และจินตนาการผ่านสี แสง และพื้นผิวได้อย่างลึกซึ้งและทรงพลัง",
      images: [
        "/6.jpg","/7.jpg","/8.jpg","/9.jpg","/10.jpg","/11.jpg",
        "/12.jpg","/13.jpg","/15.jpg","/16.jpg","/17.jpg","/14.jpg",
      ],
    },
  ];

  // ================= CUSTOM SMOOTH SCROLL FUNCTION =================
  const scrollToSection = (e, id) => {
    e.preventDefault();
    setActiveSection(id)

    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // ระยะเผื่อ Navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      // การตั้งค่าความสมูท
      const duration = 1200; // เวลาในการสไลด์ (1200ms = 1.2 วินาที ปรับเพิ่มเพื่อลดความเร็ว)
      const startY = window.scrollY;
      const distance = offsetPosition - startY;
      let startTime = null;

      // ฟังก์ชัน Easing (EaseInOutQuart) ทำให้เลื่อนนุ่มนวล หัวและท้ายชะลอตัว
      const easeInOutQuart = (time, start, change, duration) => {
        time /= duration / 2;
        if (time < 1) return change / 2 * time * time * time * time + start;
        time -= 2;
        return -change / 2 * (time * time * time * time - 2) + start;
      };

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        
        // คำนวณตำแหน่งถัดไป
        const nextY = easeInOutQuart(timeElapsed, startY, distance, duration);
        window.scrollTo(0, nextY);

        // ทำแอนิเมชันต่อไปจนกว่าจะหมดเวลา
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          window.scrollTo(0, offsetPosition); // บังคับให้หยุดตรงจุดหมายพอดีเป๊ะ
        }
      };

      requestAnimationFrame(animation);
    }
  };

return (
    <div className="bg-[#fdfbf7] text-gray-800 font-sans relative overflow-clip">
      
      {/* ================= LIGHTBOX MODAL ================= */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10 transition-opacity duration-300 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 text-4xl hover:text-white transition z-50"
            onClick={() => setSelectedImage(null)}
          >
            &times;
          </button>
          
          <div className="relative w-full max-w-5xl h-full max-h-[85vh]">
            <Image 
              src={selectedImage} 
              alt="Expanded view" 
              fill 
              className="object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="w-full bg-white border-b border-[#e8dcc4] fixed top-0 left-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-[40px] text-[12px] md:text-[15px] text-gray-500">
          <div className="hidden sm:block">เปิดทำการ: อังคาร - อาทิตย์ (08:30 - 16:30 น.)</div>
          <div className="sm:hidden">เปิด 08:30 - 16:30 น.</div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="hover:text-[#b48a3c] transition">เข้าสู่ระบบ</button>
            <span className="text-gray-300">|</span>
            <button className="hover:text-[#b48a3c] transition">สมัครสมาชิก</button>
          </div>
        </div>
      </div>
      <div className="h-[40px]"></div>

      {/* HEADER / LOGO */}
      <div className="bg-white py-8 md:py-12 text-center relative border-b border-[#f2ece0] px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="w-12 md:w-16 h-[2px] bg-[#b48a3c] mx-auto mb-4 md:mb-5 animate-pulse"></div>
          <h1 className="text-3xl md:text-5xl text-[#8c6a2f] tracking-[1px] font-bold mb-3 md:mb-4 font-serif">
            ศูนย์ศิลปาชีพบางไทร
          </h1>
          <p className="text-[14px] md:text-[16px] text-gray-500 tracking-wide font-light">
            แหล่งเรียนรู้และสืบสานภูมิปัญญาทางด้านศิลปหัตถกรรมของไทย
          </p>
        </div>
      </div>

{/* ===== PREMIUM NAVBAR ===== */}
<nav className="bg-white sticky top-[36px] z-40 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-b border-[#f0e7d8]">
  <div className="flex md:justify-center gap-10 text-[14px] md:text-[15px] font-medium max-w-[1200px] mx-auto px-4 h-[56px] items-center">

    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        setActiveSection("home");
      }}
      className={`relative transition ${
        activeSection === "home"
          ? "text-[#C6A64A]"
          : "text-gray-600 hover:text-[#C6A64A]"
      }`}
    >
      หน้าหลัก
      {activeSection === "home" && (
        <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-[#C6A64A]"></span>
      )}
    </a>

    <a
      href="#story"
      onClick={(e) => scrollToSection(e, "story")}
      className={`relative transition ${
        activeSection === "story"
          ? "text-[#C6A64A]"
          : "text-gray-600 hover:text-[#C6A64A]"
      }`}
    >
      ความเป็นมา
      {activeSection === "story" && (
        <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-[#C6A64A]"></span>
      )}
    </a>

    <Link href="/read" className="text-gray-600 hover:text-[#C6A64A] transition">
      เรื่องราว
    </Link>

    <a
      href="#workshop"
      onClick={(e) => scrollToSection(e, "workshop")}
      className={`relative transition ${
        activeSection === "workshop"
          ? "text-[#C6A64A]"
          : "text-gray-600 hover:text-[#C6A64A]"
      }`}
    >
      กิจกรรมเวิร์กชอป
      {activeSection === "workshop" && (
        <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-[#C6A64A]"></span>
      )}
    </a>

    <Link href="/mainpage" className="text-gray-600 hover:text-[#C6A64A] transition">
      ผลิตภัณฑ์ศิลปาชีพ
    </Link>

  </div>
</nav>

      {/* HERO SECTION */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <Image src="/BC.jpg" alt="Bang Sai Hero" fill className="object-cover z-0" priority />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/10 to-[#e9e6de]"></div>
        
        <FadeIn className="relative z-20 text-center text-white px-4 flex flex-col items-center mt-10" delay={200}>
          <span className="text-[#e8dcc4] text-[10px] md:text-sm lg:text-lg tracking-[3px] md:tracking-[4px] mb-3 uppercase">
            Bang Sai Arts and Crafts Centre
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-10 drop-shadow-lg font-serif">
            สืบสานงานศิลป์ แผ่นดินสยาม
          </h2>
        </FadeIn>
      </section>

   {/* ================= WORKSHOP POPUP ================= */}
{selectedWorkshop && (
  <FloatingStack
    selectedWorkshop={selectedWorkshop}
    onClose={() => setSelectedWorkshop(null)}
  />
)}

      {/* ================= STORY SECTION ================= */}
      <section id="story" className="relative py-20 md:py-40 px-4 md:px-6 bg-[#e9e6de] text-[#1f1f1f]">
        
        {/* LEFT SIDE VERTICAL INDICATOR */}
        <FadeIn delay={400} className="hidden lg:flex absolute left-0 -top-[180px] bottom-0 w-[140px] justify-center">
          <div className="relative flex flex-col items-center h-full">
            <div className="w-[2px] flex-1 bg-gradient-to-b from-transparent to-black"></div>
            <div className="py-6 text-[50px] font-serif text-black">๐๑</div>
            <div className="w-[2px] h-[160px] bg-black"></div>
            <div className="py-18 rotate-[-90deg] text-[15px] tracking-[3px] text-black/70">ความเป็นมา</div>
            <div className="w-[2px] flex-1 bg-black"></div>
          </div>
        </FadeIn>

        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 md:gap-24 items-center relative z-10">

          {/* ซ้าย: เนื้อหา */}
          <FadeIn className="order-2 lg:order-1" delay={100}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.20] tracking-tight mb-8 md:mb-10 text-black [text-shadow:3px_3px_0px_rgba(0,0,0,0.15)] md:[text-shadow:5px_5px_0px_rgba(0,0,0,0.22)]">
              จากอุดมคติ <br />
              สู่สถาปัตยกรรมที่มีชีวิต
            </h2>

            <div className="space-y-4 md:space-y-6 text-[16px] md:text-[18px] leading-relaxed md:leading-loose text-[#3a3a3a] font-light max-w-md">
              <p>
                ศูนย์ศิลปาชีพบางไทร เกิดขึ้นจากแนวพระราชดำริในการส่งเสริมศิลปหัตถกรรมไทย ให้เป็นทั้งแหล่งเรียนรู้และพื้นที่แห่งการอนุรักษ์ภูมิปัญญาท้องถิ่น
              </p>
              <p>
                ด้วยความมุ่งหวังให้ศิลปะและวัฒนธรรมไทยไม่เลือนหายไปตามกาลเวลา ศูนย์แห่งนี้จึงเปรียบเสมือน “พิพิธภัณฑ์ที่มีชีวิต” ที่ยังคงมีลมหายใจของช่างฝีมือไทยอยู่ในทุกผลงาน
              </p>
              <p>

                จากอดีตสู่ปัจจุบัน งานฝีมือแต่ละชิ้นสะท้อนเรื่องราว ความประณีต และจิตวิญญาณของแผ่นดินสยามอย่างแท้จริง
              </p>
            </div>

            <Link href="/read" className="inline-block mt-8 md:mt-10 text-xs md:text-sm tracking-widest uppercase border-b border-black/40 pb-1 hover:border-black transition">
              อ่านเพิ่มเติม
            </Link>
          </FadeIn>

          {/* ขวา: รูปภาพ */}
          <FadeIn className="relative flex justify-center lg:justify-end w-full order-1 lg:order-2" delay={300}>
            <div className="relative w-full max-w-[720px] h-[400px] sm:h-[480px] md:h-[560px]">

              <div className="absolute top-0 right-4 md:right-10 text-[#C6A64A] text-lg md:text-xl font-light z-0">+</div>
              <div className="absolute bottom-10 md:bottom-20 left-0 md:left-4 text-[#C6A64A] text-lg md:text-xl font-light z-0">+</div>

              <div className="absolute top-2 md:top-5 left-2 md:left-5 w-[85%] md:w-[80%] h-[280px] sm:h-[350px] md:h-[400px] border border-[#C6A64A]/40 z-0"></div>

              <div className="absolute top-6 md:top-12 right-2 md:right-4 w-[85%] md:w-[80%] h-[85%] md:h-[80%] bg-[#e9e6de]/70 backdrop-blur-md shadow-2xl z-0 border border-white/50"></div>

              {/* รูปหลัก */}
              <div 
                className="absolute left-0 top-4 md:top-10 w-[80%] md:w-[75%] h-[260px] sm:h-[320px] md:h-[400px] shadow-2xl cursor-zoom-in overflow-hidden group z-10 bg-gray-200"
                onClick={() => setSelectedImage("/BB.jpg")}
              >
                <Image src="/BB.jpg" alt="Historical Image" fill className="object-cover group-hover:scale-105 transition duration-1000 ease-in-out" />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition duration-500"></div>
              </div>

              <div className="absolute top-16 md:top-24 -left-4 md:-left-6 -rotate-180 z-20" style={{ writingMode: 'vertical-rl' }}>
                <span className="text-[8px] md:text-[10px] tracking-[4px] md:tracking-[5px] text-gray-500 uppercase font-medium">
                  Archive Collection
                </span>
              </div>

              {/* รูปซ้อน 2 */}
              <div 
                className="absolute bottom-10 md:bottom-6 right-4 md:right-12 w-[160px] sm:w-[200px] md:w-[260px] h-[200px] sm:h-[260px] md:h-[320px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] md:shadow-[0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden border-[4px] md:border-[6px] border-white z-20 group cursor-zoom-in"
                onClick={() => setSelectedImage("/BC.jpg")}
              >
                <Image src="/BC.jpg" alt="Secondary Image" fill className="object-cover group-hover:scale-110 transition duration-700" />
              </div>

              {/* รูปจิ๋ว 3 */}
              <div 
                className="absolute bottom-0 md:bottom-28 -right-2 md:-right-2 w-[80px] sm:w-[100px] md:w-[120px] h-[100px] sm:h-[120px] md:h-[140px] shadow-xl border-[3px] md:border-[4px] border-white z-30 overflow-hidden group cursor-zoom-in rotate-6 hover:rotate-0 transition-transform duration-500 bg-gray-200"
                onClick={() => setSelectedImage("/B1.jpg")}
              >
                <Image src="/B1.jpg" alt="Detail Image" fill className="object-cover group-hover:scale-110 transition duration-500" />
              </div>

              {/* แคปชั่น */}
              <div className="absolute bottom-0 md:bottom-4 left-2 md:left-6 bg-white/95 backdrop-blur-sm p-3 md:p-4 shadow-xl z-30 border-l-[3px] border-[#C6A64A] max-w-[160px] md:max-w-[220px]">
                 <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-[#C6A64A] font-bold mb-1">Fig. 01</p>
                 <p className="text-[10px] md:text-xs text-gray-700 font-serif leading-relaxed">
                   สถาปัตยกรรมและงานฝีมือที่ได้รับการอนุรักษ์อย่างวิจิตรบรรจง
                 </p>
              </div>

              {/* ตราประทับ */}
              <div className="absolute -top-2 md:-top-4 right-8 md:right-16 w-14 h-14 md:w-20 md:h-20 z-30 bg-[#2c3e35] rounded-full flex flex-col items-center justify-center text-[#C6A64A] shadow-lg border border-[#C6A64A]/30">
                 <span className="text-[6px] md:text-[8px] tracking-[1px] md:tracking-[2px] uppercase mb-0 md:mb-1">Est.</span>
                 <span className="text-sm md:text-lg font-serif leading-none">2527</span>
              </div>

            </div>
          </FadeIn>

        </div>
      </section>

      {/* ================= WORKSHOP SECTIONห้ามลบ ================= */}
      <section id="workshop" className="relative py-16 md:py-24 bg-[#FAF7F2]">
        
        {/* LEFT SIDE VERTICAL INDICATOR */}
        <FadeIn delay={200} className="hidden lg:flex absolute left-0 -top-[180px] bottom-0 w-[140px] justify-center">
         <div className="relative flex flex-col items-center h-full">
            <div className="w-[2px] flex-1 bg-gradient-to-b from-transparent to-black"></div>
            <div className="py-6 text-[50px] font-serif text-black">๐๒</div>
            <div className="w-[2px] h-[160px] bg-black"></div>
            <div className="py-18 rotate-[-90deg] text-[15px] tracking-[3px] text-black/70">กิจกรรมเวิร์กชอป</div>
            <div className="w-[2px] flex-1 bg-black"></div>
          </div>
        </FadeIn>

        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
          <FadeIn className="flex flex-col items-center text-center mb-12 md:mb-20">
             <div className="h-[30px] md:h-[50px] w-[1px] bg-gradient-to-b from-transparent to-[#C6A64A] mb-4 md:mb-6"></div>
             <h3 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.20] tracking-tight mb-8 md:mb-10 text-black [text-shadow:3px_3px_0px_rgba(0,0,0,0.15)] md:[text-shadow:5px_5px_0px_rgba(0,0,0,0.22)]">
              กิจกรรมเวิร์กชอป
              </h3>
             <p className="text-sm md:text-base text-gray-500 max-w-lg leading-relaxed">
               สัมผัสประสบการณ์ตรงในการสร้างสรรค์งานศิลป์ และสืบสานภูมิปัญญาไทยด้วยมือของคุณเอง
             </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {workshops.map((workshop, i) => (
              <FadeIn key={i} delay={i * 200} className="group cursor-pointer">
                <div className="relative h-[280px] sm:h-[350px] md:h-[400px] overflow-hidden mb-4 md:mb-6 rounded-sm shadow-md group-hover:shadow-xl transition-all duration-500">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-500 z-10"></div>
                  <Image src={`/workshop${i+1}.jpg`} alt={workshop.title} fill className="object-cover group-hover:scale-105 transition duration-1000" />
                  <div className="absolute top-3 md:top-4 left-3 md:left-4 bg-white/90 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold tracking-widest text-[#2c3e35] uppercase z-20 shadow-sm">
                    Workshop 0{i+1}
                  </div>
                </div>
                
                <div className="text-center px-2">
                  <h4 className="text-xl md:text-2xl font-serif text-[#8c6a2f] mb-2 md:mb-3">{workshop.title}</h4>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4 md:mb-6 font-light">{workshop.shortDesc}</p>
                  <span
  onClick={() => setSelectedWorkshop(workshop)}
  className="inline-block text-[10px] md:text-xs font-semibold text-[#2c3e35] tracking-widest uppercase border-b border-[#2c3e35]/30 pb-1 group-hover:text-[#C6A64A] group-hover:border-[#C6A64A] transition-colors cursor-pointer"
>
  รายละเอียดเพิ่มเติม →
</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#111815] text-gray-400 py-12 md:py-16 text-center text-sm border-t border-gray-800 px-4">
        <div className="max-w-xl mx-auto mb-6">
          <Image src="/logo-signature.png" alt="Signature" width={100} height={35} className="mx-auto mb-4 md:mb-6 opacity-30" />
          <h2 className="text-xl md:text-2xl font-serif text-[#C6A64A] mb-3 md:mb-4 tracking-wider">PATTANA GEMS x ศูนย์ศิลปาชีพ</h2>
          <p className="font-light tracking-wide text-gray-500 text-xs md:text-sm">ร่วมสืบสานและต่อยอดงานหัตถกรรมไทยให้ก้าวไกลสู่สากล</p>
        </div>
        <p className="text-[10px] md:text-[12px] uppercase tracking-widest text-gray-600 mt-8 md:mt-12">© 2026 Bang Sai Arts & Crafts Centre. All rights reserved.</p>
      </footer>

    </div>
  );
}