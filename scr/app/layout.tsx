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
      <body>
        {children}
        <footer style={{ 
          textAlign: 'center', 
          padding: '20px', 
          background: '#f5f5f5', 
          marginTop: '40px',
          borderTop: '2px solid #2d7d2d'
        }}>
          <p>© 2026 الواحة 🌱 - جميع الحقوق محفوظة</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>خضروات وفاكهة طازجة يومياً</p>
        </footer>
      </body>
    </html>
  )
} 
