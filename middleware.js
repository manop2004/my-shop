import { NextResponse } from 'next/server';

export function middleware(request) {
  // ดึงคุกกี้ชื่อ admin_token
  const adminToken = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  // 🛡️ ถ้า URL ขึ้นต้นด้วย /admin
  if (pathname.startsWith('/admin')) {
    
    // 🚩 ถ้าไม่มี "บัตรผ่าน" (admin_token)
    if (adminToken !== 'true') {
      // เตะกลับไปหน้า Login
      // ⚠️ เช็ค URL หน้า Login ของคุณให้ดีว่าคือ /login หรือ /
      return NextResponse.redirect(new URL('/loginadmin', request.url));
    }
  }

  return NextResponse.next();
}

// ⚙️ ตั้งค่า Matcher ให้ดักทุกหน้าใน admin
export const config = {
  matcher: ['/admin/:path*'], 
};