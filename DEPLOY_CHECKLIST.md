# Pre-Deployment Checklist

Use this checklist to verify everything is ready before deploying to production.

## ✅ Development Setup

- [ ] All dependencies installed (`pnpm install`)
- [ ] Environment variables configured (`.env.local`)
- [ ] Local development server runs without errors (`pnpm dev`)
- [ ] No console errors in browser developer tools
- [ ] No TypeScript errors (`pnpm type-check`)

## ✅ Testing & Quality

- [ ] All tests passing (`pnpm test`)
- [ ] Tests have good coverage (aim for >80%)
- [ ] No linting errors (`pnpm lint`)
- [ ] Code follows project conventions
- [ ] No console warnings in production build
- [ ] Build completes successfully (`pnpm build`)

## ✅ Database & Backend

- [ ] Supabase project created
- [ ] Database schema pushed (`supabase db push`)
- [ ] Seed data loaded (`supabase db seed`)
- [ ] Sample seller account created (AngeBae)
- [ ] Sample buyer account created
- [ ] All database indexes created
- [ ] Row Level Security (RLS) policies configured
- [ ] Test queries work correctly

## ✅ Authentication

- [ ] Buyer registration tested
- [ ] Seller registration tested
- [ ] Login/logout functionality works
- [ ] Protected routes redirect unauthenticated users
- [ ] Session persistence works
- [ ] Password reset flow works
- [ ] Email verification (if enabled) works

## ✅ Shopping Features

- [ ] Product listing displays correctly
- [ ] Search and filtering work
- [ ] Product detail pages load with all info
- [ ] Add to cart works
- [ ] Cart updates persist across sessions
- [ ] Cart removal works
- [ ] Quantity updates work
- [ ] Wishlist add/remove works

## ✅ Checkout & Payments

- [ ] Checkout form validates correctly
- [ ] Coupon codes apply correctly
- [ ] Stripe test payment succeeds
- [ ] Stripe test payment decline handled
- [ ] Payment fails gracefully with error message
- [ ] Order created in database after payment
- [ ] Stock decrements after successful order
- [ ] Order confirmation page displays correctly
- [ ] Guest checkout works without account

## ✅ Email Integration (Resend)

- [ ] Resend account configured
- [ ] Order confirmation emails send correctly
- [ ] Payment failure emails send
- [ ] Email templates display correctly
- [ ] Emails aren't marked as spam

## ✅ Image Uploads (Cloudinary)

- [ ] Cloudinary account configured
- [ ] Image upload endpoint works
- [ ] Product images store correctly
- [ ] Image previews display
- [ ] Image URL generation works
- [ ] Image deletion works

## ✅ Seller Dashboard

- [ ] Seller login works
- [ ] Dashboard metrics display
- [ ] Product table shows all products
- [ ] Add product form works
- [ ] Edit product works
- [ ] Delete product works (with confirmation)
- [ ] Product images upload works
- [ ] Stock management works
- [ ] Order history displays

## ✅ Admin & Monitoring

- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] Analytics tracking working
- [ ] Error pages display correctly (404, 500)
- [ ] Sentry or similar error tracking setup (optional)

## ✅ Responsive Design

- [ ] Mobile layout responsive
- [ ] Tablet layout responsive
- [ ] Desktop layout responsive
- [ ] All buttons accessible on mobile
- [ ] Forms usable on touch devices
- [ ] Navigation works on mobile
- [ ] Images load correctly on all devices

## ✅ Security

- [ ] API secrets not exposed in frontend code
- [ ] Sensitive data not logged
- [ ] SQL injection prevention implemented
- [ ] CORS configured correctly
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all forms
- [ ] XSS protection in place
- [ ] CSRF tokens implemented
- [ ] No hardcoded credentials

## ✅ Performance

- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 80
- [ ] Images optimized
- [ ] Code splitting working
- [ ] Bundle size acceptable
- [ ] Caching strategy implemented
- [ ] API responses optimized
- [ ] Database queries optimized

## ✅ Vercel Deployment

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Build settings configured
- [ ] Environment variables added to Vercel dashboard
- [ ] All integration tests pass on Vercel
- [ ] Production build deploys successfully
- [ ] Deployed site loads without errors
- [ ] All pages accessible on production URL

## ✅ Stripe Webhook Configuration

- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] Webhook URL: `https://your-domain.vercel.app/api/webhooks/stripe`
- [ ] Events configured:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
- [ ] Webhook secret stored in Vercel environment variables
- [ ] Webhook tested and receiving events
- [ ] Orders create correctly from webhook
- [ ] Emails send from webhook

## ✅ Custom Domain (Optional)

- [ ] Custom domain purchased
- [ ] DNS records configured
- [ ] SSL certificate auto-renewed
- [ ] Domain connects to Vercel project
- [ ] Redirects working (www to non-www or vice versa)

## ✅ Monitoring & Maintenance

- [ ] Uptime monitoring configured
- [ ] Alert system for errors configured
- [ ] Backup strategy planned
- [ ] Database backups automated
- [ ] Regular deployment process documented
- [ ] Rollback plan in place
- [ ] Team access configured
- [ ] Documentation updated

## ✅ Final Checks

- [ ] No console errors in production
- [ ] All forms submit and process correctly
- [ ] Payment processing works end-to-end
- [ ] Email notifications arrive
- [ ] Database queries perform well
- [ ] No 404 or broken links
- [ ] Analytics tracking working
- [ ] Error handling works correctly

## 📝 Post-Deployment Tasks

### First 24 Hours

- [ ] Monitor error logs for issues
- [ ] Check analytics for traffic
- [ ] Verify all email notifications send
- [ ] Test payment processing with real card (test mode)
- [ ] Performance monitoring active
- [ ] backup strategy tested

### First Week

- [ ] Review logs for patterns
- [ ] Gather user feedback
- [ ] Fix any reported issues
- [ ] Optimize based on real usage
- [ ] Update documentation if needed
- [ ] Scale resources if needed

### Ongoing

- [ ] Regular security updates
- [ ] Dependency updates monthly
- [ ] Performance monitoring
- [ ] Backup verification
- [ ] Analytics review
- [ ] User feedback collection

## 🔄 Deployment Commands

```bash
# Local testing before deployment
pnpm test
pnpm type-check
pnpm build
pnpm start

# To deploy to Vercel
git push origin main  # Auto-deploys if configured

# To view logs
vercel logs
```

## 🆘 Troubleshooting

| Issue                     | Solution                                          |
| ------------------------- | ------------------------------------------------- |
| Build fails               | Check build logs in Vercel dashboard              |
| Env vars not working      | Verify in Vercel Settings → Environment Variables |
| Stripe webhook not firing | Check webhook URL and secret in Vercel            |
| Emails not sending        | Check Resend API key and sender domain            |
| Images not loading        | Check Cloudinary configuration                    |
| Database connection error | Verify Supabase connection string                 |

## ✨ Done!

Once all items are checked, your deployment is ready to go live! 🚀

**Deployed at:** `https://your-domain.vercel.app`

**Monitor at:**

- Vercel Dashboard: https://vercel.com
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://app.supabase.com
- Cloudinary Dashboard: https://cloudinary.com/console
