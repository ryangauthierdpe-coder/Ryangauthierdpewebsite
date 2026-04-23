# DPE Booking Website

Professional website for Ryan Gauthier, Designated Pilot Examiner (DPE) at Westerly State Airport (WST).

## Features

- **Home Page**: Service offerings, pricing, and contact information
- **About Page**: Professional background and qualifications
- **Preparation Guide**: Comprehensive checklist for checkride preparation
- **References Page**: Aviation resources and study materials
- **Schedule & Booking**: Real-time availability calendar with booking form
- **Admin Dashboard**: Booking management with approval workflow
- **Email Notifications**: Automatic confirmations via Resend
- **Google Calendar Integration**: Automatic calendar event creation
- **Mobile Responsive**: Works perfectly on all devices

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (Database + Edge Functions)
- **Email**: Resend API
- **Calendar**: Google Calendar API
- **Hosting**: Vercel (recommended) or any static host
- **Version Control**: GitHub

## Services Offered

### Practical Tests
- Private Pilot - Airplane Single Engine Land (ASEL): **$850**

### Administrative Functions
- Foreign Pilot: **$250**
- Military Competency: **$250**
- Flight Instructor Renewal: **$150**
- Ground Instructor: **$150**
- Basic Administrative Functions: **$150**
  - SIC Type Ratings
  - SOE Limitation Removals
  - ATP Limitation Removals
  - Remote Pilot Certificate
  - Night Flight Limitation Removal

## Contact Information

**Office**: 58 Airport Road, Westerly, RI 02891  
**Phone**: 860-912-3283  
**Email**: RyanGauthierDPE@gmail.com  
**Airport**: Westerly State Airport (WST)  
**FSDO**: Boston FSDO: EA-61

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- Supabase account (free tier works)
- Resend account for emails (free tier: 3,000 emails/month)
- Google Calendar API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/dpe-booking-website.git
   cd dpe-booking-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual credentials

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

## Deployment

### Deploy to Vercel (Recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.

**Quick version:**

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!
5. Connect custom domain (optional)

### Deploy Supabase Functions

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy make-server-e4d9f7d7
```

## Environment Variables

Create a `.env` file with these variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_db_url
RESEND_API_KEY=your_resend_key
GOOGLE_CALENDAR_API_KEY=your_google_api_key
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=your_private_key
```

**Important**: Never commit `.env` to GitHub! It's already in `.gitignore`.

## Project Structure

```
/
├── index.html                      # HTML entry point
├── package.json                    # Dependencies & scripts
├── vite.config.ts                 # Vite configuration
├── vercel.json                    # Vercel routing config
├── src/
│   └── main.tsx                   # React entry point
├── App.tsx                        # Main application component
├── components/
│   ├── home-page.tsx             # Home page with services
│   ├── about-page.tsx            # About Ryan Gauthier
│   ├── preparation-page.tsx      # Checkride prep guide
│   ├── references-page.tsx       # Aviation resources
│   ├── schedule-page.tsx         # Booking calendar & form
│   ├── admin-page.tsx            # Admin dashboard
│   ├── admin-login.tsx           # Admin authentication
│   ├── contact-modal.tsx         # Contact form modal
│   ├── ui/                       # Reusable UI components
│   └── figma/
│       └── ImageWithFallback.tsx # Image component
├── supabase/functions/server/
│   ├── index.tsx                 # Hono web server
│   ├── kv_store.tsx             # KV database utilities
│   └── google-auth.tsx          # Google Calendar auth
├── utils/supabase/
│   └── info.tsx                 # Supabase config
└── styles/
    └── globals.css              # Global styles & Tailwind
```

## Admin Access

Access the admin dashboard at `/admin` to:
- View all booking requests
- Approve or decline appointments
- Manage calendar integration
- Track booking history

**Note**: Admin credentials are managed through Supabase Auth.

## Testing Checklist

After deployment, verify:

- [ ] Home page loads with all services
- [ ] Navigation works between all pages
- [ ] Schedule page shows available dates
- [ ] Booking form submits successfully
- [ ] Confirmation email is received
- [ ] Google Calendar event is created
- [ ] Admin dashboard loads
- [ ] Admin can approve/decline bookings
- [ ] Contact modal works
- [ ] All images load properly
- [ ] Mobile responsive design works
- [ ] Custom domain (if configured)

## Troubleshooting

### Build fails
- Check all environment variables are set
- Verify Node.js version is 18+
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Features don't work after deployment
- Verify all environment variables in Vercel
- Check Supabase Edge Functions are deployed
- Check browser console for errors

### Emails not sending
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for errors
- Verify sender email is verified in Resend

### Calendar not syncing
- Verify Google service account has calendar access
- Check private key format (include `-----BEGIN/END PRIVATE KEY-----`)
- Verify GOOGLE_CALENDAR_ID is correct

## Future Updates

To update your deployed site:

1. Make changes locally
2. Test with `npm run dev`
3. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Vercel auto-deploys on push to main branch!

## Cost Summary

- **GitHub**: Free
- **Vercel**: Free (Hobby tier)
- **Supabase**: Free tier (sufficient for most use)
- **Resend**: Free (3,000 emails/month)
- **Domain**: ~$15-20/year (your existing GoDaddy cost)

**Total: Just your domain registration!**

## License

© 2026 Ryan Gauthier DPE. All rights reserved.

## Support

For deployment help, see [DEPLOYMENT.md](./DEPLOYMENT.md)

For technical issues:
1. Check Vercel deployment logs
2. Check browser console (F12 → Console)
3. Verify environment variables
4. Check Supabase Edge Function logs