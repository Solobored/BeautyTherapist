'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { ChevronRight, Ticket, Check, X, ChevronDown } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/language-context'
import { useCart } from '@/contexts/cart-context'
import { useAuth, type Coupon } from '@/contexts/auth-context'
import Link from 'next/link'
import { formatClp } from '@/lib/utils'

const NATIONAL_CLP = Number(process.env.NEXT_PUBLIC_SHIPPING_NATIONAL_CLP ?? '5000')
const INTERNATIONAL_CLP = Number(process.env.NEXT_PUBLIC_SHIPPING_INTERNATIONAL_CLP ?? '25000')
const DISTANCE_QUOTE_UI = process.env.NEXT_PUBLIC_ENABLE_SHIPPING_DISTANCE_QUOTE === 'true'

function normCountry(s: string) {
  return s.trim().toLowerCase()
}

export default function CheckoutPage() {
  const { t } = useLanguage()
  const { items, subtotal } = useCart()
  const { user, isAuthenticated, userType, getAvailableCoupons } = useAuth()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    shippingKind: 'national' as 'national' | 'international',
    nationalMode: 'flat' as 'flat' | 'distance',
    createAccount: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [showSavedCoupons, setShowSavedCoupons] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [distanceQuoteClp, setDistanceQuoteClp] = useState<number | null>(null)
  const [distanceQuoteLoading, setDistanceQuoteLoading] = useState(false)
  const [distanceQuoteNote, setDistanceQuoteNote] = useState<string | null>(null)
  
  // Pre-fill form with user data if logged in as buyer
  useEffect(() => {
    if (isAuthenticated && userType === 'buyer' && user?.type === 'buyer') {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || ''
      }))
      
      // Set default address
      const defaultAddress = user.addresses.find(a => a.isDefault)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
        setFormData(prev => ({
          ...prev,
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone,
          address: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zip: defaultAddress.zipCode,
          country: defaultAddress.country
        }))
      }
    }
  }, [isAuthenticated, userType, user])
  
  const availableCoupons = isAuthenticated && userType === 'buyer' ? getAvailableCoupons() : []
  
  const isChile = ['chile', 'cl', 'república de chile', 'republic of chile'].includes(normCountry(formData.country))

  const shippingCost = useMemo(() => {
    if (formData.shippingKind === 'international') {
      return Number.isFinite(INTERNATIONAL_CLP) ? INTERNATIONAL_CLP : 25000
    }
    if (formData.nationalMode === 'distance' && distanceQuoteClp != null) {
      return distanceQuoteClp
    }
    return Number.isFinite(NATIONAL_CLP) ? NATIONAL_CLP : 5000
  }, [formData.shippingKind, formData.nationalMode, distanceQuoteClp])

  const fetchDistanceQuote = useCallback(async () => {
    if (!DISTANCE_QUOTE_UI || formData.nationalMode !== 'distance' || !isChile) return
    if (!formData.city.trim() || !formData.state.trim()) {
      setDistanceQuoteNote('Completa ciudad y región para estimar el envío.')
      return
    }
    setDistanceQuoteLoading(true)
    setDistanceQuoteNote(null)
    try {
      const res = await fetch('/api/shipping-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: formData.city,
          state: formData.state,
          country: formData.country || 'Chile',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDistanceQuoteClp(null)
        setDistanceQuoteNote(data.error || 'No se pudo calcular el envío.')
        return
      }
      if (typeof data.shippingClp === 'number') {
        setDistanceQuoteClp(data.shippingClp)
        if (data.distanceKm != null) {
          setDistanceQuoteNote(`Distancia aprox. ${data.distanceKm} km desde bodega.`)
        } else if (data.fallback) {
          setDistanceQuoteNote(data.message || 'Se aplica tarifa plana nacional.')
        } else {
          setDistanceQuoteNote(null)
        }
      }
    } catch {
      setDistanceQuoteNote('Error de red al calcular envío.')
      setDistanceQuoteClp(null)
    } finally {
      setDistanceQuoteLoading(false)
    }
  }, [
    formData.city,
    formData.state,
    formData.country,
    formData.nationalMode,
    isChile,
  ])

  useEffect(() => {
    if (formData.shippingKind !== 'national' || formData.nationalMode !== 'distance' || !isChile) {
      setDistanceQuoteClp(null)
      setDistanceQuoteNote(null)
      return
    }
    if (!formData.city.trim() || !formData.state.trim()) {
      setDistanceQuoteClp(null)
      setDistanceQuoteNote('Completa ciudad y región para estimar el envío.')
      return
    }
    const timer = window.setTimeout(() => {
      void fetchDistanceQuote()
    }, 600)
    return () => window.clearTimeout(timer)
  }, [
    formData.shippingKind,
    formData.nationalMode,
    formData.city,
    formData.state,
    formData.country,
    isChile,
    fetchDistanceQuote,
  ])
  
  // Calculate discount
  let discount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.discount) / 100
    } else {
      discount = appliedCoupon.discount
    }
  }
  
  const total = subtotal + shippingCost - discount
  
  const handleApplyCoupon = () => {
    setCouponError('')
    
    if (!couponCode.trim()) {
      setCouponError('Ingresa un codigo')
      return
    }
    
    // Check user's saved coupons first if logged in
    if (isAuthenticated && userType === 'buyer') {
      const userCoupon = availableCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase())
      if (userCoupon) {
        setAppliedCoupon(userCoupon)
        return
      }
    }
    
    // Check for common demo coupons
    if (couponCode.toUpperCase() === 'WELCOME10') {
      setAppliedCoupon({
        id: 'guest-coupon',
        code: 'WELCOME10',
        discount: 10,
        type: 'percentage',
        expiryDate: '2025-12-31',
        used: false
      })
      return
    }
    
    if (couponCode.toUpperCase() === 'SKIN20') {
      setAppliedCoupon({
        id: 'guest-coupon-2',
        code: 'SKIN20',
        discount: 20,
        type: 'percentage',
        expiryDate: '2025-12-31',
        applicableCategories: ['skincare'],
        used: false
      })
      return
    }
    
    setCouponError('Cupon invalido o expirado')
  }
  
  const handleSelectSavedCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon)
    setCouponCode(coupon.code)
    setShowSavedCoupons(false)
  }
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
  }
  
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    if (user?.type === 'buyer') {
      const address = user.addresses.find(a => a.id === addressId)
      if (address) {
        setFormData(prev => ({
          ...prev,
          fullName: address.fullName,
          phone: address.phone,
          address: address.street,
          city: address.city,
          state: address.state,
          zip: address.zipCode,
          country: address.country
        }))
      }
    }
  }
  
  const distanceShippingBlocked =
    formData.shippingKind === 'national' &&
    formData.nationalMode === 'distance' &&
    isChile &&
    DISTANCE_QUOTE_UI &&
    (distanceQuoteLoading || distanceQuoteClp == null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (distanceShippingBlocked) {
      setSubmitError('Espera a que se calcule el envío o elige tarifa plana nacional.')
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          price: item.price,
        })),
        buyerEmail: formData.email,
        buyerName: formData.fullName,
        buyerPhone: formData.phone,
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
        shippingKind: formData.shippingKind,
        nationalMode: formData.shippingKind === 'national' ? formData.nationalMode : 'flat',
        couponCode: appliedCoupon?.code || couponCode || undefined,
        subtotal,
        shippingCost,
        discount,
        total,
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Checkout failed')
      }

      const data = await res.json()

      if (data?.initPoint) {
        // Redirect to Mercado Pago hosted checkout
        window.location.href = data.initPoint
      } else {
        throw new Error('Payment link not received')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-semibold mb-4">{t('cart.empty')}</h1>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/shop">{t('cart.continueShopping')}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">{t('nav.home')}</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-foreground transition-colors">{t('nav.shop')}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{t('checkout.title')}</span>
          </nav>
          
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">{t('checkout.title')}</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Information */}
                <section className="bg-card rounded-2xl p-6 border border-border/50">
                  <h2 className="font-serif text-xl font-semibold mb-6">{t('checkout.shipping')}</h2>
                  
                  {/* Saved Addresses Selector */}
                  {isAuthenticated && userType === 'buyer' && user?.type === 'buyer' && user.addresses.length > 0 && (
                    <div className="mb-6">
                      <Label className="mb-2 block">
                        Direcciones Guardadas
                      </Label>
                      <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar direccion" />
                        </SelectTrigger>
                        <SelectContent>
                          {user.addresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {address.label} - {address.street}, {address.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="fullName">{t('checkout.fullName')}</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">{t('checkout.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">{t('checkout.phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="address">{t('checkout.address')}</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city">{t('checkout.city')}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="state">{t('checkout.state')}</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="zip">{t('checkout.zip')}</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="country">{t('checkout.country')}</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {/* Envío nacional / internacional */}
                  <div className="mt-6">
                    <Label className="mb-3 block">Tipo de envío</Label>
                    <RadioGroup
                      value={formData.shippingKind}
                      onValueChange={(value) =>
                        handleInputChange('shippingKind', value as 'national' | 'international')
                      }
                      className="space-y-3"
                    >
                      <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-accent transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                        <RadioGroupItem value="national" id="ship-national" />
                        <div className="flex-1">
                          <p className="font-medium">Nacional (Chile)</p>
                          <p className="text-sm text-muted-foreground">
                            Desde {formatClp(Number.isFinite(NATIONAL_CLP) ? NATIONAL_CLP : 5000)}
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-accent transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                        <RadioGroupItem value="international" id="ship-international" />
                        <div className="flex-1">
                          <p className="font-medium">Internacional</p>
                          <p className="text-sm text-muted-foreground">
                            {formatClp(Number.isFinite(INTERNATIONAL_CLP) ? INTERNATIONAL_CLP : 25000)}
                          </p>
                        </div>
                      </label>
                    </RadioGroup>

                    {formData.shippingKind === 'national' && DISTANCE_QUOTE_UI && isChile && (
                      <div className="mt-4 pl-1 space-y-2">
                        <Label className="text-sm text-muted-foreground">Modalidad dentro de Chile</Label>
                        <RadioGroup
                          value={formData.nationalMode}
                          onValueChange={(value) =>
                            handleInputChange('nationalMode', value as 'flat' | 'distance')
                          }
                          className="space-y-2"
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="flat" id="nat-flat" />
                            <span className="text-sm">Tarifa plana nacional</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value="distance" id="nat-distance" />
                            <span className="text-sm">Estimación por distancia (ciudad/región)</span>
                          </label>
                        </RadioGroup>
                        {formData.nationalMode === 'distance' && (
                          <div className="text-sm text-muted-foreground pt-1">
                            {distanceQuoteLoading && <p>Calculando envío…</p>}
                            {distanceQuoteNote && <p>{distanceQuoteNote}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {formData.shippingKind === 'international' && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        El envío internacional usa tarifa fija. Asegúrate de indicar el país correcto en el
                        formulario.
                      </p>
                    )}
                  </div>
                </section>
                
                {/* Payment Method */}
                <section className="bg-card rounded-2xl p-6 border border-border/50">
                  <h2 className="font-serif text-xl font-semibold mb-6">{t('checkout.payment')}</h2>

                  <div className="p-4 rounded-xl border border-accent/40 bg-accent/5">
                    <p className="font-semibold mb-1">Mercado Pago</p>
                    <p className="text-sm text-muted-foreground">
                      You will be redirected to Mercado Pago to complete your payment securely
                      with cards, debit, or local wallets. We never store your card details.
                    </p>
                  </div>
                </section>
                
                {/* Create Account Option - only show if not logged in */}
                {!isAuthenticated && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.createAccount}
                      onCheckedChange={(checked) => handleInputChange('createAccount', !!checked)}
                    />
                    <span className="text-sm">{t('checkout.createAccount')}</span>
                  </label>
                )}
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 border border-border/50 sticky top-24">
                  <h2 className="font-serif text-xl font-semibold mb-6">{t('checkout.orderSummary')}</h2>
                  
                  {/* Items */}
                  <ul className="space-y-4 mb-6">
                    {items.map((item) => (
                      <li key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.brand}</p>
                          <p className="text-sm mt-1">
                            {item.quantity} x {formatClp(item.price)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Coupon Code Section */}
                  <div className="border-t border-border pt-4 mb-4">
                    <Label className="mb-2 block flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      Cupon de Descuento
                    </Label>
                    
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="font-mono font-medium text-green-700">{appliedCoupon.code}</span>
                          <span className="text-sm text-green-600">
                            (-{appliedCoupon.type === 'percentage' ? `${appliedCoupon.discount}%` : formatClp(appliedCoupon.discount)})
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Codigo de cupon"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="font-mono"
                          />
                          <Button type="button" variant="outline" onClick={handleApplyCoupon}>
                            Aplicar
                          </Button>
                        </div>
                        {couponError && (
                          <p className="text-sm text-destructive">{couponError}</p>
                        )}
                        
                        {/* Show saved coupons dropdown for logged-in buyers */}
                        {availableCoupons.length > 0 && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowSavedCoupons(!showSavedCoupons)}
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              Usar mis cupones guardados
                              <ChevronDown className={`h-4 w-4 transition-transform ${showSavedCoupons ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showSavedCoupons && (
                              <div className="absolute z-10 mt-2 w-full bg-card border border-border rounded-lg shadow-lg">
                                {availableCoupons.map((coupon) => (
                                  <button
                                    key={coupon.id}
                                    type="button"
                                    onClick={() => handleSelectSavedCoupon(coupon)}
                                    className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono font-medium">{coupon.code}</span>
                                      <span className="text-sm text-accent">
                                        {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `${formatClp(coupon.discount)} OFF`}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Expira: {new Date(coupon.expiryDate).toLocaleDateString()}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Totals */}
                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                      <span>{formatClp(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('cart.shipping')}</span>
                      <span>{formatClp(shippingCost)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-sm text-green-600">
                        <span>Descuento</span>
                        <span>-{formatClp(discount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-semibold text-lg pt-2 border-t border-border">
                      <span>{t('cart.total')}</span>
                      <span>{formatClp(total)}</span>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={isSubmitting || distanceShippingBlocked}
                  >
                    {isSubmitting ? t('common.loading') : t('checkout.placeOrder')}
                  </Button>
                  {submitError && (
                    <p className="text-sm text-destructive mt-3 text-center">{submitError}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
