---
title: "18. Global App Header"
status: "Draft"
last_updated: "2026-05-16"
---

# Feature 18: Global App Header & Notifications

## Objective
Create a global `AppHeader` component to serve as the top navigation bar across all authenticated pages. This header will replace the existing bottom-of-sidebar profile management, providing a cleaner sidebar and a dedicated space for global actions like notifications and user settings.

## Core Requirements

### 1. Header Layout & Placement
- **Location:** The header should be integrated into the `AppShell` component, sitting persistently at the top of the main content area (to the right of the sidebar on desktop, and spanning the full width below the hamburger menu on mobile).
- **Design:** Follow the existing `ui-context.md` guidelines. Use a clean, minimal border at the bottom (`border-b`), a white/canvas background, and proper flex alignment.

### 2. Profile Management Migration
- **Remove from Sidebar:** Delete the user profile dropdown currently located at the bottom of `Sidebar.tsx`.
- **Header Profile Dropdown:** Implement a `DropdownMenu` in the far right of the header.
  - **Trigger:** An `Avatar` component or user icon showing the user's email/name.
  - **Menu Items:** 
    - **View Profile:** Navigates to `/admin/profile`, `/coop/profile`, or `/farmer/profile` depending on the role.
    - **Sign Out:** Triggers the auth context logout function and redirects to `/login`.

### 3. Notification System
- **Bell Icon:** Add a notification bell (`lucide-react` Bell icon) next to the profile dropdown.
- **Notification Dropdown:** Clicking the bell opens a `DropdownMenu` showing a list of recent alerts.
- **Current Notification Sources:**
  - **Partnership Inquiries (Admin):** Alert the Admin when there are new `pending` Partnership Requests.
  - **Delivery Confirmations (Admin/Officer):** Alert when a delivery is pending confirmation.
- **View All Notifications Action:** A button at the bottom of the dropdown that routes the Admin to `/admin/requests` (since Partnership Inquiries are currently the primary notification source). 

## Implementation Steps

1. **Create `AppHeader.tsx`:** Build the component using `shadcn/ui` components (`DropdownMenu`, `Avatar`, `Button`, `Badge` for notification dot).
2. **Modify `AppShell.tsx`:** Inject the `AppHeader` into the main content wrapper so it appears globally.
3. **Refactor `Sidebar.tsx`:** Remove the user footer section.
4. **Wire up Notifications:** Fetch the pending requests count via an API call (or reuse dashboard stats) to display an unread badge on the bell icon.
