'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeEmail } from '@/lib/seller-identity'

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
  isAuthLoading: boolean
  userType: UserType | null
  buyer?: Buyer
  seller?: Seller
  login: (email: string, password: string) => Promise<{ success: boolean; redirectTo: string }>
  register: (email: string, password: string, type: 'buyer' | 'seller', data?: any) => Promise<boolean>
  registerBuyer: (data: Omit<Buyer, 'id' | 'type' | 'addresses' | 'wishlist' | 'coupons' | 'orders' | 'beautyPreferences'> & { password: string }) => Promise<boolean>
  registerSeller: (data: Omit<Seller, 'id' | 'type'> & { password: string }) => Promise<boolean>
  changeSellerCredentials: (data: {
    currentPassword: string
    newEmail?: string
    newPassword?: string
  }) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
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
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    let cancelled = false
    const legacy = localStorage.getItem('beauty-therapist-auth')
    if (legacy && !localStorage.getItem('beauty-therapy-auth')) {
      localStorage.setItem('beauty-therapy-auth', legacy)
      localStorage.removeItem('beauty-therapist-auth')
    }

    const savedAuth = localStorage.getItem('beauty-therapy-auth')
    let buyerFromStorage: Buyer | null = null
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth) as User
        if (parsed?.type === 'buyer') {
          buyerFromStorage = parsed
          setUser(parsed)
        } else {
          localStorage.removeItem('beauty-therapy-auth')
        }
      } catch {
        console.error('Failed to parse auth from localStorage')
      }
    }

    const syncSellerSession = async () => {
      try {
        const res = await fetch('/api/seller/auth/session', {
          method: 'GET',
          cache: 'no-store',
        })
        const json = await res.json().catch(() => ({}))
        if (cancelled) return

        if (res.ok && json.seller) {
          setUser(json.seller as Seller)
        } else if (!buyerFromStorage) {
          setUser(null)
        }
      } catch {
        if (!cancelled && !buyerFromStorage) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true)
          setIsAuthLoading(false)
        }
      }
    }

    void syncSellerSession()

    return () => {
      cancelled = true
    }
  }, [])
  
  useEffect(() => {
    if (isHydrated) {
      if (user?.type === 'buyer') {
        localStorage.setItem('beauty-therapy-auth', JSON.stringify(user))
      } else {
        localStorage.removeItem('beauty-therapy-auth')
      }
    }
  }, [user, isHydrated])
  
  const login = async (email: string, password: string): Promise<{ success: boolean; redirectTo: string }> => {
    const normalizedEmail = normalizeEmail(email)
    
    // Check buyers first
    const buyer = mockBuyers.find(b => b.email === email && b.password === password)
    if (buyer) {
      const { password: _, ...buyerData } = buyer
      setUser(buyerData)
      return { success: true, redirectTo: '/account/dashboard' }
    }
    
    try {
      const res = await fetch('/api/seller/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      })
      const json = await res.json().catch(() => ({}))

      if (res.ok && json.seller) {
        setUser(json.seller as Seller)
        return { success: true, redirectTo: '/seller/dashboard' }
      }
    } catch {
      // ignore and fall through to invalid credentials response
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

  const changeSellerCredentials = async ({
    currentPassword,
    newEmail,
    newPassword,
  }: {
    currentPassword: string
    newEmail?: string
    newPassword?: string
  }): Promise<{ success: boolean; message: string }> => {
    if (user?.type !== 'seller') {
      return { success: false, message: 'No hay una sesión de vendedor activa.' }
    }

    const trimmedCurrentPassword = currentPassword.trim()
    const trimmedNewPassword = newPassword?.trim() ?? ''
    const normalizedNewEmail = newEmail?.trim() ? normalizeEmail(newEmail) : ''

    if (!trimmedCurrentPassword) {
      return { success: false, message: 'Debes ingresar tu contraseña actual.' }
    }

    if (!normalizedNewEmail && !trimmedNewPassword) {
      return { success: false, message: 'Ingresa un nuevo correo o una nueva contraseña.' }
    }

    if (normalizedNewEmail && !EMAIL_PATTERN.test(normalizedNewEmail)) {
      return { success: false, message: 'Ingresa un correo válido.' }
    }

    if (trimmedNewPassword && trimmedNewPassword.length < 8) {
      return { success: false, message: 'La nueva contraseña debe tener al menos 8 caracteres.' }
    }
    if (normalizedNewEmail && normalizedNewEmail === normalizeEmail(user.email) && !trimmedNewPassword) {
      return { success: false, message: 'No hay cambios para guardar.' }
    }

    try {
      const res = await fetch('/api/seller/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: trimmedCurrentPassword,
          newEmail: normalizedNewEmail || undefined,
          newPassword: trimmedNewPassword || undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        return {
          success: false,
          message: json.error || 'No se pudo actualizar la cuenta del vendedor.',
        }
      }

      if (json.seller) {
        setUser(json.seller as Seller)
      }

      if (normalizedNewEmail && trimmedNewPassword) {
        return { success: true, message: 'Correo y contraseña actualizados correctamente.' }
      }
      if (normalizedNewEmail) {
        return { success: true, message: 'Correo actualizado correctamente.' }
      }
      return { success: true, message: 'Contraseña actualizada correctamente.' }
    } catch {
      return {
        success: false,
        message: 'No se pudo actualizar la cuenta del vendedor. Intenta de nuevo.',
      }
    }
  }
  
  const logout = async () => {
    const currentUserType = user?.type

    if (currentUserType === 'seller') {
      try {
        await fetch('/api/seller/auth/logout', {
          method: 'POST',
        })
      } catch {
        /* noop */
      }
    }

    setUser(null)
    router.push(currentUserType === 'seller' ? '/seller/login' : '/')
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
    isAuthLoading,
    userType: user?.type || null,
    seller: user?.type === 'seller' ? (user as Seller) : undefined,
    buyer: user?.type === 'buyer' ? (user as Buyer) : undefined,
    login,
    register,
    registerBuyer,
    registerSeller,
    changeSellerCredentials,
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
