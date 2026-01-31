# to-do.md — Vocabulary Practice Sheet App (Updated, Spreadsheet-Faithful)

## Product definition (lock this first)
The app is a digital vocabulary worksheet generator.

It allows users to:
- maintain a vocabulary list (source of truth)
- generate practice sheets (not games)
- practice by hiding / revealing information
- type answers and self-check
- print or export sheets as PDFs (student / teacher versions)

If a feature does not clearly support this definition, it is out of scope for v1.

---

## Non-goals (explicitly excluded in v1)
- Gamification (points, streaks, timers)
- Forced progression or adaptive difficulty
- Accounts, login, cloud sync
- Sentence generation or AI feedback
- Audio, speech recognition, handwriting

These may be added later, but must not distort the worksheet metaphor.

---

## Core data model (must exist before UI work)

### VocabItem (source of truth)
Each row corresponds to one vocabulary item in the spreadsheet.

Fields:
- id
- sourceLanguage (default: German)
- sourceText (e.g. "in der Naehe")
- targetLanguage (default: Japanese)
- targetKana (hiragana)
- targetKanji (optional)
- targetRomaji (optional)
- lessonOrDomain (e.g. "Unterwegs")
- orderIndex (preserves spreadsheet order)

No learning state is stored in v1.

---

## Core user flows (must all work end-to-end)

### Flow A — Maintain vocabulary list

Tasks:
- Create vocab list page (/vocab)
- Display items in a clean table or list
- Allow add / edit / delete
- Allow toggling visibility of:
  - German
  - Japanese (kana)
  - Kanji
  - Romaji

Acceptance criteria:
- User can recreate the spreadsheet's master list digitally
- Toggling fields feels like hiding/showing columns

---

### Flow B — Generate a practice sheet

Tasks:
- Create practice sheet builder (/practice/new)
- User selects:
  - practice direction (DE -> JA or JA -> DE)
  - number of words
  - optional lesson/domain filter
- App selects vocab items (ordered or random, but deterministic)
- App creates a PracticeSheet instance

Acceptance criteria:
- Generated sheet mirrors a printed worksheet structure
- No game-like UI elements appear

---

### Flow C — Practice on a sheet (digital worksheet)

Tasks:
- Create practice sheet page (/practice/[id])
- Layout:
  - left column: prompt language
  - right column: blank answer fields
- Allow user to:
  - type answers
  - click "Reveal answers"
  - click "Check" (simple correctness feedback)

Rules:
- Checking is optional and user-controlled
- No time pressure
- Feedback is subtle (checkmark / x or color, no scoring)

Acceptance criteria:
- Practicing feels like filling in a worksheet, not playing a game

---

### Flow D — Print / PDF export

Tasks:
- Create print-only route (/print/practice/[id])
- Support query options:
  - answers=1 (teacher version)
  - answers=0 (student version)
  - mode=ink (black/white, ink-efficient)
- Create PDF export endpoint using Playwright

Acceptance criteria:
- PDF looks like a real worksheet
- Can be used in a classroom without explanation

---

## Spreadsheet import (high priority)

Purpose:
- Respect existing material
- Avoid re-entry of vocab

Tasks:
- Implement XLSX/ODS import endpoint
- Detect header row (Deutsch / Japanisch / Kanji / Romaji)
- Import rows until empty
- Preserve original order and lesson labels

Acceptance criteria:
- Provided spreadsheet imports cleanly
- Imported data matches visible sheet content

---

## UX / UI constraints (hard rules)
- Calm, paper-like visual language
- Minimal color; one accent color max
- Typography optimized for readability and printing
- Layout must degrade gracefully to PDF

Anti-patterns:
- Card-based gamified layouts
- Animations that do not exist in print
- Dense dashboards or charts

---

## Implementation milestones

### Milestone 1 — Foundation
- Repo scaffold
- DB schema
- Vocab CRUD

### Milestone 2 — Practice sheets
- Sheet generator
- Practice page (typed answers)

### Milestone 3 — Print & PDF
- Print routes
- Ink-efficient styles
- PDF export

### Milestone 4 — Import
- Spreadsheet import
- Validation and cleanup

Each milestone must be reviewed against the spreadsheet before proceeding.

---

## Definition of Done (v1)
The app is complete when:
- A teacher can recreate an existing worksheet digitally
- A student can practice exactly as with the spreadsheet
- A printable PDF can replace the original sheet
- No explanation is required to understand how to use it

If all four are true, v1 is successful.
