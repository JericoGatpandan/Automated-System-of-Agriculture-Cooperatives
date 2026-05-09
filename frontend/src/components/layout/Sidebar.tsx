import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SidebarNavItem } from "./SidebarNavItem";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

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
} from "lucide-react";

import logoImg from "../../assets/logo.png";

// ── Role label mapping ──
const ROLE_LABELS: Record<string, string> = {
  Admin: "FACCS Admin",
  Officer: "Cooperative Officer",
  Farmer: "Farmer",
};

// ── Navigation config per role (from 06-sidebar-navigation.md) ──
const ADMIN_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, route: "/admin", exact: true },
  { label: "Cooperative Registry", icon: Building2, route: "/admin/cooperatives" },
  { label: "Farmer Registry", icon: Users, route: "/admin/farmers", disabled: true },
  { label: "Order Management", icon: ShoppingCart, route: "/admin/orders", disabled: true },
  { label: "Deliveries", icon: Truck, route: "/admin/deliveries", disabled: true },
  { label: "Federation Overview", icon: BarChart3, route: "/admin/overview", disabled: true },
];

const OFFICER_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, route: "/coop", exact: true },
  { label: "Farmer Registry", icon: Users, route: "/coop/farmers", disabled: true },
  { label: "Assignments", icon: ClipboardList, route: "/coop/assignments", disabled: true },
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

      {/* ── User Footer ── */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="mb-3">
          <p className="text-xs text-sidebar-foreground/60 truncate" title={user?.email}>
            {user?.email}
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleSignOut}
          id="sidebar-sign-out"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
