# ASAC Database Seeding Reference

Read `GEMINI.md` before implementing seed code. This document defines the demo data rules and canonical reference values.

## Reference Date

- Use May 16, 2026 as the current reference date for all seed timestamps unless a specific historical date is required.

## Cooperative Master List (Primary Cooperatives)

Federation of Agriculture Cooperatives in Camarines Sur (FACCS) was registered on August 15, 2019 at the Cooperative Development Authority with Reg. No. 9520-1050000000046468, Bureau of Internal Revenue TIN: 754-576-209-000, and Department of Labor and Employment Reg. No.: 0620-1440.

As of May 16, 2026 General Assembly, the following are the primary cooperative members to seed:

1. CamSur Multi-Purpose Cooperative (CMPC) - Pili, Camarines Sur
2. Magarao Multi-Purpose Cooperative (MMPC) - Magarao, Camarines Sur
3. San Agustin-San Ramon Agrarian Reform Farmers Cooperative (SARFC) - Bula, Camarines Sur
4. Lirag Agrarian Reform Farmer Beneficiaries Cooperative (LARFBCO) - Bula, Camarines Sur
5. Sampaloc Multi-Purpose Cooperative (SMPC) - Gainza, Camarines Sur
6. Pamplona Farmers Cooperative (PAMFACO) - Pamplona, Camarines Sur
7. Penitan Agriculture Cooperative (PAC) - Siruma, Camarines Sur
8. New Mataoroc, Sagrada, San Jose Baliwag Viejo (NEW MASSBA) Multi-Purpose Cooperative - Minalabac, Camarines Sur
9. Cabangal Palsong Agrarian Reform Beneficiary and Fisherfolks Cooperative (CAPARBAFCO) - Bula, Camarines Sur
10. Siruma Agriculture Cooperative (SACoop) - Siruma, Camarines Sur
11. Bula Farmers Irrigators Multi-Purpose Cooperative (BUFIMCO) - Bula, Camarines Sur
12. Holistic Operation for People Empowerment Multi-Purpose Cooperative (HOPE MPC) - Tigaon, Camarines Sur
13. Bikolanas Agriculture Cooperative (BAC) - Naga City, Camarines Sur
14. Kaibigan Child Center Multi-Purpose Cooperative (KCCMPC) - Bula, Camarines Sur
15. Lupi Multi-Purpose Cooperative (LMPC) - Lupi, Camarines Sur
16. Danawin Agrarian Reform Cooperative (DARCO) - Del Gallego, Camarines Sur
17. San Antonio Farmers Irrigators Multi-Purpose Cooperative (SAFIMCO) - Buhi, Camarines Sur
18. Pandan Organic Farmers Cooperative - Cabusao, Camarines Sur
19. Sipocot Farmers and Fisherfolks Agriculture Cooperative (SIFFACO) - Sipocot, Camarines Sur

## Names Policy (Seed Personas)

- Use the following names as mandatory inclusions:
 	- Jerico C. Gatpandan
 	- Thatiana Nicole R. Calma
 	- Frence Sherwin S. Triste
- For all other user/farmer/cooperative officer personas, use names of modern Filipino artists and celebrities.

## Demo Data Rules

- Use realistic, up-to-date values for addresses, phones, prices, quantities, and dates.
- Ensure data stays consistent with relationships in `context/feature-specs/04-database.md`.
- Seed data should reflect operationally valid flows (orders -> assignments -> fulfillments -> deliveries -> ledger).
- Avoid using placeholder strings like "lorem ipsum" or "sample data" in any seeded user-visible fields.

## Seed Coverage Targets

- Users: Admin, Officer, Farmer across multiple cooperatives.
- PrimaryCooperatives: all 19 entries above.
- Farmers: enough to cover multi-coop membership and multiple ledger accounts.
- Orders/Assignments/Fulfillments/Deliveries: a mix of statuses to support UI filtering.
- Ledger: SalesRecords, FeeRecords, LoanRecords, PrintedStatements aligned with deliveries. 


## Date and Status Guidance

- Use May 16, 2026 as "today" for new records.
- Use recent dates (April-May 2026) for in-progress and pending states.
- Use completed deliveries for generating SalesRecords and FeeRecords.
- PrintedStatements should include coherent periodStart/periodEnd ranges within 2026.

## Notes

- This file is the authoritative reference for demo seed content. Keep it in sync with any changes to seeding rules or the cooperative list.
- the data should should be compute correctly for accounting part.
