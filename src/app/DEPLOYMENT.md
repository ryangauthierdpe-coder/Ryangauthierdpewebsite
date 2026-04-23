# Deployment Guide: DPE Booking Website

This guide will walk you through deploying your DPE booking website to Vercel with your GoDaddy domain.

## Prerequisites

Before you begin, make sure you have:
- All your environment variable values (Supabase keys, Resend API key, Google Calendar credentials)
- Your GoDaddy domain login credentials
- A GitHub account (free - sign up at https://github.com)

---

## Step 1: Export Your Code from Figma Make

1. In Figma Make, look for an "Export" or "Download" button
2. Download all your project files as a ZIP
3. Extract the ZIP to a folder on your computer (e.g., `dpe-booking-site`)

---

## Step 2: Set Up GitHub Repository

### Create a GitHub Account (if you don't have one)
1. Go to https://github.com
2. Click "Sign up"
3. Follow the prompts to create your free account

### Create a New Repository
1. Log into GitHub
2. Click the "+" icon in the top-right corner
3. Select "New repository"
4. Name it: `dpe-booking-website`
5. Set it to "Private" (recommended for business sites)
6. **Do NOT** initialize with README, .gitignore, or license (your code already has these)
7. Click "Create repository"

### Upload Your Code to GitHub

**Option A: Using GitHub Desktop (Easiest for non-developers)**
1. Download GitHub Desktop: https://desktop.github.com
2. Install and sign in with your GitHub account
3. Click "Add" → "Add Existing Repository"
4. Select your `dpe-booking-site` folder
5. Click "Publish repository"
6. Make sure "Keep this code private" is checked
7. Click "Publish Repository"

**Option B: Using Command Line (If you're comfortable with terminal)**
```bash
cd path/to/dpe-booking-site
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dpe-booking-website.git
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Sign Up for Vercel
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### Import Your Repository
1. On the Vercel dashboard, click "Add New..." → "Project"
2. Find your `dpe-booking-website` repository
3. Click "Import"

### Configure Your Project
1. **Framework Preset**: Should auto-detect as "Vite" or "React"
2. **Root Directory**: Leave as `./` (default)
3. **Build Command**: Leave as default (`npm run build` or `vite build`)
4. **Output Directory**: Leave as default (`dist`)

### Add Environment Variables
This is **CRITICAL** - your site won't work without these!

Click "Environment Variables" and add each of these (get values from your current Figma Make setup):

```
SUPABASE_URL=your_actual_value
SUPABASE_ANON_KEY=your_actual_value
SUPABASE_SERVICE_ROLE_KEY=your_actual_value
SUPABASE_DB_URL=your_actual_value
RESEND_API_KEY=your_actual_value
GOOGLE_CALENDAR_API_KEY=your_actual_value
GOOGLE_CALENDAR_ID=your_actual_value
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_actual_value
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=your_actual_value
```

**Important for `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`:**
- Make sure to include the full key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep all the line breaks intact

### Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for the build to complete
3. You'll get a URL like: `https://dpe-booking-website-abc123.vercel.app`
4. Test your site at this URL to make sure everything works!

---

## Step 4: Connect Your GoDaddy Domain

### In Vercel:
1. Go to your project dashboard
2. Click "Settings" → "Domains"
3. Enter your domain (e.g., `ryangauthierdpe.com`)
4. Click "Add"
5. Vercel will show you DNS records to add

You'll see something like:
```
Type: A
Name: @
Value: 76.76.21.21
```
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### In GoDaddy:
1. Log into your GoDaddy account
2. Go to "My Products" → "Domains"
3. Click "DNS" next to your domain
4. Click "Add" to add new records

**Add the A Record:**
- Type: `A`
- Name: `@`
- Value: (the IP address Vercel gave you, e.g., `76.76.21.21`)
- TTL: `1 Hour` (default)

**Add the CNAME Record:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`
- TTL: `1 Hour` (default)

**Delete any conflicting records:**
- If there's an existing A record for `@`, delete it
- If there's an existing CNAME for `www`, delete it

### Wait for DNS Propagation
- This can take 5 minutes to 48 hours (usually 15-30 minutes)
- You can check progress at: https://dnschecker.org
- Enter your domain and check if it resolves to Vercel's servers

### Verify in Vercel
1. Go back to Vercel → Settings → Domains
2. Once DNS propagates, you'll see a green checkmark
3. Vercel automatically provisions an SSL certificate (HTTPS)
4. Your site is now live at your domain! 🎉

---

## Step 5: Future Updates

Whenever you make changes in Figma Make:

1. **Export** updated code from Figma Make
2. **Replace** files in your local folder
3. **Commit & Push** changes:
   - **GitHub Desktop**: Open the app → Review changes → Add commit message → Push to origin
   - **Command Line**: `git add .` → `git commit -m "Update description"` → `git push`
4. **Auto-Deploy**: Vercel detects the changes and deploys automatically (30-60 seconds)
5. **Check**: Visit your domain to see the updates live

---

## Testing Checklist

After deployment, test these features:

- [ ] Home page loads correctly
- [ ] All navigation links work
- [ ] Schedule page shows available dates
- [ ] Booking form submits successfully
- [ ] Confirmation email is received
- [ ] Admin dashboard loads at `/admin`
- [ ] Admin can view bookings
- [ ] Admin can approve/decline bookings
- [ ] Google Calendar integration works
- [ ] All images load properly
- [ ] Site works on mobile devices

---

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly in Vercel
- Look at the build logs in Vercel for specific error messages

### 404 Errors on Navigation
- Make sure `vercel.json` file is in your root directory
- Redeploy if you added it after initial deployment

### Features Don't Work
- Verify all environment variables are correct
- Check browser console for errors (F12 → Console tab)
- Make sure Supabase edge functions are deployed

### Email Not Sending
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for sending limits
- Make sure the sender email is verified in Resend

### Google Calendar Not Syncing
- Verify all Google credentials are correct
- Check that the service account has calendar access
- Make sure the private key is formatted correctly (with line breaks)

---

## Important Notes

- Your Supabase database and edge functions remain hosted at Supabase
- Only your frontend React app is hosted on Vercel
- All API calls go through Supabase edge functions
- Keep your environment variables secure - never commit them to GitHub
- The `.gitignore` file prevents sensitive data from being uploaded

---

## Support

If you run into issues:
1. Check the Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test with the Vercel preview URL first before troubleshooting the custom domain

---

## Cost Summary

- **GitHub**: Free (private repositories included)
- **Vercel**: Free (hobby tier - perfect for this use case)
- **GoDaddy Domain**: ~$15-20/year (what you're already paying)
- **Supabase**: Free tier (should be sufficient, or whatever you're currently paying)
- **Resend**: Free tier (up to 3,000 emails/month)

**Total ongoing cost: Just your domain registration!**
