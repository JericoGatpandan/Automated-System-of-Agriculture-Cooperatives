import { useAuth } from "../../context/AuthContext";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNavItem } from "./SidebarNavItem";

import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import logoImg from "../../assets/logo.png";

type SidebarNavEntry = {
  label: string;
  icon: LucideIcon;
  route: string;
  exact?: boolean;
  disabled?: boolean;
  children?: { label: string; route: string }[];
};

// ── Role label mapping ──
const ROLE_LABELS: Record<string, string> = {
  Admin: "FACCS Admin",
  Officer: "Cooperative Officer",
  Farmer: "Farmer",
};

// ── Profile route mapping ──
const PROFILE_ROUTES: Record<string, string> = {
  Admin: "/admin/profile",
  Officer: "/coop/profile",
  Farmer: "/farmer/profile",
};

// ── Navigation config per role (from 06-sidebar-navigation.md) ──
const ADMIN_NAV: SidebarNavEntry[] = [
  { label: "Dashboard", icon: LayoutDashboard, route: "/admin", exact: true },
  {
    label: "Cooperative Registry",
    icon: Building2,
    route: "/admin/cooperatives",
    children: [{ label: "Partnership Inquiries", route: "/admin/requests" }],
  },
  { label: "Farmer Registry", icon: Users, route: "/admin/farmers" },
  { label: "Products", icon: PackageSearch, route: "/admin/products" },
  { label: "Order Management", icon: ShoppingCart, route: "/admin/orders" },
  { label: "Deliveries", icon: Truck, route: "/admin/deliveries" },
  { label: "Farm Ledger", icon: BarChart3, route: "/admin/farmledger" },
];

const OFFICER_NAV: SidebarNavEntry[] = [
  { label: "Dashboard", icon: LayoutDashboard, route: "/coop", exact: true },
  { label: "Farmer Registry", icon: Users, route: "/coop/farmers" },
  { label: "Products", icon: PackageSearch, route: "/coop/products" },
  { label: "Assignments", icon: ClipboardList, route: "/coop/assignments" },
  { label: "Farmer Ledger", icon: BookOpen, route: "/coop/farmledger" },
];

const FARMER_NAV: SidebarNavEntry[] = [
  { label: "Dashboard", icon: LayoutDashboard, route: "/farmer", exact: true },
  { label: "My Ledger", icon: BookOpen, route: "/farmer/ledger" },
];

const NAV_BY_ROLE: Record<string, SidebarNavEntry[]> = {
  Admin: ADMIN_NAV,
  Officer: OFFICER_NAV,
  Farmer: FARMER_NAV,
};

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();

  const role = user?.role ?? "Admin";
  const navItems = NAV_BY_ROLE[role] ?? [];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        "w-[var(--sidebar-width)]",
      )}
      data-collapsed={collapsed ? "true" : "false"}
    >
      {/* ── Header / Logo ── */}
      <div
        className={cn(
          "flex flex-col gap-2 px-4 py-5 border-b border-sidebar-border",
          collapsed ? "items-center" : "items-start",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center",
          )}
        >
          <img src={logoImg} alt="ASAC Logo" className="h-8 w-8 rounded" />
          {!collapsed && (
            <span className="text-base font-bold tracking-tight">ASAC</span>
          )}
        </div>
        {!collapsed && (
          <Badge variant="secondary" className="text-xs font-normal">
            {ROLE_LABELS[role] ?? role}
          </Badge>
        )}
      </div>

      {/* ── Navigation Items ── */}
      <ScrollArea className={cn("flex-1 py-4", collapsed ? "px-2" : "px-3")}>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.route}
              label={item.label}
              icon={item.icon}
              route={item.route}
              disabled={item.disabled}
              exact={item.exact}
              children={item.children}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
