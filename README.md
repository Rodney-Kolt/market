# 🍽️ Market Assistant

> A marketplace knowledge platform for food businesses — restaurants, cafes, food trucks, bakeries, and grocery stores.

Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | Email/password + Google OAuth, two roles: `customer` & `business_owner` |
| 🏪 Business Profiles | Full profiles with contact info, menu, ratings, Q&A |
| 📅 Today's Menu Snapshot | Owners mark items available today; customers see "Available Now" badges |
| 💬 Community Q&A | Ask questions, get answers, link to recommended businesses |
| 💰 Price Snapshot | Crowdsourced pricing with "Verified by customer" flag |
| ⭐ Ratings & Reviews | 1–5 star ratings with comments; auto-updates business average |
| 🔍 Transparency Score | 0–100 score based on profile completeness, response rate, price accuracy |
| 🏅 Reputation Badges | Bronze (5 ratings), Silver (20), Gold (100) |
| 🔎 Search & Filters | Search by name/dish/cuisine; filter by rating, price range, dietary options |
| 📊 Owner Dashboard | Manage menu, respond to Q&A, view analytics |
| 👤 Customer Dashboard | Track questions asked, answers received, reviews written |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (for deployment)

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/market-assistant.git
cd market-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name, database password, and region
3. Once created, go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Go to **SQL Editor** → **New Query**, paste the contents of `supabase/schema.sql`, and click **Run**

5. *(Optional)* Run `supabase/seed.sql` for sample data (update the `owner_id` UUIDs to real user IDs first)

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Enable Google OAuth (optional)

1. In Supabase → **Authentication → Providers → Google**
2. Enable it and add your Google OAuth credentials
3. Add `http://localhost:3000/auth/callback` to the allowed redirect URLs

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
market-assistant/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (Navbar, Footer, Toaster)
│   ├── page.tsx                  # Homepage
│   ├── not-found.tsx             # 404 page
│   ├── error.tsx                 # Error boundary
│   ├── auth/
│   │   ├── login/page.tsx        # Sign in
│   │   ├── register/page.tsx     # Sign up (with role selection)
│   │   ├── forgot-password/      # Password reset
│   │   └── callback/route.ts     # OAuth callback handler
│   ├── businesses/
│   │   ├── page.tsx              # Business listing + filters
│   │   └── [id]/
│   │       ├── page.tsx          # Business profile (server)
│   │       └── BusinessProfileClient.tsx  # Business profile (client)
│   ├── questions/
│   │   └── [id]/answer/page.tsx  # Answer a question
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard router (owner vs customer)
│   │   ├── OwnerDashboard.tsx    # Business owner dashboard
│   │   └── CustomerDashboard.tsx # Customer dashboard
│   └── profile/page.tsx          # User profile settings
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx            # Responsive navbar with auth state
│   │   └── Footer.tsx            # Site footer
│   ├── ui/
│   │   ├── SearchBar.tsx         # Search input with routing
│   │   ├── StarRating.tsx        # Star display + interactive rating
│   │   ├── Badge.tsx             # Reputation, transparency, available badges
│   │   ├── LoadingSpinner.tsx    # Spinner + page loader
│   │   └── EmptyState.tsx        # Empty state with CTA
│   ├── business/
│   │   ├── BusinessCard.tsx      # Grid/list business card
│   │   ├── BusinessFiltersPanel.tsx  # Sidebar filters
│   │   ├── MenuItemCard.tsx      # Menu item with price snapshot
│   │   ├── QuestionCard.tsx      # Q&A card with expandable answers
│   │   └── RatingCard.tsx        # Review card
│   └── forms/
│       ├── AskQuestionForm.tsx   # Ask a question
│       ├── AnswerForm.tsx        # Answer a question
│       ├── RateBusinessForm.tsx  # Rate a business
│       ├── ReportPriceForm.tsx   # Crowdsource a price
│       ├── BusinessForm.tsx      # Create/edit business profile
│       └── MenuItemForm.tsx      # Add/edit menu item
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Session refresh middleware
│   └── utils.ts                  # Helpers, formatters, constants
│
├── types/
│   └── index.ts                  # All TypeScript interfaces
│
├── supabase/
│   ├── schema.sql                # Full database schema + RLS + triggers
│   └── seed.sql                  # Sample data
│
├── middleware.ts                 # Next.js middleware (session refresh)
├── tailwind.config.ts            # Tailwind config with brand colors
└── .env.local.example            # Environment variable template
```

---

## 🗄️ Database Schema

```
users           → auth profiles with role
businesses      → food business listings
menu_items      → items with availability toggle
questions       → customer questions per business
answers         → answers with optional business recommendation
ratings         → 1-5 star reviews (one per user per business)
price_reports   → crowdsourced pricing data
```

Key features:
- **Row Level Security (RLS)** on all tables
- **Auto-trigger** creates user profile on sign-up
- **Auto-trigger** updates `rating_avg` and `rating_count` on every rating change
- **Unique constraint** on `(business_id, rater_id)` — one rating per user per business

---

## 🚢 Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts. When asked about environment variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (set to your Vercel URL, e.g. `https://market-assistant.vercel.app`)

### Option B: GitHub + Vercel Dashboard

1. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Market Assistant MVP"
git remote add origin https://github.com/YOUR_USERNAME/market-assistant.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

3. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` → your Vercel deployment URL

4. Click **Deploy** ✅

### After deploying

Update your Supabase project:
- **Authentication → URL Configuration** → add your Vercel URL to **Site URL** and **Redirect URLs**
- Add `https://your-app.vercel.app/auth/callback` to redirect URLs

---

## 🔧 Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🎨 Design System

The app uses a warm **orange/amber** color palette:

| Token | Usage |
|---|---|
| `orange-500` | Primary actions, brand color |
| `amber-400` | Star ratings |
| `green-*` | Available today, dietary badges |
| `gray-*` | Text, borders, backgrounds |

All components use Tailwind utility classes with custom component classes defined in `globals.css` (`.btn-primary`, `.card`, `.input`, `.badge`, etc.)

---

## 🔒 Security

- All database tables have **Row Level Security** enabled
- Users can only modify their own data
- Business owners can only manage their own businesses
- Server-side Supabase client used for data fetching in Server Components
- OAuth handled via Supabase Auth with secure cookie sessions

---

## 📈 Roadmap (Post-MVP)

- [ ] Real-time Q&A notifications (Supabase Realtime)
- [ ] Image uploads for business logos and menu items (Supabase Storage)
- [ ] Map integration (Google Maps / Mapbox)
- [ ] Advanced search with full-text search (Supabase pg_trgm)
- [ ] Email notifications for new answers
- [ ] Business hours management
- [ ] Dispute resolution system
- [ ] Mobile app (React Native + Expo)

---

## 📄 License

MIT — free to use and modify.
