'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { products as mockProducts } from '@/lib/data'

export interface Product {
  id: string
  name: string
  nameEs: string
  brand: string
  brandSlug: string
  category: 'skincare' | 'makeup'
  price: number
  comparePrice?: number
  description: string
  descriptionEs: string
  ingredients: string
  howToUse: string
  howToUseEs: string
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  status: 'active' | 'draft'
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('products')
          .select(
            `
            id,
            name_en,
            name_es,
            description_en,
            description_es,
            ingredients,
            how_to_use,
            price,
            compare_at_price,
            stock,
            category,
            status,
            product_images (
              url,
              position,
              is_primary
            ),
            brands (
              brand_name,
              brand_slug
            )
          `
          )
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) {
          // Fallback to mock data if Supabase fails
          console.warn('Failed to fetch from Supabase, using mock data:', error.message)
          setProducts(mockProducts)
          setIsUsingMockData(true)
          setError(null)
        } else if (data && data.length > 0) {
          // Transform data to match Product interface
          const transformedProducts: Product[] = data.map((item: any) => {
            const brand = Array.isArray(item.brands) ? item.brands[0] : item.brands
            return {
              id: item.id,
              name: item.name_en,
              nameEs: item.name_es,
              brand: brand?.brand_name || 'AngeBae',
              brandSlug: brand?.brand_slug || 'angebae',
              category: item.category,
              price: item.price,
              comparePrice: item.compare_at_price,
              description: item.description_en,
              descriptionEs: item.description_es,
              ingredients: item.ingredients || '',
              howToUse: item.how_to_use || '',
              howToUseEs: item.how_to_use || '',
              images: item.product_images
                ?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
                .map((img: any) => img.url) || [],
              rating: 4.5,
              reviewCount: 0,
              stock: item.stock,
              status: item.status
            }
          })
          setProducts(transformedProducts)
          setIsUsingMockData(false)
          setError(null)
        } else {
          // No data from Supabase, use mock data
          setProducts(mockProducts)
          setIsUsingMockData(true)
          setError(null)
        }
      } catch (err) {
        console.warn('Error fetching products, using mock data:', err)
        setProducts(mockProducts)
        setIsUsingMockData(true)
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error, isUsingMockData }
}

// Hook to get a single product by ID
export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        setLoading(true)
        
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('products')
          .select(
            `
            id,
            name_en,
            name_es,
            description_en,
            description_es,
            ingredients,
            how_to_use,
            price,
            compare_at_price,
            stock,
            category,
            status,
            product_images (
              url,
              position,
              is_primary
            ),
            brands (
              brand_name,
              brand_slug
            )
          `
          )
          .eq('id', id)
          .single()

        if (error) {
          // Fallback to mock data
          const mockProduct = mockProducts.find(p => p.id === id)
          if (mockProduct) {
            setProduct(mockProduct)
            setIsUsingMockData(true)
            setError(null)
          } else {
            setError('Product not found')
            setProduct(null)
          }
        } else if (data) {
          const brand = Array.isArray(data.brands) ? data.brands[0] : data.brands
          const transformedProduct: Product = {
            id: data.id,
            name: data.name_en,
            nameEs: data.name_es,
            brand: brand?.brand_name || 'AngeBae',
            brandSlug: brand?.brand_slug || 'angebae',
            category: data.category,
            price: data.price,
            comparePrice: data.compare_at_price,
            description: data.description_en,
            descriptionEs: data.description_es,
            ingredients: data.ingredients || '',
            howToUse: data.how_to_use || '',
            howToUseEs: data.how_to_use || '',
            images: data.product_images
              ?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
              .map((img: any) => img.url) || [],
            rating: 4.5,
            reviewCount: 0,
            stock: data.stock,
            status: data.status
          }

          setProduct(transformedProduct)
          setIsUsingMockData(false)
          setError(null)
        }
      } catch (err) {
        console.warn('Error fetching product, using mock data:', err)
        const mockProduct = mockProducts.find(p => p.id === id)
        if (mockProduct) {
          setProduct(mockProduct)
          setIsUsingMockData(true)
          setError(null)
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch product')
          setProduct(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error, isUsingMockData }
}
