import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
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
  ChevronLeft, Plus, Trash2, AlertTriangle, Package, ClipboardList, Loader2,
} from "lucide-react";

const API = "http://localhost:8800/api/assignments";
const FARMER_API = "http://localhost:8800/api/farmers/my-coop";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-500/50",
  matched: "bg-blue-50 text-blue-700 border-blue-500/50",
  ready: "bg-green-50 text-green-700 border-green-500/50",
  assigned: "bg-yellow-50 text-yellow-700 border-yellow-500/50",
  confirmed: "bg-blue-50 text-blue-700 border-blue-500/50",
};

const FULFILLMENT_STATUSES = ["assigned", "confirmed", "ready"];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Assign farmer dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState("");
  const [commitQty, setCommitQty] = useState("");
  const [commitNotes, setCommitNotes] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");

  // Remove fulfillment dialog
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/${id}`);
      setAssignment(res.data.assignment);
    } catch (err: any) {
      if (err.response?.status === 401) { logout(); navigate("/login"); return; }
      setError(err.response?.data?.message || "Failed to load assignment");
    } finally {
      setLoading(false);
    }
  }, [id, logout, navigate]);

  useEffect(() => { fetchAssignment(); }, [fetchAssignment]);

  const totalCommitted = assignment?.FarmerFulfillments?.reduce((s: number, f: any) => s + f.quantityCommitted, 0) || 0;
  const remaining = (assignment?.quantityRequired || 0) - totalCommitted;
  const pct = assignment?.quantityRequired ? Math.min(100, Math.round((totalCommitted / assignment.quantityRequired) * 100)) : 0;

  // Open assign farmer dialog
  const openAssignFarmer = async () => {
    setAssignError("");
    setSelectedFarmer("");
    setCommitQty("");
    setCommitNotes("");
    try {
      const res = await axios.get(FARMER_API);
      setFarmers(res.data.farmers || []);
    } catch { /* ignore */ }
    setAssignOpen(true);
  };

  const handleAssignFarmer = async () => {
    setAssignError("");
    setAssignLoading(true);
    try {
      await axios.post(`${API}/${id}/fulfillments`, {
        farmerID: parseInt(selectedFarmer),
        quantityCommitted: parseInt(commitQty),
        notes: commitNotes || null,
      });
      setAssignOpen(false);
      await fetchAssignment();
    } catch (err: any) {
      setAssignError(err.response?.data?.message || "Failed to assign farmer");
    } finally {
      setAssignLoading(false);
    }
  };

  // Update fulfillment status
  const updateFulfillmentStatus = async (fulfillmentID: number, newStatus: string) => {
    try {
      await axios.put(`${API}/${id}/fulfillments/${fulfillmentID}`, { status: newStatus });
      await fetchAssignment();
    } catch { /* ignore */ }
  };

  // Remove fulfillment
  const handleRemove = async () => {
    setRemoveError("");
    setRemoveLoading(true);
    try {
      await axios.delete(`${API}/${id}/fulfillments/${removeTarget.fulfillmentID}`);
      setRemoveOpen(false);
      setRemoveTarget(null);
      await fetchAssignment();
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

  if (error || !assignment) {
    return <div className="min-h-screen bg-background"><div className="max-w-4xl mx-auto px-6 py-8">
      <Card className="border-destructive/50"><CardContent className="pt-6">
        <p className="text-sm text-destructive">{error || "Assignment not found"}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/coop/assignments")}>Back</Button>
      </CardContent></Card>
    </div></div>;
  }

  const order = assignment.BuyerOrder;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coop/assignments")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <ClipboardList className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">ORD-{order?.orderID || assignment.orderID}</h1>
            <p className="text-sm text-muted-foreground">{order?.buyerName || "—"} — {order?.CropType?.cropName || "—"}</p>
          </div>
        </div>

        {/* Section A: Assignment Info */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Assignment Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
              <div><p className="text-xs text-muted-foreground">Buyer</p><p className="font-medium">{order?.buyerName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Crop</p><p className="font-medium">{order?.CropType?.cropName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Qty Required</p><p className="font-medium font-mono">{assignment.quantityRequired?.toLocaleString()} kg</p></div>
              <div><p className="text-xs text-muted-foreground">Cooperative</p><p className="font-medium">{assignment.PrimaryCooperative?.coopName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Assigned</p><p className="font-medium">{fmtDate(assignment.assignedDate)}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p>
                <Badge variant="outline" className={STATUS_COLORS[assignment.status] || ""}>{assignment.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section B: Farmer Fulfillments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Farmer Fulfillments</CardTitle>
                <CardDescription className="mt-1">{assignment.FarmerFulfillments?.length || 0} farmer{(assignment.FarmerFulfillments?.length || 0) !== 1 ? "s" : ""} assigned</CardDescription>
              </div>
              <Button size="sm" onClick={openAssignFarmer} id="assign-farmer-btn">
                <Plus className="h-4 w-4 mr-1" />Assign Farmer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Qty summary */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Required:</span>
                <span className="font-mono font-medium">{assignment.quantityRequired?.toLocaleString()}</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Committed:</span>
              <span className="font-mono font-medium">{totalCommitted.toLocaleString()}</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Remaining:</span>
              <span className={`font-mono font-medium ${remaining > 0 ? "text-yellow-700" : "text-green-700"}`}>{remaining.toLocaleString()}</span>
            </div>
            <Progress value={pct} className="mb-4 h-2" />

            {assignment.FarmerFulfillments?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="font-semibold text-muted-foreground">Farmer</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Farm</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-right">Qty</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-center">Status</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Notes</TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignment.FarmerFulfillments.map((f: any) => (
                    <TableRow key={f.fulfillmentID}>
                      <TableCell className="py-4 font-semibold">
                        {f.Farmer?.lastName}, {f.Farmer?.firstName}
                      </TableCell>
                      <TableCell className="py-4">{f.Farmer?.farmName || "—"}</TableCell>
                      <TableCell className="py-4 text-right font-mono">{f.quantityCommitted?.toLocaleString()}</TableCell>
                      <TableCell className="py-4 text-center">
                        <Select value={f.status} onValueChange={(v: string) => updateFulfillmentStatus(f.fulfillmentID, v)}>
                          <SelectTrigger className="w-28 h-8">
                            <Badge variant="outline" className={STATUS_COLORS[f.status] || ""}>{f.status}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {FULFILLMENT_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-4 max-w-[150px] truncate" title={f.notes || ""}>{f.notes || "—"}</TableCell>
                      <TableCell className="py-4 text-right">
                        {f.status === "assigned" && (
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                            onClick={() => { setRemoveTarget(f); setRemoveError(""); setRemoveOpen(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No farmers assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign Farmer Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Farmer</DialogTitle>
            <DialogDescription>Select a farmer from your cooperative to fulfill this assignment.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Farmer</Label>
              <Select value={selectedFarmer} onValueChange={setSelectedFarmer}>
                <SelectTrigger><SelectValue placeholder="Select farmer" /></SelectTrigger>
                <SelectContent>
                  {farmers.map((f: any) => (
                    <SelectItem key={f.farmerID} value={String(f.farmerID)}>
                      {f.lastName}, {f.firstName} — {f.farmName || f.farmLocation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commitQty">Quantity (kg)</Label>
              <Input id="commitQty" type="number" min="1" value={commitQty}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommitQty(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commitNotes">Notes</Label>
              <Textarea id="commitNotes" value={commitNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommitNotes(e.target.value)}
                placeholder="Optional notes…" rows={2} />
            </div>
            {assignError && <p className="text-sm text-destructive">{assignError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={assignLoading}>Cancel</Button>
            <Button onClick={handleAssignFarmer} disabled={assignLoading || !selectedFarmer || !commitQty}>
              {assignLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Assigning…</> : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Fulfillment Dialog */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Remove Farmer</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Remove <strong>{removeTarget?.Farmer?.lastName}, {removeTarget?.Farmer?.firstName}</strong> from this assignment?
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
