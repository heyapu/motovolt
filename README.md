# Motovolt Accessories Store — v2

Next.js 15 (App Router, TSX) storefront + admin.

| Layer | Choice |
|---|---|
| Storefront UI | SCSS modules (Chakra Petch, matches Motovolt design) |
| Admin UI | shadcn-style components + Tailwind (scoped to `/admin` only) |
| Auth | **Kinde** (hosted login) + DB `admins` table for authorization |
| Payments | **Razorpay Checkout** — signature-verified + webhook backup |
| Database | Supabase Postgres (DB only, no Supabase Auth) |
| Images | ImageKit (direct browser upload, admin-signed) |

## How auth works
Kinde answers "who is this?" — the `admins` table answers "are they allowed?".
Anyone can authenticate with Kinde, but unless their email is in `admins`,
`requireAdmin()` bounces them. The **superadmin** manages that list at
`/admin/admins` (add/remove admins, grant superadmin). The first superadmin is
seeded in `supabase/schema.sql` — change the email there before running it.

## How payments work
1. Cart drawer collects contact + delivery address (client validates, server re-validates).
2. `POST /api/checkout` recomputes prices from the DB, creates a PENDING order
   (with the address/contact **copy in the DB**), then creates a Razorpay order
   with the same details in **Razorpay notes**.
3. Razorpay Checkout opens (prefilled name/phone/email, Motovolt orange theme).
4. On success the browser posts to `/api/razorpay/verify`, which checks the
   HMAC signature, marks the order PAID, and decrements stock.
5. `/api/razorpay/webhook` does the same thing independently (idempotent), so a
   closed tab can't lose an order.
6. `/order/success` shows the printable invoice (browser print, no PDF), the
   "call within 24 hours / no online tracking" notice, and the support phone.

## Setup
1. `npm install`
2. Copy `.env.example` → `.env.local`, fill everything. Never commit it.
3. Supabase → SQL editor → run `supabase/schema.sql`
   (edit the seeded superadmin email first).
4. Kinde → create a "Back-end web" app →
   callback: `{SITE_URL}/api/auth/kinde_callback`, logout: `{SITE_URL}`.
   Enable whichever sign-in methods you want (Google, email OTP…).
5. Razorpay dashboard (test mode) → copy Key ID + Secret. Add a webhook:
   `{SITE_URL}/api/razorpay/webhook`, events `payment.captured` +
   `payment.failed`, and set the same secret as `RAZORPAY_WEBHOOK_SECRET`.
6. `npm run dev`

Local webhook testing needs a tunnel (ngrok). Not required to test the happy
path — `/api/razorpay/verify` already confirms payments without the webhook.

## Conventions
- **All writes go through `/api/*` routes** with the Supabase service role.
  The anon key only reads the public catalog (enforced by RLS).
- Variants require a **hex color** (`#FF5A1F`) — validated in the form, the API,
  and the DB (`check` constraint). The hex draws the swatch dots.
- Products are model-independent (`product_models` join). Adding a 5th vehicle
  model = one row in `models`; the toggle/banner/grid all follow.
- Font sizes/colors/spacing: `src/styles/variables.scss` for the storefront,
  `src/styles/admin.css` tokens for the admin.
