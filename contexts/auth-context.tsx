'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export type UserType = 'buyer' | 'seller'

export interface Address {
  id: string
  label: string
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
}

export interface Coupon {
  id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  expiryDate: string
  applicableCategories?: ('skincare' | 'makeup')[]
  minPurchase?: number
  used: boolean
}

export interface BuyerOrder {
  id: string
  date: string
  status: 'pending' | 'shipped' | 'delivered'
  items: {
    productId: string
    name: string
    quantity: number
    price: number
    image: string
  }[]
  total: number
  shippingAddress: Address
}

export interface BeautyPreferences {
  skinType: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive' | ''
  concerns: string[]
}

export interface Buyer {
  id: string
  type: 'buyer'
  fullName: string
  email: string
  phone?: string
  birthday?: string
  profilePhoto?: string
  backgroundPhoto?: string
  description?: string
  addresses: Address[]
  wishlist: string[]
  coupons: Coupon[]
  orders: BuyerOrder[]
  beautyPreferences: BeautyPreferences
}

export interface Seller {
  id: string
  type: 'seller'
  brandName: string
  ownerName: string
  email: string
  phone: string
  country: string
  brandLogo?: string
  brandBanner?: string
  brandDescription?: string
  facebookUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  category: 'skincare' | 'makeup' | 'both'
}

export type User = Buyer | Seller

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  userType: UserType | null
  buyer?: Buyer
  seller?: Seller
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo: string }>
  register: (email: string, password: string, type: 'buyer' | 'seller', data?: any) => Promise<boolean>
  registerBuyer: (data: Omit<Buyer, 'id' | 'type' | 'addresses' | 'wishlist' | 'coupons' | 'orders' | 'beautyPreferences'> & { password: string }) => Promise<boolean>
  registerSeller: (data: Omit<Seller, 'id' | 'type'> & { password: string }) => Promise<boolean>
  logout: () => void
  updateBuyerProfile: (data: Partial<Buyer>) => void
  updateSellerProfile: (data: Partial<Seller>) => void
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  deleteAddress: (id: string) => void
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  applyCoupon: (code: string) => Coupon | null
  getAvailableCoupons: () => Coupon[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock buyer data - Empty, buyers should register via Supabase
const mockBuyers: (Buyer & { password: string })[] = []

// Mock seller data
const mockSellers: (Seller & { password: string })[] = [
  {
    id: 'f486c511-c72d-4c32-a562-af8606a448df',
    type: 'seller',
    brandName: 'AngeBae',
    ownerName: 'Angelica Baeriswyl',
    email: 'angebae@gmail.com',
    password: 'password123',
    phone: '+1 555 123 4567',
    country: 'United States',
    brandLogo: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop',
    brandBanner: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop',
    brandDescription: 'Skincare y maquillaje premium elaborado con amor. Nuestros productos combinan ingredientes naturales con fórmulas innovadoras para revelar tu belleza natural.',
    facebookUrl: 'https://www.facebook.com/angebae',
    instagramUrl: 'https://www.instagram.com/angebae',
    tiktokUrl: 'https://www.tiktok.com/@angebae',
    category: 'both'
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    const legacy = localStorage.getItem('beauty-therapist-auth')
    if (legacy && !localStorage.getItem('beauty-therapy-auth')) {
      localStorage.setItem('beauty-therapy-auth', legacy)
      localStorage.removeItem('beauty-therapist-auth')
    }
    const savedAuth = localStorage.getItem('beauty-therapy-auth')
    if (savedAuth) {
      try {
        setUser(JSON.parse(savedAuth))
      } catch {
        console.error('Failed to parse auth from localStorage')
      }
    }
    setIsHydrated(true)
  }, [])
  
  useEffect(() => {
    if (isHydrated) {
      if (user) {
        localStorage.setItem('beauty-therapy-auth', JSON.stringify(user))
      } else {
        localStorage.removeItem('beauty-therapy-auth')
      }
    }
  }, [user, isHydrated])
  
  const login = async (email: string, password: string): Promise<{ success: boolean; redirectTo: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check buyers first
    const buyer = mockBuyers.find(b => b.email === email && b.password === password)
    if (buyer) {
      const { password: _, ...buyerData } = buyer
      setUser(buyerData)
      return { success: true, redirectTo: '/account/dashboard' }
    }
    
    // Check sellers
    const seller = mockSellers.find(s => s.email === email && s.password === password)
    if (seller) {
      const { password: _, ...sellerData } = seller
      setUser(sellerData)
      
      // También intenta sincronizar datos desde Supabase en backend (sin bloquear)
      // El dashboard completará la sincronización cuando cargue
      setTimeout(async () => {
        try {
          const res = await fetch('/api/seller/profile', {
            method: 'GET',
            headers: {
              'x-seller-email': seller.email,
              'x-brand-slug': seller.brandName?.toLowerCase().replace(/\s+/g, '-') || ''
            }
          })
          if (res.ok) {
            const json = await res.json()
            if (json.brand) {
              const b = json.brand
              // Actualizar el contexto con datos de Supabase
              setUser(prev => prev && prev.type === 'seller' ? {
                ...prev,
                brandName: b.brand_name ?? prev.brandName,
                brandLogo: b.logo_url ?? prev.brandLogo,
                brandBanner: b.banner_url ?? prev.brandBanner,
                brandDescription: b.description ?? prev.brandDescription,
                facebookUrl: b.facebook_url ?? prev.facebookUrl,
                instagramUrl: b.instagram_url ?? prev.instagramUrl,
                tiktokUrl: b.tiktok_url ?? prev.tiktokUrl,
              } : prev)
            }
          }
        } catch (e) {
          // Silenciar errores de sincronización post-login
          console.debug('Profile sync after login failed', e)
        }
      }, 100)
      
      return { success: true, redirectTo: '/seller/dashboard' }
    }
    
    return { success: false, redirectTo: '' }
  }
  
  const registerBuyer = async (data: Omit<Buyer, 'id' | 'type' | 'addresses' | 'wishlist' | 'coupons' | 'orders' | 'beautyPreferences'> & { password: string }): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Generate IDs only when called (client-side only)
    const generateId = (prefix: string) => {
      if (typeof window === 'undefined') return `${prefix}-temp`
      return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    const newBuyer: Buyer = {
      id: generateId('buyer'),
      type: 'buyer',
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      birthday: data.birthday,
      profilePhoto: data.profilePhoto,
      addresses: [],
      wishlist: [],
      coupons: [
        {
          id: generateId('coupon'),
          code: 'WELCOME10',
          discount: 10,
          type: 'percentage',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          used: false
        }
      ],
      orders: [],
      beautyPreferences: {
        skinType: '',
        concerns: []
      }
    }
    
    setUser(newBuyer)
    return true
  }
  
  const registerSeller = async (data: Omit<Seller, 'id' | 'type'> & { password: string }): Promise<boolean> => {
    // Registro de nuevos sellers deshabilitado temporalmente; dejar login intacto
    await new Promise(resolve => setTimeout(resolve, 200))
    return false
  }
  
  const logout = () => {
    setUser(null)
    router.push('/')
  }
  
  const updateBuyerProfile = (data: Partial<Buyer>) => {
    if (user?.type === 'buyer') {
      setUser({ ...user, ...data })
    }
  }

  const updateSellerProfile = (data: Partial<Seller>) => {
    if (user?.type === 'seller') {
      setUser({ ...user, ...data })
    }
  }
  
  const addAddress = (address: Omit<Address, 'id'>) => {
    if (user?.type === 'buyer') {
      const generateId = (prefix: string) => {
        if (typeof window === 'undefined') return `${prefix}-temp`
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
      }
      
      const newAddress: Address = {
        ...address,
        id: generateId('addr')
      }
      if (address.isDefault) {
        const updatedAddresses = user.addresses.map(a => ({ ...a, isDefault: false }))
        setUser({ ...user, addresses: [...updatedAddresses, newAddress] })
      } else {
        setUser({ ...user, addresses: [...user.addresses, newAddress] })
      }
    }
  }
  
  const updateAddress = (id: string, address: Partial<Address>) => {
    if (user?.type === 'buyer') {
      let updatedAddresses = user.addresses.map(a => 
        a.id === id ? { ...a, ...address } : a
      )
      if (address.isDefault) {
        updatedAddresses = updatedAddresses.map(a => 
          a.id === id ? a : { ...a, isDefault: false }
        )
      }
      setUser({ ...user, addresses: updatedAddresses })
    }
  }
  
  const deleteAddress = (id: string) => {
    if (user?.type === 'buyer') {
      setUser({ ...user, addresses: user.addresses.filter(a => a.id !== id) })
    }
  }
  
  const toggleWishlist = (productId: string) => {
    if (user?.type === 'buyer') {
      const newWishlist = user.wishlist.includes(productId)
        ? user.wishlist.filter(id => id !== productId)
        : [...user.wishlist, productId]
      setUser({ ...user, wishlist: newWishlist })
    }
  }
  
  const isInWishlist = (productId: string): boolean => {
    if (user?.type === 'buyer') {
      return user.wishlist.includes(productId)
    }
    return false
  }
  
  const applyCoupon = (code: string): Coupon | null => {
    if (user?.type === 'buyer') {
      const coupon = user.coupons.find(c => c.code === code && !c.used)
      return coupon || null
    }
    return null
  }
  
  const getAvailableCoupons = (): Coupon[] => {
    if (user?.type === 'buyer') {
      return user.coupons.filter(c => !c.used && new Date(c.expiryDate) > new Date())
    }
    return []
  }
  
  // Add register method to match interface
  const register = async (email: string, password: string, type: 'buyer' | 'seller', data?: any): Promise<boolean> => {
    if (type === 'buyer') {
      return await registerBuyer({ email, password, ...data })
    } else {
      return await registerSeller({ email, password, ...data })
    }
  }

  // Always provide context value, even during server render and before hydration
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    userType: user?.type || null,
    seller: user?.type === 'seller' ? (user as Seller) : undefined,
    buyer: user?.type === 'buyer' ? (user as Buyer) : undefined,
    login,
    register,
    registerBuyer,
    registerSeller,
    logout,
    updateBuyerProfile,
    updateSellerProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleWishlist,
    isInWishlist,
    applyCoupon,
    getAvailableCoupons
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
