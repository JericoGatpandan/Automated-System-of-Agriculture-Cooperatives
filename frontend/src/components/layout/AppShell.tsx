import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "../ui/sheet";
import { Menu } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile Hamburger + Sheet ── */}
      <div className="md:hidden fixed top-0 left-0 z-40 p-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(true)}
          id="mobile-menu-toggle"
          className="bg-card shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div onClick={() => setMobileOpen(false)}>
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
