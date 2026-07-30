import { NextRequest, NextResponse } from 'next/server'
import { Order } from '@/types'

// تخزين مؤقت في الذاكرة (بديل localStorage للـ Server)
let ordersCache: Order[] = [];

// GET: جلب جميع الطلبات
export async function GET() {
  try {
    return NextResponse.json(ordersCache)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST: إضافة طلب جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, phone, address, items, total } = body
    
    // التحقق من البيانات المطلوبة
    if (!customer || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customer, phone, or items' },
        { status: 400 }
      )
    }
    
    // إنشاء طلب جديد
    const newOrder: Order = {
      id: Date.now(),
      customer,
      phone,
      address: address || 'غير محدد',
      items,
      total: total || items.reduce((sum: number, item: any) => 
        sum + (item.price * (item.weight || 1)), 0
      ),
      date: new Date().toISOString()
    }
    
    // حفظ الطلب
    ordersCache.push(newOrder)
    
    // ===== إعداد رسالة واتساب =====
    let message = `🛒 *طلب جديد من الواحة 🌱*\n`
    message += `════════════════════════\n\n`
    message += `👤 *الاسم:* ${customer}\n`
    message += `📍 *العنوان:* ${address || 'غير محدد'}\n`
    message += `📱 *الجوال:* ${phone}\n\n`
    message += `📦 *المنتجات:*\n`
    message += `─────────────────────\n`
    
    items.forEach((item: any, index: number) => {
      const weight = item.weight || 1
      const totalPrice = item.price * weight
      message += `${index + 1}. ${item.emoji} ${item.name}\n`
      message += `   الكمية: ${weight} كجم × ${item.price} ج = ${totalPrice} ج\n`
    })
    
    message += `─────────────────────\n`
    message += `💰 *الإجمالي:* ${newOrder.total} ج\n\n`
    message += `📅 *التاريخ:* ${new Date().toLocaleString('ar-EG')}\n\n`
    message += `شكراً لتسوقك من الواحة 🌱\n`
    message += `════════════════════════`
    
    // إنشاء رابط واتساب
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '01229156909'
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
    return NextResponse.json({
      success: true,
      order: newOrder,
      whatsappUrl,
      message: 'تم إرسال الطلب بنجاح'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: حذف طلب
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    const index = ordersCache.findIndex((o: Order) => o.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    ordersCache = ordersCache.filter((o: Order) => o.id !== id)
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
      } 
