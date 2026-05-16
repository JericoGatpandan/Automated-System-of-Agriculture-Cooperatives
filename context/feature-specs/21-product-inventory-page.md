# Feature 21 — Product Inventory Page & Admin Assignment

Read `GEMINI.md` first.

Follow the design system in `context/feature-specs/01-design-system.md` and `context/ui-context.md`.

## Goal

Enhance the crop/product inventory feature by moving from a modal/dialog-based detail view to a dedicated full page. This provides more space for cooperatives to manage their product documentation/images and introduces a streamlined "Assign Cooperative" workflow for FACCS Admins directly from the inventory page.

## Core Requirements

### 1. Dedicated Product Inventory Page
- **Route:** Change the detail view to a full page.
  - Admin: `/admin/inventory/:cropTypeId` (or `/admin/products/:id` depending on current routing)
  - Cooperative: `/coop/inventory/:productId`
- **Layout:** Use a two-column or spacious card-based layout.
  - **Left/Main Area:** Product details, images, and documentation.
  - **Right/Sidebar Area:** Availability, assigned farmers, or list of cooperatives (depending on role).

### 2. Cooperative Side: Image & Documentation Upload
- **Feature:** Allow Cooperative Officers to upload images or documentation for their specific products.
- **UI:** A drag-and-drop or file selection area within the product page.
- **Backend:** 
  - Add an endpoint (e.g., `POST /api/products/:id/upload`) using `multer` to handle file uploads.
  - **Storage:** Files must be stored in `backend/uploads/products/`.
  - **Database:** Store only the relative file path (string) in the `imagePath` column of the `Products` table. **Do not store binary data (BLOBs) in the database** to ensure maximum performance and keep the database lean.
  - Re-use the upload logic patterns already established in the backend for consistency.

### 3. Admin Side: "Assign Cooperative" Workflow
- **Feature:** Allow FACCS Admins to easily assign a cooperative to an order based on the crop they are viewing.
- **Trigger:** An "Assign Cooperative" button on the Admin's crop/product detail page.
- **UI Flow:**
  - Clicking the button opens a clean, focused Dialog or a dedicated section on the page.
  - **Cooperative Selection:** Displays cooperatives that have the specific crop available as **clickable cards**.
  - **Card Design:** When clicked, the card shows a primary-colored border, a slight background tint, and a checkmark icon to indicate it is "selected".
  - **Assignment Details:** After selecting a cooperative, the Admin inputs the **Quantity Required**.
  - **Order Linking:** The Admin must select an existing `BuyerOrder` (that requires this crop) to attach this assignment to, or have a shortcut to create a new draft order.
- **Backend Action:** Submitting this form calls the existing `POST /api/assignments` endpoint to create a `CoopAssignment`.

## UX Expectations

- **Visual Consistency:** Ensure the clickable cooperative cards follow the clean, high-contrast ASAC design system (e.g., `hover:border-primary`, `ring-2 ring-primary` when selected).
- **Feedback:** Provide immediate visual feedback when a cooperative card is selected.
- **Uploads:** Show a loading spinner during image uploads and a success toast afterward. If no image exists, display a stylized fallback placeholder as defined in `14-crop-list.md`.

## Data Model Updates (if necessary)
- **Products Table:** May need a migration to add `imagePath` (String) if not already present, to store the uploaded product image.

## Acceptance Criteria

- [ ] Product detail view is now a standalone page instead of a modal.
- [ ] Cooperative Officers can upload an image/document for their product, and it persists in the database.
- [ ] Admins see an "Assign Cooperative" button on the crop detail page.
- [ ] The assignment interface shows eligible cooperatives as selectable cards with visual active states (border/check).
- [ ] Admins can input a quantity, select a buyer order, and successfully create a `CoopAssignment` from this interface.
- [ ] The UI uses shadcn/ui components (`Card`, `Dialog`, `Input`, `Button`, `Select`) and matches existing styling.
