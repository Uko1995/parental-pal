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

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbo) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run init-db` | Initialize/seed database |
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
