'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Ticket, ArrowLeft, Copy, Check, Clock, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/language-context'
import { useAuth, type Coupon } from '@/contexts/auth-context'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function CouponsPage() {
  const { language } = useLanguage()
  const { user, isAuthenticated, userType } = useAuth()
  const router = useRouter()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  useEffect(() => {
    if (!isAuthenticated || userType !== 'buyer') {
      router.push('/auth/login?returnUrl=/account/coupons')
    }
  }, [isAuthenticated, userType, router])
  
  if (!user || user.type !== 'buyer') {
    return null
  }
  
  const activeCoupons = user.coupons.filter(c => !c.used && new Date(c.expiryDate) > new Date())
  const usedCoupons = user.coupons.filter(c => c.used)
  const expiredCoupons = user.coupons.filter(c => !c.used && new Date(c.expiryDate) <= new Date())
  
  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }
  
  const getDaysUntilExpiry = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }
  
  const CouponCard = ({ coupon, status }: { coupon: Coupon; status: 'active' | 'used' | 'expired' }) => {
    const daysLeft = getDaysUntilExpiry(coupon.expiryDate)
    const isActive = status === 'active'
    
    return (
      <Card className={`relative overflow-hidden ${!isActive ? 'opacity-60' : ''}`}>
        <div className={`absolute inset-0 ${isActive ? 'bg-gradient-to-br from-primary/10 via-transparent to-accent/10' : 'bg-secondary/50'}`} />
        
        {/* Coupon cutout design */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-background rounded-r-full" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-background rounded-l-full" />
        
        <CardContent className="relative p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Tag className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-mono text-xl font-bold text-foreground">{coupon.code}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `$${coupon.discount} OFF`}
                </Badge>
                {coupon.applicableCategories && (
                  <Badge variant="outline" className="text-xs">
                    {coupon.applicableCategories.join(', ')}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {status === 'active' ? (
                    <span className={daysLeft <= 7 ? 'text-orange-500' : ''}>
                      {daysLeft} {language === 'es' ? 'dias restantes' : 'days left'}
                    </span>
                  ) : status === 'used' ? (
                    <span>{language === 'es' ? 'Usado' : 'Used'}</span>
                  ) : (
                    <span>{language === 'es' ? 'Expirado' : 'Expired'}</span>
                  )}
                </div>
                {coupon.minPurchase && (
                  <span>
                    {language === 'es' ? 'Min.' : 'Min.'} ${coupon.minPurchase}
                  </span>
                )}
              </div>
            </div>
            
            {isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyCode(coupon.code)}
                className="shrink-0"
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Copiado!' : 'Copied!'}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Copiar Codigo' : 'Copy Code'}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/account/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Volver al Dashboard' : 'Back to Dashboard'}
            </Button>
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
            {language === 'es' ? 'Mis Cupones' : 'My Coupons'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'es' 
              ? `${activeCoupons.length} cupones activos`
              : `${activeCoupons.length} active coupons`}
          </p>
        </div>
        
        {user.coupons.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Ticket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {language === 'es' ? 'No tienes cupones' : 'No coupons yet'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'es' 
                  ? 'Los cupones apareceran aqui cuando los obtengas'
                  : 'Coupons will appear here when you get them'}
              </p>
              <Link href="/shop">
                <Button>
                  {language === 'es' ? 'Explorar Tienda' : 'Explore Shop'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Coupons */}
            {activeCoupons.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {language === 'es' ? 'Cupones Activos' : 'Active Coupons'}
                </h2>
                <div className="space-y-4">
                  {activeCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} status="active" />
                  ))}
                </div>
              </section>
            )}
            
            {/* Used Coupons */}
            {usedCoupons.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  {language === 'es' ? 'Cupones Usados' : 'Used Coupons'}
                </h2>
                <div className="space-y-4">
                  {usedCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} status="used" />
                  ))}
                </div>
              </section>
            )}
            
            {/* Expired Coupons */}
            {expiredCoupons.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  {language === 'es' ? 'Cupones Expirados' : 'Expired Coupons'}
                </h2>
                <div className="space-y-4">
                  {expiredCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} status="expired" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
