// ============================================
// الملف: app/layout.tsx
// ============================================
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الواحة 🌱 - خضروات وفاكهة طازجة',
  description: 'متجر بسيط لبيع الخضروات والفاكهة',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
} 
