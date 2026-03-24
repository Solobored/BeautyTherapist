# Beauty Therapist - Next.js Marketplace

A modern, full-stack e-commerce marketplace platform built with Next.js 16, featuring multi-brand support, real-time payments via Stripe, and a beautiful responsive UI.

## 🌟 Features

- **Multi-Seller Marketplace**: Support for multiple brands with seller dashboard
- **Authentication**: Secure buyer and seller authentication via Supabase
- **Product Management**: Sellers can create, edit, and manage products with images
- **Shopping Cart**: Real-time cart management with localStorage persistence
- **Payment Processing**: Stripe integration for secure credit card payments
- **Order Management**: Order tracking and status updates
- **Coupons & Discounts**: Apply discount codes at checkout
- **Product Search & Filtering**: Search by name, category, and price range
- **Wishlist**: Save favorite products for later
- **Blog**: Featured blog posts with skincare and makeup tips
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Multilingual**: Support for English and Spanish

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **Image Hosting**: Cloudinary
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## 📦 Prerequisites

- Node.js 18+ and pnpm
- Supabase account (free tier available)
- Stripe account (free tier available)
- Cloudinary account (free tier available)
- Resend account (free tier available)
- Git

## 🚀 Local Setup (Step by Step)

### Step 1: Clone and Install Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd BeautyTherapist

# Install dependencies
pnpm install
```

### Step 2: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Project Settings → API to get your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Setup Environment Variables

```bash
# Copy example file
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Initialize Supabase Database

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link your Supabase project
supabase link --project-ref <your-project-ref>

# Push the schema
supabase db push

# Seed sample data
supabase db seed
```

This creates:
- Database tables with proper relationships
- Row-level security (RLS) policies
- Sample AngeBae seller with 10 products
- Test buyer account
- Blog posts and coupons

### Step 5: Setup Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. Switch to **Test Mode** (use the toggle at top)
3. Get your keys from Developers → API Keys:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Publishable key)
   - `STRIPE_SECRET_KEY` (Secret key)
4. Create a webhook endpoint in Developers → Webhooks
5. Add endpoint: `http://localhost:3000/api/webhooks/stripe`
6. Select events: `payment_intent.succeeded` and `payment_intent.payment_failed`
7. Copy the `STRIPE_WEBHOOK_SECRET` and add to `.env.local`

### Step 6: Setup Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create an account
2. Go to Dashboard to get your credentials
3. Add to `.env.local`:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Step 7: Setup Resend

1. Go to [resend.com](https://resend.com) and create an account
2. Get your API key from the dashboard
3. Add `RESEND_API_KEY` to `.env.local`

### Step 8: Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage
```

Test files are in `__tests__/`:
- `auth.test.ts` - Authentication flows
- `cart.test.ts` - Shopping cart functionality
- `checkout.test.ts` - Checkout process
- `products.test.ts` - Product catalog
- `seller-dashboard.test.ts` - Seller dashboard
- `api/checkout.test.ts` - API validation

## 🔍 Type Checking

```bash
pnpm type-check
```

## 📤 Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🚀 Deployment to Vercel

### Prerequisites Checklist

- [ ] All env variables configured locally and working
- [ ] Tests passing (`pnpm test`)
- [ ] Type check passing (`pnpm type-check`)
- [ ] Build passing locally (`pnpm build`)
- [ ] Supabase project created with schema pushed
- [ ] Seed data loaded successfully
- [ ] Stripe account in Test Mode with webhook configured
- [ ] Cloudinary and Resend account configured

### Deployment Steps

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Select the project

3. **Configure Environment Variables**

   In Vercel dashboard, go to Settings → Environment Variables and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx (use production key when ready)
   STRIPE_SECRET_KEY=sk_test_xxx (use production key when ready)
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   RESEND_API_KEY=your-resend-key
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

4. **Deploy**

   - Click "Deploy"
   - Wait for build to complete
   - Test your deployed site

5. **Setup Stripe Webhook for Production**

   - In Stripe Dashboard, add a new webhook endpoint
   - Endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded` and `payment_intent.payment_failed`
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

6. **Configure Custom Domain (Optional)**

   - In Vercel project settings, go to Domains
   - Add your custom domain
   - Update DNS records as instructed

## 📁 Project Structure

```
BeautyTherapist/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── checkout/            # Checkout endpoint
│   │   ├── upload/              # Image upload endpoint
│   │   └── webhooks/stripe/     # Stripe webhook handler
│   ├── auth/                    # Authentication pages
│   ├── account/                 # Buyer account pages
│   ├── seller/                  # Seller dashboard
│   ├── shop/                    # Product catalog
│   ├── blog/                    # Blog pages
│   ├── checkout/                # Checkout flow
│   └── order-confirmation/      # Order confirmation
├── components/                   # React components
│   ├── checkout/                # Checkout components
│   ├── home/                    # Homepage sections
│   ├── ui/                      # Reusable UI components
│   ├── navbar.tsx               # Navigation bar
│   ├── footer.tsx               # Footer
│   └── cart-drawer.tsx          # Shopping cart
├── lib/                          # Utilities and helpers
│   ├── supabase.ts              # Supabase client
│   ├── stripe.ts                # Stripe utilities
│   └── utils.ts                 # General utilities
├── contexts/                     # React contexts
│   ├── auth-context.tsx         # Authentication context
│   └── cart-context.tsx         # Shopping cart context
├── __tests__/                    # Test files
│   ├── api/                     # API tests
│   ├── auth.test.ts             # Auth tests
│   ├── cart.test.ts             # Cart tests
│   ├── checkout.test.ts         # Checkout tests
│   ├── products.test.ts         # Products tests
│   └── seller-dashboard.test.ts # Dashboard tests
├── supabase/                     # Database files
│   ├── schema.sql               # Database schema
│   └── seed.sql                 # Sample data
├── jest.config.ts               # Jest configuration
├── jest.setup.ts                # Jest setup
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind config
├── next.config.mjs              # Next.js config
├── vercel.json                  # Vercel deployment config
├── .env.local.example           # Environment variables template
└── package.json                 # Dependencies
```

## 🧪 Test Sample Data

**Seller Account:**
- Email: `angebae@beautytherapist.com`
- Password: `AngeBae2024!`

**Buyer Account:**
- Email: `testbuyer@gmail.com`
- Password: `TestBuyer2024!`

**Available Coupons:**
- `WELCOME10` - 10% off (min $25)
- `SKIN20` - 20% off skincare (min $40)

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Expired: `4000 0000 0000 0069`

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@beautytherapist.com

## 🔐 Security Notes

- Never commit `.env.local` with real credentials
- Use Stripe Test Mode during development
- Implement rate limiting in production
- Use HTTPS in production
- Regularly update dependencies
- Review Supabase RLS policies periodically

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Resend Documentation](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Built with ❤️ by the Beauty Therapist team**
