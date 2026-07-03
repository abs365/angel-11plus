# Angel 11+

A private, iPad-first web application preparing children (ages 9–11) for UK selective school entrance examinations (GL Assessment, CEM, CSSE, ISEB) — English comprehension, Maths reasoning, Vocabulary, Creative Writing, and the four Reasoning disciplines (Verbal, Non-Verbal, Spatial, Numerical).

**Start here for project context, not this file:**

| Document | What it covers |
|---|---|
| `PROJECT_CONTEXT.md` | What the product is, tech stack, architecture overview — the primary onboarding doc |
| `DEPLOYMENT.md` | Environment variables, Supabase setup, migration run order, Vercel deployment |
| `ALI_VERSION.md` | Current state of Angel Learning Intelligence (the adaptive engine) — capabilities, gaps, roadmap |
| `ALI_OPERATIONS_MANUAL.md` | Day-to-day ALI operations: authoring, tagging, seeding, activation, monitoring, troubleshooting |
| `ENTERPRISE_BETA_READINESS_REPORT.md` | Latest independent readiness audit and launch-readiness scoring |
| `BETA_DEPLOYMENT_CHECKLIST.md` | Manual pre-launch verification checklist |

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and (optional locally) `OPENAI_API_KEY` — see `DEPLOYMENT.md` §1.

```bash
npm run build   # production build + typecheck
npm run lint    # ESLint
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Supabase (Postgres + Auth) · OpenAI (writing feedback only) · Vercel (hosting target).

## Database migrations

All schema changes live in `supabase/migrations/`, applied in numeric order via the Supabase Dashboard SQL Editor (no CLI-linked migration tooling in this project — see `DEPLOYMENT.md` §2 and `ALI_PRODUCTION_ACTIVATION_CHECKLIST.md` for the ALI-specific run order and safety notes). Every migration is additive-only.
