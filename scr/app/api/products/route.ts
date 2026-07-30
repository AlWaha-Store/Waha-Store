import { NextRequest, NextResponse } from 'next/server'
import { Product } from '@/types'
import { allProducts } from '@/data/products'

// تخزين مؤقت في الذاكرة (بديل localStorage للـ Server)
let productsCache: Product[] = [...allProducts];

// GET: جلب جميع المنتجات
export async function GET() {
  try {
    return NextResponse.json(productsCache)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST: إدارة المنتجات (إضافة - تعديل - حذف)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, product, id } = body
    
    // ===== إضافة منتج جديد =====
    if (action === 'add') {
      if (!product.name || !product.price) {
        return NextResponse.json(
          { error: 'Name and price are required' },
          { status: 400 }
        )
      }
      
      const newProduct: Product = {
        ...product,
        id: Date.now(),
      }
      productsCache.push(newProduct)
      
      return NextResponse.json({
        success: true,
        product: newProduct,
        message: 'تم إضافة المنتج بنجاح'
      })
    }
    
    // ===== تعديل منتج =====
    if (action === 'update') {
      const index = productsCache.findIndex((p: Product) => p.id === id)
      
      if (index === -1) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      
      productsCache[index] = {
        ...productsCache[index],
        ...product,
        id: productsCache[index].id // الحفاظ على الـ ID الأصلي
      }
      
      return NextResponse.json({
        success: true,
        product: productsCache[index],
        message: 'تم تعديل المنتج بنجاح'
      })
    }
    
    // ===== حذف منتج =====
    if (action === 'delete') {
      const index = productsCache.findIndex((p: Product) => p.id === id)
      
      if (index === -1) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      
      const deletedProduct = productsCache[index]
      productsCache = productsCache.filter((p: Product) => p.id !== id)
      
      return NextResponse.json({
        success: true,
        product: deletedProduct,
        message: 'تم حذف المنتج بنجاح'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Use: add, update, or delete' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: تحديث منتج (بديل)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...productData } = body
    
    const index = productsCache.findIndex((p: Product) => p.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    productsCache[index] = {
      ...productsCache[index],
      ...productData,
      id: productsCache[index].id
    }
    
    return NextResponse.json({
      success: true,
      product: productsCache[index],
      message: 'تم تحديث المنتج بنجاح'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: حذف منتج (بديل)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    const index = productsCache.findIndex((p: Product) => p.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    productsCache = productsCache.filter((p: Product) => p.id !== id)
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف المنتج بنجاح'
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
        } 
