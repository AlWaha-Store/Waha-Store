import { NextRequest, NextResponse } from 'next/server'
import { Product } from '@/types'
import { allProducts } from '@/data/products'

// تخزين مؤقت في الذاكرة (بديل localStorage)
let productsCache: Product[] = [...allProducts];

export async function GET() {
  try {
    return NextResponse.json(productsCache)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, product, id } = body
    
    if (action === 'add') {
      const newProduct = { ...product, id: Date.now() }
      productsCache.push(newProduct)
      return NextResponse.json({ success: true, product: newProduct })
    }
    
    if (action === 'update') {
      const index = productsCache.findIndex((p: Product) => p.id === id)
      if (index === -1) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      productsCache[index] = { ...productsCache[index], ...product }
      return NextResponse.json({ success: true, product: productsCache[index] })
    }
    
    if (action === 'delete') {
      productsCache = productsCache.filter((p: Product) => p.id !== id)
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 
