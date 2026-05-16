import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  getStoredTheme,
  setStoredTheme,
  type ThemeMode,
} from "../../lib/theme";

export function SettingsPage() {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme());

  useEffect(() => {
    setStoredTheme(theme);
  }, [theme]);

  return (
    <div className="ml-64 min-h-screen bg-canvas-50/50">
      <div className="w-full mx-auto px-6 py-8">
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your workspace preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="appearance-theme">Theme</Label>
              <Select
                value={theme}
                onValueChange={(value) => setTheme(value as ThemeMode)}
              >
                <SelectTrigger id="appearance-theme">
                  <SelectValue placeholder="Choose theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Theme preference applies to all signed-in sessions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
