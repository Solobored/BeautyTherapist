'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'

export default function SellerRegisterPage() {
  const { t } = useLanguage()
  const { register } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    brandName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    acceptTerms: false
  })
  
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions')
      return
    }
    
    setIsLoading(true)
    
    const success = await register({
      brandName: formData.brandName,
      ownerName: formData.ownerName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      country: formData.country
    })
    
    if (success) {
      router.push('/seller/dashboard')
    } else {
      setError('Registration failed. Please try again.')
    }
    
    setIsLoading(false)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Beauty & Therapy
            </span>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">Seller Portal</p>
        </div>
        
        {/* Register Form */}
        <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
          <h1 className="font-serif text-2xl font-semibold text-center mb-6">{t('seller.register')}</h1>
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="brandName">{t('seller.brandName')}</Label>
              <Input
                id="brandName"
                value={formData.brandName}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
                required
                className="mt-1"
                placeholder="Your Brand Name"
              />
            </div>
            
            <div>
              <Label htmlFor="ownerName">{t('seller.ownerName')}</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                required
                className="mt-1"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <Label htmlFor="email">{t('seller.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">{t('seller.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('seller.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  className="mt-1"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">{t('seller.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                className="mt-1"
                placeholder="+1 555 123 4567"
              />
            </div>
            
            <div>
              <Label htmlFor="country">{t('seller.country')}</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                required
                className="mt-1"
                placeholder="United States"
              />
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleInputChange('acceptTerms', !!checked)}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                {t('seller.terms')}
              </span>
            </label>
            
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('seller.createAccount')}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t('seller.alreadyHaveAccount')}{' '}
            <Link href="/seller/login" className="text-accent hover:underline font-medium">
              {t('seller.login')}
            </Link>
          </div>
        </div>
        
        {/* Back to store */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            &larr; Back to store
          </Link>
        </div>
      </div>
    </div>
  )
}
