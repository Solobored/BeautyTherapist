import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { MorePageContent } from '@/components/more-page-content'

export const metadata: Metadata = {
  title: 'Más',
  description: 'Ayuda, información y políticas de Beauty & Therapy.',
}

export default function MorePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <main className="flex-1">
        <MorePageContent />
      </main>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  )
}