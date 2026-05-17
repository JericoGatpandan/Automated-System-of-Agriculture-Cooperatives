import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Progress } from "../../components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { ScrollArea } from "../../components/ui/scroll-area";

import { API_URL } from "../../lib/api";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  Loader2, Package,
  Pencil,
  Plus, ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

const API = `${API_URL}/api/orders`;
const ASSIGN_API = `${API_URL}/api/assignments`;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-500/50",
  assigned: "bg-blue-50 text-blue-700 border-blue-500/50",
  inProgress: "bg-indigo-50 text-indigo-700 border-indigo-500/50",
  consolidated: "bg-green-50 text-green-700 border-green-500/50",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-500/50",
  cancelled: "bg-gray-50 text-gray-500 border-gray-300",
  matched: "bg-blue-50 text-blue-700 border-blue-500/50",
  ready: "bg-green-50 text-green-700 border-green-500/50",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface AvailableCoop {
  primaryCoopID: number;
  coopName: string;
  hasCrop: boolean;
  totalAvailableQuantity: number;
  farmerCount: number;
}

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Assign coop dialog — multi-step
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignStep, setAssignStep] = useState<1 | 2>(1);
  const [availableCoops, setAvailableCoops] = useState<AvailableCoop[]>([]);
  const [coopsLoading, setCoopsLoading] = useState(false);
  const [selectedCoop, setSelectedCoop] = useState<AvailableCoop | null>(null);
  const [assignQty, setAssignQty] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");

  // Cancel dialog
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Remove assignment dialog
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/${id}`);
      setOrder(res.data.order);
    } catch (err: any) {
      if (err.response?.status === 401) { logout(); navigate("/login"); return; }
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id, logout, navigate]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const totalAssigned = order?.CoopAssignments?.reduce((s: number, a: any) => s + a.quantityRequired, 0) || 0;
  const remaining = (order?.requestedQuantity || 0) - totalAssigned;
  const pct = order?.requestedQuantity ? Math.min(100, Math.round((totalAssigned / order.requestedQuantity) * 100)) : 0;

  // Open assign dialog — fetch available coops with inventory context
  const openAssignDialog = async () => {
    setAssignError("");
    setSelectedCoop(null);
    setAssignQty("");
    setAssignStep(1);
    setCoopsLoading(true);
    setAssignOpen(true);
    try {
      const res = await axios.get(`${API}/${id}/available-coops`);
      setAvailableCoops(res.data.cooperatives || []);
    } catch {
      setAvailableCoops([]);
    } finally {
      setCoopsLoading(false);
    }
  };

  // Step 1 → Step 2: select a cooperative
  const selectCoop = (coop: AvailableCoop) => {
    setSelectedCoop(coop);
    // Pre-fill quantity: min of remaining and available
    const prefill = Math.min(remaining, coop.totalAvailableQuantity || remaining);
    setAssignQty(String(prefill > 0 ? prefill : ""));
    setAssignError("");
    setAssignStep(2);
  };

  const handleAssign = async () => {
    if (!selectedCoop) return;
    setAssignError("");
    setAssignLoading(true);
    try {
      await axios.post(ASSIGN_API, {
        orderID: parseInt(id!),
        primaryCoopID: selectedCoop.primaryCoopID,
        quantityRequired: parseInt(assignQty),
      });
      setAssignOpen(false);
      await fetchOrder();
    } catch (err: any) {
      setAssignError(err.response?.data?.message || "Failed to assign");
    } finally {
      setAssignLoading(false);
    }
  };

  // Cancel order
  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await axios.put(`${API}/${id}/cancel`);
      setCancelOpen(false);
      await fetchOrder();
    } catch { /* ignore */ } finally { setCancelLoading(false); }
  };

  // Remove assignment
  const handleRemove = async () => {
    setRemoveError("");
    setRemoveLoading(true);
    try {
      await axios.delete(`${ASSIGN_API}/${removeTarget.assignmentID}`);
      setRemoveOpen(false);
      setRemoveTarget(null);
      await fetchOrder();
    } catch (err: any) {
      setRemoveError(err.response?.data?.message || "Failed to remove");
    } finally {
      setRemoveLoading(false);
    }
  };

  const qtyExceedsAvailable = selectedCoop && parseInt(assignQty) > selectedCoop.totalAvailableQuantity;

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }

  if (error || !order) {
    return <div className="min-h-screen bg-background"><div className="max-w-4xl mx-auto px-6 py-8">
      <Card className="border-destructive/50"><CardContent className="pt-6">
        <p className="text-sm text-destructive">{error || "Order not found"}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/admin/orders")}>Back</Button>
      </CardContent></Card>
    </div></div>;
  }

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="w-full mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/orders")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <ShoppingCart className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">ORD-{order.orderID}</h1>
              <p className="text-sm text-muted-foreground">{order.buyerName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/orders/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1" />Edit
            </Button>
            {order.status !== "cancelled" && order.status !== "completed" && (
              <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>Cancel Order</Button>
            )}
          </div>
        </div>

        {/* Section A: Order Info */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Order Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
              <div><p className="text-xs text-muted-foreground">Buyer</p><p className="font-medium">{order.buyerName}</p></div>
              <div><p className="text-xs text-muted-foreground">Company</p><p className="font-medium">{order.buyerCompany || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Contact</p><p className="font-medium">{order.buyerContact}</p></div>
              <div><p className="text-xs text-muted-foreground">Crop</p><p className="font-medium">{order.CropType?.cropName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Quantity</p><p className="font-medium font-mono">{order.requestedQuantity.toLocaleString()} kg</p></div>
              <div><p className="text-xs text-muted-foreground">Urgency</p>
                <Badge variant="outline" className={order.urgencyLevel === "high" ? "bg-red-50 text-red-700 border-red-500/50" : "bg-blue-50 text-blue-700 border-blue-500/50"}>
                  {order.urgencyLevel}
                </Badge>
              </div>
              <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{fmtDate(order.orderDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p>
                <Badge variant="outline" className={STATUS_COLORS[order.status] || ""}>{order.status}</Badge>
              </div>
              {order.notes && <div className="col-span-full"><p className="text-xs text-muted-foreground">Notes</p><p className="font-medium">{order.notes}</p></div>}
            </div>
          </CardContent>
        </Card>

        {/* Section B: Assignments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Cooperative Assignments</CardTitle>
                <CardDescription className="mt-1">{order.CoopAssignments?.length || 0} cooperative{(order.CoopAssignments?.length || 0) !== 1 ? "s" : ""} assigned</CardDescription>
              </div>
              {order.status !== "cancelled" && order.status !== "completed" && (
                <Button size="sm" onClick={openAssignDialog} id="assign-coop-btn">
                  <Plus className="h-4 w-4 mr-1" />Assign Cooperative
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Qty summary bar */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Requested:</span>
                <span className="font-mono font-medium">{order.requestedQuantity.toLocaleString()}</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Assigned:</span>
              <span className="font-mono font-medium">{totalAssigned.toLocaleString()}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Remaining:</span>
              <span className={`font-mono font-medium ${remaining > 0 ? "text-yellow-700" : "text-green-700"}`}>{remaining.toLocaleString()}</span>
            </div>
            <Progress value={pct} className="mb-4 h-2" />

            {/* Assignments table */}
            {order.CoopAssignments?.length > 0 ? (
              <div className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="font-semibold text-muted-foreground">Cooperative</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">Qty Required</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Assigned</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-center">Status</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.CoopAssignments.map((a: any) => (
                      <TableRow key={a.assignmentID}>
                        <TableCell className="py-4 font-semibold">{a.PrimaryCooperative?.coopName || "—"}</TableCell>
                        <TableCell className="py-4 text-right font-mono">{a.quantityRequired.toLocaleString()}</TableCell>
                        <TableCell className="py-4">{fmtDate(a.assignedDate)}</TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge variant="outline" className={STATUS_COLORS[a.status] || ""}>{a.status}</Badge>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                            onClick={() => { setRemoveTarget(a); setRemoveError(""); setRemoveOpen(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No cooperatives assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Multi-Step Assign Cooperative Dialog                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Dialog open={assignOpen} onOpenChange={(open) => { if (!open) setAssignOpen(false); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {assignStep === 1 ? "Select Cooperative" : "Set Quantity & Confirm"}
            </DialogTitle>
            <DialogDescription>
              {assignStep === 1
                ? `Select a cooperative to fulfill ${order?.CropType?.cropName || "this crop"} — showing inventory availability.`
                : `Confirm assignment to ${selectedCoop?.coopName}.`
              }
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Cooperative list with inventory context */}
          {assignStep === 1 && (
            <div className="flex-1 min-h-0">
              {coopsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading cooperatives…</span>
                </div>
              ) : availableCoops.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">No cooperatives found</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[50vh]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableHead className="font-semibold text-muted-foreground">Cooperative</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-center">Crop Match</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-right">Available Qty</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-right">Active Farmers</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableCoops.map((coop) => (
                        <TableRow
                          key={coop.primaryCoopID}
                          className={`cursor-pointer transition-colors ${!coop.hasCrop ? "opacity-50" : "hover:bg-accent/50"}`}
                          onClick={() => selectCoop(coop)}
                        >
                          <TableCell className="py-3 font-semibold">{coop.coopName}</TableCell>
                          <TableCell className="py-3 text-center">
                            {coop.hasCrop ? (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <Check className="h-4 w-4" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <X className="h-4 w-4" /> No
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-3 text-right font-mono">
                            {coop.totalAvailableQuantity.toLocaleString()} kg
                          </TableCell>
                          <TableCell className="py-3 text-right font-mono">
                            {coop.farmerCount}
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); selectCoop(coop); }}>
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Step 2: Quantity & Confirm */}
          {assignStep === 2 && selectedCoop && (
            <div className="grid gap-4">
              {/* Selected coop summary */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Cooperative</p>
                    <p className="font-semibold">{selectedCoop.coopName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Available Stock</p>
                    <p className="font-mono font-medium">{selectedCoop.totalAvailableQuantity.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Farmers</p>
                    <p className="font-mono font-medium">{selectedCoop.farmerCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining Unassigned</p>
                    <p className="font-mono font-medium">{remaining.toLocaleString()} kg</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assignQty">Quantity Required (kg)</Label>
                <Input id="assignQty" type="number" min="1" value={assignQty}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssignQty(e.target.value)} />
              </div>

              {/* Warning if quantity exceeds available */}
              {qtyExceedsAvailable && (
                <div className="flex items-center gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
                  <p className="text-sm text-yellow-700">
                    Quantity exceeds the cooperative's available stock ({selectedCoop.totalAvailableQuantity.toLocaleString()} kg).
                  </p>
                </div>
              )}

              {assignError && <p className="text-sm text-destructive">{assignError}</p>}
            </div>
          )}

          <DialogFooter>
            {assignStep === 2 && (
              <Button variant="outline" onClick={() => setAssignStep(1)} disabled={assignLoading} className="mr-auto">
                Back
              </Button>
            )}
            <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={assignLoading}>Cancel</Button>
            {assignStep === 2 && (
              <Button onClick={handleAssign} disabled={assignLoading || !assignQty || parseInt(assignQty) <= 0}>
                {assignLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Assigning…</> : "Assign"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Cancel Order</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to cancel <strong>ORD-{order.orderID}</strong>? Existing assignments will remain but cannot progress.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={cancelLoading}>Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelLoading}>
              {cancelLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cancelling…</> : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Assignment Dialog */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Remove Assignment</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Remove <strong>{removeTarget?.PrimaryCooperative?.coopName}</strong> from order <strong>ORD-{order.orderID}</strong>?
            </DialogDescription>
          </DialogHeader>
          {removeError && <p className="text-sm text-destructive">{removeError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)} disabled={removeLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removeLoading}>
              {removeLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Removing…</> : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
