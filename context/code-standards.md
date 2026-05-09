# Code Standards

## General

- **Domain-First**: Use entity names from the ASAC specification (e.g., `BuyerOrder`, `FarmerFulfillment`).
- **Surgical Changes**: Focus each change on one business unit (Auth, Orders, Ledger).
- **Validation**: All incoming request data must be validated at the API layer.

## Backend (Express + Sequelize)

- **Auth**: Use standard JWT middleware and Bcrypt for passwords. Do not use external auth providers.
- **Isolation**: Enforce cooperative scoping for Coop Officer roles in every controller.
- **Transactions**: Use Sequelize transactions for atomic updates (e.g., marking delivery as delivered and creating ledger records).
- **Models**: Maintain associations as defined in `context/feature-specs/04-database.md`.

## Frontend (React + TypeScript)

- **UI Library**: Use `shadcn/ui` components. Avoid custom styled `div`s when a component exists.
- **Composition**: Follow the "Compose, don't reinvent" principle from the shadcn skill.
- **Icons**: Use `lucide-react` with consistent sizing (usually `h-4 w-4`).
- **State Management**: Handle async states (loading, error) explicitly using shadcn primitives like `Skeleton` or `Alert`.

## Accounting Integrity

- **Formulaic**: All commission and fee calculations must follow the formulas in Section 4 of the Project Specification.
- **Immutable Records**: Sales and Fee records should be read-only once generated.
- **Audit Logs**: Maintain clear status history for `BuyerOrder` and `CoopAssignment`.

## Styling

- **Semantic Tokens**: Use CSS variables for colors (e.g., `bg-primary`, `text-muted-foreground`).
- **Dark Mode**: Support light/dark mode via the root `data-theme` or `class`.
- **Print Friendliness**: Ensure Ledger reports are formatted for A4 printing.
