'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, ShoppingBag, Store, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

type AccountType = 'buyer' | 'seller'

export default function RegisterPage() {
  const { language } = useLanguage()
  const { registerBuyer, registerSeller } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [accountType, setAccountType] = useState<AccountType>('buyer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Buyer fields
  const [buyerData, setBuyerData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthday: '',
    acceptTerms: false
  })
  
  // Seller fields
  const [sellerData, setSellerData] = useState({
    brandName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    brandDescription: '',
    category: '' as 'skincare' | 'makeup' | 'both' | '',
    acceptTerms: false
  })
  
  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'seller' || type === 'buyer') {
      setAccountType(type)
    }
  }, [searchParams])
  
  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (buyerData.password !== buyerData.confirmPassword) {
      setError(language === 'es' ? 'Las contrasenas no coinciden' : 'Passwords do not match')
      return
    }
    
    if (!buyerData.acceptTerms) {
      setError(language === 'es' ? 'Debes aceptar los terminos y condiciones' : 'You must accept the terms and conditions')
      return
    }
    
    setIsLoading(true)
    
    try {
      const success = await registerBuyer({
        fullName: buyerData.fullName,
        email: buyerData.email,
        password: buyerData.password,
        phone: buyerData.phone || undefined,
        birthday: buyerData.birthday || undefined
      })
      
      if (success) {
        router.push('/account/dashboard')
      } else {
        setError(language === 'es' ? 'Error al crear la cuenta' : 'Failed to create account')
      }
    } catch {
      setError(language === 'es' ? 'Ha ocurrido un error' : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (sellerData.password !== sellerData.confirmPassword) {
      setError(language === 'es' ? 'Las contrasenas no coinciden' : 'Passwords do not match')
      return
    }
    
    if (!sellerData.acceptTerms) {
      setError(language === 'es' ? 'Debes aceptar los terminos y condiciones' : 'You must accept the terms and conditions')
      return
    }
    
    if (!sellerData.category) {
      setError(language === 'es' ? 'Selecciona una categoria' : 'Please select a category')
      return
    }
    
    setIsLoading(true)
    
    try {
      const success = await registerSeller({
        brandName: sellerData.brandName,
        ownerName: sellerData.ownerName,
        email: sellerData.email,
        password: sellerData.password,
        phone: sellerData.phone,
        country: sellerData.country,
        brandDescription: sellerData.brandDescription,
        category: sellerData.category as 'skincare' | 'makeup' | 'both'
      })
      
      if (success) {
        router.push('/seller/dashboard')
      } else {
        setError(language === 'es' ? 'Error al crear la cuenta' : 'Failed to create account')
      }
    } catch {
      setError(language === 'es' ? 'Ha ocurrido un error' : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              Beauty Therapist
            </h1>
          </Link>
        </div>
        
        {/* Account Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-secondary p-1">
            <button
              onClick={() => setAccountType('buyer')}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all',
                accountType === 'buyer'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ShoppingBag className="w-4 h-4" />
              {language === 'es' ? 'Comprar como Cliente' : 'Shop as Customer'}
            </button>
            <button
              onClick={() => setAccountType('seller')}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all',
                accountType === 'seller'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Store className="w-4 h-4" />
              {language === 'es' ? 'Vender mi Marca' : 'Sell my Brand'}
            </button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">
              {accountType === 'buyer' 
                ? (language === 'es' ? 'Crear Cuenta de Cliente' : 'Create Customer Account')
                : (language === 'es' ? 'Registrar mi Marca' : 'Register my Brand')}
            </CardTitle>
            <CardDescription>
              {accountType === 'buyer'
                ? (language === 'es' 
                    ? 'Unete y disfruta de beneficios exclusivos'
                    : 'Join and enjoy exclusive benefits')
                : (language === 'es'
                    ? 'Comienza a vender tus productos de belleza'
                    : 'Start selling your beauty products')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between">
                {error}
                <button onClick={() => setError('')}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {accountType === 'buyer' ? (
              /* Buyer Registration Form */
              <form onSubmit={handleBuyerSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {language === 'es' ? 'Nombre Completo' : 'Full Name'} *
                  </Label>
                  <Input
                    id="fullName"
                    value={buyerData.fullName}
                    onChange={(e) => setBuyerData({ ...buyerData, fullName: e.target.value })}
                    placeholder={language === 'es' ? 'Tu nombre completo' : 'Your full name'}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {language === 'es' ? 'Correo Electronico' : 'Email Address'} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={buyerData.email}
                    onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {language === 'es' ? 'Contrasena' : 'Password'} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={buyerData.password}
                        onChange={(e) => setBuyerData({ ...buyerData, password: e.target.value })}
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {language === 'es' ? 'Confirmar Contrasena' : 'Confirm Password'} *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={buyerData.confirmPassword}
                      onChange={(e) => setBuyerData({ ...buyerData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {language === 'es' ? 'Telefono' : 'Phone'} ({language === 'es' ? 'opcional' : 'optional'})
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={buyerData.phone}
                      onChange={(e) => setBuyerData({ ...buyerData, phone: e.target.value })}
                      placeholder="+1 555 123 4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthday">
                      {language === 'es' ? 'Fecha de Nacimiento' : 'Birthday'} ({language === 'es' ? 'para cupon de cumpleanos' : 'for birthday coupon'})
                    </Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={buyerData.birthday}
                      onChange={(e) => setBuyerData({ ...buyerData, birthday: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex items-start gap-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={buyerData.acceptTerms}
                    onCheckedChange={(checked) => setBuyerData({ ...buyerData, acceptTerms: checked as boolean })}
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    {language === 'es'
                      ? 'Acepto los Terminos y Condiciones y la Politica de Privacidad'
                      : 'I accept the Terms & Conditions and Privacy Policy'}
                  </Label>
                </div>
                
                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'es' ? 'Creando cuenta...' : 'Creating account...'}
                    </>
                  ) : (
                    language === 'es' ? 'Crear mi Cuenta' : 'Create my Account'
                  )}
                </Button>
              </form>
            ) : (
              /* Seller Registration Form */
              <form onSubmit={handleSellerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandName">
                      {language === 'es' ? 'Nombre de la Marca' : 'Brand Name'} *
                    </Label>
                    <Input
                      id="brandName"
                      value={sellerData.brandName}
                      onChange={(e) => setSellerData({ ...sellerData, brandName: e.target.value })}
                      placeholder="AngeBae"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">
                      {language === 'es' ? 'Nombre del Propietario' : 'Owner Full Name'} *
                    </Label>
                    <Input
                      id="ownerName"
                      value={sellerData.ownerName}
                      onChange={(e) => setSellerData({ ...sellerData, ownerName: e.target.value })}
                      placeholder={language === 'es' ? 'Nombre completo' : 'Full name'}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">
                    {language === 'es' ? 'Correo de Negocio' : 'Business Email'} *
                  </Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={sellerData.email}
                    onChange={(e) => setSellerData({ ...sellerData, email: e.target.value })}
                    placeholder="contact@yourbrand.com"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellerPassword">
                      {language === 'es' ? 'Contrasena' : 'Password'} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="sellerPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={sellerData.password}
                        onChange={(e) => setSellerData({ ...sellerData, password: e.target.value })}
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sellerConfirmPassword">
                      {language === 'es' ? 'Confirmar Contrasena' : 'Confirm Password'} *
                    </Label>
                    <Input
                      id="sellerConfirmPassword"
                      type="password"
                      value={sellerData.confirmPassword}
                      onChange={(e) => setSellerData({ ...sellerData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellerPhone">
                      {language === 'es' ? 'Telefono' : 'Phone'} *
                    </Label>
                    <Input
                      id="sellerPhone"
                      type="tel"
                      value={sellerData.phone}
                      onChange={(e) => setSellerData({ ...sellerData, phone: e.target.value })}
                      placeholder="+1 555 123 4567"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      {language === 'es' ? 'Pais' : 'Country'} *
                    </Label>
                    <Select
                      value={sellerData.country}
                      onValueChange={(value) => setSellerData({ ...sellerData, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'es' ? 'Seleccionar pais' : 'Select country'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Mexico">Mexico</SelectItem>
                        <SelectItem value="Spain">Spain</SelectItem>
                        <SelectItem value="Argentina">Argentina</SelectItem>
                        <SelectItem value="Colombia">Colombia</SelectItem>
                        <SelectItem value="Chile">Chile</SelectItem>
                        <SelectItem value="Peru">Peru</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">
                    {language === 'es' ? 'Categoria' : 'Category'} *
                  </Label>
                  <Select
                    value={sellerData.category}
                    onValueChange={(value) => setSellerData({ ...sellerData, category: value as 'skincare' | 'makeup' | 'both' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'es' ? 'Seleccionar categoria' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skincare">Skincare</SelectItem>
                      <SelectItem value="makeup">{language === 'es' ? 'Maquillaje' : 'Makeup'}</SelectItem>
                      <SelectItem value="both">{language === 'es' ? 'Ambos' : 'Both'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brandLogo">
                    {language === 'es' ? 'Logo de la Marca' : 'Brand Logo'} ({language === 'es' ? 'opcional' : 'optional'})
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'es' ? 'Haz clic para subir o arrastra aqui' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG hasta 2MB</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brandDescription">
                    {language === 'es' ? 'Descripcion de la Marca' : 'Brand Description'} ({language === 'es' ? 'opcional' : 'optional'})
                  </Label>
                  <Textarea
                    id="brandDescription"
                    value={sellerData.brandDescription}
                    onChange={(e) => setSellerData({ ...sellerData, brandDescription: e.target.value })}
                    placeholder={language === 'es' 
                      ? 'Cuentanos sobre tu marca y productos...'
                      : 'Tell us about your brand and products...'}
                    rows={3}
                  />
                </div>
                
                <div className="flex items-start gap-2 pt-2">
                  <Checkbox
                    id="sellerTerms"
                    checked={sellerData.acceptTerms}
                    onCheckedChange={(checked) => setSellerData({ ...sellerData, acceptTerms: checked as boolean })}
                  />
                  <Label htmlFor="sellerTerms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    {language === 'es'
                      ? 'Acepto los Terminos de Vendedor y la Politica de Comisiones'
                      : 'I accept the Seller Terms and Commission Policy'}
                  </Label>
                </div>
                
                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'es' ? 'Registrando marca...' : 'Registering brand...'}
                    </>
                  ) : (
                    language === 'es' ? 'Registrar mi Marca' : 'Register my Brand'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-muted-foreground">
          {language === 'es' ? 'Ya tienes una cuenta?' : 'Already have an account?'}{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            {language === 'es' ? 'Iniciar Sesion' : 'Login'}
          </Link>
        </p>
      </div>
    </main>
  )
}
