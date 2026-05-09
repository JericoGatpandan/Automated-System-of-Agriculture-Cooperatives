# UI Context

## Theme

ASAC uses a clean, high-contrast operations dashboard style optimized for data-heavy workflows and readability during cooperative office use. Prioritize clarity over decorative UI, with strong emphasis on tables, statuses, and printable financial summaries.

## Component Library: shadcn/ui

We use **shadcn/ui** for all UI primitives.
- **Activation**: Use `activate_skill('shadcn')` for expert guidance.
- **CLI Usage**: `npx shadcn@latest add <component>`
- **Icons**: `lucide-react` (default).

## Colors

All new UI work should use semantic CSS variables from `frontend/src/index.css` and avoid hardcoded color values.
Theme behavior:
- Default runtime mode is light (the `dark` class is not applied in `frontend/src/main.tsx`).
- Root `data-theme` is set to `light` at startup, and both must stay aligned when adding a theme toggle.

| Role | CSS Variable | Light |
| --- | --- | --- |
| Canvas background | `--color-bg-canvas` | `#f2f3f2` |
| Surface background | `--color-bg-surface` | `#ffffff` |
| Subtle background | `--color-bg-subtle` | `#e4e7e4` |
| Strong text | `--color-text-strong` | `#181b18` |
| Default text | `--color-text-default` | `#313531` |
| Muted text | `--color-text-muted` | `#626a62` |
| Primary action | `--color-primary` | `#38c73d` |
| Primary hover | `--color-primary-hover` | `#2d9f31` |
| Border | `--color-border-default` | `#c9cfc9` |
| Success | `--color-success` | `#2d9f31` |
| Warning | `--color-warning` | `#b07a14` |
| Danger | `--color-danger` | `#b3261e` |
| Info | `--color-info` | `#2c7a7b` |

Use primary/secondary/accent shades for emphasis, but prefer semantic tokens above for app-level consistency.

## Layout Patterns

- **App Shell**: Side navigation for module switching (Orders, Ledger, Coops, Farmers).
- **Table-First**: Use `Table` component for listing orders, farmers, and transactions.
- **Status Badges**: Use `Badge` with variants (`outline`, `secondary`, `destructive`) for status tracking.
- **Form Layout**: Use `FieldGroup` + `Field` pattern for input consistency.

## Typography

| Role | Font | Variable |
| --- | --- | --- |
| UI text | Poppins (+ system fallbacks) | `--font-sans` |
| Code/mono | IBM Plex Mono (+ system fallbacks) | `--font-mono` |

Use at least `14px` equivalent body size for form-heavy screens and avoid low-contrast small text for operational tables.

## Component Library

Use **shadcn/ui** as the primary component library on top of Tailwind.

- Prefer shadcn components first (Button, Input, Select, Dialog, Table, etc.) before creating custom primitives.
- Keep app-level visual consistency by mapping components to existing semantic CSS tokens in `frontend/src/index.css`.
- Place reusable UI primitives in `frontend/src/components/ui/` and domain composites near their feature modules.
- Avoid editing generated base component behavior unless the change is needed project-wide.

Current generated primitives:
- Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea
- Label, Select, Table, Badge

Support utilities/packages in use:
- `cn()` helper in `frontend/src/lib/utils.ts`
- `tw-animate-css`, `class-variance-authority`, `clsx`, `tailwind-merge`

## Border Radius

| Context | Class |
| --- | --- |
| Inputs / small controls | `rounded-md` |
| Cards / panels | `rounded-lg` |
| Modals / overlays | `rounded-xl` |

## Operational Guidelines

- **Typography**: Poppins for UI, IBM Plex Mono for financial data.
- **Spacing**: Use `gap-*` (Flex/Grid) instead of `space-y-*`.
- **Icons**: Use `data-icon` attribute in buttons; avoid manual sizing classes on icons inside components.
- **Accessibility**: Every `Dialog`, `Sheet`, or `Drawer` MUST have a `Title`.

## Print Standards

The **Farmer Balance Sheet** must be:
- Deterministic (matches database exactly).
- Single-page formatted.
- High contrast (black on white) for physical printing.

## Icons

Use **lucide-react** as the project icon library.

- Prefer stroke icons with consistent sizing:
  - `h-4 w-4` for inline/table icons
  - `h-5 w-5` for button-leading icons
- Keep icon usage semantic and restrained in dense operator screens.
