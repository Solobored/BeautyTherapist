# Supabase VS Code Extension - Connection Guide

## ✅ What's Done
- ✅ Supabase CLI installed locally (`npm install --save-dev supabase`)
- ✅ Project initialized (`supabase init` - creates supabase.json)

## Next: Create Supabase Access Token

### Step 1: Get Your Access Token
1. Go to: https://app.supabase.com/account/tokens
2. Click "**Generate new token**"
3. Name it something like: `BeautyTherapist-Dev`
4. Click "**Generate token**"
5. **Copy the token** (it won't show again!)

### Step 2: Set Environment Variable

Run this in PowerShell (replace YOUR_TOKEN):

```powershell
$env:SUPABASE_ACCESS_TOKEN = "YOUR_TOKEN"
```

Or add to your system permanently:
- Right-click "This PC" → Properties
- Advanced System Settings → Environment Variables
- Click "New" and add:
  - Variable name: `SUPABASE_ACCESS_TOKEN`
  - Variable value: `YOUR_TOKEN_HERE`

### Step 3: Link Your Project

```powershell
cd c:\Users\josva\Documents\JVNB\BeautyTherapist
npx supabase link --project-ref cntumaksbvnfqscixyxx
```

When prompted, enter your **database password** (the one you set when creating Supabase project).

### Step 4: Verify in VS Code

1. Open VS Code
2. Look for **Supabase** extension in the sidebar
3. Click the Supabase icon
4. You should see your project: `cntumaksbvnfqscixyxx`
5. Expand it to see:
   - Tables
   - Functions
   - Triggers
   - Realtime subscriptions
   - Logs

## Useful Commands After Linking

```bash
# Pull remote schema to local migrations
npx supabase db pull

# Push local migrations to cloud
npx supabase db push

# View all migrations
npx supabase migration list

# Check status
npx supabase status

# View local stack
npx supabase start
```

## Environment Files

Your `.env.local` is already set up with:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` - Update with your real key from:
  https://app.supabase.com → Settings → API → Service Role Key

## Troubleshooting

**Issue:** "Access token not provided"
- Solution: Set `SUPABASE_ACCESS_TOKEN` environment variable (see Step 2)

**Issue:** Extension doesn't show project
- Solution: Restart VS Code after linking
- Check: `supabase status`

**Issue:** "Cannot connect to database"
- Solution: Make sure your Supabase project is active at https://app.supabase.com

**Issue:** Database password wrong
- Solution: Reset at https://app.supabase.com → Settings → Database

## Next Steps

Once connected:
1. Explore your database in VS Code
2. Review `supabase/schema.sql` and `supabase/seed.sql`
3. Create migrations for changes
4. Test with: `npx supabase start` (local Postgres stack)

---

**Let me know once you get your access token and I'll help you link the project!**
