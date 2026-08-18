# Production Platform Foundation

A production-oriented Next.js + TypeScript + PostgreSQL application foundation implementing real database-backed authentication, RBAC, profiles, projects, applications, messaging/file/course/verification/review/report/dispute/payment data models, admin governance, search-ready discovery, and deployment configuration.

## Run locally
1. Install Node 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and a strong `JWT_SECRET`.
3. `npm install`
4. `npx prisma generate`
5. `npx prisma db push`
6. `npm run db:seed`
7. `npm run dev`

Demo accounts created by seed: `admin@example.com` and `demo@example.com`, password `ChangeMe12345!` — change immediately.

## GitHub / production
Push the repository to GitHub, then deploy the Next.js app on a Node-compatible host such as Vercel and attach a managed PostgreSQL database. Set all environment variables in the hosting provider. Do not commit `.env`.

## Architecture
- Next.js App Router + TypeScript
- PostgreSQL + Prisma
- HTTP-only signed session cookie
- bcrypt password hashing
- Server-side RBAC helpers
- Zod request validation
- Database audit logs
- Extensible storage abstraction point
- Paystack payment model ready for server-side integration/webhooks/idempotency
- Automated test entrypoint via Vitest

## Security note
This repository is a strong working foundation, not a claim that every final business-specific control is complete. Before public launch, add production secrets, email provider, 2FA provider, object storage, malware scanning, rate limiting/edge WAF, CSRF strategy for state-changing browser flows, observability, backups, migrations, and a full security/penetration test against the final disclosed business rules.
