import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SidebarNavItem } from "./SidebarNavItem";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  LayoutDashboard,
  Building2,
  Users,
  ShoppingCart,
  Truck,
  BarChart3,
  ClipboardList,
  Wallet,
  BookOpen,
  FileText,
  Receipt,
  PiggyBank,
  LogOut,
  UserCircle,
  ChevronsUpDown,
} from "lucide-react";

import logoImg from "../../assets/logo.png";

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
const ADMIN_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, route: "/admin", exact: true },
  { label: "Cooperative Registry", icon: Building2, route: "/admin/cooperatives" },
  { label: "Farmer Registry", icon: Users, route: "/admin/farmers" },
  { label: "Order Management", icon: ShoppingCart, route: "/admin/orders" },
  { label: "Deliveries", icon: Truck, route: "/admin/deliveries", disabled: true },
  { label: "Federation Overview", icon: BarChart3, route: "/admin/overview", disabled: true },
];

const OFFICER_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, route: "/coop", exact: true },
  { label: "Farmer Registry", icon: Users, route: "/coop/farmers" },
  { label: "Assignments", icon: ClipboardList, route: "/coop/assignments" },
  { label: "Loan Management", icon: Wallet, route: "/coop/loans", disabled: true },
  { label: "Farmer Ledger", icon: BookOpen, route: "/coop/ledger", disabled: true },
  { label: "Statements", icon: FileText, route: "/coop/statements", disabled: true },
];

const FARMER_NAV = [
  { label: "My Ledger", icon: BookOpen, route: "/farmer", exact: true },
  { label: "Sales History", icon: Receipt, route: "/farmer/sales", disabled: true },
  { label: "Share Capital", icon: PiggyBank, route: "/farmer/capital", disabled: true },
  { label: "Loan Status", icon: Wallet, route: "/farmer/loans", disabled: true },
];

const NAV_BY_ROLE: Record<string, typeof ADMIN_NAV> = {
  Admin: ADMIN_NAV,
  Officer: OFFICER_NAV,
  Farmer: FARMER_NAV,
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role ?? "Admin";
  const navItems = NAV_BY_ROLE[role] ?? [];
  const profileRoute = PROFILE_ROUTES[role] ?? "/admin/profile";

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* ── Header / Logo ── */}
      <div className="flex flex-col items-start gap-2 px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="ASAC Logo" className="h-8 w-8 rounded" />
          <span className="text-base font-bold tracking-tight">ASAC</span>
        </div>
        <Badge variant="secondary" className="text-xs font-normal">
          {ROLE_LABELS[role] ?? role}
        </Badge>
      </div>

      {/* ── Navigation Items ── */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.route}
              label={item.label}
              icon={item.icon}
              route={item.route}
              disabled={item.disabled}
              exact={item.exact}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* ── User Footer (DropdownMenu) ── */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/50"
              id="sidebar-user-menu"
            >
              <UserCircle className="h-5 w-5 shrink-0 text-sidebar-foreground/70" />
              <span className="truncate text-left flex-1 text-sidebar-foreground/80" title={user?.email}>
                {user?.email}
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-foreground/40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem
              onClick={() => navigate(profileRoute)}
              className="cursor-pointer"
              id="menu-profile"
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
              id="menu-sign-out"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

