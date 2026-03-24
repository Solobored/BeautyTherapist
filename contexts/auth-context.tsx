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
  brandDescription?: string
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
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  deleteAddress: (id: string) => void
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  applyCoupon: (code: string) => Coupon | null
  getAvailableCoupons: () => Coupon[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock buyer data
const mockBuyers: (Buyer & { password: string })[] = [
  {
    id: 'buyer-1',
    type: 'buyer',
    fullName: 'Maria Santos',
    email: 'maria@example.com',
    password: 'password123',
    phone: '+1 555 987 6543',
    birthday: '1992-05-15',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    addresses: [
      {
        id: 'addr-1',
        label: 'Home',
        fullName: 'Maria Santos',
        street: '123 Main Street, Apt 4B',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        country: 'United States',
        phone: '+1 555 987 6543',
        isDefault: true
      },
      {
        id: 'addr-2',
        label: 'Work',
        fullName: 'Maria Santos',
        street: '456 Business Ave, Suite 200',
        city: 'Miami',
        state: 'FL',
        zipCode: '33102',
        country: 'United States',
        phone: '+1 555 987 6543',
        isDefault: false
      }
    ],
    wishlist: ['1', '3', '5'],
    coupons: [
      {
        id: 'coupon-1',
        code: 'WELCOME10',
        discount: 10,
        type: 'percentage',
        expiryDate: '2024-06-30',
        used: false
      },
      {
        id: 'coupon-2',
        code: 'SKIN20',
        discount: 20,
        type: 'percentage',
        expiryDate: '2024-03-31',
        applicableCategories: ['skincare'],
        used: false
      }
    ],
    orders: [
      {
        id: 'order-001',
        date: '2024-01-20',
        status: 'delivered',
        items: [
          { productId: '1', name: 'Radiance Glow Serum', quantity: 2, price: 68, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop' }
        ],
        total: 136,
        shippingAddress: {
          id: 'addr-1',
          label: 'Home',
          fullName: 'Maria Santos',
          street: '123 Main Street, Apt 4B',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'United States',
          phone: '+1 555 987 6543',
          isDefault: true
        }
      },
      {
        id: 'order-002',
        date: '2024-01-25',
        status: 'shipped',
        items: [
          { productId: '2', name: 'Velvet Rose Moisturizer', quantity: 1, price: 54, image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop' },
          { productId: '5', name: 'Petal Soft Lip Tint', quantity: 2, price: 24, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop' }
        ],
        total: 102,
        shippingAddress: {
          id: 'addr-1',
          label: 'Home',
          fullName: 'Maria Santos',
          street: '123 Main Street, Apt 4B',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'United States',
          phone: '+1 555 987 6543',
          isDefault: true
        }
      }
    ],
    beautyPreferences: {
      skinType: 'combination',
      concerns: ['hyperpigmentation', 'fine lines']
    }
  },
  {
    id: 'buyer-2',
    type: 'buyer',
    fullName: 'Elena Torres',
    email: 'elena@example.com',
    password: 'password123',
    phone: '+1 555 456 7890',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    addresses: [
      {
        id: 'addr-3',
        label: 'Home',
        fullName: 'Elena Torres',
        street: '789 Oak Lane',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'United States',
        phone: '+1 555 456 7890',
        isDefault: true
      }
    ],
    wishlist: ['2', '4'],
    coupons: [
      {
        id: 'coupon-3',
        code: 'BIRTHDAY15',
        discount: 15,
        type: 'percentage',
        expiryDate: '2024-04-15',
        used: false
      }
    ],
    orders: [
      {
        id: 'order-003',
        date: '2024-01-17',
        status: 'delivered',
        items: [
          { productId: '4', name: 'Midnight Recovery Eye Cream', quantity: 3, price: 48, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=600&fit=crop' }
        ],
        total: 144,
        shippingAddress: {
          id: 'addr-3',
          label: 'Home',
          fullName: 'Elena Torres',
          street: '789 Oak Lane',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'United States',
          phone: '+1 555 456 7890',
          isDefault: true
        }
      }
    ],
    beautyPreferences: {
      skinType: 'dry',
      concerns: ['dark circles', 'dryness']
    }
  }
]

// Mock seller data
const mockSellers: (Seller & { password: string })[] = [
  {
    id: 'seller-1',
    type: 'seller',
    brandName: 'AngeBae',
    ownerName: 'Angela Rodriguez',
    email: 'angela@angebae.com',
    password: 'password123',
    phone: '+1 555 123 4567',
    country: 'United States',
    brandLogo: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=200&h=200&fit=crop',
    brandDescription: 'Premium skincare and makeup crafted with love. Our products combine natural ingredients with innovative formulas.',
    category: 'both'
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    const savedAuth = localStorage.getItem('beauty-therapist-auth')
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
        localStorage.setItem('beauty-therapist-auth', JSON.stringify(user))
      } else {
        localStorage.removeItem('beauty-therapist-auth')
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
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const generateId = (prefix: string) => {
      if (typeof window === 'undefined') return `${prefix}-temp`
      return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    const newSeller: Seller = {
      id: generateId('seller'),
      type: 'seller',
      brandName: data.brandName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      brandLogo: data.brandLogo,
      brandDescription: data.brandDescription,
      category: data.category
    }
    
    setUser(newSeller)
    return true
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
    login,
    register,
    registerBuyer,
    registerSeller,
    logout,
    updateBuyerProfile,
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
