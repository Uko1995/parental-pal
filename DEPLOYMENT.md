# PARENTALPAL Deployment Guide

## Pre-deployment Checklist ✅

### 1. Environment Variables Setup

The application requires these essential environment variables:

**Required:**

- `MONGODB_URI` - Your MongoDB Atlas connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth.js (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

**Optional (App works without these):**

- `EMAIL_USER` & `EMAIL_PASSWORD` - Gmail credentials for email notifications
- `GOOGLE_ID` & `GOOGLE_SECRET` - Google OAuth credentials
- `CLOUDINARY_*` - Image upload credentials

### 2. Database Preparation

Ensure your MongoDB Atlas cluster is configured:

- Whitelist Vercel IP addresses (0.0.0.0/0 for all IPs)
- Database user has read/write permissions
- Connection string includes database name

### 3. Code Status

- ✅ Email service has fallback mechanism (won't crash without credentials)
- ✅ Blog components converted to "Coming Soon" placeholders
- ✅ Mobile authentication implemented
- ✅ All TypeScript errors resolved

## Deployment Steps

### Step 1: Vercel Project Setup

1. Push your code to GitHub
2. Connect GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard

### Step 2: Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

```bash
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parentalpal
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=https://your-app.vercel.app

# Optional (add when ready)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
```

### Step 3: Deploy

- Vercel will automatically deploy on git push
- Monitor build logs for any issues
- Test all functionality in production

## Post-deployment Testing

1. **Authentication**: Test sign in/out functionality
2. **Booking Forms**: Submit test bookings
3. **Database**: Verify data is saving correctly
4. **Email**: Test with and without email credentials
5. **Mobile**: Test mobile navigation and responsiveness

## Email Configuration (When Ready)

When you're ready to enable email notifications:

1. **Gmail Setup**:

   - Enable 2-factor authentication
   - Generate an App Password (not your regular password)
   - Add to Vercel environment variables

2. **Alternative SMTP**:
   - Use any SMTP provider (SendGrid, Mailgun, etc.)
   - Configure SMTP\_\* environment variables

## Monitoring & Maintenance

- Monitor Vercel function logs for any issues
- Check MongoDB Atlas metrics for performance
- Set up uptime monitoring (recommended)
- Regular database backups

## Rollback Plan

If deployment issues occur:

- Revert to previous Vercel deployment
- Check environment variables configuration
- Review function logs for specific errors

---

## Current Status: ✅ READY FOR DEPLOYMENT

Your codebase is production-ready with:

- Graceful handling of missing email credentials
- Comprehensive error handling
- Mobile-responsive design
- Clean placeholder content for blog
- Proper environment variable setup
