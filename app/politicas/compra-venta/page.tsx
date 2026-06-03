import type { Metadata } from 'next'
import { PolicyPage } from '@/components/policies/policy-page'
import { getPolicyPage } from '@/lib/policies'
import { toAbsoluteUrl } from '@/lib/site-url'

const page = getPolicyPage('compra-venta')!

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: toAbsoluteUrl('/politicas/compra-venta'),
  },
}

export default function PurchaseTermsPage() {
  return <PolicyPage page={page} />
}
