'use client'

import Link from 'next/link'
import { ShoppingBag, Store, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/contexts/language-context'

export default function AuthPage() {
  const { language } = useLanguage()
  
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Beauty Therapist
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2">
            {language === 'es' ? 'Unete a nuestra comunidad de belleza' : 'Join our beauty community'}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Buyer Card */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl">
                {language === 'es' ? 'Quiero Comprar' : 'I Want to Shop'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'es' 
                  ? 'Crea tu cuenta de cliente y disfruta de beneficios exclusivos'
                  : 'Create your customer account and enjoy exclusive benefits'}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {language === 'es' ? 'Guarda tus direcciones de envio' : 'Save your shipping addresses'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {language === 'es' ? 'Rastrea tu historial de pedidos' : 'Track your order history'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {language === 'es' ? 'Obtén cupones de descuento exclusivos' : 'Get exclusive discount coupons'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {language === 'es' ? 'Guarda tus productos favoritos' : 'Save your favorite products'}
                </li>
              </ul>
              <Link href="/auth/register?type=buyer" className="block">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 group">
                  {language === 'es' ? 'Registrarme como Cliente' : 'Register as Customer'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Seller Card */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow border-2 hover:border-accent/50">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
            <CardHeader className="relative">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Store className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="font-serif text-2xl">
                {language === 'es' ? 'Quiero Vender' : 'I Want to Sell'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'es' 
                  ? 'Registra tu marca y comienza a vender tus productos'
                  : 'Register your brand and start selling your products'}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {language === 'es' ? 'Gestiona tu catalogo de productos' : 'Manage your product catalog'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {language === 'es' ? 'Analiza tus ventas y metricas' : 'Analyze your sales and metrics'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {language === 'es' ? 'Administra pedidos e inventario' : 'Manage orders and inventory'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {language === 'es' ? 'Personaliza tu pagina de marca' : 'Customize your brand page'}
                </li>
              </ul>
              <Link href="/auth/register?type=seller" className="block">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 group">
                  {language === 'es' ? 'Registrar mi Marca' : 'Register my Brand'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            {language === 'es' ? 'Ya tienes una cuenta?' : 'Already have an account?'}{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              {language === 'es' ? 'Iniciar Sesion' : 'Login'}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
