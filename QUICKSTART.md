# Quick Start Guide

Get your Beauty Therapist marketplace running in 15 minutes.

## Prerequisites

- Node.js 18+
- pnpm (or npm)
- Git

## 1. Clone & Install (2 min)

```bash
cd BeautyTherapist
pnpm install
```

## 2. Setup Services (8 min)

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create free project
3. Go → Settings → API → Copy these to `.env.local`:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

### Stripe
1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Switch to **Test Mode**
4. Developers → API Keys → Copy to `.env.local`:
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - STRIPE_SECRET_KEY
5. Create webhook: Developers → Webhooks
   - Endpoint: `http://localhost:3000/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy STRIPE_WEBHOOK_SECRET

### Cloudinary
1. Go to [cloudinary.com](https://cloudinary.com)
2. Dashboard → Copy to `.env.local`:
   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

### Resend
1. Go to [resend.com](https://resend.com)
2. Copy API key to `.env.local`: RESEND_API_KEY

## 3. Setup Database (3 min)

```bash
# Push schema to your Supabase project
supabase link --project-ref <your-project-ref>
supabase db push

# Load sample data
supabase db seed
```

## 4. Create .env.local

```bash
cp .env.local.example .env.local
# Edit with your keys from services above
```

## 5. Run (2 min)

```bash
pnpm dev
```

Visit: http://localhost:3000

## Test Credentials

```
Seller:
  Email: angebae@beautytherapist.com
  Password: AngeBae2024!

Buyer:
  Email: testbuyer@gmail.com
  Password: TestBuyer2024!

Coupons:
  WELCOME10 (10% off, min $25)
  SKIN20 (20% off, min $40)

Stripe Test Cards:
  Success: 4242 4242 4242 4242
  Decline: 4000 0000 0000 0002
  Expired: 4000 0000 0000 0069
```

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server

# Testing
pnpm test             # Run tests
pnpm test:watch      # Watch mode

# Production
pnpm build            # Build
pnpm start            # Start production server

# Quality
pnpm type-check       # TypeScript check
pnpm lint             # Linting

# Database
supabase db push      # Push schema
supabase db seed      # Load sample data
```

## Project Structure

```
app/                 # Next.js app (pages, API routes)
components/          # React components
lib/                 # Utilities (supabase, stripe, i18n)
__tests__/           # Test files
supabase/            # Database schema & seeds
```

## Common Tasks

### Add a new product manually
1. Go to seller dashboard: `/seller/dashboard`
2. Click "Add Product"
3. Fill form and upload images
4. Click Save

### Test a payment
1. Add product to cart
2. Go to checkout
3. Use test card: `4242 4242 4242 4242`
4. Exp: any future date
5. CVC: any 3 digits

### View orders
- Buyer: `/account/orders`
- Seller: `/seller/dashboard` (Orders tab)

### Check database
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. SQL Editor → Run queries

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build error | Run `pnpm install` again |
| Env vars not working | Restart dev server after changing `.env.local` |
| Database not connected | Check NEXT_PUBLIC_SUPABASE_URL and keys |
| Images not uploading | Check Cloudinary API keys |
| Emails not sending | Check RESEND_API_KEY |
| Tests failing | Run `pnpm test -- --clearCache` |

## Next: Deploy to Production

Follow [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)

### Quick deploy summary:
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy
5. Configure Stripe webhook

---

**Questions? Check [README.md](./README.md) for detailed docs.**
