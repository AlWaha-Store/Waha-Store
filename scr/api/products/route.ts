import { NextRequest, NextResponse } from 'next/server'
import { Product } from '@/types'

export async function GET() {
  try {
    const products = JSON.parse(localStorage.getItem('admin_products') || '[]')
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, product, id } = body
    
    const products = JSON.parse(localStorage.getItem('admin_products') || '[]')
    
    if (action === 'add') {
      const newProduct = { ...product, id: Date.now() }
      products.push(newProduct)
      localStorage.setItem('admin_products', JSON.stringify(products))
      return NextResponse.json({ success: true, product: newProduct })
    }
    
    if (action === 'update') {
      const index = products.findIndex((p: Product) => p.id === id)
      if (index === -1) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      products[index] = { ...products[index], ...product }
      localStorage.setItem('admin_products', JSON.stringify(products))
      return NextResponse.json({ success: true, product: products[index] })
    }
    
    if (action === 'delete') {
      const filtered = products.filter((p: Product) => p.id !== id)
      localStorage.setItem('admin_products', JSON.stringify(filtered))
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
  } 
