'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'

function LoginContent() {
  const { language } = useLanguage()
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const result = await login(email, password)
      if (result.success) {
        router.push(returnUrl || result.redirectTo)
      } else {
        setError(language === 'es' 
          ? 'Correo o contrasena incorrectos' 
          : 'Invalid email or password')
      }
    } catch {
      setError(language === 'es' 
        ? 'Ha ocurrido un error. Intenta de nuevo.' 
        : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              Beauty & Therapy
            </h1>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">
              {language === 'es' ? 'Iniciar Sesion' : 'Login'}
            </CardTitle>
            <CardDescription>
              {language === 'es' 
                ? 'Ingresa a tu cuenta de cliente o vendedor'
                : 'Sign in to your customer or seller account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  {language === 'es' ? 'Correo Electronico' : 'Email Address'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">
                    {language === 'es' ? 'Contrasena' : 'Password'}
                  </Label>
                  <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                    {language === 'es' ? 'Olvidaste tu contrasena?' : 'Forgot password?'}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
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
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'es' ? 'Ingresando...' : 'Signing in...'}
                  </>
                ) : (
                  language === 'es' ? 'Iniciar Sesion' : 'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-muted-foreground">
          {language === 'es' ? 'No tienes cuenta?' : "Don't have an account?"}{' '}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            {language === 'es' ? 'Registrate' : 'Register'}
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
