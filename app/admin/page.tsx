'use client'
import { useState, useEffect } from 'react'
import { Product, Order } from '@/types'
import { allProducts } from '@/data/products'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [password, setPassword] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'فاكهة',
    price: 0,
    emoji: '🍎',
    offer: false,
    discount: 0
  })

  // جلب المنتجات من API
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts(allProducts)
    }
  }

  // جلب الطلبات من API
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts()
      fetchOrders()
    }
  }, [isLoggedIn])

  const handleLogin = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '123456'
    if (password === adminPassword) {
      setIsLoggedIn(true)
    } else {
      alert('كلمة المرور غير صحيحة')
    }
  }

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('الرجاء إدخال الاسم والسعر')
      return
    }
    const product: Product = {
      ...newProduct as Product,
      id: Date.now(),
    }
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', product })
      })
      if (res.ok) {
        await fetchProducts()
        setNewProduct({ name: '', category: 'فاكهة', price: 0, emoji: '🍎', offer: false, discount: 0 })
      }
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  const deleteProduct = async (id: number) => {
    if (confirm('هل أنت متأكد من الحذف؟')) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id })
        })
        if (res.ok) {
          await fetchProducts()
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const updateProductField = async (id: number, field: keyof Product, value: any) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update', 
          id, 
          product: { ...product, [field]: value } 
        })
      })
      if (res.ok) {
        await fetchProducts()
      }
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <h2>🔐 دخول الأدمن</h2>
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button onClick={handleLogin}>دخول</button>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>📊 لوحة التحكم - الواحة 🌱</h1>
        <button 
          onClick={() => setIsLoggedIn(false)} 
          style={{ padding: '8px 16px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          تسجيل خروج
        </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>➕ إضافة منتج جديد</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
          <input
            type="text"
            placeholder="الاسم"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          >
            <option value="فاكهة">فاكهة</option>
            <option value="خضروات">خضروات</option>
            <option value="عروض">عروض</option>
          </select>
          <input
            type="number"
            placeholder="السعر"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
          />
          <input
            type="text"
            placeholder="ايموجي"
            value={newProduct.emoji}
            onChange={(e) => setNewProduct({ ...newProduct, emoji: e.target.value })}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={newProduct.offer}
              onChange={(e) => setNewProduct({ ...newProduct, offer: e.target.checked })}
            />
            عرض
          </label>
          {newProduct.offer && (
            <input
              type="number"
              placeholder="نسبة الخصم"
              value={newProduct.discount || 0}
              onChange={(e) => setNewProduct({ ...newProduct, discount: parseFloat(e.target.value) || 0 })}
            />
          )}
          <button className="btn-add" onClick={addProduct}>➕ إضافة</button>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>📦 إدارة المنتجات ({products.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ايموجي</th>
                <th>الاسم</th>
                <th>القسم</th>
                <th>السعر</th>
                <th>عرض</th>
                <th>الخصم</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.emoji}</td>
                  <td>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProductField(product.id, 'name', e.target.value)}
                      style={{ border: '1px solid #ddd', padding: '4px', borderRadius: '4px', width: '100%' }}
                    />
                  </td>
                  <td>
                    <select
                      value={product.category}
                      onChange={(e) => updateProductField(product.id, 'category', e.target.value)}
                      style={{ border: '1px solid #ddd', padding: '4px', borderRadius: '4px' }}
                    >
                      <option value="فاكهة">فاكهة</option>
                      <option value="خضروات">خضروات</option>
                      <option value="عروض">عروض</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => updateProductField(product.id, 'price', parseFloat(e.target.value) || 0)}
                      style={{ border: '1px solid #ddd', padding: '4px', borderRadius: '4px', width: '80px' }}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={product.offer}
                      onChange={(e) => updateProductField(product.id, 'offer', e.target.checked)}
                    />
                  </td>
                  <td>
                    {product.offer && (
                      <input
                        type="number"
                        value={product.discount || 0}
                        onChange={(e) => updateProductField(product.id, 'discount', parseFloat(e.target.value) || 0)}
                        style={{ border: '1px solid #ddd', padding: '4px', borderRadius: '4px', width: '60px' }}
                      />
                    )}
                  </td>
                  <td>
                    <button className="btn-delete" onClick={() => deleteProduct(product.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h3>📋 الطلبات السابقة ({orders.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>العميل</th>
                <th>الجوال</th>
                <th>العنوان</th>
                <th>المنتجات</th>
                <th>الإجمالي</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice().reverse().map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.phone}</td>
                  <td>{order.address}</td>
                  <td>
                    {order.items.map(item => (
                      <div key={item.id}>{item.emoji} {item.name} ({item.weight}كجم)</div>
                    ))}
                  </td>
                  <td>{order.total} ج</td>
                  <td>{new Date(order.date).toLocaleString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
                      } 
