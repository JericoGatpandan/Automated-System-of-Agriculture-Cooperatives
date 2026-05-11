# Feature 13 — Table Pagination

Read `GEMINI.md` first.

## Purpose

Create a consistent pagination pattern for all table-based screens in ASAC so long lists remain readable, efficient, and visually aligned across the app. This feature applies to the cooperative registry, farmer registry, order management, delivery records, and FarmLedger tables.

## Design Goal

Follow the design system in `context/feature-specs/01-design-system.md` and `context/ui-context.md`.

The table experience should feel like one shared system, not a separate implementation per module. Keep the layout clean, operational, and easy to scan for office users who work with dense data all day.

## Required Behavior

- Tables must fill the available vertical space inside the page container, targeting a full `100vh`-style content area when the shell layout allows it.
- Table headers should remain visible while the body scrolls.
- Each table should support pagination by default.
- Default page size should show about 10 rows per page on standard screens.
- If the table content exceeds the viewport, the body may scroll within the table container, but pagination must still be available.
- Pagination must clearly show the current range and total count.
- Use consistent controls and spacing across all table screens.

## Pagination Footer Layout

Place the pagination controls below the table in a dedicated footer row.

### Left Side

Show the current range and total results in plain language.

Example:

`Showing 1-8 of 24 results`

### Right Side

Show navigation controls for paging.

- Use a `Previous` control when there is a previous page.
- Use a `Next` control when there is a next page.
- When the data set has multiple pages, show page numbers for direct navigation.
- Disable controls that cannot be used.

## Table Consistency Rules

- Use the same table density, spacing, border treatment, and typography across all modules.
- Use shadcn/ui components where appropriate, especially `Table`, `Button`, `ScrollArea`, and supporting layout primitives.
- Keep row height consistent so the page count feels predictable across screens.
- Align empty, loading, and error states with the same table container and footer structure.

## Interaction Details

- Preserve the active sort or filter state when changing pages.
- Reset to the first page when a filter changes the result set.
- If the current page becomes invalid after a delete or data refresh, move to the nearest valid page.
- Keep pagination updates fast and deterministic.

## Responsive Behavior

- On larger screens, show the full footer layout with range text on the left and controls on the right.
- On smaller screens, keep the same information but allow the controls to wrap cleanly instead of breaking the layout.
- Do not reduce the table into a card list unless a separate mobile-specific spec requires it.

## Accessibility

- Pagination controls must be keyboard accessible.
- The current page should be announced clearly to screen readers.
- Disabled controls should be non-interactive and visibly distinct.
- Maintain sufficient contrast for all table text, borders, and control states.

## Acceptance Criteria

- All table-heavy screens use a consistent pagination layout.
- Table sections occupy the intended vertical space without feeling cramped.
- The footer shows a readable summary such as `Showing 1-8 of 24 results`.
- `Previous` and `Next` work only when valid.
- Page numbers appear when the result set spans multiple pages.
- The design matches the shared ASAC UI system and uses the existing shadcn/tailwind stack.
