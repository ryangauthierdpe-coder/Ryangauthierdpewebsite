# Quick Start Guide

Follow these steps to get your site live on your GoDaddy domain.

## ✅ Step-by-Step Checklist

### 1️⃣ Prepare Your Environment Variables

Before you start, gather these values from your current Figma Make setup:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_DB_URL`
- [ ] `RESEND_API_KEY`
- [ ] `GOOGLE_CALENDAR_API_KEY`
- [ ] `GOOGLE_CALENDAR_ID`
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- [ ] `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

**💡 Tip**: Copy these to a text file so you can easily paste them into Vercel later.

---

### 2️⃣ Export from Figma Make

- [ ] In Figma Make, find the Export/Download option
- [ ] Download all files as ZIP
- [ ] Extract to a folder (e.g., `dpe-booking-site`)

---

### 3️⃣ Set Up GitHub

- [ ] Create GitHub account: https://github.com (if you don't have one)
- [ ] Create new repository named `dpe-booking-website`
- [ ] Set to Private
- [ ] **Do NOT** initialize with README

**Upload Code - Easy Method:**
- [ ] Download GitHub Desktop: https://desktop.github.com
- [ ] Add your folder to GitHub Desktop
- [ ] Publish to GitHub

---

### 4️⃣ Deploy to Vercel

- [ ] Sign up at https://vercel.com (use GitHub to sign in)
- [ ] Click "Add New Project"
- [ ] Import your `dpe-booking-website` repository
- [ ] Add ALL 9 environment variables (paste from your text file)
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes
- [ ] Test the Vercel URL they give you

---

### 5️⃣ Connect Your Domain

**In Vercel:**
- [ ] Go to Settings → Domains
- [ ] Add your domain (e.g., `ryangauthierdpe.com`)
- [ ] Copy the DNS records Vercel shows you

**In GoDaddy:**
- [ ] Log into GoDaddy
- [ ] Go to Domains → DNS
- [ ] Add the A record (Type: A, Name: @, Value: Vercel's IP)
- [ ] Add the CNAME record (Type: CNAME, Name: www, Value: cname.vercel-dns.com)
- [ ] Delete any conflicting existing records
- [ ] Wait 15-60 minutes for DNS to propagate

**Verify:**
- [ ] Check https://dnschecker.org with your domain
- [ ] Once propagated, your site is live! 🎉

---

### 6️⃣ Test Everything

- [ ] Visit your domain
- [ ] Test booking form
- [ ] Check that you receive confirmation email
- [ ] Visit `/admin` and verify admin dashboard works
- [ ] Test on mobile phone

---

## 🆘 Need Help?

1. **Build fails on Vercel**: Check environment variables are all set correctly
2. **Site shows 404**: Make sure `vercel.json` file is uploaded
3. **Features don't work**: Double-check all 9 environment variables
4. **Domain not working**: Wait longer for DNS propagation (up to 24-48 hours)

---

## 📝 Future Updates

When you make changes in Figma Make:

1. Export new code
2. Replace files in your local folder
3. Open GitHub Desktop
4. Review changes → Commit → Push
5. Vercel auto-deploys in 30 seconds
6. Check your live site!

---

## ⏱️ Time Estimate

- Export from Figma: 2 minutes
- GitHub setup: 5-10 minutes
- Vercel deployment: 5 minutes
- Domain connection: 20-60 minutes (mostly waiting for DNS)

**Total active time: ~15 minutes**  
**Total elapsed time: ~30-90 minutes**

---

## 💰 Costs

- **GitHub**: FREE
- **Vercel**: FREE (hobby tier)
- **Domain**: What you're already paying GoDaddy (~$15-20/year)

**No additional monthly costs!**
