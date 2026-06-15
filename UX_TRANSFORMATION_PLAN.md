# Angel 11+ UX Transformation Plan — Phase 2D-A

## Goal

When a parent opens Angel 11+ for the first time it should feel like a premium educational product built for the whole UK market — not a side project. Every screen must communicate expertise, structure, and genuine care for the student's progress.

---

## Navigation Architecture

### Before
Flat list of 14 items with no grouping. Parent Dashboard sat among student learning modules. Reasoning pages buried without context. Mobile nav included items that weren't relevant on small screens.

### After: Sectioned Sidebar

| Section | Items |
|---------|-------|
| **Learning** | Home, English, Maths, Vocabulary, Writing, Progress |
| **Reasoning** | Verbal Reasoning, Non-Verbal, Spatial, Numerical |
| **Exams** | Mock Tests, Exam Pathways |
| **Parent Area** | Parent Dashboard (bottom, separated by border) |

**Key principles:**
- Section headers use 10px uppercase tracking-widest — structurally clear without taking space
- Parent Dashboard is visually separated from student learning at all times
- Mobile bottom nav (6 slots): Home, English, Maths, Exams, Progress, Parent/Login

---

## Dashboard Redesign

### Layout Order

```
WelcomeHero          ← gradient card, time-of-day greeting, XP/streak/level/progress bar
NewBadgeBanner       ← transient, only when badges earned
Today's Mission      ← primary focus section; featured first item + secondary items
Pathway + Weekly     ← 2-column utility row
Core Subjects        ← 6-card grid (English, Maths, Vocabulary, Writing, Mocks, Progress)
Reasoning Skills     ← 4-card grid (VR, NVR, Spatial, Numerical)
Learning Insights    ← analytics, pushed to bottom where it belongs
About footer
```

### Welcome Hero
- `from-purple-600 via-purple-700 to-indigo-700` gradient
- Time-aware greeting ("Good morning/afternoon/evening")
- Level badge (white/15 glass background)
- Three stats inline: Total XP | Day Streak | Sessions
- XP progress bar (white fill on white/20 track)
- Daily tip embedded (Lightbulb icon, glass card)

### Today's Mission
- Section header with Target icon
- Featured card: first (Focus) mission item gets `from-purple-50 to-indigo-50` gradient treatment with a purple "Start" button
- Secondary mission items use existing DailyMission component (compact)
- Empty state with Target illustration for new students

---

## Icon Upgrades

| Subject | Old icon | New icon |
|---------|----------|----------|
| Verbal Reasoning | Brain | Puzzle |
| Non-Verbal Reasoning | Eye | Shapes |
| Spatial Reasoning | Box | Compass |
| Numerical Reasoning | Hash | Hash (kept) |
| Mock Tests | ClipboardList | Target |

Icons were chosen for semantic accuracy: Puzzle = word/logic puzzles, Shapes = visual pattern recognition, Compass = spatial navigation and direction.

---

## Student vs Parent Journey Separation

- **Student journey:** Learning → Reasoning → Exams (top nav sections)
- **Parent journey:** Parent Area (always at bottom, clearly separated)
- Parent Dashboard never appears mid-stream in student navigation
- Mobile: Parent tab at far right of bottom nav, distinct from student tabs

---

## Mobile / iPad Principles

- All pages use `max-w-2xl mx-auto px-4` for readable line lengths
- Cards: minimum 44px touch targets on all interactive elements
- Bottom nav: 6 slots, `min-w-[52px]` per item
- Sidebar hidden on mobile; bottom nav replaces it
- `pb-safe` and `pb-nav-safe` ensure content doesn't hide behind home indicator / nav
- No horizontal scroll on any page

---

## Content Preserved (Not Removed)

All Phase 2A/2B/2C features are intact:

- Adaptive engine + daily missions
- Analytics + insight cards
- Replay queue system
- Gamification (XP, levels, streaks, badges)
- Parent dashboard (readiness, insights, focus areas, mock performance)
- Mock exam pathways (GL, CEM, CSSE, ISEB)
- Reasoning question banks (52 VR, 40 NVR, 39 SR, 41 NR)
- Pathway selection system
