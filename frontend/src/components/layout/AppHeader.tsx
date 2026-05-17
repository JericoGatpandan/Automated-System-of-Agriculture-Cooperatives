import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { API_URL } from "../../lib/api";

interface Notification {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface AppHeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function AppHeader({
  isSidebarCollapsed,
  onToggleSidebar,
}: AppHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Map roles to their profile routes
  const profileRoutes: Record<string, string> = {
    Admin: "/admin/profile",
    Officer: "/coop/profile",
    Farmer: "/farmer/profile",
  };
  const profileRoute = profileRoutes[user?.role || "Admin"] || "/admin/profile";

  const settingsRoutes: Record<string, string> = {
    Admin: "/admin/settings",
    Officer: "/coop/settings",
    Farmer: "/farmer/settings",
  };
  const settingsRoute =
    settingsRoutes[user?.role || "Admin"] || "/admin/settings";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("asac_token");
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    if (user) {
      fetchNotifications();
      // Optional: Polling every 60 seconds
      const intervalId = setInterval(fetchNotifications, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const markAsReadAndNavigate = async (notif: Notification) => {
    try {
      const token = localStorage.getItem("asac_token");
      await axios.put(
        `${API_URL}/api/notifications/${notif.id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Remove from UI
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));

      // Navigate based on type
      if (notif.type === "partnership_request") navigate("/admin/requests");
      else if (notif.type === "delivery_confirmation")
        navigate("/admin/deliveries");
      else if (notif.type === "coop_assignment") navigate("/coop/assignments");
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const navigateToAllNotifications = () => {
    if (user?.role === "Admin") navigate("/admin/requests");
    else if (user?.role === "Officer") navigate("/coop/assignments");
  };

  return (
    <header className="app-header sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background pr-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSidebar}
          className="bg-card"
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isSidebarCollapsed ? (
            <ChevronRight data-icon="inline-start" />
          ) : (
            <ChevronLeft data-icon="inline-start" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full border-2 border-background"
                >
                  {notifications.length > 99 ? "99+" : notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-normal flex justify-between items-center">
              <span className="font-semibold">Notifications</span>
              <span className="text-xs text-muted-foreground">
                {notifications.length} unread
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <ScrollArea className="h-max-[300px] overflow-y-auto max-h-[60vh]">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className="flex flex-col items-start p-3 cursor-pointer gap-1 focus:bg-accent focus:text-accent-foreground"
                      onClick={() => markAsReadAndNavigate(notif)}
                    >
                      <span className="text-sm font-medium">
                        {notif.message}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleDateString()}{" "}
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </ScrollArea>

            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="w-full text-center text-primary font-medium cursor-pointer justify-center py-3"
                  onClick={navigateToAllNotifications}
                >
                  View Activity
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-1"></div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 hover:bg-accent/50">
              {user?.profilePicture ? (
                <img
                  src={`${API_URL}${user.profilePicture}`}
                  alt="Profile"
                  className="h-7 w-7 rounded-full object-cover border border-border"
                />
              ) : (
                <img
                  src="/empty-profile.svg"
                  alt="Default profile"
                  className="h-7 w-7 rounded-full object-cover"
                />
              )}
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-sm font-medium leading-none">
                  {user?.email?.split("@")[0] || "User"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {user?.role}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.role} Account
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate(profileRoute)}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate(settingsRoute)}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
