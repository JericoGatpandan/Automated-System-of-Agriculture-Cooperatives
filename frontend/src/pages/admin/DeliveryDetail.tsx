import { format, parseISO } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/button";
import { DatePicker } from "../../components/ui/date-picker";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ScrollArea } from "../../components/ui/scroll-area";
import { TablePaginationFooter } from "../../components/table-pagination-footer";

import { API_URL } from "../../lib/api";
import {
  ChevronLeft,
  Pencil,
  Truck,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";

const API = `${API_URL}/api/deliveries`;
const ORDER_API = `${API_URL}/api/orders`;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-500/50",
  delivered: "bg-green-50 text-green-700 border-green-500/50",
  cancelled: "bg-gray-50 text-gray-500 border-gray-300",
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtPHP(amount: string | number) {
  const value = Number(amount);
  return `PHP ${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(rate: string | number) {
  return `${(parseFloat(String(rate)) * 100).toFixed(0)}%`;
}

export function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const pageSize = 10;

  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fulfillingCount, setFulfillingCount] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Mark delivered dialog
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [deliverLoading, setDeliverLoading] = useState(false);
  const [deliverResult, setDeliverResult] = useState("");

  // Cancel dialog
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchDelivery = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/${id}`);
      setDelivery(res.data.delivery);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load delivery");
    } finally {
      setLoading(false);
    }
  }, [id, logout, navigate]);

  useEffect(() => {
    fetchDelivery();
  }, [fetchDelivery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [delivery?.deliveryID]);

  const salesRecords = delivery?.SalesRecords || [];
  const totalPages = Math.max(1, Math.ceil(salesRecords.length / pageSize));
  const paginatedSalesRecords = salesRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    if (!delivery?.orderID || delivery.status !== "pending") {
      setFulfillingCount(null);
      return;
    }

    (async () => {
      try {
        const res = await axios.get(`${ORDER_API}/${delivery.orderID}`);
        const assignments = res.data.order?.CoopAssignments || [];
        const farmerIDs = new Set<number>();

        assignments.forEach((assignment: any) => {
          (assignment.FarmerFulfillments || []).forEach((ff: any) => {
            if (["confirmed", "ready"].includes(ff.status)) {
              farmerIDs.add(ff.farmerID);
            }
          });
        });

        setFulfillingCount(farmerIDs.size);
      } catch (err: any) {
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
          return;
        }
        setFulfillingCount(0);
      }
    })();
  }, [delivery?.orderID, delivery?.status, logout, navigate]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  // Mark as delivered
  const handleDeliver = async () => {
    setDeliverLoading(true);
    setDeliverResult("");
    try {
      const res = await axios.put(`${API}/${id}/deliver`, { deliveryDate });
      setDeliverResult(res.data.message);
      setDeliverOpen(false);
      await fetchDelivery();
    } catch (err: any) {
      setDeliverResult(
        err.response?.data?.message || "Failed to mark as delivered",
      );
    } finally {
      setDeliverLoading(false);
    }
  };

  // Cancel
  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await axios.put(`${API}/${id}/cancel`);
      setCancelOpen(false);
      await fetchDelivery();
    } catch {
      /* ignore */
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-64 min-h-screen bg-gray-50/50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="ml-64 min-h-screen bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                {error || "Delivery not found"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate("/admin/deliveries")}
              >
                Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }



  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="w-full mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/deliveries")}
            >
              <ChevronLeft />
            </Button>
            <Truck className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">DEL-{delivery.deliveryID}</h1>
              <p className="text-sm text-muted-foreground">
                ORD-{delivery.orderID} — {delivery.BuyerOrder?.buyerName || "—"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {delivery.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/deliveries/${id}/edit`)}
                >
                  <Pencil data-icon="inline-start" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => setDeliverOpen(true)}
                  id="mark-delivered-btn"
                >
                  <Check data-icon="inline-start" />
                  Mark Delivered
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setCancelOpen(true)}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Success result */}
        {deliverResult && (
          <Card className="border-green-500/50 mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-green-700 font-medium">
                {deliverResult}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Section A: Delivery Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Delivery Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Order</p>
                <button
                  className="font-medium text-primary hover:underline"
                  onClick={() => navigate(`/admin/orders/${delivery.orderID}`)}
                >
                  ORD-{delivery.orderID}
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Buyer</p>
                <p className="font-medium">
                  {delivery.BuyerOrder?.buyerName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="font-medium">
                  {delivery.BuyerOrder?.buyerCompany || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Crop</p>
                <p className="font-medium">
                  {delivery.BuyerOrder?.CropType?.cropName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Consolidation Date
                </p>
                <p className="font-medium">
                  {fmtDate(delivery.consolidationDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivery Date</p>
                <p className="font-medium">{fmtDate(delivery.deliveryDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-medium font-mono">
                  {fmtPHP(delivery.totalTransactionAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Federation Rate</p>
                <p className="font-medium font-mono">
                  {fmtPct(delivery.commissionRateFederation)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Cooperative Rate
                </p>
                <p className="font-medium font-mono">
                  {fmtPct(delivery.commissionRateCoop)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className={STATUS_COLORS[delivery.status] || ""}
                >
                  {delivery.status}
                </Badge>
              </div>
              {delivery.notes && (
                <div className="col-span-full">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="font-medium">{delivery.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section B: Generated Sales Records (only when delivered) */}
        {delivery.status === "delivered" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Generated Sales Records
              </CardTitle>
              <CardDescription>
                {salesRecords.length} record
                {salesRecords.length !== 1 ? "s" : ""} generated from this
                delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
              <div className="flex min-h-0 flex-1 flex-col">
                {salesRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No sales records generated
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="min-h-0 flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 z-10 bg-muted hover:bg-muted">
                          <TableHead className="font-semibold text-muted-foreground">
                            Farmer
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Cooperative
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Gross
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Commission
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Net
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Date
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedSalesRecords.map((sr: any) => (
                          <TableRow key={sr.salesRecordID}>
                            <TableCell className="py-4 font-semibold">
                              {sr.FarmerAccount?.Farmer
                                ? `${sr.FarmerAccount.Farmer.lastName}, ${sr.FarmerAccount.Farmer.firstName}`
                                : "—"}
                            </TableCell>
                            <TableCell className="py-4">
                              {sr.FarmerAccount?.PrimaryCooperative?.coopName ||
                                "—"}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono">
                              {fmtPHP(sr.grossAmount)}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono">
                              {fmtPHP(sr.commissionAmount)}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono">
                              {fmtPHP(sr.netAmount)}
                            </TableCell>
                            <TableCell className="py-4">
                              {fmtDate(sr.transactionDate)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
                {salesRecords.length > 0 && (
                  <TablePaginationFooter
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalCount={salesRecords.length}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mark as Delivered Dialog */}
      <Dialog open={deliverOpen} onOpenChange={setDeliverOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Mark as Delivered</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Mark <strong>DEL-{delivery.deliveryID}</strong> as delivered? This
              will generate sales and fee records for all fulfilling farmers.
              <strong className="block mt-2">
                This action cannot be undone.
              </strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="deliveryDateInput">Delivery Date *</Label>
              <DatePicker
                id="deliveryDateInput"
                date={deliveryDate ? parseISO(deliveryDate) : undefined}
                onDateChange={(value) =>
                  setDeliveryDate(value ? format(value, "yyyy-MM-dd") : "")
                }
              />
            </div>
            <div className="rounded-md bg-muted p-3 text-sm flex flex-col gap-1">
              <p>
                <span className="text-muted-foreground">Amount:</span>{" "}
                <span className="font-mono font-medium">
                  {fmtPHP(delivery.totalTransactionAmount)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Federation:</span>{" "}
                <span className="font-mono">
                  {fmtPct(delivery.commissionRateFederation)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Cooperative:</span>{" "}
                <span className="font-mono">
                  {fmtPct(delivery.commissionRateCoop)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Farmers:</span>{" "}
                <span className="font-mono font-medium">
                  {fulfillingCount ?? "—"}
                </span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeliverOpen(false)}
              disabled={deliverLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeliver}
              disabled={deliverLoading || !deliveryDate}
            >
              {deliverLoading ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Check data-icon="inline-start" />
                  Confirm Delivery
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Cancel Delivery</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Cancel <strong>DEL-{delivery.deliveryID}</strong>? No accounting
              records have been generated for this delivery.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelLoading}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Cancelling…
                </>
              ) : (
                "Confirm Cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
