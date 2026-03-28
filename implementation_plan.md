# Substitute Teacher Management System – Full-Day Absence Flow

The project already has per-period manual/auto substitution logic, but is **missing the key workflow**: "a teacher takes leave for the day → the system suggests a substitute for every period → admin reviews and confirms." The seed data is also too sparse (2 teachers, 4 periods, one class) to properly demo the system.

## What Exists ✅

| Feature | Status |
|---------|--------|
| [Teacher](file:///H:/new/frontend1/src/lib/types.ts#43-49), [Timetable](file:///H:/new/frontend1/src/lib/types.ts#11-22), [Substitution](file:///H:/new/frontend1/src/lib/types.ts#23-32) models | ✅ |
| Per-period auto-assign ([findReplacement](file:///H:/new/backend-nest/src/substitutions/substitutions.service.ts#15-68)) | ✅ Scores by subject match & workload |
| Manual & auto substitution endpoints | ✅ |
| Clash detection (teacher busy, already assigned) | ✅ |
| Admin dashboard with timetable view & teacher CRUD | ✅ |
| Admin substitution page (per-period forms) | ✅ |
| Teacher dashboard with timetable grid | ✅ |

## What's Missing ❌

| Feature | Gap |
|---------|-----|
| Realistic seed data | Only 2 teachers, 4 periods, 1 class |
| Full-day absence endpoint | No way to mark a teacher absent for all periods at once |
| Suggestion preview | Auto-assign immediately creates — doesn't show suggestions first |
| Batch confirmation | Admin can't review + confirm/reject all substitutions at once |
| UI for the full-day flow | No visual workflow for marking absent → reviewing suggestions → confirming |

---

## Proposed Changes

### Seed Data

#### [MODIFY] [seed.ts](file:///H:/new/backend-nest/prisma/seed.ts)

Replace the current 2-teacher seed with **8 teachers** across diverse subjects and **8 periods per day** (MON–FRI). Each teacher will have a realistic schedule with some free periods, enabling meaningful substitution testing.

| Teacher | Subjects | Typical periods busy |
|---------|----------|---------------------|
| Alice Johnson | Math, Physics | 6 of 8 periods |
| Bob Smith | Chemistry, Biology | 6 of 8 periods |
| Carol Williams | English, History | 5 of 8 periods |
| David Brown | Computer Science, Math | 5 of 8 periods |
| Eva Martinez | Physics, Chemistry | 5 of 8 periods |
| Frank Davis | History, Geography | 4 of 8 periods |
| Grace Wilson | Biology, English | 5 of 8 periods |
| Henry Taylor | Geography, Computer Science | 4 of 8 periods |

Classes: `8A`, `8B`, `9A`, `9B`, `10A`, `10B`, `11A`, `11B`

---

### Backend – Full-Day Absence API

#### [NEW] [full-day-absence.dto.ts](file:///H:/new/backend-nest/src/substitutions/dto/full-day-absence.dto.ts)

DTO with `absentTeacherId` (string) and [date](file:///H:/new/backend-nest/src/teachers/teachers.service.ts#54-62) (string, ISO date). Day of week will be computed from the date.

#### [MODIFY] [substitutions.service.ts](file:///H:/new/backend-nest/src/substitutions/substitutions.service.ts)

Add two new methods:

1. **`suggestFullDay(dto)`** — For each period the absent teacher has a class on the computed day:
   - Call existing [findReplacement](file:///H:/new/backend-nest/src/substitutions/substitutions.service.ts#15-68) to get the best candidate
   - Also return a list of **all available candidates** (so admin can pick an alternative)
   - Return an array of `{ period, className, subject, suggestedTeacher, allCandidates[] }`

2. **`confirmFullDay(dto)`** — Accept `absentTeacherId`, [date](file:///H:/new/backend-nest/src/teachers/teachers.service.ts#54-62), and `assignments[]` (each with `period` + `replacementTeacherId`). Batch-create all [Substitution](file:///H:/new/frontend1/src/lib/types.ts#23-32) records and increment workloads.

#### [MODIFY] [substitutions.controller.ts](file:///H:/new/backend-nest/src/substitutions/substitutions.controller.ts)

Add two new routes:
- `POST /api/substitutions/suggest-full-day` → calls `suggestFullDay`
- `POST /api/substitutions/confirm-full-day` → calls `confirmFullDay`

---

### Frontend – Admin Substitution Page Redesign

#### [MODIFY] [types.ts](file:///H:/new/frontend1/src/lib/types.ts)

Add types for the suggestion response: `SubstitutionSuggestion`, `SuggestionCandidate`.

#### [MODIFY] [page.tsx (admin/substitutions)](file:///H:/new/frontend1/src/app/admin/substitutions/page.tsx)

Complete redesign of the page into a **3-step flow**:

1. **Step 1 – Mark Absent**: Large, prominent card. Select teacher + pick date. One button: "Find Substitutes".
2. **Step 2 – Review Suggestions**: A table showing every period of the absent teacher's day, the class/subject they were supposed to teach, and the auto-suggested substitute (with a dropdown to pick an alternative from all available candidates). Status indicators (✅ found, ⚠️ no one available).
3. **Step 3 – Confirm**: "Confirm All Assignments" button that batch-creates substitutions. Success state shows a summary.

Keep existing manual/auto per-period forms in a collapsible "Advanced" section below.

Visual improvements:
- Animated step indicators
- Color-coded status badges
- Responsive grid layout
- Better card hierarchy with shadows and spacing

---

## Verification Plan

### Automated Verification

1. **Seed the database** and verify teacher/timetable data:
   ```
   cd H:\new\backend-nest
   npx prisma db push --force-reset
   npm run seed
   ```
   Then query the DB to verify 8 teachers and timetable entries exist.

2. **Start the backend** and test the new endpoints with the browser tool:
   ```
   cd H:\new\backend-nest
   npm run start:dev
   ```
   - Login as admin via `POST /api/auth/login`
   - Call `POST /api/substitutions/suggest-full-day` with a teacher ID and date
   - Verify the response contains period-by-period suggestions with candidate lists
   - Call `POST /api/substitutions/confirm-full-day` and verify substitutions are created

3. **Start the frontend** and visually verify the admin flow:
   ```
   cd H:\new\frontend1
   npm run dev
   ```
   - Navigate to `/admin/login`, sign in as admin
   - Go to `/admin/substitutions`
   - Select a teacher, pick today's date, click "Find Substitutes"
   - Verify the suggestion table appears with period → substitute mappings
   - Confirm all and verify the substitutions appear in the "Recent substitutions" list
