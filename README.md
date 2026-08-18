# Nexus Platform — Production Application Foundation

A production-oriented Next.js + TypeScript + PostgreSQL application foundation for a large-scale platform with multiple roles, real workflows, authentication, discovery, learning, governance, messaging, verification, payments and auditability.

## Current development stage

This is the active development master. The current iteration adds the first end-to-end collaboration workflow: applicants can track proposals, project owners can review/shortlist/accept/reject applications, accepted collaborators can be connected to a protected project conversation, and project owners can control the project lifecycle.

### Implemented in the latest iteration
- Applicant "My applications" workspace
- Owner "My projects" management workspace
- Server-side application status authorization
- Accept & hire workflow with automatic rejection of competing pending applications
- Project lifecycle controls
- Project management audit logging
- Protected project conversations
- Secure conversation membership checks
- Persistent messages and unread/read state foundations
- Message notifications
- Activity API and mark-all-read UI
- Navigation for applications, projects and messages
- Prisma relation/index hardening for payments, verification reviewers and message attachments


This repository is the **development master**, not a finished production launch. It is intentionally designed so the business-specific workflows can be added without replacing the architecture.

### Implemented in this iteration
- Next.js App Router + TypeScript
- PostgreSQL + Prisma schema
- Opaque, hashed database-backed sessions in an HTTP-only cookie
- Password hashing with bcrypt
- Registration, login and logout
- Role-aware navigation and admin route protection
- User profile editing and profile-completion scoring
- Real project creation and project discovery
- Search and category filtering
- Applications and owner notifications
- Dashboard activity and application summaries
- Course/catalog foundation
- Verification, review, report, dispute and payment data models
- Audit logging hooks
- Responsive commercial-style design system

## Local development

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` and a long random `JWT_SECRET` (kept for backward compatibility; current sessions use database-backed opaque tokens).
4. Run `npm install`.
5. Run `npx prisma generate`.
6. Run `npx prisma db push` for development.
7. Run `npm run db:seed`.
8. Run `npm run dev`.
9. Open `http://localhost:3000`.

Demo seed accounts are shown by the seed script. Change the demo password immediately in any real environment.

## GitHub / hosting

Keep GitHub as the source-of-truth repository during development. GitHub Pages is not the application runtime because this project requires server-side Next.js execution and PostgreSQL. When the application is ready for external testing or production, deploy the repository to a Node-compatible Next.js host and attach managed PostgreSQL.

Never commit `.env` or production secrets.

## Production hardening still required

Before public launch, complete email verification, password recovery, 2FA, CSRF strategy, rate limiting/WAF, secure object storage, malware scanning, secret management, observability, backups, privacy/retention policies, comprehensive authorization/IDOR tests, E2E tests, payment webhooks and idempotency, and business-specific moderation/verification rules.
