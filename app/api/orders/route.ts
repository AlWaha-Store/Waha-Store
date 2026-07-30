// ============================================
// الملف: app/api/orders/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server'
import { Order } from '@/types'

// تخزين مؤقت في الذاكرة
let ordersCache: Order[] = [];

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, phone, address, items, total, notes, paymentMethod } = body
    
    if (!customer || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const newOrder: Order = {
      id: Date.now(),
      customer,
      phone,
      address: address || 'غير محدد',
      items,
      total,
      date: new Date().toISOString(),
      notes: notes || '',
      paymentMethod: paymentMethod || 'كاش'
    }
    
    ordersCache.push(newOrder)
    
    return NextResponse.json({
      success: true,
      order: newOrder,
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
