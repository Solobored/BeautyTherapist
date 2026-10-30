'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { SellerProfileEditor } from '@/components/seller-profile-editor'
import { SellerAccountCredentialsCard } from '@/components/seller/SellerAccountCredentialsCard'
import { SellerMercadoPagoConnectCard } from '@/components/seller/SellerMercadoPagoConnectCard'
import { ShippingGroupsManager } from '@/components/seller/ShippingGroupsManager'
import { SellerVideosManager } from '@/components/seller/SellerVideosManager'
import { SellerCouponsManager } from '@/components/seller/SellerCouponsManager'
import { SellerCategoriesManager } from '@/components/seller/SellerCategoriesManager'
import { DashboardShell } from '@/components/seller/dashboard/dashboard-shell'
import { OverviewSection } from '@/components/seller/dashboard/overview-section'
import { SalesSection } from '@/components/seller/dashboard/sales-section'
import { FinanceSection } from '@/components/seller/dashboard/finance-section'
import { CostsSection } from '@/components/seller/dashboard/costs-section'
import { ReviewsSection } from '@/components/seller/dashboard/reviews-section'
import { FeaturedSection } from '@/components/seller/dashboard/featured-section'
import { isSectionId, type SectionId } from '@/components/seller/dashboard/nav-config'
import { useSellerFinance } from '@/components/seller/dashboard/use-seller-finance'
import { useAuth } from '@/contexts/auth-context'
import { useSellerProducts, sellerApiHeaders } from '@/hooks/use-seller-products'
import { brandNameToSlug } from '@/lib/seller-utils'

function DashboardContent() {
  const { seller, isAuthenticated, isAuthLoading, logout, updateSellerProfile } = useAuth()
  const { products, loading } = useSellerProducts()
  const router = useRouter()
  const params = useSearchParams()
  const fin = useSellerFinance(seller)
  const [savingProfile, setSavingProfile] = useState(false)
  const profileFetched = useRef(false)

  const raw = params.get('s')
  const section: SectionId = isSectionId(raw) ? raw : 'resumen'
  const go = (id: SectionId) => {
    router.replace(id === 'resumen' ? '/seller/dashboard' : `/seller/dashboard?s=${id}`, { scroll: false })
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.push('/seller/login')
  }, [isAuthLoading, isAuthenticated, router])

  // Sincroniza el perfil público de la marca una sola vez.
  useEffect(() => {
    if (!seller?.email || profileFetched.current) return
    profileFetched.current = true
    ;(async () => {
      try {
        const res = await fetch('/api/seller/profile', { headers: sellerApiHeaders(seller) })
        const json = await res.json().catch(() => ({}))
        if (res.ok && json.brand) {
          const b = json.brand
          updateSellerProfile({
            brandName: b.brand_name ?? seller.brandName, brandLogo: b.logo_url ?? seller.brandLogo,
            brandBanner: b.banner_url ?? seller.brandBanner, brandDescription: b.description ?? seller.brandDescription,
            facebookUrl: b.facebook_url ?? seller.facebookUrl, instagramUrl: b.instagram_url ?? seller.instagramUrl,
            tiktokUrl: b.tiktok_url ?? seller.tiktokUrl,
          })
        }
      } catch { /* sin perfil remoto: se usa el de sesión */ }
    })()
  }, [seller, updateSellerProfile])

  if (isAuthLoading || !isAuthenticated || !seller || loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground" role="status">Cargando panel…</div>
  }

  const saveBrand = async (data: Parameters<typeof updateSellerProfile>[0]) => {
    setSavingProfile(true)
    try {
      const res = await fetch('/api/seller/profile', { method: 'PUT', headers: { ...sellerApiHeaders(seller), 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No se pudo guardar la marca')
      updateSellerProfile({ ...data })
      toast.success('Marca actualizada')
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error al guardar') } finally { setSavingProfile(false) }
  }

  const sellerLite = { email: seller.email, brandName: seller.brandName }

  return (
    <DashboardShell
      active={section} onNavigate={go} brandName={seller.brandName} brandLogo={seller.brandLogo}
      storeHref={`/brands/${brandNameToSlug(seller.brandName)}`} period={fin.period} onPeriodChange={fin.setPeriod} onLogout={() => void logout()}
    >
      {fin.error && <div role="alert" className="mb-4 rounded-2xl border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">No pudimos actualizar tus pedidos: {fin.error}</div>}

      {section === 'resumen' && <OverviewSection fin={fin} products={products} />}
      {section === 'ventas' && <SalesSection fin={fin} />}
      {section === 'finanzas' && <FinanceSection fin={fin} />}
      {section === 'costos' && <CostsSection fin={fin} products={products} seller={sellerLite} />}
      {section === 'categorias' && <SellerCategoriesManager seller={seller} products={products} />}
      {section === 'destacados' && <FeaturedSection seller={sellerLite} products={products} />}
      {section === 'videos' && <SellerVideosManager seller={seller} products={products.map((p) => ({ id: p.id, name: p.name, nameEs: p.nameEs }))} />}
      {section === 'cupones' && <SellerCouponsManager seller={sellerLite} />}
      {section === 'resenas' && <ReviewsSection seller={sellerLite} />}
      {section === 'envios' && (
        <ShippingGroupsManager seller={seller} products={products.map((p) => ({ id: p.id, name: p.name, nameEs: p.nameEs, shippingMode: p.shippingMode, shippingGroupId: p.shippingGroupId, netContentMl: p.netContentMl, weightOverrideG: p.weightOverrideG }))} />
      )}
      {section === 'mi-marca' && (
        <div className="grid max-w-5xl gap-6">
          <SellerProfileEditor brandName={seller.brandName} brandLogo={seller.brandLogo} brandBanner={seller.brandBanner} brandDescription={seller.brandDescription}
            facebookUrl={seller.facebookUrl} instagramUrl={seller.instagramUrl} tiktokUrl={seller.tiktokUrl} onSave={saveBrand} isLoading={savingProfile} />
          <SellerAccountCredentialsCard />
          <SellerMercadoPagoConnectCard />
        </div>
      )}
    </DashboardShell>
  )
}

export default function SellerDashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Cargando panel…</div>}>
      <DashboardContent />
    </Suspense>
  )
}
