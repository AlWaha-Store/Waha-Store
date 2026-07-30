'use client'
import { useState, useEffect } from 'react'
import { allProducts } from '@/data/products'
import { CartItem, FilterType } from '@/types'

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [filter, setFilter] = useState<FilterType>('الكل')
  const [showCart, setShowCart] = useState<boolean>(false)
  const [showCheckout, setShowCheckout] = useState<boolean>(false)
  const [customerName, setCustomerName] = useState<string>('')
  const [customerAddress, setCustomerAddress] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')

  // تحميل السلة من localStorage (client-side فقط)
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

  // حفظ السلة في localStorage (client-side فقط)
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

  const sendOrder = async () => {
    if (!customerName || !customerPhone) {
      alert('الرجاء إدخال الاسم ورقم الجوال')
      return
    }

    let message = `🛒 *طلب جديد من الواحة 🌱*\n\n`
    message += `👤 *الاسم:* ${customerName}\n`
    message += `📍 *العنوان:* ${customerAddress || 'غير محدد'}\n`
    message += `📱 *الجوال:* ${customerPhone}\n\n`
    message += `*المنتجات:*\n`
    
    cart.forEach(item => {
      const weight = item.weight || 1
      const totalPrice = item.price * weight
      message += `- ${item.emoji} ${item.name} (${weight} كجم) = ${totalPrice} ج\n`
    })
    
    message += `\n*الإجمالي:* ${getTotal()} ج`
    message += `\n\nشكراً لتسوقك من الواحة 🌱`

    // إرسال الطلب عبر API
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerName,
          phone: customerPhone,
          address: customerAddress,
          items: cart,
          total: getTotal()
        })
      })
    } catch (error) {
      console.error('Error saving order:', error)
    }

    // فتح واتساب
    const encodedMessage = encodeURIComponent(message)
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '01229156909'
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank')
    
    setCart([])
    setShowCheckout(false)
    setCustomerName('')
    setCustomerAddress('')
    setCustomerPhone('')
  }

  return (
    <>
      <header>
        <h1>🌱 الواحة</h1>
        <p>خضروات وفاكهة طازجة يومياً</p>
      </header>

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
            {f === 'عروض' && '🏷️ عروض حصرية'}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {getFilteredProducts().map(product => (
          <div key={product.id} className="product-card">
            <span className="emoji">{product.emoji}</span>
            <div className="name">{product.name}</div>
            {product.offer && <span className="offer">خصم {product.discount || 20}%</span>}
            <div className="price">{product.price} ج/كجم</div>
            <button onClick={() => addToCart(product)}>➕ إضافة</button>
          </div>
        ))}
      </div>

      <div className="floating-cart" onClick={() => setShowCart(true)}>
        <span className="icon">🛒</span>
        <span className="count">{cart.length}</span>
      </div>

      <div className={`cart-sidebar ${showCart ? 'open' : ''}`}>
        <span className="close" onClick={() => setShowCart(false)}>✕</span>
        <h2>🛒 سلة التسوق</h2>
        
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '30px' }}>السلة فارغة</p>
        ) : (
          <>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div>
                  <div>{item.emoji} {item.name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {item.price} ج/كجم
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="number"
                    value={item.weight || 1}
                    onChange={(e) => updateWeight(item.id, parseFloat(e.target.value) || 0)}
                    min="0.1"
                    step="0.1"
                    style={{ width: '60px' }}
                  />
                  <span>كجم</span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            
            <div className="cart-total">
              الإجمالي: {getTotal()} ج
            </div>
            
            <button className="btn-checkout" onClick={() => {
              setShowCart(false)
              setShowCheckout(true)
            }}>
              شراء الآن
            </button>
          </>
        )}
      </div>

      {showCheckout && (
        <div className="checkout-modal" onClick={(e) => {
          if (e.target === e.currentTarget) setShowCheckout(false)
        }}>
          <div className="modal-content">
            <h2>📋 تأكيد الطلب</h2>
            
            <div className="order-summary">
              <h3>المنتجات:</h3>
              {cart.map(item => (
                <div key={item.id}>
                  {item.emoji} {item.name} - {item.weight || 1} كجم = {(item.price * (item.weight || 1))} ج
                </div>
              ))}
              <div style={{ fontWeight: 'bold', marginTop: '10px', fontSize: '1.2rem' }}>
                الإجمالي: {getTotal()} ج
              </div>
            </div>

            <input
              type="text"
              placeholder="👤 الاسم الكامل *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="📍 العنوان"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
            <input
              type="tel"
              placeholder="📱 رقم الجوال *"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />

            <button className="btn-confirm" onClick={sendOrder}>
              ✅ تأكيد وإرسال للواتساب
            </button>
            <button 
              style={{ marginTop: '10px', background: '#ccc', color: '#333' }}
              className="btn-confirm"
              onClick={() => setShowCheckout(false)}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </>
  )
                        } 
