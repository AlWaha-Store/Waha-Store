import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, phone, address, items, total } = body
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const newOrder = {
      id: Date.now(),
      customer,
      phone,
      address,
      items,
      total,
      date: new Date().toISOString()
    }
    orders.push(newOrder)
    localStorage.setItem('orders', JSON.stringify(orders))
    
    let message = `🛒 *طلب جديد من الواحة 🌱*\n\n`
    message += `👤 *الاسم:* ${customer}\n`
    message += `📍 *العنوان:* ${address || 'غير محدد'}\n`
    message += `📱 *الجوال:* ${phone}\n\n`
    message += `*المنتجات:*\n`
    
    items.forEach((item: any) => {
      const weight = item.weight || 1
      const totalPrice = item.price * weight
      message += `- ${item.emoji} ${item.name} (${weight} كجم) = ${totalPrice} ج\n`
    })
    
    message += `\n*الإجمالي:* ${total} ج`
    message += `\n\nشكراً لتسوقك من الواحة 🌱`
    
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '01229156909'
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
    return NextResponse.json({ 
      success: true, 
      order: newOrder,
      whatsappUrl 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
        } 
