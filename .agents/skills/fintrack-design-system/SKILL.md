---
name: fintrack-design-system
description: >-
  Use this skill when making any UI/UX changes, styling updates, creating new components,
  or designing the FinTrack application. Contains the authoritative Product-First UI/UX
  System v3.0 rules, restrained editorial-financial aesthetic, color tokens, typography scale,
  table/chart standards, and anti-patterns.
---

# FinTrack Design Skill — Product-First UI/UX System v3.0

## Purpose

This skill governs every visual and interaction decision in FinTrack.

It should be applied whenever:

* creating a new page
* modifying an existing UI
* creating or redesigning components
* changing typography, spacing, colors, icons, charts, or motion
* improving responsive behavior
* introducing a new feature
* rebranding or visually refining the product

The goal is **not to make FinTrack look “modern.”**

The goal is to make FinTrack feel like a **serious financial instrument that happens to be exceptionally pleasant to use.**

Every design decision must improve at least one of these:

**clarity → hierarchy → trust → speed → comprehension → delight**

If a visual treatment does not improve one of these, remove it.

---

# 1. Design Philosophy

## 1.1 Product character

FinTrack should feel:

**calm
precise
intelligent
credible
quietly premium
human**

It should never feel:

**template-generated
startup-generic
overdesigned
dribbble-inspired
cyberpunk
luxury-fashion
gaming-like
artificially futuristic**

The interface should feel designed by someone who understands finance, not by someone trying to demonstrate CSS skills.

---

## 1.2 The primary design principle

### Information first. Decoration second.

Financial information is the visual subject.

UI chrome exists to organize that information.

Do not create visual elements merely because an empty area feels uncomfortable.

Whitespace is a design element.

---

## 1.3 Distinctiveness rule

FinTrack must NOT derive its identity primarily from:

* gradients
* glassmorphism
* glowing borders
* giant rounded cards
* excessive pills
* floating blobs
* oversized hero typography
* animated backgrounds
* arbitrary purple/blue accents

These patterns are allowed only when their functional purpose is obvious.

The product should remain recognizable even if all gradients, shadows, and animations are removed.

---

# 2. Visual Language

FinTrack uses a **restrained editorial-financial aesthetic**.

The visual system combines:

* strong typographic hierarchy
* subtle surface differentiation
* dense but breathable information layouts
* precise alignment
* restrained color
* meaningful data visualization
* minimal decorative UI

Think:

**financial terminal + premium productivity software + editorial dashboard**

rather than:

**AI SaaS landing page**

---

# 3. Color System — Obsidian & Emerald Terminal

## 3.1 Core principle

Color should communicate meaning with razor-sharp institutional authority.

Financial information is the visual subject. The palette is anchored by deep obsidian surfaces and crisp electric emerald accents.

### Dark theme (Flagship Terminal Mode)

```css
--bg-app: #0A0E12;
--bg-surface: #11161B;
--bg-surface-alt: #171E25;

--text-primary: #F3F4F6;
--text-secondary: #9CA3AF;
--text-muted: #6B7280;

--border: rgba(255, 255, 255, 0.08);
--border-strong: rgba(255, 255, 255, 0.16);
```

### Light theme (Crisp Institutional Paper)

```css
--bg-app: #F3F4F6;
--bg-surface: #FFFFFF;
--bg-surface-alt: #F8FAFC;

--text-primary: #0F172A;
--text-secondary: #475569;
--text-muted: #94A3B8;

--border: #E2E8F0;
--border-strong: #CBD5E1;
```

---

## 3.2 Brand accent

Electric Emerald represents growth, settled liquidity, and precision capital management.

```css
--accent: #10B981;
--accent-hover: #059669;
--accent-soft: rgba(16, 185, 129, 0.12);
```

The accent is reserved primarily for:

* primary actions & buttons
* active navigation states
* focused inputs & controls
* selected ledger data
* verified status badges

Do not paint entire background sections in the accent color.

---

## 3.3 Financial semantic colors

```css
--positive: #10B981;
--positive-soft: rgba(16, 185, 129, 0.12);

--negative: #F43F5E;
--negative-soft: rgba(244, 63, 94, 0.12);

--warning: #F59E0B;
--warning-soft: rgba(245, 158, 11, 0.12);

--info: #38BDF8;
--info-soft: rgba(56, 189, 248, 0.12);
```

Financial meaning always takes priority over brand color.

For example:

* income → positive
* expense → negative
* risk → warning/negative
* informational state → info

---

## 3.4 Color restraint

Default component rule:

**Neutral surface + neutral typography + one semantic accent.**

Avoid multi-color components unless the information itself requires multiple categories.

Do not combine:

* purple borders
* blue buttons
* green icons
* pink gradients
* cyan glow

inside one component.

That immediately creates visual noise.

---

# 4. Typography

## 4.1 Typography should create hierarchy, not personality theater.

Use:

```css
--font-ui: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-display: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
```

A single primary family is preferred.

Do not introduce a second display font unless the specific page genuinely benefits from editorial typography.

---

## 4.2 Type scale

```css
--text-xs: 0.6875rem;
--text-sm: 0.8125rem;
--text-md: 0.9375rem;
--text-lg: 1.125rem;
--text-xl: 1.375rem;
--text-2xl: 1.75rem;
--text-3xl: 2.25rem;
```

### Usage

| Role            |      Size | Weight |
| --------------- | --------: | -----: |
| Display         |   2.25rem |    700 |
| Page title      |   1.75rem |    700 |
| Section title   |  1.375rem |    650 |
| Component title |  1.125rem |    600 |
| Body            | 0.9375rem |    400 |
| Secondary       | 0.8125rem |    500 |
| Metadata        | 0.6875rem |    600 |

---

## 4.3 Financial numbers

Numbers are a major part of the visual identity.

Use:

```css
font-variant-numeric: tabular-nums;
font-feature-settings: "tnum" 1;
```

Large values should feel stable and readable.

Avoid excessively oversized numbers.

The number should dominate the card, but the surrounding context must remain immediately understandable.

Example:

```text
TOTAL BALANCE

₹2,84,520.00
+8.4% this month
```

Not:

```text
₹284K
```

unless the user's context benefits from compact notation.

---

# 5. Spacing System

Use a 4px base grid.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

However:

### Do not mechanically apply spacing tokens everywhere.

Spacing exists to create hierarchy.

Use:

* tighter spacing within related information
* larger spacing between unrelated groups
* generous spacing around primary decisions

The visual rhythm should feel intentional, not mathematically repetitive.

---

# 6. Layout System

## 6.1 Page width

```css
--page-max: 1380px;
```

Use a centered content area with responsive horizontal padding.

Desktop:

```css
padding-inline: 32px;
```

Tablet:

```css
padding-inline: 24px;
```

Mobile:

```css
padding-inline: 16px;
```

---

## 6.2 Grid philosophy

Do not automatically turn every section into cards.

Use three levels of hierarchy:

### Level 1 — Page structure

Major sections and navigation.

### Level 2 — Information groups

Panels, tables, charts, summaries.

### Level 3 — Controls

Buttons, filters, tabs, inputs, menus.

Not everything requires a container.

A table can sit directly on the page.

A metric can exist without a card.

A section heading can stand alone.

---

# 7. Surface System

FinTrack should have **three visual surfaces**, maximum.

### Base

```css
--bg-app
```

### Surface

```css
--bg-surface
```

### Secondary surface

```css
--bg-surface-alt
```

Use borders to establish boundaries before using shadows.

---

## 7.1 Cards

Cards should feel like **information containers**, not floating objects.

```css
background: var(--bg-surface);
border: 1px solid var(--border);
border-radius: 10px;
```

Standard padding:

```css
20px;
```

Feature sections:

```css
24px;
```

Avoid:

* huge 20–28px radius cards
* permanent shadows
* gradient backgrounds
* glowing edges

---

# 8. Border Radius

Keep geometry restrained.

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 10px;
--radius-xl: 14px;
--radius-pill: 999px;
```

Default:

**8–10px**

Do not use large radii simply because they look “friendly.”

FinTrack is a financial product.

Geometry should communicate precision.

---

# 9. Elevation

Prefer borders over shadows.

### Default

```css
box-shadow: none;
```

### Floating element

```css
box-shadow:
  0 8px 24px rgba(0,0,0,0.08),
  0 2px 6px rgba(0,0,0,0.04);
```

### Modal

Use a stronger layered shadow only when the element genuinely sits above the interface.

Do not add shadows to every card.

---

# 10. Navigation

Navigation should be extremely stable.

Desktop:

```text
Logo
Dashboard
Transactions
Budgets
Analytics
Accounts

               Search
               Notifications
               Profile
```

Active navigation should use:

* accent text
* subtle accent background
* clear visual indicator

Avoid:

* glowing nav items
* animated pills
* gradient active states
* oversized icons

---

# 11. Buttons

Buttons should communicate hierarchy immediately.

## Primary

Solid accent background.

```css
background: var(--accent);
color: white;
```

## Secondary

Neutral surface + border.

## Ghost

Transparent.

## Destructive

Negative semantic color.

---

### Button sizing

```text
Small   32px
Default 38px
Large   44px
```

Buttons should generally have:

```css
border-radius: 7px;
font-weight: 600;
```

Do not use gradients for standard buttons.

---

# 12. Inputs

Inputs should prioritize clarity.

```css
height: 42px;
border: 1px solid var(--border);
border-radius: 7px;
background: var(--bg-surface);
```

Focus:

```css
border-color: var(--accent);
box-shadow: 0 0 0 3px var(--accent-soft);
```

Do not create glowing input effects.

Labels should sit above fields.

Placeholder text should remain secondary to real values.

---

# 13. Tables

Tables are a core FinTrack pattern.

Prioritize:

**alignment > decoration**

Rules:

* no outer card unless useful
* subtle row separators
* compact headers
* generous numeric alignment
* right-align monetary values
* tabular numbers
* predictable column widths
* hover only when useful

Example:

```text
DATE        DESCRIPTION              CATEGORY        AMOUNT
────────────────────────────────────────────────────────────
04 Sep      Netflix                   Entertainment   -₹649
03 Sep      Salary                    Income          +₹85,000
02 Sep      Swiggy                    Food            -₹482
```

Avoid turning every row into an individual card.

---

# 14. Charts

Charts should look analytical rather than decorative.

## Rules

* remove unnecessary chart decoration
* use fewer grid lines
* avoid heavy axes
* prioritize direct labels when possible
* use animation only when it helps comprehension
* do not use gradients simply because the chart library supports them

### Line chart

Use:

```css
stroke-width: 2px;
```

Area fills should be extremely subtle.

### Bar chart

Bars should be visually solid and easy to compare.

### Donut chart

Only use when the relationship between parts and whole is genuinely useful.

Never use a donut just to make a dashboard look richer.

---

# 15. Dashboard Composition

A dashboard should answer:

### What is my financial state?

### What changed?

### Why did it change?

### What needs my attention?

Recommended hierarchy:

```text
Page title
↓
Primary financial summary
↓
Important changes
↓
Analysis
↓
Detailed activity
↓
Secondary information
```

Do not make six cards equally prominent.

The user should understand what matters within approximately three seconds.

---

# 16. Empty States

Never use generic:

> No data available.

Instead explain:

**what happened + why + what the user can do next**

Example:

```text
No transactions yet

Connect an account or add your first transaction
to start seeing your spending patterns.
```

Empty states should feel like part of the product, not placeholders.

---

# 17. Loading States

Prefer skeletons when the layout is known.

Skeletons should replicate:

* approximate dimensions
* information density
* hierarchy

Do not animate every skeleton aggressively.

Use a subtle shimmer only when loading takes long enough to justify it.

---

# 18. Motion

Motion should communicate:

**change, cause, feedback, or continuity**

Never use animation simply to create “wow.”

### Durations

```css
--duration-fast: 120ms;
--duration-normal: 180ms;
--duration-slow: 280ms;
```

Prefer:

```css
cubic-bezier(0.2, 0.8, 0.2, 1);
```

### Appropriate motion

* button feedback
* menu opening
* modal entrance
* tab transitions
* chart data updates
* page-level continuity

### Avoid

* floating decorative objects
* perpetual background animations
* unnecessary bounce
* excessive stagger
* dramatic card entrances

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 19. Hover States

Hover should clarify interactivity.

It does NOT need to physically move the interface.

Preferred:

```css
background change
border change
text change
shadow change
```

Avoid making every card:

```css
transform: translateY(-2px);
```

Cards do not need to “pop up” to prove they are interactive.

---

# 20. Iconography

Use one consistent icon family.

Icons should be:

* simple
* 1.5–2px stroke
* geometrically consistent
* visually subordinate to labels

Default size:

```text
16px
```

Large:

```text
20px
```

Do not mix:

* filled icons
* outlined icons
* emoji
* random SVG styles

within the same interface.

---

# 21. Microcopy

FinTrack should speak like a competent financial assistant.

Use:

**Review spending**

instead of:

**Let's explore your financial journey!**

Use:

**Budget exceeded**

instead of:

**Oops! Looks like you're spending a little more than expected!**

Use:

**Updated 2 minutes ago**

instead of:

**Freshly updated for you ✨**

Tone:

**clear
quiet
specific
helpful**

Never fake enthusiasm.

---

# 22. AI / Insight Features

When AI-generated insights exist, they must not visually resemble generic chatbot interfaces.

Prefer:

```text
INSIGHT

Dining spending increased 22% this month.

Most of the increase came from weekend
orders between ₹400–₹700.
```

Then optionally:

```text
View transactions →
```

Do not automatically create:

* glowing AI cards
* sparkles
* rainbow gradients
* “AI magic”
* chat bubbles
* robot icons

The insight should feel like a financial observation, not an AI advertisement.

---

# 23. Responsive Design

Responsive behavior should preserve hierarchy rather than merely shrink desktop layouts.

### Mobile

Prioritize:

1. balance / primary state
2. important changes
3. primary action
4. recent activity
5. secondary analytics

Tables should become:

* horizontally scrollable when necessary
* simplified when possible
* transformed into readable rows only when that improves usability

Never compress five columns until they become unreadable.

---

# 24. Accessibility

Every component must consider:

* keyboard navigation
* visible focus state
* semantic HTML
* sufficient contrast
* screen-reader labels
* reduced motion
* touch target size
* error communication
* color-independent status communication

Never communicate financial meaning through color alone.

Example:

```text
+₹12,500 ↑
```

is preferable to green color alone.

---

# 25. Design Review Checklist

Before considering a UI complete, ask:

### Hierarchy

Can I immediately identify the most important information?

### Density

Is anything unnecessarily taking space?

### Contrast

Are secondary elements visually subordinate?

### Color

Is every color serving a purpose?

### Consistency

Does this behave like the rest of FinTrack?

### Distinctiveness

Would this interface still feel unique without gradients, shadows, and animation?

### Authenticity

Does this feel like a financial product or an AI-generated SaaS template?

### Interaction

Is it obvious what is clickable, editable, or actionable?

### Mobile

Does the same hierarchy survive on a small screen?

---

# 26. Hard Anti-Patterns

Never introduce these merely for visual effect:

❌ Gradient-heavy UI
❌ Glassmorphism everywhere
❌ Floating blobs
❌ Neon glow
❌ Excessive rounded cards
❌ Huge hero text inside product screens
❌ Excessive pills
❌ Random accent colors
❌ Decorative grid backgrounds
❌ AI sparkle icons
❌ Fake futuristic dashboards
❌ Excessive animation
❌ Card hover lifts everywhere
❌ Massive shadows
❌ Excessive empty space
❌ Dribbble-style decorative widgets
❌ Generic SaaS illustrations
❌ Emoji as interface decoration
❌ “✨ AI-powered” visual language

---

# 27. The 70/20/10 Rule

A typical FinTrack screen should visually approximate:

**70% neutral information surfaces**

**20% hierarchy through typography, spacing, and borders**

**10% semantic or brand color**

This is a guideline, not a mathematical requirement.

If a screen feels colorful before it feels understandable, it is probably over-designed.

---

# 28. Design Decision Priority

When two design choices conflict, prioritize in this order:

```text
1. Usability
2. Information hierarchy
3. Accessibility
4. Consistency
5. Performance
6. Brand identity
7. Aesthetic novelty
```

Novelty is always last.

---

# 29. Core Rule

### Do not ask:

> “How can we make this look more modern?”

Ask:

> “What is the user trying to understand or accomplish here, and what is the clearest possible visual system for that?”

The best FinTrack interface should feel **obvious after five seconds and refined after five minutes.**

That is the standard.
