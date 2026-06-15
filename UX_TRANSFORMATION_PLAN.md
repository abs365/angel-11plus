# Angel 11+ UX Transformation Plan

Version: 2D-A  
Last updated: 2026-06-15

---

## Vision

When a parent opens Angel 11+ for the first time:

1. It feels premium within 5 seconds
2. The child immediately knows what to do next
3. The experience feels modern and intentional
4. The platform looks like a national educational product, not a collection of features

This is not achieved by adding more features. It is achieved by making every interaction feel considered.

---

## Design Principles

**1. Student First**
Every screen answers "What should I do next?" before "How much have I done?"

**2. Pathway Aware**
The experience knows whether you're preparing for GL, CEM, CSSE or ISEB. Recommendations are context-specific.

**3. Progressive Disclosure**
Students see what they need. Analytics, insights and parent tools are a tap away — never in the way.

**4. Visual Identity Per Subject**
Every subject has a unique colour, icon and personality. A child should recognise their subject at a glance.

**5. Consistency Over Novelty**
Spacing, cards, shadows and typography must be the same across every screen. The platform should feel designed, not assembled.

---

## Navigation Hierarchy

### Problem with the Original Design

The original navigation was a flat list of 14 items with no grouping. Parent Dashboard appeared between student learning modules. Reasoning pages had no context. Students on mobile had 7+ items competing for attention.

### New Structure

```
Learning
  Home
  English
  Maths
  Vocabulary
  Writing
  Progress

Reasoning
  Verbal Reasoning
  Non-Verbal Reasoning
  Spatial Reasoning
  Numerical Reasoning

Exams
  Mock Tests
  Exam Pathways

──────────────────
Parent Area
  Parent Hub (Beta)

──────────────────
[User account]
```

**Section headers** (`text-[10px] font-bold uppercase tracking-widest text-gray-300`) create clear visual hierarchy without taking space.

**Parent Area** is always separated from student navigation by a border. It is never between student learning modules.

### Mobile Navigation

Mobile shows 6 slots in the bottom nav:

```
Home | English | Maths | Exams | Progress | Parent
```

These are the most-accessed destinations. All other pages are reachable from these entry points.

---

## Student Journey

### Entry: First Visit

```
Dashboard
  └─ WelcomeHero (XP: 0, Streak: 0, Level: 1)
  └─ Today's Mission: empty state (no sessions yet)
  └─ Core Subjects grid (6 cards visible)
  └─ Reasoning Skills grid (4 cards visible)
```

**Goal:** Student clicks a subject card within 10 seconds.

### Entry: Returning Student

```
Dashboard
  └─ WelcomeHero (personalised greeting, current stats)
  └─ Today's Mission: adaptive primary + secondary items
  └─ Featured "Start" button → highest-priority lesson
  └─ Weekly Goal progress (dots)
  └─ Subject grids (below the fold — already know where to go)
```

**Goal:** Student taps "Start" in under 5 seconds.

### Learning Loop

```
Subject Card tap
  └─ Subject landing page (lesson list or session menu)
  └─ Session start
  └─ Questions (adaptive difficulty)
  └─ Answer check + explanation
  └─ Session complete (XP earned, score shown)
  └─ Dashboard (updated mission, progress)
```

### Progress Loop

```
Dashboard
  └─ My Progress (Progress card or sidebar)
      └─ Skill breakdown
      └─ Subject scores
      └─ Insight cards (what to do next)
      └─ Gamification (badges, level, streak)
```

---

## Parent Journey

### Separation Principle

Parents and students have completely separate journeys. The parent view:

- Lives in its own **Parent Area** section of navigation
- Is labelled "Parent Hub (Beta)" — not visible between student subjects
- Has a separate visual treatment (blue accent, family icon)
- Contains data that students don't need to see during learning

### Parent Hub Entry Points

1. **Sidebar** → Parent Area → Parent Hub
2. **Mobile** → Parent icon (far right of bottom nav)
3. **Dashboard** → (no parent shortcut — requires deliberate navigation)

### Parent Hub Structure

```
Parent Hub
  └─ Exam Readiness card (overall readiness rating)
  └─ Subject Performance (scores per subject)
  └─ Focus Areas (what to prioritise this week)
  └─ Mock Performance (scores, section breakdown)
  └─ Reasoning Readiness (skill-by-skill breakdown)
  └─ Parent Insights (personalised advice — up to 5)
  └─ Badge Timeline (achievements earned)
```

---

## Dashboard Structure

### Layout Order

```
1. WelcomeHero
   ├─ Time-of-day greeting
   ├─ Student name + Level badge
   ├─ XP / Streak / Sessions stats
   ├─ XP progress bar (Level N → N+1)
   └─ Daily tip (embedded, glass card)

2. NewBadgeBanner (conditional — only when new badges earned)

3. Today's Mission
   ├─ Section header with Target icon
   ├─ Featured card: first mission item
   │    ├─ "Start here" label + subject name
   │    ├─ Item reason (adaptive explanation)
   │    └─ "Start" button (purple, full-featured)
   └─ Secondary items: remaining mission rows

4. Utility Row
   ├─ Pathway card (left)
   └─ Weekly Goal (right)

5. Core Subjects
   ├─ Section header
   └─ 3-column grid: English, Maths, Vocab, Writing, Mocks, Progress

6. Reasoning Skills
   ├─ Section header
   └─ 2-column grid: VR, NVR, Spatial, Numerical

7. Learning Insights (conditional — requires data)
   ├─ Section header + "Full report →" link
   └─ Top 2 analytics insights

8. About / Disclaimer footer
```

### Priority Change

In the original dashboard:
- Analytics panel appeared mid-page (above subjects)
- Daily tip was a full-width purple block
- Quick stats were three separate boxes

In the new dashboard:
- Analytics is at the **bottom** (students care about what to do, not their data)
- Daily tip is **embedded in the hero** (always visible, never intrusive)
- Stats are **inside the hero card** (one premium section, not three boxes)

---

## Mobile & iPad Rules

### iPad (768px–1024px)

- Sidebar is **visible** on iPad (md:flex activates at 768px)
- Content area: `md:ml-64` keeps content clear of sidebar
- Subject card grids: `sm:grid-cols-2` gives 2 columns on iPad
- Core subjects: `lg:grid-cols-3` gives 3 columns on larger iPad/desktop
- Hero: adequate padding (`px-6 py-5`) for iPad finger usage
- Mission CTA button: full `px-4 py-2.5` for reliable tapping

### Mobile (< 768px)

- Sidebar hidden; replaced by bottom nav (6 items)
- `pb-nav-safe` clears content above bottom nav on iOS
- All cards use `mx-4` or `px-4` page padding
- Subject cards are single column on mobile
- Bottom nav items: `min-w-[52px]` each
- Mission featured card has full-width Start button on mobile

### General Touch Rules (all devices)

- All interactive elements: `min-height: 44px; min-width: 44px` (set in globals.css)
- Filter buttons: `px-3.5 py-1.5` minimum (≈ 44px height after text)
- Navigation items: `py-2.5` minimum
- No hover-only affordances — all states legible without hover
- `group-active:scale-[0.98]` on all card links for tactile feedback

---

## Consistency Checklist

Before shipping any screen, verify:

- [ ] Uses `PageLayout` wrapper (or documented standalone pattern)
- [ ] Page max-width matches purpose (`max-w-2xl` / `max-w-3xl` / `max-w-4xl`)
- [ ] Correct page padding (`px-4 py-6 md:px-8 md:py-8`)
- [ ] Section headings use `text-xl font-bold text-gray-900`
- [ ] Cards use rounded-2xl (main cards) or rounded-xl (utility cards)
- [ ] Subject icons use updated icon mapping (Puzzle, Shapes, Compass, Target, etc.)
- [ ] Icons use coloured containers (`bg-{color}-100 p-3.5 rounded-2xl`)
- [ ] Touch targets meet 44px minimum
- [ ] No horizontal overflow on mobile
- [ ] Dark mode `dark:` variants on cards and navigation

---

## Preserved Features

All Phase 2A / 2B / 2C features are preserved:

| Feature | Status |
|---------|--------|
| Adaptive engine + daily missions | ✅ Active |
| Analytics + insight cards | ✅ Active |
| Replay queue system | ✅ Active |
| Gamification (XP, levels, streaks, badges) | ✅ Active |
| Parent Hub (readiness, insights, focus areas) | ✅ Active |
| Mock exam runner (GL, CEM, CSSE, ISEB) | ✅ Active |
| Mock performance in Parent Hub | ✅ Active |
| Reasoning question banks (172 total) | ✅ Active |
| Exam Pathway selection | ✅ Active |
| Supabase sync (fire-and-forget) | ✅ Active |

---

## Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 2A | Core content + adaptive engine | Complete |
| 2B | Analytics, replay, gamification, parent dashboard | Complete |
| 2C | Content expansion (172 questions), mock system (GL/CEM/CSSE/ISEB) | Complete |
| 2D-A | Design system, navigation, dashboard, subject cards, icon system | **Active** |
| 2D-B | Dark mode full implementation, English page redesign | Planned |
| 2E | Authentication, Supabase full sync, student profiles | Planned |
| 2F | Subscriptions, premium tier, tutor dashboard | Planned |
