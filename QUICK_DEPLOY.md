# Quick Start - Deploy to Vercel

## 30-Second Deploy

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Fix hydration issues and prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel**
   - Visit https://vercel.com/import
   - Select your GitHub repo
   - Click "Deploy"

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add these variables:

### Required Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cntumaksbvnfqscixyxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_sJggJG9A6JHa1srs1ThZHw_jHbMSeSS
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-test-key-here
STRIPE_SECRET_KEY=sk_test_your-test-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# Resend
RESEND_API_KEY=your-resend-api-key-here

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App URL (your production domain)
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

4. **Done!** ✅
   - Vercel auto-deploys your site
   - Get a live URL (beautyth.vercel.app)
   - Connect custom domain if desired

## Verify Deployment Works

```bash
# After deployment completes:

# 1. Open your Vercel URL in browser
# 2. Open DevTools Console (F12)
# 3. Check for these:
✅ No red/orange "Hydration mismatch" errors
✅ No console warnings
✅ Smooth page transitions
✅ Images load properly
✅ Forms submit without errors
```

## Troubleshooting

**Issue:** Build fails

- Check logs in Vercel dashboard
- Ensure all env variables are set
- Run `npm run build` locally first

**Issue:** 500 errors after deploy

- Check Production environment (not Preview)
- Verify NEXT_PUBLIC_APP_URL is correct
- Check API keys are valid

**Issue:** Stripe not working

- Update webhook endpoint URL in Stripe dashboard
- Use your Vercel domain (https://yourdomain.vercel.app)

**Issue:** Images not loading

- Verify Cloudinary credentials
- Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is correct

## Connect Custom Domain

1. In Vercel dashboard, go to Settings → Domains
2. Add your domain
3. Update DNS records OR use Vercel nameservers
4. Wait up to 48 hours for DNS propagation
5. SSL certificate auto-provisions

## Next Deployments

After the first deploy:

1. Make changes on your local machine
2. Push to GitHub:
   ```bash
   git push origin main
   ```
3. Vercel auto-detects changes
4. Automatic deployment (2-3 minutes)
5. Preview deployments for Pull Requests (optional)

## Environment Variables Reference

### For Development (`.env.local`)

- `EXPO_PUBLIC_SUPABASE_URL` → Keep as-is (shared key)
- `NEXT_PUBLIC_*` → Sent to browser (safe to use in client code)
- Other vars → Server-only (keep secret)

### For Production (Vercel Dashboard)

- Set same variables with NEXT*PUBLIC* prefix for client
- Set server-only vars without prefix
- Vercel encrypts and secures them

## Monitor Performance

After deployment, check:

- Vercel Analytics (automatic)
- PageSpeed Insights: https://pagespeed.web.dev
- Lighthouse in DevTools (F12 → Lighthouse)
- Web Vitals: https://web.dev/vitals/

## Rollback (if needed)

1. Go to Deployments tab
2. Click on previous successful deployment
3. Click "..." → "Redeploy"
4. Done! Previous version is live

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Chat with support: help@vercel.com

---

**Your app is now live!** 🚀

Visit: `https://yourdomain.vercel.app`
