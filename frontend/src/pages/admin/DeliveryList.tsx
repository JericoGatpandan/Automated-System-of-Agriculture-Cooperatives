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
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { Eye, Loader2, Pencil, Plus, Truck } from "lucide-react";

const API = "http://localhost:8800/api/deliveries";

interface DeliveryRow {
  deliveryID: number;
  orderID: number;
  consolidationDate: string;
  deliveryDate: string | null;
  totalTransactionAmount: string;
  commissionRateFederation: string;
  commissionRateCoop: string;
  status: string;
  notes: string | null;
  BuyerOrder?: {
    orderID: number;
    buyerName: string;
    buyerCompany: string | null;
  };
}

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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-500/50",
  delivered: "bg-green-50 text-green-700 border-green-500/50",
  cancelled: "bg-gray-50 text-gray-500 border-gray-300",
};

const STATUS_OPTIONS = ["all", "pending", "delivered", "cancelled"];

export function DeliveryList() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pageSize = 10;

  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API);
      setDeliveries(res.data.deliveries);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const filtered = deliveries.filter(
    (d) => statusFilter === "all" || d.status === statusFilter,
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="mx-auto flex min-h-screen w-full flex-col px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Delivery Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Track deliveries and generate accounting records
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10" id="status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All Statuses" : s}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            onClick={() => navigate("/admin/deliveries/new")}
            id="new-delivery-btn"
          >
            <Plus data-icon="inline-start" />
            New Delivery
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/50 mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={fetchDeliveries}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading deliveries…</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex min-h-0 flex-1 flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Delivery Records</CardTitle>
              <CardDescription>
                {filtered.length} of {deliveries.length} deliver
                {deliveries.length !== 1 ? "ies" : "y"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    {statusFilter !== "all"
                      ? "No deliveries match your filter"
                      : "No deliveries yet"}
                  </p>
                  {statusFilter === "all" && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/admin/deliveries/new")}
                    >
                      <Plus data-icon="inline-start" />
                      Create first delivery
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <ScrollArea className="min-h-0 flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 z-10 bg-muted hover:bg-muted">
                          <TableHead className="font-semibold text-muted-foreground">
                            Delivery #
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Order #
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Buyer
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Consolidation
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Delivery Date
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Amount
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Fed
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Coop
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
                        {paginated.map((d) => (
                          <TableRow key={d.deliveryID}>
                            <TableCell className="py-4 font-semibold">
                              DEL-{d.deliveryID}
                            </TableCell>
                            <TableCell className="py-4">
                              <button
                                className="text-primary hover:underline font-medium"
                                onClick={() =>
                                  navigate(`/admin/orders/${d.orderID}`)
                                }
                              >
                                ORD-{d.orderID}
                              </button>
                            </TableCell>
                            <TableCell className="py-4">
                              {d.BuyerOrder?.buyerName || "—"}
                            </TableCell>
                            <TableCell className="py-4">
                              {fmtDate(d.consolidationDate)}
                            </TableCell>
                            <TableCell className="py-4">
                              {fmtDate(d.deliveryDate)}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono">
                              {fmtPHP(d.totalTransactionAmount)}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono">
                              {fmtPct(d.commissionRateFederation)}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono">
                              {fmtPct(d.commissionRateCoop)}
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <Badge
                                variant="outline"
                                className={STATUS_COLORS[d.status] || ""}
                              >
                                {d.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    navigate(
                                      `/admin/deliveries/${d.deliveryID}`,
                                    )
                                  }
                                  id={`view-delivery-${d.deliveryID}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {d.status === "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      navigate(
                                        `/admin/deliveries/${d.deliveryID}/edit`,
                                      )
                                    }
                                    id={`edit-delivery-${d.deliveryID}`}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
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
    </div>
  );
}
