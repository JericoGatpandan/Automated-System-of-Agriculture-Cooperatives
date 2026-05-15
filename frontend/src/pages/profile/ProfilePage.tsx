import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";

import {
  AlertTriangle,
  Building2,
  Calendar,
  Hash,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sprout,
  Trash2,
  UserCircle,
} from "lucide-react";

const API_BASE = "http://localhost:8800/api/profile";

interface ProfileOrganization {
  type: "cooperative" | "farmer";
  // Officer
  primaryCoopID?: number;
  coopName?: string;
  barangay?: string;
  municipality?: string;
  phone?: string;
  registrationNumber?: string;
  // Farmer
  farmerID?: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffixName?: string;
  farmName?: string;
  municipality?: string;
  barangay?: string;
  cooperatives?: { coopName: string; status: string; joinedDate: string }[];
}

interface Profile {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  organization: ProfileOrganization | null;
}

export function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Change password dialog ──
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Deactivate dialog ──
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch profile ──
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_BASE);
      setProfile(res.data.profile);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ── Change password handler ──
  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);

    try {
      const res = await axios.put(`${API_BASE}/password`, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess(res.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.message || "Failed to change password",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Deactivate handler ──
  const handleDeactivate = async () => {
    setDeleteError("");
    setDeleteLoading(true);

    try {
      await axios.delete(API_BASE, { data: { password: deletePassword } });
      setDeleteOpen(false);
      logout();
      navigate("/login");
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.message || "Failed to deactivate account",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Role display labels ──
  const ROLE_LABELS: Record<string, string> = {
    Admin: "FACCS Admin",
    Officer: "Cooperative Officer",
    Farmer: "Farmer",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                {error || "Profile not found"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={fetchProfile}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const org = profile.organization;

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="w-full mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <UserCircle className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ── Section 1: Account Information ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
              <CardDescription>Your login credentials and role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{profile.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    {ROLE_LABELS[profile.role] ?? profile.role}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {new Date(profile.createdAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Section 2: Organization Information ── */}
          {org && org.type === "cooperative" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Cooperative Information
                </CardTitle>
                <CardDescription>
                  Your assigned cooperative details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Cooperative Name
                    </p>
                    <p className="text-sm font-medium">{org.coopName}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">
                      {org.barangay}, {org.municipality}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{org.phone || "—"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      CDA Registration #
                    </p>
                    <p className="text-sm font-mono">
                      {org.registrationNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {org && org.type === "farmer" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Farm Information</CardTitle>
                <CardDescription>
                  Your personal and farm details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="text-sm font-medium">
                      {[
                        org.firstName,
                        org.middleName,
                        org.lastName,
                        org.suffixName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Sprout className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Farm Name</p>
                    <p className="text-sm font-medium">{org.farmName || "—"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Farm Location
                    </p>
                    <p className="text-sm font-medium">
                      {org.municipality && org.barangay
                        ? `${org.barangay}, ${org.municipality}`
                        : "—"}
                    </p>
                  </div>
                </div>
                {org.cooperatives && org.cooperatives.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Cooperative Memberships
                        </p>
                        <div className="space-y-1.5">
                          {org.cooperatives.map((c, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {c.coopName}
                              </span>
                              <Badge
                                variant={
                                  c.status === "active"
                                    ? "outline"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {c.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Section 3: Account Actions ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Actions</CardTitle>
              <CardDescription>
                Security settings and account management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  setPasswordError("");
                  setPasswordSuccess("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordOpen(true);
                }}
                id="change-password-btn"
              >
                <KeyRound className="h-4 w-4" />
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => {
                  setDeleteError("");
                  setDeletePassword("");
                  setDeleteOpen(true);
                }}
                id="deactivate-account-btn"
              >
                <Trash2 className="h-4 w-4" />
                Deactivate Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Change Password Dialog ── */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentPassword(e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-600">{passwordSuccess}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordOpen(false)}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing…
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate Account Dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Deactivate Account</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              This will deactivate your account and log you out. Enter your
              password to confirm. This action can be reversed by a system
              administrator.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="delete-password">Confirm Password</Label>
              <Input
                id="delete-password"
                type="password"
                placeholder="Enter your current password"
                value={deletePassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDeletePassword(e.target.value)
                }
              />
            </div>

            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deleteLoading}
              id="confirm-deactivate-btn"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deactivating…
                </>
              ) : (
                "Deactivate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
