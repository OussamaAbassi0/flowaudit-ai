<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00c3ff,100:0050ff&height=180&section=header&text=FlowAudit%20AI&fontSize=48&fontColor=ffffff&fontAlignY=38&desc=Your%20manual%20process%2C%20automated%20in%20seconds&descAlignY=58&descSize=16" width="100%" />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-flowaudit--ai.vercel.app-00c3ff?style=for-the-badge&logo=vercel&logoColor=white)](https://flowaudit-ai.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff?style=for-the-badge&logo=stripe)](https://stripe.com)

</div>

---

## What is FlowAudit AI?

**FlowAudit AI** is a full-stack SaaS that turns any plain-English process description into a ready-to-import **n8n automation workflow** — in under 30 seconds.

> *"Every Monday our team exports orders from Shopify, removes cancelled ones in Excel, pastes results into Google Sheets, and emails a summary to leadership. It takes 3 hrs/week across 2 people."*

Paste that sentence → get a process audit report + a downloadable `workflow.json` you import directly into n8n.

**Live:** [flowaudit-ai.vercel.app](https://flowaudit-ai.vercel.app)

---

## Key Features

| Feature | Details |
|---|---|
| 🧠 **AI Process Analysis** | GPT-4o identifies every manual bottleneck and redundant handoff |
| ⏱️ **Time & Cost Quantification** | Hours saved/week, FTE reclaimed, annual dollar value |
| 📦 **Instant n8n JSON Export** | Download a workflow with nodes, connections, and credential placeholders |
| 🗺️ **30+ Tool Mappings** | Gmail, HubSpot, Shopify, Notion, Airtable, Slack, Stripe, Jira, and more |
| 💳 **Stripe Subscriptions** | Free tier (3 audits) + Pro plan with unlimited access |
| 🔐 **Auth via Clerk** | Sign up/sign in with social or email — session managed by Clerk |
| 📊 **Audit Dashboard** | Track all past audits, hours saved, and export history |

---

## Tech Stack

```
Frontend    Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript
AI Engine   OpenAI GPT-4o (via Vercel AI SDK)
Auth        Clerk (webhooks via Svix)
Database    Neon PostgreSQL (serverless) · Prisma ORM
Payments    Stripe (subscription billing + webhooks)
Deploy      Vercel
```

---

## Architecture

```
User describes process (plain English)
        │
        ▼
POST /api/generate-audit
        └─→ GPT-4o
                ├─→ Bottleneck analysis report
                └─→ n8n workflow JSON (nodes + connections)
                            │
                            ▼
                    Stored in Neon DB (Prisma)
                            │
                            ▼
                    Dashboard + Download button

Stripe webhook flow:
Stripe → POST /api/webhooks/stripe
        └─→ Update user.stripeCurrentPeriodEnd in DB
                └─→ Unlock Pro features (unlimited audits)
```

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/OussamaAbassi0/flowaudit-ai.git
cd flowaudit-ai
npm install
```

### 2. Configure environment variables

Create a `.env.local` file:

```env
# Database (Neon)
DATABASE_URL=postgresql://...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

```prisma
model User {
  id                     String    @id @default(cuid())
  clerkId                String    @unique
  email                  String    @unique
  audits                 Audit[]
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  stripeCurrentPeriodEnd DateTime?
}

model Audit {
  id              String   @id @default(cuid())
  userId          String
  originalInput   String   @db.Text
  analysisReport  String   @db.Text
  n8nWorkflowJson Json
  createdAt       DateTime @default(now())
}
```

---

## Deploy to Vercel

```bash
npx vercel
```

Add all environment variables in the Vercel dashboard. The project is pre-configured for serverless deployment.

---

## Built by

**Oussama Abassi** — AI Automation Architect

[![Malt](https://img.shields.io/badge/Malt-Profile-FF6B35?style=flat-square)](https://www.malt.fr/profile/oussamaabassi)
[![GitHub](https://img.shields.io/badge/GitHub-OussamaAbassi0-181717?style=flat-square&logo=github)](https://github.com/OussamaAbassi0)

---

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0050ff,100:00c3ff&height=100&section=footer" width="100%" />
</div>
