import { Noto_Serif_Thai } from 'next/font/google'
import './globals.css'

// 1. เรียกใช้ฟอนต์ Noto Serif Thai และกำหนดน้ำหนักฟอนต์ที่ต้องการ
const notoSerifThai = Noto_Serif_Thai({ 
  subsets: ['thai', 'latin'],
  // สามารถเลือก weight ได้ตั้งแต่ 100 ถึง 900
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], 
  display: 'swap',
})

export const metadata = {
  title: 'ศูนย์ศิลปาชีพบางไทร',
  description: 'ศูนย์ศิลปาชีพบางไทร',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      {/* 2. นำคลาสของฟอนต์ Noto Serif Thai มาใส่ไว้ที่ <body> */}
      <body className={notoSerifThai.className}>
        {children}
      </body>
    </html>
  )
}