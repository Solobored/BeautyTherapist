import type { Metadata } from 'next'
import { PolicyPage } from '@/components/policies/policy-page'
import { getPolicyPage } from '@/lib/policies'
import { toAbsoluteUrl } from '@/lib/site-url'

const page = getPolicyPage('devoluciones')!

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: toAbsoluteUrl('/politicas/devoluciones'),
  },
}

export default function ReturnsPolicyPage() {
  return <PolicyPage page={page} />
}
