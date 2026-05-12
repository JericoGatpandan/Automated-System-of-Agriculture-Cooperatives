import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { TablePaginationFooter } from "../../components/table-pagination-footer";
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
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  AlertTriangle,
  Building2,
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash,
  Trash2
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const API_BASE = "http://localhost:8800/api/cooperatives";

interface Cooperative {
  primaryCoopID: number;
  userID: number;
  coopName: string;
  barangay: string;
  municipality: string;
  phone: string | null;
  registrationNumber: string;
  isDeleted: boolean;
  createdAt: string;
  User?: {
    userID: number;
    email: string;
  };
}

interface CoopFormData {
  coopName: string;
  barangay: string;
  municipality: string;
  phone: string;
  registrationNumber: string;
  officerEmail: string;
  officerPassword: string;
}

const emptyForm: CoopFormData = {
  coopName: "",
  barangay: "",
  municipality: "",
  phone: "",
  registrationNumber: "",
  officerEmail: "",
  officerPassword: "",
};

export function CooperativeRegistry() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pageSize = 10;

  // ── State ──
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCoop, setSelectedCoop] = useState<Cooperative | null>(null);

  // Form state
  const [formData, setFormData] = useState<CoopFormData>(emptyForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // ── Fetch cooperatives ──
  const fetchCooperatives = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API_BASE);
      setCooperatives(res.data.cooperatives);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load cooperatives");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchCooperatives();
  }, [fetchCooperatives]);

  // ── Filtered list ──
  const filtered = cooperatives.filter(
    (c) =>
      c.coopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  // ── Create handler ──
  const handleCreate = async () => {
    setFormError("");
    setFormLoading(true);

    try {
      await axios.post(API_BASE, formData);
      setCreateOpen(false);
      setFormData(emptyForm);
      await fetchCooperatives();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || "Failed to create cooperative",
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ── Edit handler ──
  const handleEdit = async () => {
    if (!selectedCoop) return;
    setFormError("");
    setFormLoading(true);

    try {
      await axios.put(`${API_BASE}/${selectedCoop.primaryCoopID}`, {
        coopName: formData.coopName,
        barangay: formData.barangay,
        municipality: formData.municipality,
        phone: formData.phone,
        registrationNumber: formData.registrationNumber,
      });
      setEditOpen(false);
      setSelectedCoop(null);
      setFormData(emptyForm);
      await fetchCooperatives();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || "Failed to update cooperative",
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete handler ──
  const handleDelete = async () => {
    if (!selectedCoop) return;
    setFormLoading(true);

    try {
      await axios.delete(`${API_BASE}/${selectedCoop.primaryCoopID}`);
      setDeleteOpen(false);
      setSelectedCoop(null);
      await fetchCooperatives();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || "Failed to deactivate cooperative",
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ── Open edit dialog ──
  const openEdit = (coop: Cooperative) => {
    setSelectedCoop(coop);
    setFormData({
      coopName: coop.coopName,
      barangay: coop.barangay,
      municipality: coop.municipality,
      phone: coop.phone || "",
      registrationNumber: coop.registrationNumber,
      officerEmail: "",
      officerPassword: "",
    });
    setFormError("");
    setEditOpen(true);
  };

  // ── Open delete dialog ──
  const openDelete = (coop: Cooperative) => {
    setSelectedCoop(coop);
    setFormError("");
    setDeleteOpen(true);
  };

  // ── Open create dialog ──
  const openCreate = () => {
    setFormData(emptyForm);
    setFormError("");
    setCreateOpen(true);
  };

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      {/* ── Content ── */}
      <div className="mx-auto flex min-h-screen w-full flex-col px-6 py-8">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Cooperative Registry
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage federation cooperatives
            </p>
          </div>
        </div>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-cooperatives"
              placeholder="Search by name, municipality, or CDA number…"
              className="pl-9"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
          <Button onClick={openCreate} id="add-cooperative-btn">
            <Plus className="h-4 w-4 mr-2" />
            Add Cooperative
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive/50 mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={fetchCooperatives}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading cooperatives…</p>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {!loading && !error && (
          <Card className="flex min-h-0 flex-1 flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">
                    Registered Cooperatives
                  </CardTitle>
                  <CardDescription>
                    {filtered.length} of {cooperatives.length} cooperative
                    {cooperatives.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    {searchQuery
                      ? "No cooperatives match your search"
                      : "No cooperatives registered yet"}
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={openCreate}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add your first cooperative
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <ScrollArea className="min-h-0 flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 z-10 bg-muted hover:bg-muted">
                          <TableHead>Cooperative Name</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>CDA Registration</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Officer Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginated.map((coop) => (
                          <TableRow key={coop.primaryCoopID}>
                            <TableCell className="font-medium max-w-[250px]">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="truncate">
                                  {coop.coopName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                  {coop.barangay}, {coop.municipality}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-xs">
                                {coop.registrationNumber}
                              </span>
                            </TableCell>
                            <TableCell>
                              {coop.phone ? (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Phone className="h-3.5 w-3.5 shrink-0" />
                                  <span>{coop.phone}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {coop.User?.email || "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    id={`actions-menu-${coop.primaryCoopID}`}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => openEdit(coop)}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openDelete(coop)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 
                                    className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  <TablePaginationFooter
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalCount={filtered.length}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Register New Cooperative</DialogTitle>
            <DialogDescription>
              Create a new primary cooperative and its officer account.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="create-coopName">Cooperative Name *</Label>
              <Input
                id="create-coopName"
                placeholder="e.g. CamSur Multi-Purpose Cooperative (CMPC)"
                value={formData.coopName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, coopName: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-barangay">Barangay *</Label>
                <Input
                  id="create-barangay"
                  placeholder="e.g. Poblacion"
                  value={formData.barangay}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, barangay: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-municipality">Municipality *</Label>
                <Input
                  id="create-municipality"
                  placeholder="e.g. Pili"
                  value={formData.municipality}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, municipality: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-phone">Phone</Label>
                <Input
                  id="create-phone"
                  placeholder="e.g. 9171234567"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-regNumber">CDA Registration # *</Label>
                <Input
                  id="create-regNumber"
                  placeholder="e.g. CDA-9520-006"
                  value={formData.registrationNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      registrationNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-medium mb-3 text-muted-foreground">
                Cooperative Officer Account
              </p>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-officerEmail">Officer Email *</Label>
                  <Input
                    id="create-officerEmail"
                    type="email"
                    placeholder="e.g. officer@coop.ph"
                    value={formData.officerEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        officerEmail: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-officerPassword">
                    Officer Password *
                  </Label>
                  <Input
                    id="create-officerPassword"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formData.officerPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        officerPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Cooperative"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Cooperative</DialogTitle>
            <DialogDescription>
              Update details for {selectedCoop?.coopName}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-coopName">Cooperative Name</Label>
              <Input
                id="edit-coopName"
                value={formData.coopName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, coopName: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-barangay">Barangay</Label>
                <Input
                  id="edit-barangay"
                  value={formData.barangay}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, barangay: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-municipality">Municipality</Label>
                <Input
                  id="edit-municipality"
                  value={formData.municipality}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, municipality: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-regNumber">CDA Registration #</Label>
                <Input
                  id="edit-regNumber"
                  value={formData.registrationNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      registrationNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Deactivate Cooperative</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to deactivate{" "}
              <strong>{selectedCoop?.coopName}</strong>? This will also
              deactivate the linked officer account. This action can be reversed
              by a database administrator.
            </DialogDescription>
          </DialogHeader>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={formLoading}
              id="confirm-delete-btn"
            >
              {formLoading ? (
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
