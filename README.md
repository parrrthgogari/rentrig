# ⚡ RentRig — High-End Hardware & Compute Rental Platform

> **Fullstack Development with Next.js (DJS23AMD302)**  
> **Dwarkadas J. Sanghvi College of Engineering** — Department of Artificial Intelligence and Machine Learning  
> Comprehensive Implementation of **Assignment 1**, **Assignment 2**, and **Self-Learning Modules 1 to 6**.

---

## 📋 Course Outcomes & Syllabus Mapping

| Module / Topic | Specification | Project Implementation |
|---|---|---|
| **CO1 & Topic 1** | Accessible UI primitives with shadcn/ui & Radix UI | Radix UI primitives (`@radix-ui/react-dialog`, `select`, `slot`, `label`, `toast`), Tailwind CSS v4, Accessible Button & Card components |
| **CO1 & Topic 1** | Dark/Light/System theme switching without hydration mismatch | `next-themes` ThemeProvider configured with `suppressHydrationWarning` and CSS variables |
| **CO1 & Deliverable** | RSC vs Client Component render boundaries | Server Component catalog (`app/(public)/equipment/page.tsx`), details page (`[slug]`), and fine-grained Client Components (`reservation-form.tsx`, `filter-panel.tsx`) |
| **CO1, CO2 & Topic 2** | Lightweight client-side state management with Zustand | `cart-store.ts` (persisted to `localStorage` for checkout cart), `filter-store.ts` (persisted to `sessionStorage` for catalog filters) |
| **CO2 & Topic 3** | Type-safe form handling & schema validation using Zod | `react-hook-form` + `@hookform/resolvers/zod` + shared `reservationSchema`, `loginSchema`, `registerSchema` across client and server |
| **CO1 & Topic 6** | Dynamic Open Graph image generation & Core Web Vitals | `@vercel/og` Edge API route at `/api/og?title=...&category=...&price=...` generating real-time branded 1200x630 social preview cards |
| **CO4 & Topic 4** | Normalized multi-entity relational schema & automated seeding | PostgreSQL schema with `User`, `Role`, `Session`, `Equipment`, `Reservation`, `Review`, `AuditLog`, `EmailEvent`. Automated seeding with `@faker-js/faker` in `prisma/seed.ts` |
| **CO3 & Unit V** | Authenticated session enforcement & middleware proxy gates | Better Auth integration with edge middleware (`src/middleware.ts`) enforcing Role-Based Access Control (`ADMIN`, `MEMBER`, `GUEST`) |
| **CO3, CO4 & Topic 5** | Transactional lifecycle dispatch via Resend & Webhook ingestion | Automated transactional booking confirmation email dispatch via Resend API, plus incoming webhook handler (`/api/webhooks/resend`) tracking delivery/bounce events |

---

## 🏛 System Architecture & Directory Structure

```text
rentrig/
├── prisma/
│   ├── schema.prisma              # Normalized PostgreSQL schema (8 multi-entity models + 4 enums)
│   └── seed.ts                    # Automated database seeder powered by @faker-js/faker
├── src/
│   ├── app/
│   │   ├── (public)/              # Public Server Component routes
│   │   │   ├── layout.tsx         # Navbar + sticky footer layout
│   │   │   ├── page.tsx           # Landing page with hero, categories & featured hardware (RSC)
│   │   │   ├── equipment/
│   │   │   │   ├── page.tsx       # Filterable equipment catalog (RSC with URL query parameters)
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx   # Dynamic hardware detail page + dynamic OG metadata + specs
│   │   │   └── cart/
│   │   │       └── page.tsx       # Zustand-backed persistent rental cart & checkout workflow
│   │   ├── auth/
│   │   │   ├── login/page.tsx     # Zod-validated authentication page
│   │   │   └── register/page.tsx  # Zod-validated user registration page
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Member dashboard: active rentals, statistics, history (RBAC)
│   │   │   └── admin/page.tsx     # Admin command center: audit trails, webhook logs, users (ADMIN RBAC)
│   │   ├── api/
│   │   │   ├── auth/[...all]/     # Better Auth REST endpoint handler
│   │   │   ├── og/route.tsx       # Dynamic @vercel/og preview image engine (Edge runtime)
│   │   │   ├── reservations/      # Transactional mutation endpoint: creates booking, audit log, & email
│   │   │   └── webhooks/resend/   # Ingests Resend email lifecycle webhooks (delivered/bounced)
│   │   ├── globals.css            # Tailwind CSS v4 design tokens and theme variables
│   │   └── layout.tsx             # Root layout with next-themes ThemeProvider and Sonner toaster
│   ├── components/
│   │   ├── ui/                    # Accessible UI primitives (Button, Card, Badge, Input, Label, Select)
│   │   ├── navbar.tsx             # Theme toggler, auth session badge, persistent cart pill
│   │   ├── theme-provider.tsx     # Client-side next-themes hydration wrapper
│   │   ├── equipment-grid.tsx     # Responsive hardware card grid with availability flags
│   │   ├── filter-panel.tsx       # Client-side filter controls synced to URL and Zustand
│   │   └── reservation-form.tsx   # React Hook Form + Zod date-range booking component
│   ├── lib/
│   │   ├── auth.ts                # Better Auth server configuration with Prisma adapter
│   │   ├── auth-client.ts         # Client authentication hooks (signIn, signOut, signUp, useSession)
│   │   ├── db.ts                  # Global Prisma client singleton
│   │   ├── resend.ts              # Resend email client instance
│   │   ├── schemas.ts             # Shared Zod validation schemas
│   │   └── utils.ts               # Currency formatting (INR), date calculations, class names
│   ├── stores/
│   │   ├── cart-store.ts          # Zustand store persisted in localStorage
│   │   └── filter-store.ts        # Zustand store persisted in sessionStorage
│   └── middleware.ts              # Next.js Edge proxy layer for role-based session gating
├── pnpm-workspace.yaml            # Allowed build scripts (esbuild, prisma, sharp, workerd)
└── package.json                   # Automated CLI scripts for migration, seeding, and execution
```

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v25)
- **pnpm**: v10+ (`npm install -g pnpm`)
- **PostgreSQL**: Local instance or cloud hosted (e.g. Supabase, Neon, or Docker)

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your credentials:

```bash
cp .env.example .env
```

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/rentrig"

# Base Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Better Auth Secret (any secure 32+ character string)
BETTER_AUTH_SECRET="rentrig-dev-secret-change-in-production-2026"
BETTER_AUTH_URL="http://localhost:3000"

# Resend Transactional Email API Key
RESEND_API_KEY="re_placeholder_add_your_key"
FROM_EMAIL="noreply@rentrig.dev"
```

### 3. One-Command Database Migration & Automated Seeding
Run the single automated pipeline command to push the schema and seed mock data:

```bash
# Push schema changes to your database
pnpm db:push

# Run automated Faker.js database seeder
pnpm db:seed
```

Or execute the complete reset-and-seed pipeline in one go:
```bash
pnpm db:reset
```

> **What the seed script creates automatically:**
> - `1 Admin User` (`admin@rentrig.dev` / role: `ADMIN`)
> - `20 Member Users` with realistic names, emails, and avatars
> - `60 High-end Equipment items` across 6 categories (NVIDIA H100s, A100s, DJI Drones, Apple Vision Pro, Tektronix Oscilloscopes, ARRI Cameras, Boston Dynamics Spot)
> - `40 Historical Reservations` with random dates and statuses
> - `30 Audit Log Records` capturing system actions with IP addresses and user agents

### 4. Launch Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠 Available NPM Scripts

```bash
pnpm dev          # Run Next.js development server with Turbopack
pnpm build        # Run full production build & TypeScript validation
pnpm start        # Start Next.js production server
pnpm db:generate   # Regenerate Prisma Client
pnpm db:push      # Push Prisma schema directly to PostgreSQL
pnpm db:seed      # Populate database with realistic Faker.js datasets
pnpm db:reset     # Reset database and re-seed from scratch
pnpm db:studio    # Launch visual Prisma Studio database manager
```

---

## 🔍 Technical Analysis & Evaluation Notes (for Viva/Report)

### 1. RSC vs. Client Component Hydration Boundaries
- **Server Components by default**: Pages under `app/(public)/` (`page.tsx`, `equipment/page.tsx`, `[slug]/page.tsx`) execute exclusively on the server. They directly query PostgreSQL via Prisma with **zero client JavaScript bundle overhead**, yielding an immediate First Contentful Paint (FCP) and optimal Largest Contentful Paint (LCP).
- **Client Boundaries (`'use client'`)**: Only isolated interactive controls (`reservation-form.tsx`, `navbar.tsx`, `filter-panel.tsx`) are sent to the client. Props passed across the RSC boundary are serialized to JSON, avoiding unnecessary re-renders in the parent layout tree (`layout.tsx`).

### 2. Client-Side State Management (Zustand)
- **Decoupled Stores**:
  - `cart-store.ts` uses `localStorage` persistence to preserve pending hardware rentals across browser refreshes and page transitions.
  - `filter-store.ts` uses `sessionStorage` to retain search parameters while users browse individual detail pages.
- **Render Optimization**: State selectors in Zustand ensure only the specific component subscribing to a slice re-renders when state changes, leaving the server-rendered parent layout intact.

### 3. Server-Side Data Mutations & Type Safety
- **Single Source of Truth**: Shared validation schemas (`src/lib/schemas.ts`) defined with Zod are used on the client (`react-hook-form` with `zodResolver`) for instant user feedback and inside API endpoints/Server Actions for strict payload sanitization.
- **Audit Logging**: Every reservation mutation creates an immutable `AuditLog` entry tracking the acting user, entity ID, and request metadata.

### 4. Dynamic Social Sharing Images (`@vercel/og`)
- Dynamic endpoint `/api/og` uses the Next.js Edge Runtime to dynamically render Satori-driven SVG-to-PNG cards containing the equipment title, category color badge, and real-time daily rental price.

### 5. Transactional Email Pipeline & Webhooks
- **Dispatch**: Successful bookings trigger a responsive HTML confirmation email using Resend and `@react-email/components`.
- **Event Logging**: `/api/webhooks/resend` captures delivery, bounce, and open events, persisting them directly into the `EmailEvent` PostgreSQL table.
