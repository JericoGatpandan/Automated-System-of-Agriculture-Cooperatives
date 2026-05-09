# AI Workflow Rules

## Approach

Build ASAC incrementally using the project specification and context files as the implementation contract. Focus each work unit on a single business capability and keep federation/cooperative/accounting behavior aligned with documented rules.

## Scoping Rules

- Work on one bounded feature at a time (auth, order intake, assignment, fulfillment, delivery, ledger, reporting).
- Prefer vertical slices that can be validated end to end over broad refactors.
- Do not mix unrelated backend and frontend concerns unless needed to complete one user flow.

## When to Split Work

Split the current implementation step when it combines:

- Multiple unrelated API domains in one change
- Cross-cutting UI redesign and domain logic changes together
- Undefined business behavior (especially commission and ledger edge cases)

If completion criteria are unclear, split and resolve requirements first.

## Handling Missing Requirements

- Do not invent behavior beyond ASAC specification intent.
- Record unresolved items in `context/progress-tracker.md` under Open Questions.
- For financial logic ambiguity, block implementation until assumptions are explicitly documented.

## Protected Files

Do not modify unless explicitly requested:

- `node_modules/**`
- Environment secret files (except local setup documentation updates)
- Historical migration files already applied in shared environments

## Keeping Docs in Sync

Update context docs when implementation changes:

- Feature scope or role responsibilities
- Domain schema or relationships
- Accounting/commission computation rules
- UI patterns used by operators

## Before Moving to the Next Unit

1. Current unit is complete within declared scope.
2. Architecture invariants are still respected.
3. `context/progress-tracker.md` is updated.
4. Relevant existing repo commands pass:
   - `frontend`: `npm run build`, `npm run lint`
   - `backend`: `npm run dev` starts cleanly with configured environment
