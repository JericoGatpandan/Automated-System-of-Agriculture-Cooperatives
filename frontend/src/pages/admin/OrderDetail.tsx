import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";

import {
  ChevronLeft, Pencil, AlertTriangle, Trash2, Plus, ShoppingCart, Loader2, Package,
} from "lucide-react";

const API = "http://localhost:8800/api/orders";
const ASSIGN_API = "http://localhost:8800/api/assignments";
const COOP_API = "http://localhost:8800/api/cooperatives";

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

interface Coop { primaryCoopID: number; coopName: string; }

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Assign coop dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [coops, setCoops] = useState<Coop[]>([]);
  const [selectedCoop, setSelectedCoop] = useState("");
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

  // Assign cooperative
  const openAssignDialog = async () => {
    setAssignError("");
    setSelectedCoop("");
    setAssignQty("");
    try {
      const res = await axios.get(COOP_API);
      setCoops(res.data.cooperatives || []);
    } catch { /* ignore */ }
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    setAssignError("");
    setAssignLoading(true);
    try {
      await axios.post(ASSIGN_API, {
        orderID: parseInt(id!),
        primaryCoopID: parseInt(selectedCoop),
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
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

      {/* Assign Cooperative Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Cooperative</DialogTitle>
            <DialogDescription>Select a cooperative and specify the quantity to assign.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Cooperative</Label>
              <Select value={selectedCoop} onValueChange={setSelectedCoop}>
                <SelectTrigger><SelectValue placeholder="Select cooperative" /></SelectTrigger>
                <SelectContent>
                  {coops.map((c) => (
                    <SelectItem key={c.primaryCoopID} value={String(c.primaryCoopID)}>{c.coopName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignQty">Quantity Required (kg)</Label>
              <Input id="assignQty" type="number" min="1" value={assignQty}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssignQty(e.target.value)} />
            </div>
            {assignError && <p className="text-sm text-destructive">{assignError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={assignLoading}>Cancel</Button>
            <Button onClick={handleAssign} disabled={assignLoading || !selectedCoop || !assignQty}>
              {assignLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Assigning…</> : "Assign"}
            </Button>
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
