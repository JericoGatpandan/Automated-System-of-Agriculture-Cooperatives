
# PSGC Cloud Location Lookup Feature

Read `GEMINI.md` first.

Follow the design system in [01-design-system.md](01-design-system.md) and [ui-context.md](../ui-context.md).

## Goal

Provide authoritative city/municipality and barangay lists for address capture, so cooperative and farmer records use consistent location data and avoid manual encoding errors.

## Core Requirements

- Fetch Camarines Sur cities/municipalities from PSGC Cloud.
- Fetch barangays for the selected city/municipality by code.
- Use PSGC codes in requests and form state to avoid encoding mismatches.
- Sort dropdown options alphabetically by name.
- Reset barangay selection when the city/municipality changes.
- Provide a loading state during barangay fetches.

## UX Expectations

- Two dropdowns: City/Municipality then Barangay.
- Barangay dropdown is disabled until a city/municipality is selected.
- Non-blocking error messaging when PSGC calls fail.
- The UI follows ASAC design system tokens and component patterns.

## Suggested Behavior

- Cities/Municipalities API
  - GET <https://psgc.cloud/api/v2/provinces/Camarines%20Sur/cities-municipalities>
- Barangays API
  - GET <https://psgc.cloud/api/v2/cities-municipalities/{code}/barangays>
- Data shape (observed)
  - city/municipality: { code, name }
  - barangay: { code, name }
- Cache the cities/municipalities list for the session.
- Optional: cache barangays by city code to reduce repeat calls.

## Out of Scope (for now)

- National PSGC lookup across all provinces.
- Persisting PSGC data in the database.
- Offline-first synchronization.

## Acceptance Criteria

- User can select a Camarines Sur city/municipality and then a barangay.
- Barangay list always reflects the selected city/municipality.
- PSGC codes are used for requests and stored in form state.
- Dropdowns are alphabetically sorted and stable.
- Loading indicators and errors are visible and do not break the form.

## Testing Notes

- Manual: change cities and confirm barangay options update and reset.
- Manual: simulate network errors and confirm non-blocking error display.

## Open Questions

- Which form should integrate this first (farmer registration, cooperative profile, or both)?
- Should the database store both PSGC code and display name, or only code?
- Is a backend proxy required to avoid CORS or rate limiting?

## Reference

PSGC Cloud API docs: <https://psgc.cloud/api-docs/v2>
