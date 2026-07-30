// ============================================
// الملف: app/page.tsx (الإصدار المعدل بالكامل)
// ============================================
'use client'
import { useState, useEffect } from 'react'
import { allProducts } from '@/data/products'
import { CartItem, FilterType } from '@/types'

// الدول العربية
const countries = [
  { code: '+20', name: '🇪🇬 مصر' },
  { code: '+966', name: '🇸🇦 السعودية' },
  { code: '+971', name: '🇦🇪 الإمارات' },
  { code: '+962', name: '🇯🇴 الأردن' },
  { code: '+961', name: '🇱🇧 لبنان' },
  { code: '+970', name: '🇵🇸 فلسطين' },
  { code: '+963', name: '🇸🇾 سوريا' },
  { code: '+964', name: '🇮🇶 العراق' },
  { code: '+965', name: '🇰🇼 الكويت' },
  { code: '+974', name: '🇶🇦 قطر' },
  { code: '+973', name: '🇧🇭 البحرين' },
  { code: '+968', name: '🇴🇲 عمان' },
  { code: '+967', name: '🇾🇪 اليمن' },
  { code: '+218', name: '🇱🇾 ليبيا' },
  { code: '+216', name: '🇹🇳 تونس' },
  { code: '+213', name: '🇩🇿 الجزائر' },
  { code: '+212', name: '🇲🇦 المغرب' },
  { code: '+222', name: '🇲🇷 موريتانيا' },
  { code: '+249', name: '🇸🇩 السودان' },
  { code: '+252', name: '🇸🇴 الصومال' },
  { code: '+253', name: '🇩🇯 جيبوتي' },
]

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [filter, setFilter] = useState<FilterType>('الكل')
  const [showCheckout, setShowCheckout] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState<number>(1)
  
  // بيانات الفاتورة
  const [customerName, setCustomerName] = useState<string>('')
  const [countryCode, setCountryCode] = useState<string>('+20')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [customerAddress, setCustomerAddress] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('كاش')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch (e) {
          console.error('Error loading cart:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart])

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, weight: (item.weight || 1) + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, weight: 1 }])
    }
  }

  const addWithQuantity = (product: any, qty: number) => {
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, weight: (item.weight || 0) + qty }
          : item
      ))
    } else {
      setCart([...cart, { ...product, weight: qty }])
    }
    setShowPreview(false)
    setQuantity(1)
  }

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const updateWeight = (id: number, weight: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, weight: weight || 0 } : item
    ))
  }

  const getTotal = (): number => {
    return cart.reduce((sum, item) => sum + (item.price * (item.weight || 1)), 0)
  }

  const getFilteredProducts = () => {
    if (filter === 'الكل') return allProducts
    return allProducts.filter(p => p.category === filter)
  }

  const openPreview = (product: any) => {
    setSelectedProduct(product)
    setQuantity(1)
    setShowPreview(true)
  }

  const isFormValid = () => {
    return customerName.trim() !== '' && customerPhone.trim() !== ''
  }

  // ========== دالة إرسال الطلب للواتساب ==========
  const sendOrder = async () => {
    if (!isFormValid()) {
      alert('⚠️ الرجاء ملئ الاسم ورقم الجوال')
      return
    }

    // تنظيف رقم الجوال (إزالة المسافات والشرطات)
    let cleanPhone = customerPhone.replace(/[\s\-\(\)]/g, '')
    
    // التأكد من أن الرقم يبدأ برقم وليس بعلامة +
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1)
    }

    const fullPhone = countryCode + cleanPhone

    // ===== بناء رسالة واتساب =====
    let message = `🛒 *فاتورة شراء - الواحة 🌱*\n`
    message += `═══════════════════════════════\n\n`
    message += `👤 *العميل:* ${customerName}\n`
    message += `📍 *العنوان:* ${customerAddress || 'غير محدد'}\n`
    message += `📱 *الجوال:* ${fullPhone}\n`
    message += `💳 *طريقة الدفع:* ${paymentMethod}\n\n`
    message += `📦 *المنتجات:*\n`
    message += `───────────────────────────────\n`
    
    cart.forEach((item, index) => {
      const weight = item.weight || 1
      const totalPrice = item.price * weight
      message += `${index + 1}. ${item.emoji} ${item.name}\n`
      message += `   الكمية: ${weight} كجم × ${item.price} ج = ${totalPrice} ج\n`
    })
    
    message += `───────────────────────────────\n`
    message += `💰 *الإجمالي:* ${getTotal()} ج\n`
    
    if (notes) {
      message += `\n📝 *ملاحظات:* ${notes}\n`
    }
    
    message += `\n═══════════════════════════════\n`
    message += `شكراً لتسوقك من الواحة 🌱`

    // حفظ الطلب في الـ API
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerName,
          phone: fullPhone,
          address: customerAddress,
          items: cart,
          total: getTotal(),
          notes: notes,
          paymentMethod: paymentMethod
        })
      })
    } catch (error) {
      console.error('Error saving order:', error)
    }

    // ===== إرسال للواتساب =====
    // رقم الواتساب (بدون علامة +)
    const whatsappNumber = '01229156909'
    
    // تنظيف رقم الواتساب (إزالة أي علامات)
    const cleanWhatsapp = whatsappNumber.replace(/[\s\-\(\)\+]/g, '')
    
    // ترميز الرسالة
    const encodedMessage = encodeURIComponent(message)
    
    // رابط واتساب بالرقم الصحيح
    const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodedMessage}`
    
    // فتح الرابط في نافذة جديدة
    window.open(whatsappUrl, '_blank')
    
    // تفريغ السلة
    setCart([])
    setShowCheckout(false)
    setCustomerName('')
    setCustomerPhone('')
    setCustomerAddress('')
    setNotes('')
  }

  return (
    <>
      {/* الهيدر */}
      <header className="header-main">
        <h1>🌱 الواحة</h1>
        <p>خضروات وفاكهة طازجة يومياً</p>
      </header>

      {/* أزرار التصفية */}
      <div className="filter-buttons">
        {(['الكل', 'فاكهة', 'خضروات', 'عروض'] as FilterType[]).map((f) => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f === 'الكل' && '🏠 الكل'}
            {f === 'فاكهة' && '🍎 فاكهة'}
            {f === 'خضروات' && '🥬 خضروات'}
            {f === 'عروض' && '🏷️ عروض'}
          </button>
        ))}
      </div>

      {/* المنتجات */}
      <div className="products-grid">
        {getFilteredProducts().map(product => (
          <div key={product.id} className="product-card">
            <span className="emoji">{product.emoji}</span>
            <div className="name">{product.name}</div>
            {product.offer && <span className="offer">خصم {product.discount || 20}%</span>}
            <div className="price">{product.price} ج/كجم</div>
            <div className="btn-group">
              <button className="btn-preview" onClick={() => openPreview(product)}>
                👁️ معاينة
              </button>
              <button className="btn-add" onClick={() => addToCart(product)}>
                ➕ إضافة
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* زر الشراء العائم */}
      {cart.length > 0 && (
        <button className="floating-buy" onClick={() => setShowCheckout(true)}>
          <span className="icon">🛒</span>
          شراء
          <span className="count">{cart.length}</span>
        </button>
      )}

      {/* مودال المعاينة */}
      {showPreview && selectedProduct && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowPreview(false)
        }}>
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowPreview(false)}>✕</button>
            <h2>📦 معاينة المنتج</h2>
            <div className="product-preview">
              <span className="emoji">{selectedProduct.emoji}</span>
              <div className="name">{selectedProduct.name}</div>
              {selectedProduct.offer && <div className="offer">🔥 عرض خاص - خصم {selectedProduct.discount}%</div>}
              <div className="price">{selectedProduct.price} ج/كجم</div>
            </div>
            
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 0.5)}>+</button>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
              الوزن: {quantity} كجم
            </div>
            
            <button 
              className="btn-add-to-cart"
              onClick={() => addWithQuantity(selectedProduct, quantity)}
            >
              ➕ إضافة {quantity} كجم للسلة
            </button>
          </div>
        </div>
      )}

      {/* مودال الفاتورة */}
      {showCheckout && (
        <div className="modal-overlay checkout-modal" onClick={(e) => {
          if (e.target === e.currentTarget) setShowCheckout(false)
        }}>
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowCheckout(false)}>✕</button>
            <h2>🧾 الفاتورة</h2>
            
            <div className="order-summary">
              {cart.map(item => (
                <div key={item.id} className="item">
                  <span>{item.emoji} {item.name} × {item.weight || 1} كجم</span>
                  <span>{(item.price * (item.weight || 1))} ج</span>
                </div>
              ))}
              <div className="total">
                <span>الإجمالي</span>
                <span>{getTotal()} ج</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '8px' }}>
                * لا يشمل قيمة التوصيل
              </div>
            </div>

            <input
              type="text"
              placeholder="👤 الاسم الكامل *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={!customerName && customerName !== '' ? 'error' : ''}
            />

            <div className="phone-group">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="رقم الجوال *"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            <input
              type="text"
              placeholder="📍 العنوان (الشارع، المدينة، المنطقة)"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />

            <textarea
              placeholder="📝 ملاحظات إضافية (اختياري)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />

            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="كاش">💵 كاش</option>
              <option value="انستا باي">📱 انستا باي</option>
              <option value="محفظة إلكترونية">📱 محفظة إلكترونية</option>
            </select>

            <button 
              className="btn-confirm"
              onClick={sendOrder}
              disabled={!isFormValid()}
            >
              <span className="icon">💰</span>
              تأكيد الشراء
            </button>
          </div>
        </div>
      )}
    </>
  )
    } 
