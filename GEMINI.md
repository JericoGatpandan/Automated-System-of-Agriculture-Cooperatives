# ASAC AI Entry Point

Use this file as the first read for any AI-assisted implementation task in this repository.

## Primary Sources of Truth

1. `ASAC - Project-Specification.md` - formal business and domain specification
2. `context/project-overview.md` - product scope and feature intent
3. `context/architecture.md` - technical boundaries and invariants
4. `context/ui-context.md` - UI/UX and visual system guidance
5. `context/code-standards.md` - coding conventions and guardrails
6. `context/ai-workflow-rules.md` - execution workflow and scoping rules
7. `context/progress-tracker.md` - active phase, open questions, and next implementation units

When there is a conflict, resolve it in this order:

1. Project specification
2. Context files
3. Existing implementation

## Project Mission (ASAC)

Build the **Automated System of Agriculture Cooperatives (ASAC)** for FACCS. For the current semester, the finished prototype MUST deliver three core modules:

1. **Cooperative & Farmer Registry**: Managing federation cooperatives and farmer memberships.
2. **Order & Transaction Management**: Handling the referral process from buyer intake to delivery.
3. **FarmLedger Accounting**: Automated sales, fee, and share-capital tracking with printable statements.

The system is designed around a two-tier structure:
- Federation level (FACCS Admin)
- Cooperative level (Primary Coop Officer per cooperative)

*Note: This semester focuses on these core modules as a minimum requirement, with plans for continued expansion in the future.*

## Current Implementation Snapshot

- `backend/`: Node.js + Express + Sequelize + MySQL, with JWT and Bcrypt for authentication
- `frontend/`: React + TypeScript + Vite + Tailwind CSS + shadcn/ui setup direction
- Context docs are now initialized for spec-driven development

## Operating Rules for AI Agents

1. Implement against the ASAC spec and context files, not assumptions.
2. Keep changes within one bounded feature unit at a time.
3. Preserve role boundaries (FACCS Admin vs Coop Officer vs Farmer visibility).
4. Keep order/delivery and accounting chains auditable and deterministic.
5. Update `context/progress-tracker.md` after meaningful work.
6. If scope or architecture changes, update the relevant context file before continuing implementation.
