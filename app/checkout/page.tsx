'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
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
import type { MapPinValue } from '@/components/checkout/AddressMapPicker'
import { CHILE_SHIPPING_REGIONS } from '@/lib/chile-shipping'
import { validateCommuneInRegion, getRegionForCommune } from '@/lib/chile-regions-communes'

const AddressMapPicker = dynamic(
  () => import('@/components/checkout/AddressMapPicker').then((m) => m.AddressMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] rounded-xl border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
        Cargando mapa…
      </div>
    ),
  }
)

const INTERNATIONAL_CLP = Number(process.env.NEXT_PUBLIC_SHIPPING_INTERNATIONAL_CLP ?? '25000')
/** Preview si el comprador elige “Nacional” pero el país no es Chile (el servidor aplica la misma lógica). */
const NATIONAL_NON_CHILE_CLP = Number(process.env.NEXT_PUBLIC_SHIPPING_NATIONAL_CLP ?? '5000')

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
    country: 'Chile',
    shippingKind: 'national' as 'national' | 'international',
    chileRegionCode: '',
    chileDeliveryChannel: 'domicilio' as 'domicilio' | 'punto',
    createAccount: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [showSavedCoupons, setShowSavedCoupons] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [chileQuoteClp, setChileQuoteClp] = useState<number | null>(null)
  const [chileQuoteLoading, setChileQuoteLoading] = useState(false)
  const [chileQuoteNote, setChileQuoteNote] = useState<string | null>(null)
  const [chileQuoteDetail, setChileQuoteDetail] = useState<{
    totalGrams: number
    parcelLabel: string
    eta: string
    regionLabel: string
  } | null>(null)
  const [mapPin, setMapPin] = useState<MapPinValue | null>(null)
  
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
    if (isChile && formData.shippingKind === 'national') {
      return chileQuoteClp ?? 0
    }
    return Number.isFinite(NATIONAL_NON_CHILE_CLP) ? NATIONAL_NON_CHILE_CLP : 5000
  }, [formData.shippingKind, isChile, chileQuoteClp])

  const cartLines = useMemo(
    () => items.map((i) => ({ productId: i.id, quantity: i.quantity })),
    [items]
  )

  const fetchChileShippingQuote = useCallback(async () => {
    if (formData.shippingKind !== 'national' || !isChile) return
    if (!formData.chileRegionCode.trim()) {
      setChileQuoteClp(null)
      setChileQuoteDetail(null)
      setChileQuoteNote('Selecciona la región de destino en Chile.')
      return
    }
    setChileQuoteLoading(true)
    setChileQuoteNote(null)
    try {
      const res = await fetch('/api/shipping-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: formData.country || 'Chile',
          chileRegionCode: formData.chileRegionCode,
          chileDeliveryChannel: formData.chileDeliveryChannel,
          items: cartLines,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setChileQuoteClp(null)
        setChileQuoteDetail(null)
        setChileQuoteNote(data.error || 'No se pudo cotizar el envío.')
        return
      }
      if (typeof data.shippingClp === 'number') {
        setChileQuoteClp(data.shippingClp)
        setChileQuoteDetail({
          totalGrams: data.totalGrams,
          parcelLabel: data.parcel?.label ?? '',
          eta: data.eta ?? '',
          regionLabel: data.regionLabel ?? '',
        })
        setChileQuoteNote(
          `~${data.totalGrams} g totales · ${data.parcel?.label ?? ''} · ${data.eta ?? ''}`
        )
      }
    } catch {
      setChileQuoteNote('Error de red al cotizar envío.')
      setChileQuoteClp(null)
      setChileQuoteDetail(null)
    } finally {
      setChileQuoteLoading(false)
    }
  }, [
    formData.shippingKind,
    formData.country,
    formData.chileRegionCode,
    formData.chileDeliveryChannel,
    isChile,
    cartLines,
  ])

  useEffect(() => {
    if (formData.shippingKind !== 'national' || !isChile) {
      setChileQuoteClp(null)
      setChileQuoteDetail(null)
      setChileQuoteNote(null)
      return
    }
    const timer = window.setTimeout(() => {
      void fetchChileShippingQuote()
    }, 450)
    return () => window.clearTimeout(timer)
  }, [formData.shippingKind, isChile, fetchChileShippingQuote])
  
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
  
  const chileShippingBlocked =
    formData.shippingKind === 'national' &&
    isChile &&
    (chileQuoteLoading || chileQuoteClp == null || !formData.chileRegionCode.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (chileShippingBlocked) {
      setSubmitError('Selecciona región y tipo de entrega y espera la cotización de envío.')
      return
    }
    
    // Validar que la región y ciudad sean consistentes en Chile
    if (isChile && formData.shippingKind === 'national' && formData.chileRegionCode && formData.city) {
      const detectedRegion = getRegionForCommune(formData.city)
      if (detectedRegion && detectedRegion !== formData.chileRegionCode) {
        setSubmitError(
          `La comuna "${formData.city}" pertenece a la región ${CHILE_SHIPPING_REGIONS.find((r) => r.code === detectedRegion)?.label || detectedRegion}, ` +
          `pero seleccionaste ${CHILE_SHIPPING_REGIONS.find((r) => r.code === formData.chileRegionCode)?.label || formData.chileRegionCode}. ` +
          `Por favor, corrige la región o verifica la comuna para evitar fraudes de envío.`
        )
        return
      }
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
          ...(mapPin ? { lat: mapPin.lat, lng: mapPin.lng } : {}),
        },
        shippingKind: formData.shippingKind,
        chileRegionCode:
          formData.shippingKind === 'national' && isChile ? formData.chileRegionCode : undefined,
        chileDeliveryChannel:
          formData.shippingKind === 'national' && isChile ? formData.chileDeliveryChannel : undefined,
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

                    <div className="md:col-span-2 space-y-2 pt-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Label className="text-foreground">Ubicación en el mapa (opcional)</Label>
                        {mapPin != null && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setMapPin(null)}>
                            Quitar marcador
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Haz clic en el mapa para marcar el punto de entrega (ayuda al repartidor; el costo del envío se
                        calcula por peso total del pedido y región).
                      </p>
                      <AddressMapPicker value={mapPin} onChange={setMapPin} />
                    </div>
                  </div>
                  
                  {/* Envío: Chile por peso / región / Blue Express */}
                  <div className="mt-6 space-y-4">
                    <Label className="mb-1 block">Ámbito del envío</Label>
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
                          <p className="font-medium">Chile</p>
                          <p className="text-sm text-muted-foreground">
                            Tarifa según región, tipo de entrega y peso del carrito (ml → gramos por producto).
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-accent transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                        <RadioGroupItem value="international" id="ship-international" />
                        <div className="flex-1">
                          <p className="font-medium">Internacional</p>
                          <p className="text-sm text-muted-foreground">
                            {formatClp(Number.isFinite(INTERNATIONAL_CLP) ? INTERNATIONAL_CLP : 25000)} envío estimado
                          </p>
                        </div>
                      </label>
                    </RadioGroup>

                    {formData.shippingKind === 'national' && isChile && (
                      <div className="space-y-4 rounded-xl border border-border/60 p-4 bg-muted/30">
                        <div>
                          <Label className="mb-2 block">Región de destino</Label>
                          <Select
                            value={formData.chileRegionCode || undefined}
                            onValueChange={(code) => {
                              const row = CHILE_SHIPPING_REGIONS.find((r) => r.code === code)
                              setFormData((prev) => ({
                                ...prev,
                                chileRegionCode: code,
                                state: row?.label ?? prev.state,
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona región" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[280px]">
                              {CHILE_SHIPPING_REGIONS.map((r) => (
                                <SelectItem key={r.code} value={r.code}>
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Zona logística:{' '}
                            {formData.chileRegionCode
                              ? CHILE_SHIPPING_REGIONS.find((x) => x.code === formData.chileRegionCode)?.zone ?? '—'
                              : '—'}
                          </p>
                        </div>

                        <div>
                          <Label className="mb-2 block">Tipo de entrega (Chile)</Label>
                          <RadioGroup
                            value={formData.chileDeliveryChannel}
                            onValueChange={(value) =>
                              handleInputChange('chileDeliveryChannel', value as 'domicilio' | 'punto')
                            }
                            className="space-y-2"
                          >
                            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-transparent p-2 has-[:checked]:border-accent has-[:checked]:bg-background">
                              <RadioGroupItem value="domicilio" id="del-dom" />
                              <span className="text-sm">Despacho a domicilio</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-transparent p-2 has-[:checked]:border-accent has-[:checked]:bg-background">
                              <RadioGroupItem value="punto" id="del-punto" />
                              <span className="text-sm">Retiro en punto (Blue Express u operador asociado)</span>
                            </label>
                          </RadioGroup>
                          <p className="text-xs text-muted-foreground mt-2">
                            Bulto XS hasta 0,5 kg; S hasta 3 kg. Si superas 3 kg se cotizan varios bultos S. Asegúrate
                            de que cada producto tenga ml y conversión a gramos cargados en la tienda.
                          </p>
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          {chileQuoteLoading && <p>Cotizando envío…</p>}
                          {!chileQuoteLoading && chileQuoteNote && <p>{chileQuoteNote}</p>}
                          {!chileQuoteLoading && chileQuoteClp != null && chileQuoteDetail && (
                            <p className="text-foreground font-medium">
                              Envío: {formatClp(chileQuoteClp)}{' '}
                              <span className="font-normal text-muted-foreground">
                                · {chileQuoteDetail.parcelLabel}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {formData.shippingKind === 'national' && !isChile && (
                      <p className="text-sm text-muted-foreground">
                        Envío nacional fuera de Chile (país distinto): tarifa plana estimada{' '}
                        {formatClp(NATIONAL_NON_CHILE_CLP)}. Verifica el país en el formulario.
                      </p>
                    )}

                    {formData.shippingKind === 'international' && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        El envío internacional usa tarifa fija en esta tienda. Indica país y dirección completos.
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
                    disabled={isSubmitting || chileShippingBlocked}
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
