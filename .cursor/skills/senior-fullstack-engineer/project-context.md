# Parental Pal — Project Context

Reference for deeper architectural and operational details. Read when working on unfamiliar subsystems.

## Architecture overview

```
Browser
  └── app/ (Next.js App Router)
        ├── page.tsx / layout.tsx     Public & authenticated pages
        ├── dashboard/                Admin UI (bookings, parents, payments, …)
        ├── booking/                  Multi-service booking forms
        ├── profile/                  Parent account, bookings, invoices
        └── api/                      Route handlers (JSON)
              └── lib/                Repositories + domain logic
                    └── MongoDB
```

## Repository pattern

Data access lives in `lib/*Repository.ts`:

- `BookingRepository`, `UserRepository`, `PaymentRepository`
- `ParentInvoiceRepository`, `CartRepository`, `OrderRepository`
- `ProductRepository`, `CouponRepository`, `FeedbackRepository`

Route handlers and server actions should delegate to repositories and domain modules in `lib/`, not embed query logic.

## Auth and security

- NextAuth v5 beta — sign-in at `app/auth/signin/`
- Session helpers: `lib/session-user.ts`
- Security utilities: `lib/security.ts`, `lib/account-lockout*.ts`
- CSRF and rate limiting used on sensitive endpoints
- Admin routes under `app/api/admin/` require elevated session checks

## Booking subsystem

Complex domain spanning forms, scheduling, payments, and email:

| Module | Purpose |
|--------|---------|
| `booking-calendar.ts` | Session/date scheduling |
| `booking-payment*.ts` | Paystack flows, reminders, confirmation |
| `booking-invoice.ts` | Invoice generation |
| `booking-cancellation.ts` | Cancellation rules |
| `booking-rebook*.ts` | Rebooking eligibility and templates |
| `camp-pricing.ts`, `camp-seasons.ts` | Holiday camp pricing |
| `htr-drive-folder.ts`, `google-drive.ts` | HOTR Google Drive provisioning |

Forms in `app/booking/` are service-specific (tutoring, camp, enrichment, etc.) with shared pieces like `ChildInfoForm`, `PaymentSchedule`.

## Payments (Paystack)

- Initialize: `app/api/payments/initialize/`
- Verify: `app/api/payments/verify/`
- Webhook: `app/api/payments/webhook/`
- Cron reminders: `app/api/cron/payment-reminders/`

Payment state must stay consistent between webhook, verify callback, and repository records.

## Parent invoices

Separate from booking invoices — admin approval workflow:

- Parent submission: `app/api/parent-invoices/`
- Admin queue: `app/dashboard/parent-invoices/`
- Pricing logic: `lib/parent-invoice-pricing.ts`

## Testing

Tests use Node's built-in test runner via `tsx`:

```bash
npm test
# Or single file:
npx tsx --test lib/booking-calendar.test.ts
```

Prefer extending existing test files over creating redundant coverage.

## Environment

Copy `.env.example` to `.env.local`. Minimum: `MONGODB_URI`, `MONGODB_DB_NAME`, `AUTH_SECRET`, `NEXTAUTH_URL`.

Optional integrations: Google OAuth, Cloudinary, Paystack, SMTP, Google Drive (HOTR folders).

## Conventions

- TypeScript strict; path aliases follow Next.js defaults
- UI: DaisyUI components + Tailwind utility classes
- Icons: `@heroicons/react`, `@phosphor-icons/react`
- Toasts: `react-hot-toast`; one-shot helper in `lib/toast-once.ts`
- Forms: validation in `lib/booking-form-validation.ts` and service-specific rules
- Audit trail: `lib/audit-logger-mongodb.ts` for admin actions
