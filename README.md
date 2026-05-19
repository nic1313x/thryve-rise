# Thryve Rise

Gamified leadership transition tracker for Rhiannon at Thryve Accounting & Advisory Services.

Built with Next.js 14 (App Router) + Supabase + Tailwind CSS + Framer Motion.

---

## What this is

A full-stack web app that tracks Rhiannon's 12-month transition from founder-operator to full-time CEO. 20 tasks across 4 phases. XP, levels, badges, streaks. An admin view for Nic. And a Rolex Submariner on the line.

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Name it `thryve-rise`
3. Choose a region close to your users
4. Wait for the project to spin up (~2 min)

### 2. Run the database migration

In your Supabase dashboard → SQL Editor, run the contents of:

```
supabase/migrations/001_initial.sql
```

This creates all tables with RLS policies and enables Realtime on the completions table.

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in from your Supabase project settings → API:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ Never commit `.env.local` — it's gitignored.

### 4. Install dependencies

```bash
npm install
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## First-time configuration

### Seed the tasks

1. Log in with `nic@thryvetogether.com` via magic link
2. Go to `/setup`
3. Click **Seed Tasks** to populate the 20 tasks

### Set Nic as admin

After Nic's first login, run this in Supabase SQL Editor:

```sql
UPDATE users SET role = 'admin' WHERE email = 'nic@thryvetogether.com';
```

Or call the helper function:

```sql
SELECT set_admin_role('nic@thryvetogether.com');
```

### Invite Rhiannon

Send a magic link to `rhiannon@thryvetogether.com` — she'll land on `/dashboard` automatically (player role is the default).

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Thryve Rise"
git remote add origin https://github.com/your-org/thryve-rise.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click Deploy

### 3. Update Supabase auth settings

In Supabase → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

---

## Email notifications (optional)

When Rhiannon completes all 20 tasks, the app calls a Supabase Edge Function to email Nic.

To enable this:

1. Set up [Resend](https://resend.com) — free tier works
2. Verify your domain (`thryvetogether.com`)
3. Get your API key
4. In Supabase → Edge Functions → Settings, add:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```
5. Deploy the Edge Function:
   ```bash
   npx supabase functions deploy notify-completion
   ```

If no API key is set, the completion still works — the notification is silently skipped.

---

## Architecture

```
app/
  dashboard/         # Rhiannon's main view
  roadmap/           # Full 4-phase task view
  badges/            # Badge collection
  profile/           # Stats + watch goal
  admin/
    dashboard/       # Nic's overview (realtime)
    tasks/           # Full task table + CSV export
    activity/        # Live activity feed
  setup/             # Task seeder (admin only)
  login/             # Magic link auth
  auth/callback/     # Auth redirect handler
  api/
    complete-task/   # Task completion endpoint
    export-tasks/    # CSV export endpoint

components/
  layout/            # AppShell, Sidebar, BottomNav
  game/              # XPBar, TaskCard, LevelUpModal, WinScreen, WatchDisplay...
  ui/                # Skeleton, primitives

lib/
  supabase/          # Client + server Supabase clients
  game/              # XP/level logic, badge logic, tasks seed, messages
  utils.ts           # cn(), formatRelativeTime(), formatDate()

contexts/
  toast.tsx          # Global toast system

supabase/
  migrations/        # SQL schema
  functions/         # Edge Functions
```

---

## The Prize

Rhiannon completes all 20 tasks → reaches Level 7: Architect → triggers the win screen.

Nic is notified by email: *"Rhiannon finished. Time to buy the Hulk. 🟢"*

The watch: **Rolex Submariner 116610LV — The Hulk**.

---

## Support

Questions: [nic@thryvetogether.com](mailto:nic@thryvetogether.com)
