# POPCards 🎓🇳🇬

> **Zero-cost, zero-maintenance Passing-Out Profile (POP) Card generator designed specifically for National Youth Service Corps (NYSC) CDS Groups across Nigeria.**

POPCards empowers Community Development Service (CDS) Executives to spin up branded, shareable batch links in 60 seconds. Corps members access their group link, crop their portrait photo with touch gestures, input their memories, and instantly download high-DPI (1080×1350px) commemorative profile cards—100% generated on their device with zero server storage costs.

---

## Features

- **100% Client-Side Canvas Engine:** Cards render in real-time on HTML5 canvas and export directly to the user's phone or desktop storage. Zero image storage bills, zero cloud processing queues.
- **4 Tailored Card Layouts:**
  - `Classic Wave` — Authentic NYSC green header banner, square-like photo, and balanced right-hand details with member name prominently displayed.
  <!-- - `Bold Split` — Modern editorial layout with generous photo space and crisp typography. -->
  - `Polaroid Memory` — Nostalgic souvenir polaroid frame with detail columns.
  - `Spotlight Prestige` — Luxury prestige layout with balanced double-column detail hierarchy.
- **Physical "PROUDLY SERVED" Ink Stamp:** Vector rubber stamp mark drawn on all card designs.
- **Mobile Touch Image Cropper:** Pinch, zoom, and reposition portraits with `react-easy-crop`.
- **Exco PIN Verification:** Barricades executive titles (President, VP, General Secretary, etc.) behind a secret passcode set by the CDS leadership.
- **Multi-Tenant Admin Portal:**
  - **Superadmin:** Set up and manage CDS Admin accounts, toggle status, and inspect all batches.
  - **CDS Admins:** Configure custom link slugs (`/b/<slug>`), upload CDS emblem logos, select color themes, configure field options, and toggle open/closed submission states.

---

## Tech Stack

- **Frontend:** [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Package Manager:** `pnpm`
- **Backend & Database:** [Convex](https://www.convex.dev/) (real-time serverless backend)
- **Authentication:** [`@convex-dev/auth`](https://labs.convex.dev/auth) (Password provider with PKCS8 RSA & JWKS token verification)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Cropping Tool:** [react-easy-crop](https://github.com/ValentinH/react-easy-crop)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [pnpm](https://pnpm.io/) (`npm i -g pnpm`)

### 1. Clone & Install

```bash
git clone https://github.com/ayomikun-ade/pop-cards
cd POPCards
pnpm install
```

### 2. Set Up Convex Backend

In one terminal, start Convex dev:

```bash
npx convex dev
```

Follow the CLI prompt to log in or create a Convex account. This will generate your `.env.local` file containing `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL`.

### 3. Configure Auth Environment Variables

For Convex Auth to sign session tokens, set your local dev keys:

```bash
npx convex env set SITE_URL http://localhost:5173
```

_(If prompted for JWT keys, `npx @convex-dev/auth` automatically provisions `JWT_PRIVATE_KEY` and `JWKS`)._

### 4. Run Development Server

In another terminal:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Admin & Superadmin Setup

1. **First-Time Master Account:**
   - Navigate to `/login`.
   - If no Superadmin exists, the system automatically presents the **Setup Superadmin Account** screen.
   - Enter your name, username, and password to initialize the platform.
2. **Creating CDS Admin Accounts:**
   - Log in as Superadmin and visit `/admin/users`.
   - Fill in **Display Name**, **Username**, and **Initial Password**.
   - Click **Create Admin Account** and use the **"Copy Details"** button to paste the login info directly to the CDS executive on WhatsApp.
3. **CDS Exco Batch Creation:**
   - Admins sign in at `/login` and access `/admin/batches/new`.
   - Customize CDS Group name, batch name, card template, colors, emblem logo, and form questions.
   - Share the resulting link (`cdscards.com/b/your-cds-slug`) with members.

---

## Production Deployment (Vercel + Convex)

### 1. Deploy Convex Backend to Production

```bash
npx convex deploy
```

Copy your production deployment URLs:

- `CONVEX_URL`: `https://<prod-deployment-name>.convex.cloud`
- `CONVEX_SITE_URL`: `https://<prod-deployment-name>.convex.site`

Set your production Auth secrets:

```bash
npx @convex-dev/auth --prod
npx convex env set SITE_URL https://<your-domain>.vercel.app --prod
```

### 2. Deploy Frontend to Vercel

1. Import the repository on [Vercel](https://vercel.com).
2. Set Framework Preset to **Vite** and Build Command to `pnpm build`.
3. Add Environment Variables:
   - `VITE_CONVEX_URL`: `https://<prod-deployment-name>.convex.cloud`
   - `VITE_CONVEX_SITE_URL`: `https://<prod-deployment-name>.convex.site`
4. Deploy! The included `vercel.json` ensures all client-side routes (`/b/:slug`, `/admin`, `/login`) resolve seamlessly.

---

## Project Structure

```
POPCards/
├── convex/                  # Convex backend functions & schema
│   ├── admins.ts            # Admin profile management & account creation
│   ├── auth.ts              # Convex Auth provider config
│   ├── batches.ts           # Batch queries, mutations & storage upload
│   └── schema.ts            # Database tables & indexes
├── public/                  # Static assets & emblems
│   ├── favicon.svg          # Official NYSC green & gold vector favicon
│   ├── nysc-logo.png        # Transparent NYSC official emblem
│   ├── og-image.jpg         # Flat 1200x630 Open Graph share preview
│   └── site.webmanifest     # PWA web manifest
├── src/
│   ├── components/          # Reusable UI & card components
│   │   ├── CardPreview.tsx  # Canvas preview & PNG export logic
│   │   ├── MemberCardForm.tsx # Member data form & Exco unlock
│   │   ├── TemplateThumbnail.tsx # Live card thumbnails for builder
│   │   └── ImageCropperModal.tsx # Touch photo cropping modal
│   ├── pages/               # Application route views
│   │   ├── LandingPage.tsx  # Product homepage & template showcase
│   │   ├── MemberBatchPage.tsx # Public member generator (/b/:slug)
│   │   ├── LoginPage.tsx    # Admin login & master setup
│   │   ├── DashboardPage.tsx# Admin dashboard & batch management
│   │   ├── BatchBuilderPage.tsx # Batch creator with visual previews
│   │   └── ManageUsersPage.tsx # Superadmin user access control
│   ├── templates/           # 4 HTML5 Canvas card renderers
│   └── utils/               # Color palettes, stamps & vector icons
├── vercel.json              # SPA rewrite configuration
└── package.json
```

---

## License

Created with pride for the National Youth Service Corps (NYSC) community.
