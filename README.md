# Parental Pal

A Next.js platform for parents to discover and book childcare services (tutoring, childcare, homeschooling, holiday camps, kiddies enrichment, events), shop products, and manage bookings and orders.

## Tech Stack

- **Framework:** Next.js 15 (App Router) with TypeScript
- **Auth:** NextAuth v5 (Credentials + Google)
- **Database:** MongoDB
- **Styling:** Tailwind CSS, DaisyUI, Framer Motion
- **Media:** Cloudinary
- **Payments:** Paystack
- **Email:** Nodemailer (SMTP or app password)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- (Optional) Google OAuth, Cloudinary, Paystack, and SMTP for full features

### Install & Run

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run init-db              # seed/init MongoDB collections
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local` with at least:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (`parental-pal_dev` locally; `parental-pal` on Vercel Production) |
| `AUTH_SECRET` | NextAuth secret (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |

For full functionality add: `GOOGLE_ID`, `GOOGLE_SECRET`, Cloudinary (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`), `PAYSTACK_SECRET_KEY`, and email (`EMAIL_USER`/`EMAIL_PASSWORD` or `SMTP_*`).

For **Holidays That Rock** Google Drive folder provisioning, also set:

| Variable | Description |
|----------|-------------|
| `GOOGLE_DRIVE_ENABLED` | Set to `true` to enable automatic folder creation |
| `GOOGLE_DRIVE_PARENT_FOLDER_ID` | Parent Drive folder ID (HOTR campers root) |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | **OAuth (no service account):** refresh token from one-time setup script |

**OAuth setup (uses your existing `GOOGLE_ID` / `GOOGLE_SECRET`):**

1. Enable **Google Drive API** in GCP (same project as your OAuth client).
2. On the OAuth client, add redirect URI: `http://localhost:3333/oauth2callback`
3. If the consent screen is in **Testing**, add your Google account as a test user.
4. Run: `npx tsx lib/google-drive-oauth-setup.ts` — sign in with the Google account that **owns** the HOTR parent folder.
5. Copy the printed `GOOGLE_DRIVE_REFRESH_TOKEN` into `.env.local`.

**Service account (optional alternative):** `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`, with the parent folder shared to that account as Editor.

Place handbook PDFs in the repo `handbook/` directory.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbo) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run init-db` | Initialize/seed database |
| `npx tsx lib/google-drive-oauth-setup.ts` | One-time OAuth refresh token for Drive (no service account) |
| `npm run convert:webp` | Convert public images to WebP |

## Features

- **Public:** Services listing, product shop, blog, tutor directory, contact
- **Auth:** Sign in (credentials/Google), email verification, password reset
- **User:** Profile, children, bookings, orders, wishlist, cart
- **Admin dashboard:** Services, products, bookings, orders, parents, tutors, children, coupons, analytics, payments, stock alerts

## Deploy

Configured for Vercel (`vercel.json`). Set env vars per environment:

| Environment | `MONGODB_DB_NAME` |
|-------------|-------------------|
| **Production** (Vercel) | `parental-pal` (or omit — same as default) |
| **Local / Preview** | `parental-pal_dev` |

Keep the same `MONGODB_URI` cluster on Production unless you use separate Atlas users. Dev DB is already seeded from your prod copy — no need to run `init-db` locally.
