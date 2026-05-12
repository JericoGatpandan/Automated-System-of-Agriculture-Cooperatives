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
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
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

import {
  Eye,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const API = "http://localhost:8800/api/orders";

interface OrderRow {
  orderID: number;
  buyerName: string;
  buyerCompany: string | null;
  buyerContact: string;
  requestedQuantity: number;
  urgencyLevel: string;
  orderDate: string;
  status: string;
  notes: string | null;
  CropType?: { cropName: string };
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-500/50",
  assigned: "bg-blue-50 text-blue-700 border-blue-500/50",
  inProgress: "bg-indigo-50 text-indigo-700 border-indigo-500/50",
  consolidated: "bg-green-50 text-green-700 border-green-500/50",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-500/50",
  cancelled: "bg-gray-50 text-gray-500 border-gray-300",
};

const URGENCY_COLORS: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-500/50",
  normal: "bg-blue-50 text-blue-700 border-blue-500/50",
};

const STATUS_OPTIONS = [
  "all",
  "pending",
  "assigned",
  "inProgress",
  "consolidated",
  "completed",
  "cancelled",
];

export function OrderList() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API);
      setOrders(res.data.orders);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      o.buyerName.toLowerCase().includes(q) ||
      (o.buyerCompany || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="w-full mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Order Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage buyer orders and cooperative assignments
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-orders"
                placeholder="Search buyer…"
                className="pl-9 h-10 text-sm"
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-10" id="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All Statuses" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => navigate("/admin/orders/new")}
            id="new-order-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
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
                onClick={fetchOrders}
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
              <p className="text-muted-foreground">Loading orders…</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Buyer Orders</CardTitle>
              <CardDescription>
                {filtered.length} of {orders.length} order
                {orders.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    {search || statusFilter !== "all"
                      ? "No orders match your filter"
                      : "No orders yet"}
                  </p>
                  {!search && statusFilter === "all" && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/admin/orders/new")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create first order
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="font-semibold text-muted-foreground">
                        Order #
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground">
                        Buyer
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground">
                        Company
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground">
                        Crop
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">
                        Qty
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-center">
                        Urgency
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-center">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((o) => (
                      <TableRow key={o.orderID}>
                        <TableCell className="py-4 ">ORD-{o.orderID}</TableCell>
                        <TableCell className="py-4 font-semibold">
                          {o.buyerName}
                        </TableCell>
                        <TableCell className="py-4">
                          {o.buyerCompany || "—"}
                        </TableCell>
                        <TableCell className="py-4">
                          {o.CropType?.cropName || "—"}
                        </TableCell>
                        <TableCell className="py-4 text-right font-mono">
                          {o.requestedQuantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge
                            variant="outline"
                            className={URGENCY_COLORS[o.urgencyLevel] || ""}
                          >
                            {o.urgencyLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          {fmtDate(o.orderDate)}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge
                            variant="outline"
                            className={STATUS_COLORS[o.status] || ""}
                          >
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                id={`actions-menu-${o.orderID}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/admin/orders/${o.orderID}`)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/admin/orders/${o.orderID}/edit`)
                                }
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {o.status !== "cancelled" &&
                                o.status !== "completed" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate(`/admin/orders/${o.orderID}`)
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
