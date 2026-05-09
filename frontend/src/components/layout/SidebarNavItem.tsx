import { useLocation, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  label: string;
  icon: LucideIcon;
  route: string;
  disabled?: boolean;
  /** If true, match only the exact route (not prefix) */
  exact?: boolean;
}

export function SidebarNavItem({
  label,
  icon: Icon,
  route,
  disabled = false,
  exact = false,
}: SidebarNavItemProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = exact
    ? location.pathname === route
    : location.pathname === route || location.pathname.startsWith(route + "/");

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              "text-sidebar-foreground/40 cursor-not-allowed opacity-50"
            )}
            disabled
            id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Coming soon</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
      onClick={() => navigate(route)}
      id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
