import type { Metadata } from 'next'
import { PolicyPage } from '@/components/policies/policy-page'
import { getPolicyPage } from '@/lib/policies'
import { toAbsoluteUrl } from '@/lib/site-url'

const page = getPolicyPage('privacidad')!

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: toAbsoluteUrl('/politicas/privacidad'),
  },
}

export default function PrivacyPolicyPage() {
  return <PolicyPage page={page} />
}
