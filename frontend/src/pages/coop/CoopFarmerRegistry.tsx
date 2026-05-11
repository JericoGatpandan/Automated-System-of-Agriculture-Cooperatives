import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import {
  Users,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  Loader2,
  MoreVertical,
} from "lucide-react";

const API = "http://localhost:8800/api/farmers";

interface FarmerRow {
  farmerID: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffixName: string | null;
  farmName: string | null;
  farmLocation: string;
  isDeleted: boolean;
  User?: { email: string };
  FarmerCooperatives?: {
    joinedDate: string;
    status: string;
    PrimaryCooperative?: { coopName: string };
  }[];
  Products?: {
    CropType?: { cropName: string };
    unitPrice: number;
  }[];
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function farmerDisplayName(f: FarmerRow) {
  const parts = [f.lastName, ",", f.firstName];
  if (f.middleName) parts.push(f.middleName);
  if (f.suffixName) parts.push(f.suffixName);
  return parts.join(" ").replace(" ,", ",");
}

export function CoopFarmerRegistry() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState<FarmerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteFarmer, setDeleteFarmer] = useState<FarmerRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bulk delete dialog
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const fetchFarmers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/my-coop`);
      setFarmers(res.data.farmers);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load farmers");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  const filtered = farmers.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.firstName.toLowerCase().includes(q) ||
      f.lastName.toLowerCase().includes(q) ||
      (f.farmName || "").toLowerCase().includes(q) ||
      f.farmLocation.toLowerCase().includes(q)
    );
  });

  // Selection helpers
  const allSelected =
    filtered.length > 0 && filtered.every((f) => selected.has(f.farmerID));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((f) => f.farmerID)));
  };
  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  // Single delete
  const handleDelete = async () => {
    if (!deleteFarmer) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/${deleteFarmer.farmerID}`);
      setDeleteOpen(false);
      setDeleteFarmer(null);
      setSelected((s) => {
        const n = new Set(s);
        n.delete(deleteFarmer.farmerID);
        return n;
      });
      await fetchFarmers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to deactivate farmer");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      await axios.post(`${API}/bulk-delete`, {
        farmerIDs: Array.from(selected),
      });
      setBulkDeleteOpen(false);
      setSelected(new Set());
      await fetchFarmers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to deactivate farmers");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Farmer Registry
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage farmer memberships in your cooperative
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-farmers"
              placeholder="Search by name, farm, or location…"
              className="pl-9 h-10 text-sm"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />
          </div>
          <Button
            onClick={() => navigate("/coop/farmers/new")}
            id="register-farmer-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Register Farmer
          </Button>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-4 mb-4 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-sm font-medium">
              {selected.size} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              id="bulk-deactivate-btn"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Deactivate Selected
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={fetchFarmers}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading farmers…</p>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {!loading && !error && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Registered Farmers</CardTitle>
              <CardDescription>
                {filtered.length} of {farmers.length} farmer
                {farmers.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    {search
                      ? "No farmers match your search"
                      : "No farmers registered yet"}
                  </p>
                  {!search && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/coop/farmers/new")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Register your first farmer
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleAll}
                          id="select-all"
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground">
                        Farmer Name
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground">
                        Farm
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground">
                        Location
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground">
                        Crops
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground">
                        Joined
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-center">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((f) => {
                      const isSelected = selected.has(f.farmerID);
                      const membership = f.FarmerCooperatives?.[0];
                      const crops =
                        f.Products?.map((p) => p.CropType?.cropName)
                          .filter(Boolean)
                          .join(", ") || "—";

                      return (
                        <TableRow
                          key={f.farmerID}
                          className={isSelected ? "bg-primary/5" : ""}
                        >
                          <TableCell className="py-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleOne(f.farmerID)}
                              id={`select-farmer-${f.farmerID}`}
                            />
                          </TableCell>
                          <TableCell className="py-4 font-semibold">
                            {farmerDisplayName(f)}
                          </TableCell>
                          <TableCell className="py-4">
                            {f.farmName || "—"}
                          </TableCell>
                          <TableCell className="py-4">
                            {f.farmLocation}
                          </TableCell>
                          <TableCell className="py-4">{crops}</TableCell>
                          <TableCell className="py-4">
                            {membership ? fmtDate(membership.joinedDate) : "—"}
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <Badge
                              variant="outline"
                              className={
                                membership?.status === "active"
                                  ? "border-green-500/50 text-green-700 bg-green-50"
                                  : "border-gray-300 text-gray-500 bg-gray-50"
                              }
                            >
                              {membership?.status || "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  id={`actions-menu-${f.farmerID}`}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/coop/farmers/${f.farmerID}`)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/coop/farmers/${f.farmerID}/edit`)
                                  }
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDeleteFarmer(f);
                                    setDeleteOpen(true);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Single delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Deactivate Farmer</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to deactivate{" "}
              <strong>
                {deleteFarmer ? farmerDisplayName(deleteFarmer) : ""}
              </strong>
              ? This will deactivate the farmer account and their login
              credentials.
            </DialogDescription>
          </DialogHeader>
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
              onClick={handleDelete}
              disabled={deleteLoading}
              id="confirm-delete-farmer"
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

      {/* Bulk delete dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>
                Deactivate {selected.size} Farmer
                {selected.size !== 1 ? "s" : ""}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to deactivate{" "}
              <strong>
                {selected.size} farmer{selected.size !== 1 ? "s" : ""}
              </strong>
              ? This will deactivate their accounts and login credentials.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
              disabled={bulkDeleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              id="confirm-bulk-delete"
            >
              {bulkDeleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deactivating…
                </>
              ) : (
                "Deactivate All"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
