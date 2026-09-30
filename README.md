# ⚡ RentRig — High-End Hardware & Compute Rental Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**RentRig** is a modern, full-stack rental platform engineered for high-performance hardware: GPU compute clusters (NVIDIA H100s, A100s), industrial drones, precision lab instruments, VR/AR developer headsets, professional cinema cameras, and robotics kits.

Built on the **Next.js App Router**, RentRig features React Server Component catalogs, type-safe server mutations, client-side persistent cart stores with Zustand, Better Auth role-based access control (RBAC), and automated transactional email lifecycle dispatch.

---

## ✨ Key Features

- **🚀 Server-First Architecture (RSC):** Hardware catalog and dynamic detail pages rendered on the server with zero unnecessary client JavaScript overhead.
- **⚡ Persistent Client Cart (Zustand):** Multi-item reservation cart backed by `localStorage` persistence, calculating duration and rental pricing in real time across page navigations.
- **🔍 Multi-Facet Filter Workbench:** Real-time hardware facet search (category, brand, price slider, availability flag) synchronized to URL search params.
- **🛡️ End-to-End Type Safety:** Shared Zod validation schemas applied to client forms (`react-hook-form` + `@hookform/resolvers/zod`) and backend payload verification.
- **🔐 Secure Role-Based Access Control (RBAC):** Integrated with **Better Auth** and Next.js edge middleware (`ADMIN`, `MEMBER`, `GUEST` permission gates).
- **🎨 Modern Accessible UI:** Styled with Tailwind CSS v4 and accessible Radix UI primitives with smooth Dark/Light/System theme switching (`next-themes`).
- **🖼️ Dynamic Open Graph Cards:** Built-in `@vercel/og` Edge API generating customized 1200x630 social preview cards for each hardware listing.
- **✉️ Transactional Email & Webhook Observability:** Automated HTML reservation confirmations via **Resend** and `@react-email/components`, plus webhook ingestion for delivery and bounce logging.
- **🌱 Automated Database Seeding:** One-command database migration and seeding with `@faker-js/faker` generating realistic hardware clusters, pricing models, and reservation records.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Components & Server Actions) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, Lucide Icons, `next-themes` |
| **UI Components** | Radix UI primitives (`@radix-ui/react-*`), Sonner Toasts |
| **Client State** | Zustand (with `localStorage` and `sessionStorage` persistence) |
| **Form & Validation** | React Hook Form, Zod |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Authentication** | Better Auth (Email/Password, Session Tokens, RBAC) |
| **Email Service** | Resend, React Email |
| **Synthetic Seeding** | `@faker-js/faker` |

---

## 📂 Project Architecture

```text
rentrig/
├── prisma/
│   ├── schema.prisma              # PostgreSQL relational schema (User, Equipment, Reservation, AuditLog, EmailEvent)
│   └── seed.ts                    # Automated database seeder powered by Faker.js
├── src/
│   ├── app/
│   │   ├── (public)/              # Public Server Component routes
│   │   │   ├── page.tsx           # Home landing page with category cards & featured items
│   │   │   ├── equipment/
│   │   │   │   ├── page.tsx       # Filterable equipment catalog (RSC)
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx   # Dynamic hardware detail page + dynamic OG metadata
│   │   │   └── cart/
│   │   │       └── page.tsx       # Persistent reservation cart & checkout page
│   │   ├── auth/
│   │   │   ├── login/page.tsx     # Zod-validated sign-in page
│   │   │   └── register/page.tsx  # Zod-validated registration page
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Member dashboard: active rentals & history
│   │   │   └── admin/page.tsx     # Admin panel: audit trail, users, email webhook logs
│   │   ├── api/
│   │   │   ├── auth/[...all]/     # Better Auth REST endpoint handler
│   │   │   ├── og/route.tsx       # Dynamic @vercel/og image generator (Edge runtime)
│   │   │   ├── reservations/      # Booking mutation handler + email dispatch
│   │   │   └── webhooks/resend/   # Ingests Resend email delivery/bounce webhooks
│   │   ├── globals.css            # Design tokens & CSS variables
│   │   └── layout.tsx             # Root layout with ThemeProvider and toaster
│   ├── components/
│   │   ├── ui/                    # Button, Card, Badge, Input, Label, Select
│   │   ├── navbar.tsx             # Responsive nav with cart counter & theme switch
│   │   ├── equipment-grid.tsx     # Hardware catalog grid with live badges
│   │   ├── filter-panel.tsx       # Interactive facet filters
│   │   └── reservation-form.tsx   # Date-range booking form with live pricing
│   ├── lib/
│   │   ├── auth.ts                # Better Auth server configuration
│   │   ├── auth-client.ts         # Client authentication hooks
│   │   ├── db.ts                  # Global Prisma client singleton
│   │   ├── resend.ts              # Resend API client
│   │   ├── schemas.ts             # Shared Zod validation schemas
│   │   └── utils.ts               # Currency formatting, date helpers
│   ├── stores/
│   │   ├── cart-store.ts          # Zustand store persisted in localStorage
│   │   └── filter-store.ts        # Zustand store persisted in sessionStorage
│   └── middleware.ts              # Edge proxy layer for role-based route gating
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v25)
- **pnpm**: v10+ (`npm install -g pnpm`)
- **PostgreSQL**: Local database or cloud provider (e.g. Supabase, Neon)

### 2. Clone & Install

```bash
git clone https://github.com/parrrthgogari/rentrig.git
cd rentrig
pnpm install
```

### 3. Environment Variables
Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rentrig"

# Base Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication
BETTER_AUTH_SECRET="rentrig-dev-secret-change-in-production-2026"
BETTER_AUTH_URL="http://localhost:3000"

# Transactional Email (Resend)
RESEND_API_KEY="re_your_api_key_here"
FROM_EMAIL="noreply@rentrig.dev"
```

### 4. Database Setup & Automated Seeding

```bash
# Push Prisma schema directly to PostgreSQL
pnpm db:push

# Seed the database with 60+ equipment items and demo users
pnpm db:seed
```

Or perform a complete reset and re-seed in one step:
```bash
pnpm db:reset
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@rentrig.dev` | `password123` | Full access (`/dashboard/admin`, audit logs, email logs) |
| **Member** | *Register at `/auth/register`* | *Any 8+ chars* | Rental bookings, personal dashboard (`/dashboard`) |
| **Guest** | *Unauthenticated* | — | Browse catalog, inspect hardware specs, add to cart |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts development server with Turbopack |
| `pnpm build` | Compiles production build and runs TypeScript type check |
| `pnpm start` | Launches production server |
| `pnpm db:push` | Syncs Prisma schema directly with the database |
| `pnpm db:seed` | Populates database with synthetic records using Faker.js |
| `pnpm db:reset` | Resets PostgreSQL schema and re-seeds data |
| `pnpm db:studio` | Launches visual Prisma Studio in browser (`localhost:5555`) |
| `pnpm db:generate` | Regenerates Prisma client bindings |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
