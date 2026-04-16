export type SellerIdentityLike = {
  id?: string | null
  email?: string | null
  brandName?: string | null
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function buildSellerApiHeaders(seller: SellerIdentityLike): Record<string, string> {
  // Seller auth is now resolved server-side from the HttpOnly session cookie.
  // We keep the helper so existing fetch call sites don't need custom branching.
  void seller
  return {}
}
