# Development Changelog

## V3 — Collaboration Workflow

- Added applicant application tracking at `/applications`.
- Added owner project management at `/manage/projects`.
- Added server-side application status transitions with authorization.
- Added accept-and-hire behavior that activates the project and rejects competing pending applications.
- Added project lifecycle controls for open, active, completed and cancelled states.
- Added protected project conversation creation.
- Added persistent conversation messages with membership checks.
- Added message notifications.
- Added notification API and mark-all-read UI.
- Added navigation links for applications, project management and messages.
- Hardened Prisma relations for payments, verification reviewers and message attachments.

## Validation

The local environment available for this build did not contain installed project dependencies, and package installation timed out. TypeScript syntax was checked directly and no syntax errors were reported in the new modules; full Next.js/Prisma build validation should be run after `npm install` in a normal development environment.
