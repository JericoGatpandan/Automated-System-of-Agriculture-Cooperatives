import axios from "axios";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { DateRangePicker } from "../../components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useAuth } from "../../context/AuthContext";
import { formatPhp } from "../../lib/money";
import { API_URL } from "../../lib/api";

const BASE = `${API_URL}/api/ledger`;

const BAR_COLORS = ["#16a34a", "#059669", "#0d9488", "#22c55e", "#10b981", "#6366f1", "#f59e0b", "#ef4444"];
const PIE_COLORS = ["#16a34a", "#0d9488", "#6366f1", "#f59e0b"];

interface LedgerRow {
  farmerID: number;
  farmerName: string;
  farmerAccountID: number;
  accountStatus: string;
  totalGrossSales: number;
  totalCommission: number;
  totalShareCapital: number;
  outstandingLoans: number;
  netBalance: number;
}

function accountStatusBadge(status: string) {
  const active = status === "active";
  const suspended = status === "suspended";
  return (
    <Badge
      variant="outline"
      className={
        active
          ? "border-green-500/50 text-green-700 bg-green-50"
          : suspended
            ? "border-amber-500/50 text-amber-800 bg-amber-50"
            : "border-gray-300 text-gray-500 bg-gray-50"
      }
    >
      {status}
    </Badge>
  );
}

function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md dark:bg-gray-900 dark:border-gray-700">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: p.color }}>
          {p.name}: {formatPhp(p.value)}
        </p>
      ))}
    </div>
  );
}

interface CooperativeLedgerListProps {
  mode: "admin" | "officer";
}

export function CooperativeLedgerList({ mode }: CooperativeLedgerListProps) {
  const { coopId } = useParams<{ coopId: string }>();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [period, setPeriod] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [coopName, setCoopName] = useState("");
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const farmerBase =
    mode === "admin" ? `/admin/farmledger/farmers` : `/coop/farmledger/farmers`;

  const listUrl =
    mode === "officer" ? `${BASE}/coops/me` : `${BASE}/coops/${coopId}`;

  const load = useCallback(async () => {
    if (mode === "admin" && !coopId) return;
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string> = {
        period,
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(period === "custom" && dateRange?.from
          ? { 
              startDate: dateRange.from.toISOString().split("T")[0], 
              endDate: dateRange.to ? dateRange.to.toISOString().split("T")[0] : dateRange.from.toISOString().split("T")[0] 
            }
          : {}),
      };
      const res = await axios.get(listUrl, { params });
      setRows(res.data.rows || []);
      setCoopName(res.data.cooperative?.coopName || "");
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      if (ax.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [coopId, listUrl, logout, navigate, mode, period, statusFilter, dateRange]);

  useEffect(() => {
    load();
  }, [load]);

  const mono = "font-[family-name:var(--font-mono)] tabular-nums";

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      r.farmerName.toLowerCase().includes(q) || String(r.farmerID).includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, period, dateRange]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  /* ── Aggregated KPI values ── */
  const kpi = useMemo(() => {
    const totals = {
      gross: 0,
      commission: 0,
      shareCapital: 0,
      loans: 0,
      netBalance: 0,
    };
    for (const r of rows) {
      totals.gross += r.totalGrossSales;
      totals.commission += r.totalCommission;
      totals.shareCapital += r.totalShareCapital;
      totals.loans += r.outstandingLoans;
      totals.netBalance += r.netBalance;
    }
    return totals;
  }, [rows]);

  /* ── Chart data: Farmer Earnings Bar Chart ── */
  const farmerBarData = useMemo(() => {
    return rows
      .filter((r) => r.totalGrossSales > 0)
      .sort((a, b) => b.netBalance - a.netBalance)
      .slice(0, 10)
      .map((r) => ({
        name:
          r.farmerName.length > 14
            ? r.farmerName.slice(0, 12) + "…"
            : r.farmerName,
        netBalance: r.netBalance,
        gross: r.totalGrossSales,
        commission: r.totalCommission,
      }));
  }, [rows]);

  /* ── Pie chart: Balance allocation ── */
  const pieData = useMemo(() => {
    if (kpi.gross === 0) return [];
    return [
      { name: "Net Earnings", value: kpi.netBalance },
      { name: "Commission", value: kpi.commission },
      { name: "Share Capital", value: kpi.shareCapital },
      { name: "Outstanding Loans", value: kpi.loans },
    ].filter((d) => d.value > 0);
  }, [kpi]);

  return (
    <div className="ml-64 min-h-screen bg-canvas-50/50">
      <div className="mx-auto flex min-h-screen w-full flex-col px-6 py-8">
        {mode === "admin" && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2"
            onClick={() => navigate("/admin/farmledger")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Federation overview
          </Button>
        )}

        <h1 className="text-xl font-bold text-foreground mb-2">
          Cooperative Ledger
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {coopName ? (
            <span className="font-medium text-foreground">{coopName}</span>
          ) : (
            "Loading cooperative…"
          )}
        </p>

        {/* ── KPI Summary Cards ── */}
        {!loading && rows.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Gross Sales</CardDescription>
                <CardTitle className={`text-lg ${mono}`}>
                  {formatPhp(kpi.gross)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Commission</CardDescription>
                <CardTitle className={`text-lg ${mono}`}>
                  {formatPhp(kpi.commission)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Share Capital</CardDescription>
                <CardTitle className={`text-lg ${mono}`}>
                  {formatPhp(kpi.shareCapital)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Outstanding Loans</CardDescription>
                <CardTitle className={`text-lg ${mono}`}>
                  {formatPhp(kpi.loans)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Net Balance</CardDescription>
                <CardTitle className={`text-lg ${mono}`}>
                  {formatPhp(kpi.netBalance)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* ── Charts Row ── */}
        {!loading && rows.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            {/* Farmer Earnings Bar Chart */}
            {farmerBarData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Farmer Earnings Overview
                  </CardTitle>
                  <CardDescription>
                    Top farmers by net balance in this cooperative
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={farmerBarData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip content={<CurrencyTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="gross"
                        name="Gross Sales"
                        fill="#16a34a"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="netBalance"
                        name="Net Balance"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="commission"
                        name="Commission"
                        fill="#0d9488"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Balance Allocation Pie */}
            {pieData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Balance Allocation
                  </CardTitle>
                  <CardDescription>
                    How the cooperative's gross sales are distributed
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={105}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(1)}%)`
                        }
                        labelLine={{
                          stroke: "hsl(var(--muted-foreground))",
                        }}
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatPhp(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── Filters ── */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>
              Period totals use persisted sales and fee records by transaction
              date.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Input
              placeholder="Search farmer name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Account status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {period === "custom" && (
              <DateRangePicker 
                date={dateRange} 
                onDateChange={setDateRange} 
                className="w-auto"
              />
            )}
            <Button variant="secondary" size="sm" onClick={() => load()}>
              Refresh
            </Button>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && (
          <Card className="flex min-h-0 flex-1 flex-col">
            <CardContent className="flex min-h-0 flex-1 flex-col pt-6 px-0 pb-0">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No ledger rows yet. Complete a delivery to generate sales
                  records.
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <ScrollArea className="min-h-0 flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 z-10 bg-muted/40 hover:bg-muted/40">
                          <TableHead>Farmer</TableHead>
                          <TableHead className="text-right">
                            Farmer ID
                          </TableHead>
                          <TableHead className={`text-right ${mono}`}>
                            Gross sales
                          </TableHead>
                          <TableHead className={`text-right ${mono}`}>
                            Commission
                          </TableHead>
                          <TableHead className={`text-right ${mono}`}>
                            Share capital
                          </TableHead>
                          <TableHead className={`text-right ${mono}`}>
                            Outstanding loans
                          </TableHead>
                          <TableHead className={`text-right ${mono}`}>
                            Net balance
                          </TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Detail</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginated.map((r) => (
                          <TableRow key={r.farmerAccountID}>
                            <TableCell className="font-bold">
                              {r.farmerName}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.farmerID}
                            </TableCell>
                            <TableCell className={`text-right ${mono}`}>
                              {formatPhp(r.totalGrossSales)}
                            </TableCell>
                            <TableCell className={`text-right ${mono}`}>
                              {formatPhp(r.totalCommission)}
                            </TableCell>
                            <TableCell className={`text-right ${mono}`}>
                              {formatPhp(r.totalShareCapital)}
                            </TableCell>
                            <TableCell className={`text-right ${mono}`}>
                              {formatPhp(r.outstandingLoans)}
                            </TableCell>
                            <TableCell className={`text-right ${mono}`}>
                              {formatPhp(r.netBalance)}
                            </TableCell>
                            <TableCell className="text-center">
                              {accountStatusBadge(r.accountStatus)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Link
                                to={
                                  mode === "admin" && coopId
                                    ? `${farmerBase}/${r.farmerID}?coopId=${coopId}`
                                    : `${farmerBase}/${r.farmerID}`
                                }
                                className="text-primary text-sm underline-offset-4 hover:underline"
                              >
                                Open
                              </Link>
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
