# Angel 11+ Design System — Phase 2D-A

## Colour Hierarchy

| Role | Tailwind | Usage |
|------|----------|-------|
| **Primary** | `purple-600 / purple-700` | CTAs, active nav, hero gradient start, section icons |
| **Secondary** | `indigo-600 / indigo-700` | Hero gradient end, CEM pathway, secondary actions |
| **Emerald** | `emerald-400 / emerald-600` | Success states, weekly goal complete, ISEB pathway |
| **Amber** | `amber-400 / amber-600` | "Building" readiness, attention insights, streak warnings |
| **Sky/Cyan** | `cyan-*` | Non-Verbal Reasoning subject card |
| **Teal** | `teal-*` | Spatial Reasoning subject card |
| **Rose** | `rose-*` | Mission "Focus" chips, Numerical Reasoning card |
| **Gray** | `gray-50 → gray-900` | Backgrounds, borders, text hierarchy |

### Subject Colour Assignments

| Subject | Card colour | Nav/icon colour |
|---------|-------------|----------------|
| English | purple | purple-600 |
| Maths | blue | blue-600 |
| Vocabulary | green (emerald) | emerald-600 |
| Writing | orange (amber) | amber-600 |
| Mocks / Exams | pink | rose-600 / pink-600 |
| Progress | indigo | indigo-600 |
| Verbal Reasoning | violet | violet-600 |
| Non-Verbal Reasoning | cyan | cyan-600 |
| Spatial Reasoning | teal | teal-600 |
| Numerical Reasoning | rose | rose-600 |

---

## Typography

| Element | Classes |
|---------|---------|
| Page title (hero H1) | `text-2xl font-bold` |
| Section heading | `text-xl font-bold text-gray-900` |
| Card title | `text-base font-semibold` |
| Body text | `text-sm text-gray-700 leading-relaxed` |
| Supporting / labels | `text-xs text-gray-400` |
| Section nav labels | `text-[10px] font-bold uppercase tracking-widest text-gray-300` |
| Stat numbers | `text-xl font-bold` |

---

## Card Patterns

### Subject Card (`components/SubjectCard.tsx`)
```
rounded-2xl border p-5
bg-{color}-50  border-{color}-100
hover:bg-{color}-100 hover:shadow-md
group-active:scale-[0.98]
```
Icon container: `p-3 rounded-xl bg-{color}-100`

### Mission Card
```
bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
```
Featured item: `from-purple-50 to-indigo-50` gradient, `Start` button in `bg-purple-600`
Secondary items: existing DailyMission rows

### Info / Utility Card
```
bg-white rounded-xl border border-gray-100 px-4 py-3.5
hover:shadow-sm hover:border-purple-100
```

### Hero Gradient Card
```
bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700
rounded-2xl px-6 py-5 shadow-lg
```
Stats divider: `h-7 w-px bg-white/20`
XP bar track: `h-2 bg-white/20 rounded-full`
XP bar fill: `bg-white rounded-full`
Embedded tip: `bg-white/10 rounded-xl px-4 py-2.5`

---

## Spacing

| Element | Value |
|---------|-------|
| Page padding (mobile) | `px-4 py-6` |
| Page padding (desktop) | `px-8 py-8` |
| Between sections | `space-y-6` (via parent), or `mt-6` |
| Card internal padding | `p-5` (subject cards), `px-5 py-4` (mission) |
| Gap between cards | `gap-4` (subjects), `gap-3` (utilities) |
| Section heading margin | `mb-4` below heading, `mt-0.5` for subtitle |

---

## Shadows

| Level | Usage |
|-------|-------|
| `shadow-sm` | Mission card, primary card wrapper, "Start" button |
| `shadow-md` (on hover) | Subject cards on hover |
| `shadow-lg` | Hero gradient card |

---

## Navigation Patterns

### Sidebar Nav Item (active)
```
bg-purple-50 text-purple-700 rounded-xl
icon: text-purple-600
dot indicator: w-1.5 h-1.5 rounded-full bg-purple-500
```

### Sidebar Nav Item (inactive)
```
text-gray-500 hover:bg-gray-50 hover:text-gray-800 rounded-xl
icon: text-gray-400
```

### Section Label
```
text-[10px] font-bold uppercase tracking-widest text-gray-300 px-3 pt-3 pb-1.5
```

### Mobile Bottom Nav (active)
```
text-purple-700  icon: text-purple-600
```

### Mobile Bottom Nav (inactive)
```
text-gray-400  icon: text-gray-400
```

---

## Iconography

| Context | Size | Source |
|---------|------|--------|
| Sidebar nav | 17px | lucide-react |
| Subject card | 22px | lucide-react |
| Section header icon | 15–18px | lucide-react |
| Bottom nav | 20px | lucide-react |
| Inline/utility | 13–16px | lucide-react |

### Subject Icon Assignments

| Subject | Icon |
|---------|------|
| Home | LayoutDashboard |
| English | BookOpen |
| Maths | Calculator |
| Vocabulary | BookMarked |
| Writing | Pencil |
| Progress | BarChart2 |
| Verbal Reasoning | Puzzle |
| Non-Verbal Reasoning | Shapes |
| Spatial Reasoning | Compass |
| Numerical Reasoning | Hash |
| Mock Tests | Target |
| Exam Pathways | MapPin |
| Parent Dashboard | Users |

---

## Motion

- Card hover: `transition-all duration-200`
- Card press: `group-active:scale-[0.98]`
- XP bar fill: `transition-all duration-700`
- Nav item active: `transition-all duration-150`
- Mission Start button: `transition-colors`
