# Crop Type Management Feature

Read `GEMINI.md` first.

Follow the design system in `context/feature-specs/01-design-system.md` and `context/ui-context.md`.

## Goal

Allow FACCS Admins to manage the master list of Crop Types (e.g., Rice, Corn, Mango) so that Cooperatives and Farmers can correctly classify their products.

## Core Requirements

- **Backend**:
  - Add `POST /api/products/crop-types` endpoint to create new crop types.
  - Add `PUT /api/products/crop-types/:id` to edit existing crop types.
  - Add `DELETE /api/products/crop-types/:id` to remove unused crop types.
  - **Validation**: Prevent duplicate crop names from being created.
  - Restrict modification endpoints to the `Admin` role.
  - Prevent deletion of crop types that are currently referenced by existing products or orders.
- **Frontend**:
  - In `frontend/src/pages/inventory/ProductInventoryPage.tsx`, if the `mode` is `"admin"`, display a "Manage Crop Types" button or section.
  - Provide a modal/dialog form to input `cropName` and `category`.
  - **Category Input**: The form should provide predefined category choices (e.g., Grains, Vegetables, Fruits) but also allow the Admin to input their own custom category. Predefined general categories should always be included in the options.
  - The form should follow the existing ASAC design system.
  - Refresh the crop types list upon successful creation/edit/deletion.

## UX Expectations

- A clean modal/dialog for creating and editing a Crop Type.
- Input validation (e.g., required fields, duplicate name error handling).
- Non-blocking error messaging if the creation fails (e.g., "Crop name already exists").
- Only visible to the FACCS Admin (not Cooperative Officers).
- General predefined categories must always appear in the category dropdowns.

## Data Schema (CropType)

Referencing `@context\database\` / backend models (`croptype.js`):
- `cropTypeID` (Integer, Primary Key)
- `cropName` (String, required, unique)
- `category` (String, required)

## Acceptance Criteria

- Admin can open a "Crop Type Management" interface in the Product Inventory page.
- Admin can submit a new crop name and choose from predefined categories or type a custom one.
- Backend rejects the submission if the crop name already exists.
- Admin can edit existing crop names and categories.
- Admin can delete crop types, provided they are not referenced by existing products. General predefined categories remain in the system's dropdowns even if unused.
- Cooperative Officers do not see the option to manage crop types.
- The UI properly handles loading states and potential API errors.