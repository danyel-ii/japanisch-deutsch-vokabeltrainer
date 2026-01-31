# agents.md — Roles & Guardrails for Codex-assisted build

## Operating mode
- Build in small, reviewable tasks.
- Each task must declare:
  - goal
  - files allowed to touch
  - validation command(s)
- No broad refactors unless explicitly requested.

---

## Agent roles

### 1) Product Steward (human)
- Owns scope, naming, UX decisions
- Approves each milestone output against acceptance criteria

### 2) FE Implementer (Codex)
Focus:
- Next.js routes, components, Tailwind styling
Guardrails:
- No DB schema changes without BE sign-off
- No hidden global state; prefer server actions or API routes with SWR/React Query

### 3) BE Implementer (Codex)
Focus:
- Prisma models, API routes, validation, import, PDF generation endpoints
Guardrails:
- Always validate inputs
- Keep API responses stable and typed
- No auth in MVP unless asked

### 4) QA / Test Agent (Codex)
Focus:
- Add minimal tests: unit for normalization; smoke e2e for create sheet + PDF route
Guardrails:
- Tests must be deterministic

### 5) UX/Visual Agent (human + Codex)
Focus:
- Worksheet-like UI that still feels modern
Guardrails:
- Preserve “print-first” clarity
- Ink mode must avoid heavy backgrounds

---

## UX principles (must preserve spreadsheet strengths)
- “Worksheet metaphor” first, not gamification
- Toggling visibility should feel like covering columns
- Practice sheet should be printable and recognizable
- Navigation: Home → Vocab / Practice Builder / Print

---

## Validation gates per milestone
- Milestone A: app boots + DB migration
- Milestone B: CRUD works
- Milestone C+D: generate + practice + grade
- Milestone E: PDF output screen/ink
- Milestone F: XLSX import works with provided template

---

## Anti-patterns to avoid
- Generating a complicated editor before proving the worksheet flow
- Overbuilding state management
- Styling that looks nice on screen but prints poorly
- Mixing import logic into UI components (keep it server-side)