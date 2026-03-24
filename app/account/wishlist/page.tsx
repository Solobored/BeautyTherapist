'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { useAuth } from '@/contexts/auth-context'
import { products } from '@/lib/data'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'

export default function WishlistPage() {
  const { language } = useLanguage()
  const { user, isAuthenticated, userType } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isAuthenticated || userType !== 'buyer') {
      router.push('/auth/login?returnUrl=/account/wishlist')
    }
  }, [isAuthenticated, userType, router])
  
  if (!user || user.type !== 'buyer') {
    return null
  }
  
  const wishlistProducts = products.filter(p => user.wishlist.includes(p.id))
  
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
            {language === 'es' ? 'Mi Lista de Deseos' : 'My Wishlist'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'es' 
              ? `${wishlistProducts.length} productos guardados`
              : `${wishlistProducts.length} saved products`}
          </p>
        </div>
        
        {wishlistProducts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {language === 'es' ? 'Tu lista esta vacia' : 'Your wishlist is empty'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'es' 
                  ? 'Guarda tus productos favoritos haciendo clic en el corazon'
                  : 'Save your favorite products by clicking the heart icon'}
              </p>
              <Link href="/shop">
                <Button>
                  {language === 'es' ? 'Explorar Tienda' : 'Explore Shop'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}
