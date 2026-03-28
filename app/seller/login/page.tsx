'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'

export default function SellerLoginPage() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    const result = await login(email, password)

    if (result.success) {
      router.push(result.redirectTo || '/seller/dashboard')
    } else {
      setError('Invalid email or password')
    }
    
    setIsLoading(false)
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
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
        
        {/* Login Form */}
        <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
          <h1 className="font-serif text-2xl font-semibold text-center mb-6">{t('seller.login')}</h1>
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('seller.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="angebae@gmail.com"
              />
            </div>
            
            <div>
              <Label htmlFor="password">{t('seller.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="••••••••"
              />
            </div>
            
            <div className="text-right">
              <Link href="#" className="text-sm text-accent hover:underline">
                {t('seller.forgotPassword')}
              </Link>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('seller.login')}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t('seller.noAccount')}{' '}
            <Link href="/seller/register" className="text-accent hover:underline font-medium">
              {t('seller.register')}
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
