# Angel 11+ Design System

Version: 2D-A  
Last updated: 2026-06-15  
Status: Active

---

## 1. Typography

### Scale

| Token | Class | Size | Weight | Line-height | Usage |
|-------|-------|------|--------|------------|-------|
| `display` | `text-3xl font-bold` | 30px | 700 | 1.2 | Hero section titles |
| `h1` | `text-2xl font-bold` | 24px | 700 | 1.3 | Page titles, modal headers |
| `h2` | `text-xl font-bold` | 20px | 700 | 1.35 | Section headings |
| `h3` | `text-base font-bold` | 16px | 700 | 1.4 | Card titles, sub-section labels |
| `body` | `text-sm` | 14px | 400 | 1.625 | Descriptions, running text |
| `small` | `text-xs` | 12px | 400 | 1.5 | Labels, badges, metadata |
| `micro` | `text-[10px] font-bold uppercase tracking-widest` | 10px | 700 | 1.5 | Section nav labels, category chips |

### Mobile Sizing Rules

- Never drop below `text-xs` (12px) for interactive or important labels
- Touch targets: minimum 44 × 44px (`min-h-[44px] min-w-[44px]`)
- Page titles: `text-xl` on mobile, `text-2xl` on md+
- Body text: `text-sm` on all screen sizes (14px is comfortably readable on iPad)
- Avoid `leading-tight` on mobile — prefer `leading-snug` or `leading-relaxed`

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

System fonts render natively on iPad and iPhone, improving perceived quality.

---

## 2. Colour Tokens

### Primary: Purple

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `purple-50` / `purple-950` | `#faf5ff` / `#2e1065` | | Card backgrounds |
| `purple-100` / `purple-900` | `#f3e8ff` / `#581c87` | | Icon containers, badge fills |
| `purple-500` | `#a855f7` | | XP progress bar, dots |
| `purple-600` | `#9333ea` | `purple-400 #c084fc` | Primary CTA, active nav, hero gradient start |
| `purple-700` | `#7e22ce` | `purple-400 #c084fc` | Active nav text, hover CTA |

### Secondary: Indigo

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `indigo-600` | `#4f46e5` | `indigo-400 #818cf8` | Progress subject card, hero gradient end |
| `indigo-700` | `#4338ca` | | Hero gradient darkest |
| `indigo-50` / `indigo-950` | | | Indigo card backgrounds |

### Support Palette

| Colour | Light token | Dark token | Primary usage |
|--------|-------------|-----------|---------------|
| Emerald | `emerald-500 / 600` | `emerald-400` | Success, weekly goal complete, ISEB |
| Amber | `amber-500 / 600` | `amber-400` | Warnings, building readiness, Writing |
| Sky Blue | `sky-500 / 600` | `sky-400` | Info states (reserved) |
| Rose | `rose-500 / 600` | `rose-400` | Mission Focus chip, Numerical Reasoning |
| Cyan | `cyan-500 / 600` | `cyan-400` | Non-Verbal Reasoning |
| Teal | `teal-500 / 600` | `teal-400` | Spatial Reasoning |
| Violet | `violet-600` | `violet-400` | Verbal Reasoning |

### Neutrals

| Token | Light value | Dark value | Usage |
|-------|-------------|-----------|-------|
| `--background` | `#f8f7ff` | `#0d0d1a` | Page background (via CSS var) |
| `--surface` | `#ffffff` | `#141428` | Card backgrounds |
| `--surface-raised` | `#f3f0ff` | `#1e1e36` | Elevated elements |
| `--border` | `#e5e7eb` | `#27273f` | Card borders |
| `gray-50` | `#f9fafb` | | Subtle backgrounds |
| `gray-100` | `#f3f4f6` | | Icon containers (neutral) |
| `gray-300` | `#d1d5db` | | Nav section labels |
| `gray-400` | `#9ca3af` | | Placeholder text, disabled |
| `gray-500` | `#6b7280` | | Secondary text |
| `gray-700` | `#374151` | | Body text |
| `gray-900` | `#111827` | | Headings on white |

### Dark Mode

Dark mode tokens are defined as CSS custom properties in `globals.css` and respond to `@media (prefers-color-scheme: dark)` automatically.

Components with `dark:` Tailwind variants:
- ✅ `Navigation` (sidebar + mobile nav)
- ✅ `SubjectCard` (all 10 colour variants)
- 🔲 Individual pages (Phase 2D-B)

To implement dark mode in any component, add `dark:` prefixed classes to every light-mode colour class:
```tsx
// Light + dark
className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border-gray-100 dark:border-gray-800"
```

---

## 3. Card System

### Hero Card
Used for: Dashboard welcome section

```
bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700
rounded-2xl px-6 py-5 shadow-lg text-white
```

- Stats dividers: `h-7 w-px bg-white/20`
- XP bar track: `h-2 bg-white/20 rounded-full`
- XP bar fill: `bg-white rounded-full`
- Embedded info box: `bg-white/10 rounded-xl px-4 py-2.5`

### Mission Card
Used for: Today's Mission section, primary action card

```
bg-white dark:bg-gray-900
rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden
```

Featured item (first mission):
```
bg-gradient-to-br from-purple-50 to-indigo-50 (light)
dark:from-purple-950 dark:to-indigo-950 (dark)
border-b border-purple-100/60 px-5 py-5
```

CTA button within:
```
bg-purple-600 hover:bg-purple-700 text-white
rounded-xl px-4 py-2.5 font-semibold shadow-sm
```

### Subject Card
Used for: Core subject grid, reasoning subject grid

```
bg-{color}-50 dark:bg-{color}-950
border border-{color}-100 dark:border-{color}-900
shadow-sm rounded-2xl p-6
hover:shadow-lg hover:-translate-y-0.5
group-active:scale-[0.98]
transition-all duration-200
```

Icon container: `p-3.5 rounded-2xl bg-{color}-100 dark:bg-{color}-900`
Icon size: `24px`
Title: `font-bold text-base`
Description: `text-sm leading-relaxed`
Arrow: `ChevronRight size={16}` at bottom right, inherits color class

### Achievement Card
Used for: Weekly goal, badges section

```
bg-white dark:bg-gray-900
rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3.5
```

Success state (goal complete):
```
bg-emerald-50 dark:bg-emerald-950
border-emerald-100 dark:border-emerald-900
```

### Insight Card
Used for: Analytics insights panel (in `InsightCard` component)

```
bg-white dark:bg-gray-900
rounded-xl border border-gray-100 dark:border-gray-800 p-4
```

### Parent Card
Used for: Parent Hub sections

```
bg-white dark:bg-gray-900
rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm
```

Readiness bar container: `bg-gray-100 dark:bg-gray-800 rounded-full h-2`

---

## 4. Button System

### Primary CTA

```tsx
className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-xl px-5 py-3 font-semibold text-sm transition-colors shadow-sm"
```

Usage: Start mission, submit answers, primary actions

### Secondary CTA

```tsx
className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-5 py-3 font-semibold text-sm transition-colors"
```

Usage: Try again, back to list, secondary actions

### Ghost Button

```tsx
className="border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl px-5 py-3 font-medium text-sm transition-colors"
```

Usage: Cancel, skip, low-priority actions

### Success Button

```tsx
className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-3 font-semibold text-sm transition-colors"
```

Usage: Submit, complete, confirm actions

### Warning Button

```tsx
className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-5 py-3 font-semibold text-sm transition-colors"
```

Usage: Destructive actions, time alerts

### Filter / Toggle Button

Active:
```tsx
className="bg-purple-600 text-white rounded-full px-3.5 py-1.5 text-sm font-medium"
```

Inactive:
```tsx
className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
```

---

## 5. Icon System

### Philosophy

Every subject must be instantly recognisable from its icon. Avoid generic or ambiguous icons. Prefer icons that describe the **activity**, not the category.

### Subject Mapping

| Subject | Icon | Colour | Semantic reason |
|---------|------|--------|----------------|
| English Comprehension | `BookOpen` | Purple | Open book = reading comprehension |
| Maths Reasoning | `Calculator` | Blue | Calculator = number work |
| Vocabulary Builder | `BookMarked` | Emerald | Bookmarked = words to remember |
| Creative Writing | `Pencil` | Amber | Pencil = writing tool |
| Practice Mocks | `Target` | Pink | Target = exam preparation goal |
| My Progress | `BarChart2` | Indigo | Bar chart = progress tracking |
| Verbal Reasoning | `Puzzle` | Violet | Puzzle = word/logic puzzles |
| Non-Verbal Reasoning | `Shapes` | Cyan | Shapes = visual pattern recognition |
| Spatial Reasoning | `Compass` | Teal | Compass = spatial navigation |
| Numerical Reasoning | `Hash` | Rose | Hash = numbers/patterns |
| Exam Pathways | `MapPin` | Purple | Map pin = journey destination |
| Parent Hub | `Users` | Purple | Users = family/parent view |

### Icon Sizes

| Context | Size |
|---------|------|
| Subject card | 24px |
| Sidebar nav | 17px |
| Mobile bottom nav | 20px |
| Section header | 15–18px |
| Inline / metadata | 13–14px |
| Done/result screen | 28–32px |

### Icon Containers

Standard container for subject icons:
```tsx
<div className="bg-{color}-100 dark:bg-{color}-900 p-3.5 rounded-2xl">
  <Icon size={24} className="text-{color}-600 dark:text-{color}-300" />
</div>
```

Small header container:
```tsx
<div className="w-7 h-7 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
  <Icon size={15} className="text-purple-600 dark:text-purple-300" />
</div>
```

---

## 6. Spacing System

| Scale | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight chip/badge gaps |
| `gap-2` | 8px | Icon + label gaps |
| `gap-3` | 12px | Utility card gaps |
| `gap-4` | 16px | Subject card grid gaps |
| `gap-5` | 20px | Section internal gaps |
| `gap-6` | 24px | Major section separators |
| `px-4 py-6` | — | Mobile page padding |
| `px-8 py-8` | — | Desktop page padding |
| `p-5` | 20px | Info / utility cards |
| `p-6` | 24px | Subject cards |
| `max-w-2xl` | 672px | Narrow pages (mocks, sessions) |
| `max-w-3xl` | 768px | Medium pages (English, Maths) |
| `max-w-4xl` | 896px | Wide pages (Dashboard) |

---

## 7. Motion

| Interaction | Value |
|-------------|-------|
| Nav item active | `transition-all duration-150` |
| Card hover | `transition-all duration-200` |
| Card hover lift | `group-hover:-translate-y-0.5` |
| Card press | `group-active:scale-[0.98]` |
| XP bar fill | `transition-all duration-700` |
| Modal / overlay | `transition-opacity duration-200` |
| CTA button | `transition-colors` |

All animations respect the user's `prefers-reduced-motion` setting automatically via browser behaviour.

---

## 8. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Small buttons, tags |
| `rounded-xl` | 12px | Utility cards, small containers, filter buttons |
| `rounded-2xl` | 16px | Subject cards, main cards, panels |
| `rounded-full` | 999px | Badges, chips, progress dots, avatars |

---

## 9. Shadow

| Class | Usage |
|-------|-------|
| None | Default state: most utility cards, nav items |
| `shadow-sm` | Default subject cards, primary card wrappers |
| `shadow-md` | Raised elements, dropdowns |
| `shadow-lg` | Subject cards on hover, hero card |
| `shadow-xl` | Modals |

---

## 10. Navigation Structure

### Sidebar (md+)

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
  Non-Verbal
  Spatial
  Numerical

Exams
  Mock Tests
  Exam Pathways

──────────────
Parent Area
  Parent Hub (Beta)

──────────────
[User auth / sign out]
```

### Mobile Bottom Nav (6 slots)

```
Home | English | Maths | Exams | Progress | Parent/Login
```

---

## 11. Page Layout

Every student page must use `PageLayout` with consistent padding:

```tsx
<PageLayout>
  <div className="max-w-{size} mx-auto px-4 py-6 md:px-8 md:py-8">
    ...
  </div>
</PageLayout>
```

Standalone pages (mocks, session flows) may use their own header pattern:

```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
  <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
    ...
  </header>
  <main className="max-w-2xl mx-auto px-4 pb-16 pt-5 space-y-6">
    ...
  </main>
</div>
```
