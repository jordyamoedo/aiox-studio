# AIOX Studio Design System

**Version:** 1.0.0
**Last updated:** 2026-03-17
**Stack:** Next.js 14, Tailwind CSS, shadcn/ui, Geist fonts
**Design references:** Linear, Vercel Dashboard, Claude interface
**Default theme:** Dark

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design Tokens](#2-design-tokens)
3. [Dark/Light Mode](#3-darklight-mode)
4. [Accent Indigo Usage](#4-accent-indigo-usage)
5. [Semantic Status Colors](#5-semantic-status-colors)
6. [Atoms](#6-atoms)
7. [Molecules](#7-molecules)
8. [Organisms](#8-organisms)
9. [Interaction Patterns](#9-interaction-patterns)
10. [Copy Patterns](#10-copy-patterns)
11. [Do/Don't Rules](#11-dodont-rules)

---

## 1. Design Principles

AIOX Studio is a personal OS for a single user (Jordy) who thinks visually and spatially. Every design decision filters through five principles:

| # | Principle | Meaning |
|---|-----------|---------|
| 1 | **Calm, not flashy** | The interface recedes. Content leads. Chrome disappears. |
| 2 | **Dense, not cluttered** | Information density is high (Linear-style), but breathing room exists between groups. |
| 3 | **Monochrome + one accent** | Neutral grayscale for 95% of the UI. Indigo only when something demands attention. |
| 4 | **Spatial over textual** | Maps, diagrams, grouped cards. Never a wall of text when a layout can show structure. |
| 5 | **Tool, not toy** | No illustrations, no mascots, no loading confetti. This is a cockpit. |

---

## 2. Design Tokens

### 2.1 Color Tokens

All colors are defined as HSL triplets (without `hsl()` wrapper) in CSS custom properties. Usage: `hsl(var(--token-name))`.

#### Neutrals (grayscale ramp)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `0 0% 100%` | `0 0% 5%` | Page background |
| `--foreground` | `0 0% 3.9%` | `0 0% 95%` | Primary text |
| `--card` | `0 0% 100%` | `0 0% 7%` | Card/panel backgrounds |
| `--card-foreground` | `0 0% 3.9%` | `0 0% 95%` | Card text |
| `--popover` | `0 0% 100%` | `0 0% 7%` | Popover/dropdown bg |
| `--popover-foreground` | `0 0% 3.9%` | `0 0% 95%` | Popover text |
| `--primary` | `0 0% 9%` | `0 0% 95%` | Primary buttons, strong text |
| `--primary-foreground` | `0 0% 98%` | `0 0% 9%` | Text on primary bg |
| `--secondary` | `0 0% 96.1%` | `0 0% 12%` | Secondary surfaces, code blocks |
| `--secondary-foreground` | `0 0% 9%` | `0 0% 95%` | Text on secondary bg |
| `--muted` | `0 0% 96.1%` | `0 0% 12%` | Disabled/subtle backgrounds |
| `--muted-foreground` | `0 0% 45.1%` | `0 0% 55%` | Secondary text, labels, hints |
| `--accent` | `0 0% 96.1%` | `0 0% 12%` | Hover highlights |
| `--accent-foreground` | `0 0% 9%` | `0 0% 95%` | Text on accent bg |
| `--border` | `0 0% 89.8%` | `0 0% 14%` | Borders, dividers |
| `--input` | `0 0% 89.8%` | `0 0% 14%` | Input field borders |
| `--ring` | `0 0% 3.9%` | `0 0% 83.1%` | Focus ring color |

#### Brand Accent

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--accent-primary` | `234 89% 64%` | `234 89% 67%` | CTAs, active nav items, focus indicators |

The dark mode value is 3% lighter to maintain perceived brightness against dark backgrounds.

#### Destructive

| Token | Light | Dark |
|-------|-------|------|
| `--destructive` | `0 84.2% 60.2%` | `0 62.8% 50%` |

#### Status (semantic)

| Token | Light | Dark | Maps to |
|-------|-------|------|---------|
| `--status-success` | `142 71% 45%` | `142 71% 42%` | Green |
| `--status-warning` | `38 92% 50%` | `38 92% 47%` | Amber |
| `--status-error` | `0 72% 51%` | `0 72% 48%` | Red |

Dark mode status colors are 3% lower lightness to avoid glowing against dark bg.

#### Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0.5rem` (8px) | Default for cards, inputs, dialogs |

Derived radii:
- `radius-sm`: `calc(var(--radius) - 2px)` = 6px -- badges, small pills
- `radius-lg`: `calc(var(--radius) + 2px)` = 10px -- modals, sheets
- `radius-full`: `9999px` -- avatars, circular badges

### 2.2 Typography

**Font stack:**
- Sans: `var(--font-geist-sans)` -- all UI text
- Mono: `var(--font-geist-mono)` -- code, agent IDs (`@dev`), commands (`*help`), technical values

**Type scale (Tailwind classes):**

| Level | Class | Size | Weight | Line Height | Usage |
|-------|-------|------|--------|-------------|-------|
| Display | `text-2xl` | 24px | `font-semibold` (600) | 32px | Page titles (rare) |
| Heading | `text-lg` | 18px | `font-semibold` (600) | 28px | Section headers |
| Subheading | `text-sm font-medium` | 14px | `font-medium` (500) | 20px | Card titles, sidebar labels |
| Body | `text-sm` | 14px | `font-normal` (400) | 20px | Default text everywhere |
| Caption | `text-xs` | 12px | `font-normal` (400) | 16px | Metadata, timestamps, hints |
| Label | `text-xs font-medium uppercase tracking-wider` | 12px | 500 | 16px | Section labels, group headers |
| Mono | `text-xs font-mono` | 12px | `font-normal` (400) | 16px | Code, agent IDs, commands |

**Rules:**
- Never go below `text-xs` (12px). Nothing in the UI should be smaller.
- Never use `font-bold` (700). The heaviest weight is `font-semibold` (600), reserved for headings.
- Geist Mono is exclusively for technical content. Never use it for labels or body copy.

### 2.3 Spacing

**Base unit:** 4px (`1` in Tailwind = `0.25rem` = 4px).

**Spacing scale:**

| Tailwind | Pixels | Usage |
|----------|--------|-------|
| `gap-1` / `p-1` | 4px | Tight: between icon and label inside a button |
| `gap-2` / `p-2` | 8px | Default: sidebar padding, between inline items |
| `gap-3` / `p-3` | 12px | Chat bubble padding, input padding |
| `gap-4` / `p-4` | 16px | Card padding, section gaps |
| `gap-6` / `p-6` | 24px | Between card groups, page content padding |
| `gap-8` / `p-8` | 32px | Between major sections on a page |
| `mb-1` | 4px | Label to content |
| `mb-2` | 8px | Sub-section break |
| `mb-3` | 12px | Group header to first item |
| `mb-6` | 24px | Section header to content block |

**Section layout pattern:**
```
[Section label: mb-3]
[Items with gap-2 between]
[Section break: mb-6 or mt-8]
```

### 2.4 Shadows

Shadows are minimal. AIOX Studio relies on borders and background contrast, not elevation.

| Name | Value | Usage |
|------|-------|-------|
| `shadow-none` | (default) | Cards, sidebar, panels -- borders replace shadows |
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Popover/tooltip only |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Dialogs/sheets when overlaying content |

In dark mode, shadows are nearly invisible. The hierarchy comes from background lightness steps:
- `background` (5%) < `card` (7%) < `secondary` (12%) < `border` (14%)

### 2.5 Z-Index Scale

| Layer | Value | Usage |
|-------|-------|-------|
| Base | `z-0` | Page content |
| Sidebar | `z-10` | Fixed sidebar |
| Sticky headers | `z-20` | Sticky table/list headers |
| Popover | `z-30` | Tooltips, dropdowns |
| Sheet/Drawer | `z-40` | Slide-over panels |
| Dialog | `z-50` | Modal dialogs |

---

## 3. Dark/Light Mode

### Implementation

Theme is managed by `next-themes` via `ThemeProvider` in the root layout:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="dark"
  enableSystem
  disableTransitionOnChange
>
```

- **Default:** Dark. AIOX Studio is designed dark-first.
- **Toggle:** `ThemeToggle` component in sidebar footer.
- **`disableTransitionOnChange`:** Prevents flash of wrong-colored content during toggle.

### Token Behavior per Mode

All tokens swap via the `.dark` class on `<html>`. The general pattern:

| Concept | Light | Dark | Design Rationale |
|---------|-------|------|------------------|
| Backgrounds | White (100%) | Near-black (5%) | High contrast for readability |
| Text | Near-black (3.9%) | Near-white (95%) | Not pure black/white -- reduces eye strain |
| Secondary text | Gray (45.1%) | Gray (55%) | Dark mode is 10% lighter to compensate for dark bg |
| Borders | Light gray (89.8%) | Dark gray (14%) | Subtle separation, never loud |
| Cards | White (100%) | Slightly lighter (7%) | Cards lift 2% from background in dark mode |
| Accent indigo | 64% lightness | 67% lightness | Bumped 3% to maintain vibrancy on dark bg |
| Status colors | Standard lightness | 3% darker | Prevents glow/neon effect on dark bg |

### When to Use Each Mode

- **Dark** is the primary design target. All screenshots, demos, and design reviews should use dark mode.
- **Light** exists as a functional alternative (outdoor use, user preference), not as a first-class design target.
- All new components must be tested in both modes before shipping.

---

## 4. Accent Indigo Usage

The single accent color is `--accent-primary`: `hsl(234 89% 64%)` -- a saturated indigo.

### When to Use

| Context | Example | Opacity |
|---------|---------|---------|
| Primary CTA button | "Criar sessao", "Enviar" | 100% |
| Active sidebar item background | Currently selected nav icon | 10% bg, 100% icon |
| Focus ring (keyboard nav) | Tab-focused input or button | 100% as `ring-2` |
| Active tab indicator | Bottom border on active tab | 100% |
| Link text (inline, rare) | "Ver detalhes" inside a sentence | 100% |
| Badge for "ativo" / "novo" | Status indicator on sentinel card | 10% bg, 100% text |

### When NOT to Use

- Headings or body text
- Borders (use `--border` instead)
- Backgrounds of cards, sections, or pages
- Icons in the default (non-active) state
- More than 2 indigo elements visible simultaneously in the same viewport

### Implementation

```tsx
// CTA button (primary indigo)
<Button className="bg-[hsl(var(--accent-primary))] text-white hover:bg-[hsl(var(--accent-primary))]/90">
  Criar sessao
</Button>

// Active sidebar item
<Link className="bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))]">

// Focus ring
<Input className="focus-visible:ring-[hsl(var(--accent-primary))]" />

// Badge
<Badge className="bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))] border-[hsl(var(--accent-primary))]/30">
  Novo
</Badge>
```

### Parsimony Rule

Indigo is a scalpel, not a paintbrush. If you squint at a page and see more than two spots of color, you have used too much. The interface should feel monochrome with surgical indigo accents.

---

## 5. Semantic Status Colors

Three status colors encode system state. They are never decorative.

### Definitions

| Status | Token | Light HSL | Dark HSL | Hex (approx) |
|--------|-------|-----------|----------|---------------|
| Success | `--status-success` | `142 71% 45%` | `142 71% 42%` | #22c55e / #16a34a |
| Warning | `--status-warning` | `38 92% 50%` | `38 92% 47%` | #f59e0b / #d97706 |
| Error | `--status-error` | `0 72% 51%` | `0 72% 48%` | #ef4444 / #dc2626 |

### When to Use Each

| Color | Meaning | Examples |
|-------|---------|---------|
| **Green** (success) | Something is complete, healthy, or passing | QA gate PASS, agent online, sync complete, test passing |
| **Amber** (warning) | Attention needed, not broken | Update available (sentinel), story in review, approaching limit |
| **Red** (error) | Something failed or requires immediate action | API error, QA FAIL, sync conflict, destructive action confirmation |

### Usage Patterns

```tsx
// Status dot (inline indicator)
<span className="h-2 w-2 rounded-full bg-[hsl(var(--status-success))]" />

// Status badge
<Badge className="bg-[hsl(var(--status-warning))]/10 text-[hsl(var(--status-warning))] border-[hsl(var(--status-warning))]/30">
  Atualizar
</Badge>

// Error message
<p className="text-sm text-[hsl(var(--status-error))]">
  Falha na conexao com o Supabase.
</p>

// Destructive button (uses --destructive, not --status-error)
<Button variant="destructive">Excluir sessao</Button>
```

### Rules

- Never use green/amber/red as decorative colors (e.g., don't color agent groups green/amber).
- Agent group colors (blue, green, orange, purple in AgentMap) are distinct from status colors -- they use Tailwind palette colors at low opacity, not the status tokens.
- Status colors always appear with a label or tooltip. Never rely on color alone (accessibility).

---

## 6. Atoms

### 6.1 Button

Six variants, four sizes. Defined via `class-variance-authority` in `src/components/ui/button.tsx`.

#### Variants

| Variant | Background | Text | Hover | Use for |
|---------|-----------|------|-------|---------|
| `default` | `bg-primary` | `text-primary-foreground` | `bg-primary/90` | Primary actions: submit, confirm, save |
| `secondary` | `bg-secondary` | `text-secondary-foreground` | `bg-secondary/80` | Secondary actions: cancel, back, alternative |
| `outline` | `bg-background` + `border` | `text-foreground` | `bg-accent` | Tertiary actions, toggles, filter chips |
| `ghost` | transparent | inherits | `bg-accent` | Sidebar items, icon buttons, inline actions |
| `destructive` | `bg-destructive` | white | `bg-destructive/90` | Delete, disconnect, irreversible actions |
| `link` | transparent | `text-primary` | underline | Inline text links |

#### Sizes

| Size | Height | Padding | Use for |
|------|--------|---------|---------|
| `default` | `h-10` (40px) | `px-4 py-2` | Standard buttons in forms/dialogs |
| `sm` | `h-9` (36px) | `px-3` | Compact contexts: table rows, card footers |
| `lg` | `h-11` (44px) | `px-8` | Hero CTAs, onboarding (rare) |
| `icon` | `h-10 w-10` (40x40) | none | Icon-only: send, theme toggle, close |

#### Indigo CTA (custom, not a cva variant)

For the single most important action on a page, override the default variant:

```tsx
<Button className="bg-[hsl(var(--accent-primary))] text-white hover:bg-[hsl(var(--accent-primary))]/90">
  Iniciar sessao
</Button>
```

Use sparingly -- maximum one indigo CTA per viewport.

### 6.2 Input

Standard text input with consistent border, ring, and placeholder styling.

```
h-10 (40px) | rounded-md | border-input | bg-background
text-sm | placeholder:text-muted-foreground
focus-visible:ring-2 ring-ring ring-offset-2
disabled:opacity-50
```

**States:**
- Default: `border-input` (light gray border)
- Focused: `ring-2 ring-ring` (2px ring in foreground color)
- Error: add `border-[hsl(var(--status-error))]` + error message below
- Disabled: `opacity-50` + `pointer-events-none`

### 6.3 Textarea

Same styling as Input but multi-line. Used in chat input.

```
min-h-[44px] max-h-32 | resize-none | text-sm
```

### 6.4 Badge

Four variants. Always `rounded-full`, always `text-xs font-semibold`.

| Variant | Style | Use for |
|---------|-------|---------|
| `default` | `bg-primary text-primary-foreground` | Agent count, numeric indicators |
| `secondary` | `bg-secondary text-secondary-foreground` | Tags, categories, metadata |
| `destructive` | `bg-destructive text-white` | Error count, critical alerts |
| `outline` | border-only, `text-foreground` | Neutral tags, version numbers |

**Custom status badges** (not cva variants, applied via className):

```tsx
// Success badge
<Badge className="border-transparent bg-[hsl(var(--status-success))]/10 text-[hsl(var(--status-success))]">
  PASS
</Badge>

// Warning badge
<Badge className="border-transparent bg-[hsl(var(--status-warning))]/10 text-[hsl(var(--status-warning))]">
  Em revisao
</Badge>

// Indigo badge
<Badge className="border-[hsl(var(--accent-primary))]/30 bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))]">
  Ativo
</Badge>
```

### 6.5 Separator

A 1px line using `bg-border`. Use between sidebar sections, between card groups, above chat input area.

### 6.6 Icons

All icons from `lucide-react`. Standard size: `h-4 w-4` (16x16).

**Sidebar icons:** `h-4 w-4` inside `h-9 w-9` (36x36) hit targets.
**Inline icons:** `h-3 w-3` (12x12) for tight contexts (badge prefixes, metadata).
**Icon buttons:** `h-4 w-4` inside `size="icon"` button (40x40 hit target).

**Color:** Icons inherit text color. Never apply a custom color to an icon unless it is a status indicator.

---

## 7. Molecules

### 7.1 Card Patterns

Cards use `bg-card` with `border border-border` and `rounded-md` (`--radius`). No shadow.

#### Standard Card

```
bg-card | border border-border | rounded-md | p-4
```

```tsx
<Card>
  <CardHeader className="p-4 pb-2">
    <CardTitle className="text-sm font-medium">Titulo</CardTitle>
    <CardDescription className="text-xs text-muted-foreground">Descricao</CardDescription>
  </CardHeader>
  <CardContent className="p-4 pt-0">
    {/* Content */}
  </CardContent>
</Card>
```

#### Clickable Card

Add hover state and cursor:

```tsx
<Card className="cursor-pointer transition-colors hover:bg-accent">
```

#### Card with Status

Left border indicates status:

```tsx
<Card className="border-l-2 border-l-[hsl(var(--status-success))]">
```

### 7.2 Sidebar Item

Icon-only navigation item with tooltip. Hit target: 36x36, icon: 16x16.

**Structure:**

```
Tooltip > TooltipTrigger > Link (h-9 w-9 rounded-md) > Icon (h-4 w-4)
TooltipContent (side="right") > label + description
```

**States:**

| State | Style |
|-------|-------|
| Default | `text-muted-foreground` |
| Hover | `bg-secondary/50 text-foreground` |
| Active | `bg-secondary text-foreground` |
| Active (indigo, future) | `bg-[hsl(var(--accent-primary))]/10 text-[hsl(var(--accent-primary))]` |

### 7.3 Chat Bubble

Two roles, aligned by `justify-end` (user) or `justify-start` (assistant).

**User bubble:**
```
max-w-[80%] | rounded-lg | px-3 py-2 | text-sm
bg-primary text-primary-foreground
```

**Assistant bubble:**
```
max-w-[80%] | rounded-lg | px-3 py-2 | text-sm
bg-secondary text-foreground
```

**Loading state:** `Loader2` spinner (`h-3 w-3 animate-spin`) inside empty assistant bubble.

**Container:** Messages centered with `max-w-2xl mx-auto`, vertical `space-y-4`.

### 7.4 Chat Input Bar

Fixed at bottom, separated by `border-t border-border`.

```
border-t border-border | p-4
max-w-2xl mx-auto | flex gap-2
Textarea (flex-1, min-h-[44px], max-h-32, resize-none)
Button (size="icon", h-11 w-11, shrink-0)
```

**Submit:** Enter (no shift). Shift+Enter for newline.
**Disabled:** Button disabled when input is empty or loading.

### 7.5 Agent Chip (AgentMap)

Clickable chip representing one agent, grouped by function.

```
flex items-center gap-2 | px-3 py-2 | rounded-lg | border | text-sm
transition-all | cursor-pointer
```

**Group colors** (not status colors -- these are categorical):

| Group | Color Classes |
|-------|-------------|
| Produto | `bg-blue-500/10 border-blue-500/30 text-blue-400` |
| Desenvolvimento | `bg-green-500/10 border-green-500/30 text-green-400` |
| Deploy & Docs | `bg-orange-500/10 border-orange-500/30 text-orange-400` |
| Orquestrador | `bg-purple-500/10 border-purple-500/30 text-purple-400` |

**Selected state:** `ring-1 ring-current` added.
**Unavailable agent:** `opacity-40`.

### 7.6 Search Result Card (Wiki)

For wiki search results, a compact card showing title, excerpt, and metadata.

```tsx
<div className="border-b border-border py-3 cursor-pointer hover:bg-accent/50 transition-colors px-4">
  <p className="text-sm font-medium text-foreground">{title}</p>
  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{excerpt}</p>
  <div className="flex items-center gap-2 mt-2">
    <Badge variant="secondary" className="text-[10px]">{category}</Badge>
    <span className="text-[10px] text-muted-foreground">{path}</span>
  </div>
</div>
```

### 7.7 SDC Pipeline Step

Horizontal sequence of agent steps connected by arrows.

```tsx
<div className="flex items-center gap-1 flex-wrap">
  {steps.map((step, i) => (
    <>
      <button className="px-2 py-1 rounded text-xs font-mono bg-secondary hover:bg-secondary/80 transition-colors">
        @{step.id}
      </button>
      {i < steps.length - 1 && <span className="text-muted-foreground text-xs">-></span>}
    </>
  ))}
</div>
```

### 7.8 Empty State

Centered message for empty views (no messages, no results).

```tsx
<div className="flex h-full flex-col items-center justify-center py-20 text-center">
  <p className="text-sm font-medium text-foreground mb-1">{title}</p>
  <p className="text-xs text-muted-foreground max-w-xs">{hint}</p>
</div>
```

---

## 8. Organisms

### 8.1 App Shell (Root Layout)

The top-level layout: icon sidebar + content area.

```
html (lang="pt-BR", .dark by default)
  body (Geist Sans + Geist Mono variables, antialiased)
    ThemeProvider (dark default, system-aware)
      Sidebar (w-14, fixed left, full height)
      Main content (ml-14, full height)
```

**Sidebar structure:**
1. Logo area (`h-12`, centered "AX" monogram, `border-b`)
2. Navigation sections (3 groups, separated by `h-px bg-border` dividers)
3. Footer (`border-t`, ThemeToggle)

**Content area:** Each route fills the remaining viewport. No shared header bar -- each page owns its own header content.

### 8.2 "O Framework" Space

The learning/reference space. Three main views:

#### 8.2.1 Mapa (Agent Map)

```
+-------+--------------------------------------------------+----------+
| Side  |                                                  |  Agent   |
| bar   |  Section Label (uppercase, xs, muted, tracking)  |  Detail  |
| w-14  |  [chip] [chip] [chip] [chip]                     |  Panel   |
|       |                                                  |  w-80    |
|       |  Section Label                                   |  border-l|
|       |  [chip] [chip] [chip]                            |  bg-card |
|       |                                                  |          |
|       |  Pipeline SDC                                    |          |
|       |  @sm -> @po -> @dev -> @qa -> @devops            |          |
+-------+--------------------------------------------------+----------+
```

- Left: icon sidebar (always)
- Center: agent groups with chips, pipeline visualization
- Right: detail panel (w-80, slides in when agent selected, `border-l border-border bg-card`)

#### 8.2.2 Wiki (Search + Browse)

```
+-------+--------------------------------------------------+
| Side  |  [Search Input - full width, h-10]               |
| bar   |  Results count (xs, muted)                       |
| w-14  |  ┌──────────────────────────────────┐            |
|       |  │ Result title                      │            |
|       |  │ Excerpt text... (line-clamp-2)    │            |
|       |  │ [badge] path/to/file              │            |
|       |  ├──────────────────────────────────┤            |
|       |  │ Result title                      │            |
|       |  │ ...                               │            |
|       |  └──────────────────────────────────┘            |
+-------+--------------------------------------------------+
```

- Search input at top, results below as a vertical list
- Results separated by `border-b`, not card borders (denser, Linear-style)

#### 8.2.3 Chat (Framework Q&A)

```
+-------+--------------------------------------------------+
| Side  |  Empty state (centered) or Message list          |
| bar   |                                                  |
| w-14  |     [assistant bubble, left-aligned]             |
|       |              [user bubble, right-aligned]        |
|       |     [assistant bubble]                           |
|       |                                                  |
|       |  ─────────────────── border-t ──────────────     |
|       |  [Textarea                    ] [Send btn]       |
+-------+--------------------------------------------------+
```

- Messages in `max-w-2xl mx-auto`
- Scroll area fills vertical space
- Input bar fixed at bottom with `border-t`

### 8.3 "O Direcionador" Space

The strategic decision space. Two views:

#### 8.3.1 Direcao (Strategic Chat)

Same layout as Framework Chat but with different empty state copy and system prompt context. The visual structure is identical.

#### 8.3.2 Decisoes (Decision Log)

```
+-------+--------------------------------------------------+
| Side  |  Page title + description                        |
| bar   |                                                  |
| w-14  |  [Decision Card with left border (status)]       |
|       |  [Decision Card]                                 |
|       |  [Decision Card]                                 |
+-------+--------------------------------------------------+
```

Decision cards use left-border status indicators:
- `border-l-[hsl(var(--status-success))]` -- decision confirmed/implemented
- `border-l-[hsl(var(--status-warning))]` -- decision pending/under review
- `border-l-[hsl(var(--accent-primary))]` -- decision active/current

### 8.4 Sentinela (Upstream Monitor)

```
+-------+--------------------------------------------------+
| Side  |  Page title + last check time                    |
| bar   |                                                  |
| w-14  |  ┌─ Card ─────────────────────────────────┐     |
|       |  │ Local: v5.0.3    Upstream: v5.0.4       │     |
|       |  │ [status dot] Atualizacao disponivel      │     |
|       |  └─────────────────────────────────────────┘     |
|       |                                                  |
|       |  Recomendacoes                                   |
|       |  ┌─ ABSORVER ──────────────────────────────┐     |
|       |  │ component: new-agent   reason: ...       │     |
|       |  └─────────────────────────────────────────┘     |
|       |  ┌─ AVALIAR ──────────────────────────────-┐     |
|       |  │ component: config-change  reason: ...    │     |
|       |  └─────────────────────────────────────────┘     |
+-------+--------------------------------------------------+
```

Recommendation type badges:
- **ABSORVER**: green status badge
- **AVALIAR**: amber status badge
- **IGNORAR**: secondary (muted) badge

### 8.5 Configuracoes (Settings)

Simple form layout with sections. No complex patterns -- standard inputs, toggles, and sections with `border-b` separators.

---

## 9. Interaction Patterns

### 9.1 Transitions

**Global rule:** `transition-colors` with default Tailwind duration (150ms ease).

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Buttons | `background-color`, `color` | 150ms | ease |
| Sidebar items | `background-color`, `color` | 150ms | ease |
| Cards (hoverable) | `background-color` | 150ms | ease |
| Chat scroll | `scrollIntoView` | smooth (browser default ~300ms) | -- |
| Sheet/Dialog | handled by Radix (enter/exit) | 200ms | ease-out |

**Never animate:** layout shifts, font-size changes, border-width changes. These cause layout jank.

### 9.2 Hover States

| Element | Hover Effect |
|---------|-------------|
| Default button | `bg-primary/90` (10% transparent) |
| Secondary button | `bg-secondary/80` |
| Ghost button | `bg-accent` |
| Sidebar item (inactive) | `bg-secondary/50 text-foreground` |
| Clickable card | `bg-accent` |
| Search result | `bg-accent/50` |
| Agent chip | `opacity-80` |
| Scrollbar thumb | `bg-muted-foreground` (from `bg-border`) |

### 9.3 Focus States

All interactive elements receive a visible focus ring for keyboard navigation:

```
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

The `ring-offset` uses `ring-offset-background` to create a gap between the ring and the element, maintaining visibility against the background.

For the primary CTA (indigo), override the ring color:
```
focus-visible:ring-[hsl(var(--accent-primary))]
```

### 9.4 Active/Selected States

| Element | Active Style |
|---------|-------------|
| Sidebar item | `bg-secondary text-foreground` |
| Agent chip | `ring-1 ring-current` |
| Tab | bottom border `border-b-2 border-[hsl(var(--accent-primary))]` |
| Chat message (sending) | `Loader2 animate-spin` inside bubble |

### 9.5 Loading States

| Context | Pattern |
|---------|---------|
| Page loading | Centered `text-sm text-muted-foreground` message |
| Chat streaming | Spinner in empty bubble, then incremental text |
| Button loading | Replace icon with `Loader2 animate-spin`, disable button |
| Data fetch | Skeleton (future) or text placeholder |

### 9.6 Disabled States

```
disabled:pointer-events-none disabled:opacity-50
```

Applied to buttons, inputs, and any interactive element. Never hide disabled elements -- show them at 50% opacity so the user understands what exists but is unavailable.

### 9.7 Scrollbar

Custom webkit scrollbar defined globally:

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }
```

Thin (6px), rounded, transparent track. Visible on hover over scrollable areas.

---

## 10. Copy Patterns

AIOX Studio speaks directly to Jordy. It is not a generic product with generic copy.

### Voice

| Attribute | Description | Example |
|-----------|-------------|---------|
| **Direct** | No hedging, no "talvez", no "voce poderia" | "Escolha o espaco." not "Voce poderia escolher..." |
| **Concrete** | Spatial/visual metaphors, not abstract | "Mapa de agentes" not "Visualizacao de recursos" |
| **Competent** | Assumes the user is smart, skips obvious explanations | "12 agentes, 3 grupos" not "Aqui voce encontra todos os agentes organizados em grupos para facilitar..." |
| **Portuguese (BR)** | UI copy in pt-BR. Technical terms (agent, framework, pipeline) stay in English. | "Mapa do Framework" not "Mapa da Estrutura" |

### Copy Templates

| Context | Pattern | Example |
|---------|---------|---------|
| Page title | Short noun phrase, `text-lg font-semibold` | "Mapa do Framework" |
| Page subtitle | One line of context, `text-sm text-muted-foreground` | "12 agentes ativos -- clique para ver detalhes" |
| Empty state title | Question or statement, `text-sm font-medium` | "Qual caminho seguir agora?" |
| Empty state hint | Instruction, `text-xs text-muted-foreground` | "Descreva sua situacao para comecar." |
| Tooltip label | Feature name, `text-xs font-medium` | "Wiki" |
| Tooltip description | One-line purpose, `text-xs text-muted-foreground` | "Referencia navegavel do framework" |
| Error message | What happened + what to do, `text-sm text-status-error` | "Falha na conexao. Verifique o Supabase." |
| Section label | Uppercase, tracking-wider | "PRODUTO", "PIPELINE PRINCIPAL (SDC)" |

### Things to Never Say

- "Ola! Como posso ajudar?" -- this is a generic assistant greeting.
- "Desculpe, nao entendi." -- rephrase as "Reformule com mais contexto."
- "Carregando..." -- use spinner or skeleton, not text (exception: initial page load).
- "Voce tem certeza?" -- reserve confirmation dialogs for destructive actions only.
- "Funcionalidade em breve!" -- either ship it or don't show it.

---

## 11. Do/Don't Rules

Five non-negotiable visual rules for AIOX Studio.

### RULE 1: No Color Without Meaning

**DO:** Use color only for status (green/amber/red), accent (indigo for CTAs/active), or categorical grouping (agent map groups at 10% opacity).

**DON'T:** Add color for decoration. No gradient backgrounds, no colored section headers, no rainbow badges. If a new element needs color and doesn't fit status/accent/category, it should be grayscale.

### RULE 2: Borders Over Shadows

**DO:** Separate elements with `border border-border` (1px, subtle). Use background lightness steps for hierarchy (background < card < secondary).

**DON'T:** Use `shadow-md` or `shadow-lg` on cards or panels. Shadows are reserved for floating elements only (dialogs, popovers). The interface should feel flat, not layered like Material Design.

### RULE 3: One Font, Two Faces

**DO:** Use Geist Sans for all UI text. Use Geist Mono exclusively for code, commands (`*help`), agent IDs (`@dev`), file paths, and technical values.

**DON'T:** Mix in a third font. Don't use Geist Mono for labels, headings, or body copy. Don't use Geist Sans for inline code.

### RULE 4: 14px Default, 12px Minimum

**DO:** Set `text-sm` (14px) as the default body size. Use `text-xs` (12px) for metadata, captions, and secondary information.

**DON'T:** Go below 12px for any visible text. Don't use `text-base` (16px) or larger for body copy -- it wastes space and breaks the dense, tool-like feel. `text-lg` (18px) and `text-2xl` (24px) are for headings only.

### RULE 5: Indigo is a Signal, Not a Theme

**DO:** Use `--accent-primary` (indigo) for exactly: primary CTA, active nav item, focus ring, active tab indicator, and "novo/ativo" badges. Maximum two indigo elements per viewport.

**DON'T:** Create indigo backgrounds, indigo text for headings, indigo borders as decoration, or indigo gradients. If you remove all indigo from a page and it still makes sense, you are using it correctly. If removing it breaks the hierarchy, you are over-relying on it.

---

## Appendix A: Quick Reference Card

```
Fonts:        Geist Sans (UI) + Geist Mono (code)
Text sizes:   12px (xs) / 14px (sm, default) / 18px (lg) / 24px (2xl)
Max weight:   font-semibold (600)
Spacing base: 4px
Radius:       8px (default) / 6px (sm) / 10px (lg)
Transitions:  150ms ease (colors only)
Accent:       hsl(234 89% 64%) -- indigo, max 2 per viewport
Status:       green (success) / amber (warning) / red (error)
Borders:      1px solid hsl(var(--border))
Shadows:      none (cards) / sm (popovers) / md (dialogs)
Icons:        lucide-react, 16x16 default, 12x12 tight
Sidebar:      w-14 (56px), icon-only, tooltip on hover
Content max:  max-w-2xl for chat, no max for maps/grids
Theme:        dark-first, class-based toggle, no transition on change
```

## Appendix B: Token-to-Tailwind Mapping

| CSS Variable | Tailwind Class | Example |
|-------------|----------------|---------|
| `--background` | `bg-background` | Page bg |
| `--foreground` | `text-foreground` | Body text |
| `--card` | `bg-card` | Card bg |
| `--primary` | `bg-primary` / `text-primary` | Button bg |
| `--secondary` | `bg-secondary` | Code block bg |
| `--muted` | `bg-muted` | Disabled bg |
| `--muted-foreground` | `text-muted-foreground` | Hint text |
| `--border` | `border-border` | Dividers |
| `--destructive` | `bg-destructive` | Delete button |
| `--accent-primary` | `hsl(var(--accent-primary))` (manual) | CTA, active states |
| `--status-success` | `hsl(var(--status-success))` (manual) | Pass badge |
| `--status-warning` | `hsl(var(--status-warning))` (manual) | Review badge |
| `--status-error` | `hsl(var(--status-error))` (manual) | Error text |

## Appendix C: File Map

| File | Purpose |
|------|---------|
| `src/app/globals.css` | All CSS custom property definitions, scrollbar, base styles |
| `src/app/layout.tsx` | Root layout with font loading and ThemeProvider |
| `src/components/ui/button.tsx` | Button atom (cva variants) |
| `src/components/ui/badge.tsx` | Badge atom (cva variants) |
| `src/components/ui/input.tsx` | Input atom |
| `src/components/ui/textarea.tsx` | Textarea atom |
| `src/components/ui/card.tsx` | Card atom |
| `src/components/ui/separator.tsx` | Separator atom |
| `src/components/ui/scroll-area.tsx` | ScrollArea (Radix) |
| `src/components/ui/dialog.tsx` | Dialog (Radix) |
| `src/components/ui/sheet.tsx` | Sheet/drawer (Radix) |
| `src/components/ui/tooltip.tsx` | Tooltip (Radix) |
| `src/components/shared/sidebar.tsx` | Sidebar organism |
| `src/components/shared/chat.tsx` | Chat organism |
| `src/components/shared/theme-provider.tsx` | next-themes provider |
| `src/components/shared/theme-toggle.tsx` | Theme toggle button |
| `src/components/framework/agent-map.tsx` | AgentMap organism |
