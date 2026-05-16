import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  label: string;
  icon: LucideIcon;
  route: string;
  disabled?: boolean;
  /** If true, match only the exact route (not prefix) */
  exact?: boolean;
  children?: { label: string; route: string }[];
}

export function SidebarNavItem({
  label,
  icon: Icon,
  route,
  disabled = false,
  exact = false,
  children,
}: SidebarNavItemProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isMainActive = exact
    ? location.pathname === route
    : location.pathname === route || (children ? false : location.pathname.startsWith(route + "/"));

  const isChildActive = (childRoute: string) => location.pathname === childRoute || location.pathname.startsWith(childRoute + "/");
  const hasActiveChild = children?.some(child => isChildActive(child.route)) || false;
  
  // Auto-expand if a child is active
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  // Keep it open if navigating directly to a child from outside
  useEffect(() => {
    if (hasActiveChild && !isOpen) {
      setIsOpen(true);
    }
  }, [hasActiveChild, isOpen]);

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
    <div className="flex flex-col gap-1">
      <button
        className={cn(
          "flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm font-medium transition-colors",
          isMainActive && !hasActiveChild
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
        onClick={() => {
          if (children) {
            setIsOpen(!isOpen);
          } else {
            navigate(route);
          }
        }}
        id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 shrink-0" />
          <span className="truncate">{label}</span>
        </div>
        {children && (
          isOpen ? <ChevronDown className="h-4 w-4 shrink-0 opacity-70" /> : <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
        )}
      </button>

      {/* Render Sub-items */}
      {children && isOpen && (
        <div className="flex flex-col gap-1 pl-9 pr-2">
          <button
            className={cn(
              "flex w-full items-center rounded-sm px-3 py-1.5 text-xs transition-colors",
              isMainActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
            )}
            onClick={() => navigate(route)}
          >
            Overview
          </button>
          {children.map((child) => {
            const active = isChildActive(child.route);
            return (
              <button
                key={child.route}
                className={cn(
                  "flex w-full items-center rounded-sm px-3 py-1.5 text-xs transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                )}
                onClick={() => navigate(child.route)}
              >
                {child.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
