# Profile Management

Read `GEMINI.md` first.

## 07 — Profile Management

### Design

Follow the design system in `context/feature-specs/01-design-system.md` and `context/ui-context.md`.

### Overview

Allow all authenticated users to view and manage their own profile from within the sidebar layout. Each role sees profile data scoped to their identity:

- **Admin**: Email, role, account creation date
- **Officer**: Email, role, cooperative name, location, phone, CDA registration number
- **Farmer**: Email, role, full name, farm name, farm location, cooperative memberships

Users can update their email, change their password, and soft-delete (deactivate) their own account — with confirmation modals for destructive actions.

### Access Point

The profile is accessed from the **sidebar user footer**. Replace the current plain-text email display with a clickable user button that opens a `DropdownMenu`:

```
┌─────────────────────┐
│  👤 user@email.ph   │  ← clickable
│                     │
│  ┌───────────────┐  │
│  │ 👤 Profile    │  │  ← navigates to /{role-prefix}/profile
│  │ 🚪 Sign Out   │  │  ← calls logout()
│  └───────────────┘  │
└─────────────────────┘
```

This replaces the current separate Sign Out button in the sidebar footer.

### Profile Page

A standalone page at `/{role-prefix}/profile` (e.g. `/admin/profile`, `/coop/profile`, `/farmer/profile`) rendered inside the existing `AppShell`.

The page contains three sections in a single-column `Card` layout:

#### Section 1 — Account Information (read-only)

| Field | Admin | Officer | Farmer |
|-------|-------|---------|--------|
| Email | ✅ | ✅ | ✅ |
| Role | ✅ | ✅ | ✅ |
| Member Since | ✅ | ✅ | ✅ |

#### Section 2 — Organization Information (read-only)

| Field | Admin | Officer | Farmer |
|-------|-------|---------|--------|
| Cooperative Name | — | ✅ | — |
| Barangay | — | ✅ | — |
| Municipality | — | ✅ | — |
| Phone | — | ✅ | — |
| CDA Registration # | — | ✅ | — |
| Full Name | — | — | ✅ |
| Farm Name | — | — | ✅ |
| Farm Location | — | — | ✅ |
| Cooperative Memberships | — | — | ✅ (list) |

> **Note**: Organization info is read-only on the profile page. Cooperative details are managed by Admin in the Cooperative Registry. Farmer details are managed by Officers in the Farmer Registry.

#### Section 3 — Account Actions

| Action | All Roles | Component |
|--------|-----------|-----------|
| Change Password | ✅ | Dialog with current password + new password + confirm fields |
| Deactivate Account | ✅ | Destructive Dialog with warning and password confirmation |

### API Endpoints

All endpoints are on `backend/routes/profile.routes.js`, mounted at `/api/profile`. All require `authenticate` middleware (JWT).

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/profile` | Get current user's full profile (email, role, organization) | JWT (any role) |
| `PUT` | `/api/profile/email` | Update the current user's email address | JWT (any role) |
| `PUT` | `/api/profile/password` | Change password (requires current password) | JWT (any role) |
| `DELETE` | `/api/profile` | Soft-delete own account (requires password confirmation) | JWT (any role) |

#### `GET /api/profile` — Response shape

```json
{
  "profile": {
    "id": 2,
    "email": "cmpc.officer@cmpc.coop",
    "role": "Officer",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "organization": {
      "type": "cooperative",
      "primaryCoopID": 1,
      "coopName": "CamSur Multi-Purpose Cooperative (CMPC)",
      "barangay": "Poblacion",
      "municipality": "Pili",
      "phone": "9171234567",
      "registrationNumber": "CDA-9520-001"
    }
  }
}
```

For Farmer:
```json
{
  "profile": {
    "id": 3,
    "email": "juan.dela.cruz@farmer.ph",
    "role": "Farmer",
    "createdAt": "2024-02-01T00:00:00.000Z",
    "organization": {
      "type": "farmer",
      "farmerID": 1,
      "firstName": "Juan",
      "middleName": "Reyes",
      "lastName": "Dela Cruz",
      "farmName": "Dela Cruz Farm",
      "farmLocation": "Bula, CamSur",
      "cooperatives": [
        { "coopName": "SARFC", "status": "active", "joinedDate": "2022-06-01" }
      ]
    }
  }
}
```

For Admin:
```json
{
  "profile": {
    "id": 1,
    "email": "faccs.admin@faccs.ph",
    "role": "Admin",
    "createdAt": "2024-01-10T00:00:00.000Z",
    "organization": null
  }
}
```

#### `PUT /api/profile/email`

- **Request**: `{ "newEmail": "new@email.ph" }`
- **Validation**: Must be unique (409 if already taken), must be valid email format
- **Response**: `{ "message": "Email updated", "email": "new@email.ph" }`
- **Side effect**: Updates the `AuthContext` user object on frontend after success

#### `PUT /api/profile/password`

- **Request**: `{ "currentPassword": "...", "newPassword": "...", "confirmPassword": "..." }`
- **Validation**: `currentPassword` must match stored hash, `newPassword` minimum 8 chars, `confirmPassword` must match `newPassword`
- **Response**: `{ "message": "Password changed successfully" }`
- **Security**: Current password required — prevents unauthorized changes from stolen sessions

#### `DELETE /api/profile`

- **Request**: `{ "password": "..." }`
- **Validation**: Password must match stored hash
- **Behavior**: Sets `isDeleted = true` on the user record. Also sets `isDeleted = true` on the linked PrimaryCooperative (if Officer) or Farmer (if Farmer).
- **Response**: `{ "message": "Account deactivated" }`
- **Restriction**: Admin accounts **cannot self-delete** — there must always be at least one active Admin. Return 403 with message `"Cannot deactivate the last admin account"`.
- **Side effect**: Frontend calls `logout()` after success and redirects to `/login`.

### Implementation Details

#### New files

```
backend/routes/profile.routes.js      # API endpoints
frontend/src/pages/profile/
  └── ProfilePage.tsx                  # Profile view + actions page
```

#### Modified files

| File | Change |
|------|--------|
| `backend/index.js` | Mount `profileRoutes` at `/api/profile` |
| `components/layout/Sidebar.tsx` | Replace email text + Sign Out button with `DropdownMenu` user button |
| `App.tsx` | Add `/{role-prefix}/profile` routes inside each AppShell group |

#### Sidebar footer change (Sidebar.tsx)

Replace the current user footer:
```tsx
// BEFORE (current)
<div className="border-t ...">
  <p className="text-xs ...">{user?.email}</p>
  <Button onClick={handleSignOut}>Sign Out</Button>
</div>

// AFTER (new)
<div className="border-t ...">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="flex w-full items-center gap-3 ...">
        <UserCircle className="h-5 w-5" />
        <span className="truncate text-sm">{user?.email}</span>
        <ChevronsUpDown className="h-4 w-4 ml-auto" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="w-56">
      <DropdownMenuItem onClick={() => navigate(profileRoute)}>
        <UserCircle className="h-4 w-4 mr-2" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleSignOut}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

#### Profile route mapping

```ts
const PROFILE_ROUTES: Record<string, string> = {
  Admin: "/admin/profile",
  Officer: "/coop/profile",
  Farmer: "/farmer/profile",
};
```

### shadcn Components Needed

| Component | Status | Usage |
|-----------|--------|-------|
| `DropdownMenu` | **Install** | Sidebar user footer menu |
| `Separator` | **Install** | Profile page section dividers |
| `Dialog` | ✅ Exists | Change password + deactivate modals |
| `Card` | ✅ Exists | Profile sections |
| `Button` | ✅ Exists | Action buttons |
| `Input` | ✅ Exists | Password fields |
| `Label` | ✅ Exists | Form labels |
| `Badge` | ✅ Exists | Role badge on profile |

### Icons (lucide-react)

- `UserCircle` — profile trigger button + profile page header
- `ChevronsUpDown` — dropdown indicator in sidebar
- `KeyRound` — change password action
- `Trash2` — deactivate account action
- `Mail` — email field
- `Shield` — role display
- `Calendar` — member since
- `LogOut` — sign out (already in use)

### Check when done

- [ ] Sidebar footer shows clickable user button with dropdown (Profile + Sign Out)
- [ ] `GET /api/profile` returns correct data for Admin, Officer, and Farmer
- [ ] Profile page shows account info for all roles
- [ ] Profile page shows organization info for Officer (cooperative details) and Farmer (farm + memberships)
- [ ] Change password dialog validates current password, new password length, and confirmation match
- [ ] `PUT /api/profile/password` rejects incorrect current password (401)
- [ ] `PUT /api/profile/email` rejects duplicate email (409)
- [ ] Email update refreshes the AuthContext user object
- [ ] Deactivate account dialog requires password confirmation
- [ ] Admin self-delete is blocked (403) if they are the last active admin
- [ ] `DELETE /api/profile` soft-deletes user + linked cooperative/farmer record
- [ ] After deactivation, user is logged out and redirected to `/login`
- [ ] No existing routes, components, or models are overridden
- [ ] Profile page is accessible from sidebar nav via dropdown for all three roles
