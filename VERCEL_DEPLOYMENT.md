# Vercel Deployment Guide

This guide provides step-by-step instructions to deploy the BeautyTherapist application to Vercel.

## Prerequisites

- Vercel account (free at https://vercel.com)
- GitHub account with your repository pushed
- All required API keys from third-party services

## Quick Start

### 1. Deploy on Vercel

```bash
# Option A: Using Vercel CLI
npm i -g vercel
vercel

# Option B: Using GitHub Integration
# Go to https://vercel.com/import and connect your GitHub repo
```

### 2. Environment Variables Setup

When deploying to Vercel, you need to configure the following environment variables:

#### Supabase

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

#### Stripe

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

#### Resend (Email)

- `RESEND_API_KEY` - Resend email service API key

#### Cloudinary (Images)

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

#### Application

- `NEXT_PUBLIC_APP_URL` - Your production domain (e.g., https://beautyth.vercel.app)

### 3. Vercel Dashboard Setup

1. Go to your project on https://vercel.com
2. Click "Settings" → "Environment Variables"
3. Add each variable from the list above
4. Make sure to select the appropriate environment (Production, Preview, Development)
5. Click "Save"

### 4. Build & Deployment Configuration

The `vercel.json` file is already configured with:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

No changes needed unless you want to:

- Change regions (add more regions for better global performance)
- Modify build command
- Add custom headers or redirects

### 5. Deploy

There are multiple ways to deploy:

#### Using Git (Recommended)

1. Push your code to GitHub
2. Vercel automatically deploys on every push to main
3. View deployment at your Vercel project dashboard

#### Using Vercel CLI

```bash
vercel --prod
```

#### Using GitHub Integration

1. Go to https://vercel.com/import
2. Select your GitHub repository
3. Click "Deploy"

## Production Checklist

Before going live, ensure:

- [ ] All environment variables are set in Vercel dashboard
- [ ] Database migrations are complete in Supabase
- [ ] Stripe webhook is configured to receive events from Vercel domain
- [ ] Cloudinary project is active
- [ ] Resend email templates are set up
- [ ] `NEXT_PUBLIC_APP_URL` is set to your production domain
- [ ] Domain is configured in Vercel project settings
- [ ] SSL certificate is active (auto-provisioned by Vercel)
- [ ] Analytics are configured if desired
- [ ] Error monitoring (Sentry, etc.) is configured

## Common Issues & Solutions

### Issue: "Missing SUPABASE_SERVICE_ROLE_KEY"

**Solution:** This key must be set as a server-side environment variable (without NEXT*PUBLIC* prefix) in Vercel.

### Issue: "Stripe webhook not working"

**Solution:** Update your Stripe webhook endpoint to use your Vercel domain:

```
https://yourdomain.vercel.app/api/webhooks/stripe
```

### Issue: "Hydration mismatch errors"

**Solution:** These have been fixed in the codebase. If you still see them:

1. Clear browser cache
2. Do a hard refresh (Ctrl+Shift+R)
3. Check that `suppressHydrationWarning` is set on html/body tags

### Issue: "Images not loading from Cloudinary"

**Solution:** Ensure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct and your Cloudinary account has active images.

### Issue: "Build fails"

**Solution:** Check the build logs for specific errors. Common causes:

- Missing environment variables
- TypeScript compilation errors
- Unused imports or type errors

## Performance Optimization

### Enable Image Optimization

Vercel automatically optimizes images with `next/image`.

### Add Caching Headers

Update `vercel.json` to add caching for static assets:

```json
{
  "headers": [
    {
      "source": "/public/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Enable Compression

Vercel automatically compresses all responses. No additional setup needed.

## Monitoring & Debugging

### View Logs

```bash
vercel logs
```

### View Real-Time Analytics

1. Go to your Vercel project dashboard
2. Click "Analytics" tab
3. Monitor performance metrics

### Configure Error Tracking

Add Sentry for error monitoring:

1. Create Sentry account at https://sentry.io
2. Add Sentry DSN to environment variables
3. Install Sentry in your Next.js app

## Custom Domain Setup

1. In Vercel dashboard, go to Settings → Domains
2. Click "Add Domain"
3. Enter your domain name
4. Update your domain's DNS settings:
   - Add CNAME record pointing to your Vercel domain, or
   - Update nameservers to Vercel's (if using Vercel DNS)
5. Wait for DNS to propagate (up to 48 hours)

## Updating from GitHub

After Vercel is connected to GitHub:

1. Make changes to your code
2. Push to GitHub
3. Vercel automatically builds and deploys
4. View deployment status in Vercel dashboard

## Troubleshooting

For more help:

- Check Vercel docs: https://vercel.com/docs
- Check Next.js docs: https://nextjs.org/docs
- Visit Vercel Community: https://github.com/vercel/community

## Support

If you encounter issues:

1. Check the deployment logs in Vercel dashboard
2. Review application logs with `vercel logs`
3. Test locally with `npm run build && npm start`
4. Ensure all environment variables are correctly set

---

**Last Updated:** March 23, 2026
**Next.js Version:** 16.2.0 (Turbopack)
**Node Version:** 20.x or higher recommended
