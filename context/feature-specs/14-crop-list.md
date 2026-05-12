# Crop List / Product Inventory Feature

Read `GEMINI.md` first.

Follow the design system in [01-design-system.md](01-design-system.md) and [ui-context.md](../ui-context.md).

Use `frontend/public/crops` as the source folder for crop and product images.

## Goal

Build a crop/product inventory feature for both the admin side and the cooperative side so users can quickly search available products, inspect availability, and identify which cooperatives or farmers can fulfill an order. It should also connect to the rest of the application workflow, especially order fulfillment, delivery, and related cooperative management processes.

This feature should feel like a practical inventory and fulfillment directory, not just a static list.

## Core Requirements

- Provide search, filtering, and sorting for available crops or products.
- Show each product with clear metadata such as name, category, availability, and source cooperative.
- Allow cooperative users to add and edit products.
- Restrict product creation and editing so only cooperatives can manage product records.
- Support optional image uploads for crop or fruit images.
- If no image is available, show a consistent fallback state such as a generated placeholder, crop icon, or styled initials tile.
- Keep the layout visually consistent even when product cards have mixed image availability.
- Clicking a product should reveal additional details.
- On the cooperative side, the detail view should show which farmers currently have the crop or product.
- On the admin side, the detail view should show the cooperatives that have the product available.

## UX Expectations

- Use a clean, operational layout that matches the existing ASAC dashboard style.
- Make filters easy to scan and quick to reset.
- Support a dense, inventory-style presentation for search results.
- Use the existing design system tokens and component patterns.
- Keep the experience consistent across admin and cooperative roles, while adjusting the detail panel based on permissions and data visibility.

## Suggested Behavior

- Search should match product name and related keywords.
- Filters may include category, availability, cooperative, and other useful inventory attributes.
- Results should update predictably as filters change.
- The detail view can be a dialog, side panel, or dedicated detail section, as long as it remains consistent with the app UI.
- Uploading an image should be optional, and missing images must not break the layout.

## Acceptance Criteria

- Admin users can browse and search available products.
- Cooperative users can manage their own product listings.
- Product cards show a stable image or fallback state.
- Clicking a product reveals availability details.
- The cooperative view shows farmers who have the product.
- The admin view shows cooperatives that have the product.
- The UI follows the ASAC design system and remains consistent across states.
