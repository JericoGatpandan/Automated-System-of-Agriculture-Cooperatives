# Feature 12 — Public Landing Page

Read `GEMINI.md` first.

## Purpose

A **public, unauthenticated** marketing-style page that introduces ASAC, highlights the three core modules, and funnels visitors to **Login** (and optionally **Register** if you keep public registration). It is separate from the signed-in app shell (sidebar, modules).

## Design principles

- Follow `context/feature-specs/01-design-system.md` and `context/ui-context.md`: semantic CSS variables, Poppins for UI, shadcn/ui where it fits, **lucide-react** icons.
- **Modern and minimal**: generous whitespace, clear hierarchy, no clutter. The operational app is “table-first”; the landing page can be slightly more expressive but should still feel like the same product family (primary green, neutral surfaces, readable type).
- **Performance**: avoid heavy assets; prefer CSS-based motion and small SVGs.

## Layout & sections

### Header (sticky or static)

- **Left**: App logo (existing asset) + product name **ASAC** (or full name if you add a tagline).
- **Right** (optional): anchor links to on-page sections (e.g. Features, Partners) for long pages.
- **Primary CTA** in the header: one clear button (e.g. **Sign in**, **Log in**, or **Get started** — all route to `/login` unless you later split “Get started” to register).

### Hero

- Short headline and subline describing what ASAC does (Federation + cooperatives + farmers; order flow + FarmLedger).
- **Primary CTA** (same destination as header CTA: `/login`).
- Optional secondary action (e.g. “View features” as a smooth scroll anchor) if it improves flow.

### Features / showcase

- Present the **three mandatory modules** in a scannable way (cards or a simple grid):
  1. Cooperative & farmer registry  
  2. Order & transaction management  
  3. FarmLedger accounting (sales, fees, share capital, statements)  
- Each block: short title, one or two lines of benefit-focused copy, optional icon.

### Motion & scroll (subtle)

- **Scroll-linked or enter-view motion**: e.g. section titles or cards **fade or slide in** when they enter the viewport (lightweight: CSS or a small animation approach; avoid jank on low-end devices).
- Keep motion **restrained**—reinforce quality, not distraction.

### Partners / social proof strip

- A **horizontally scrolling, infinite (or looped) strip** of partner placeholders: abstract shapes, monogram circles, or “Partner A / B / C” text. This is a **draft** until real partner logos are available; no claim of endorsement unless content is approved.

### Footer

- Simple footer: copyright or project name, optional link to login again, optional one line on FACCS / Bicol context if it matches project messaging.
- Use muted text; keep it one short band so the page does not feel heavy.

## Routing

- **Chosen:** **`/`** serves the public landing page (no auth). Primary CTAs route to **`/login`**. Unknown paths (`*`) redirect to **`/`** so visitors see marketing content first instead of being sent straight to login.

## Acceptance checks

- [x] Page is **public** (no auth required) and uses the shared design tokens (no one-off color soup).
- [x] Header includes **logo + name** and a CTA that navigates to **`/login`**.
- [x] **Hero** + at least one **feature showcase** section reflect the three core modules.
- [x] **Footer** is present and minimal.
- [x] **Subtle scroll/enter motion** is implemented without obvious layout shift or poor performance.
- [x] **Infinite (or seamless loop) horizontal** partner/placeholder strip is present as a draft.
- [x] Layout is **responsive** (readable on mobile: stacked sections, tappable CTA).
- [x] `npm run build` passes after implementation.

## Out of scope (for this feature)

- Full CMS, blog, or multi-language.
- Replacing the entire app theme—landing should **align** with the design system, not redefine it.
