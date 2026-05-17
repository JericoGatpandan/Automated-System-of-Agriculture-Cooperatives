import axios from "axios";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  LineChart,
  Line,
} from "recharts";
import { TablePaginationFooter } from "../../components/table-pagination-footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
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

const API = "http://localhost:8800/api/ledger/summary";
const MONTHLY_API = "http://localhost:8800/api/ledger/summary/monthly";

/* ── Chart palette (green-based with complementary accents) ── */
const COLORS = {
  gross: "#16a34a",
  fedFee: "#059669",
  coopFee: "#0d9488",
  shareCapital: "#6366f1",
  netEarnings: "#22c55e",
};

const PIE_COLORS = ["#16a34a", "#0d9488", "#6366f1", "#f59e0b"];

interface CoopRow {
  primaryCoopID: number;
  coopName: string;
  farmersWithAccounts: number;
  totalGrossSales: number;
  totalNetEarnings: number;
  totalFederationFee: number;
  totalCooperativeFee: number;
}

interface MonthlyRow {
  month: string;
  gross: number;
  fees: number;
  net: number;
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleString("en", { month: "short", year: "2-digit" });
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

export function FederationFarmLedger() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deliveriesCompleted, setDeliveriesCompleted] = useState(0);
  const [totalGrossSales, setTotalGrossSales] = useState(0);
  const [totalFederationFees, setTotalFederationFees] = useState(0);
  const [totalCooperativeFees, setTotalCooperativeFees] = useState(0);
  const [totalShareCapital, setTotalShareCapital] = useState(0);
  const [cooperativeSummary, setCooperativeSummary] = useState<CoopRow[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [summaryRes, monthlyRes] = await Promise.all([
        axios.get(API),
        axios.get(MONTHLY_API),
      ]);
      setDeliveriesCompleted(summaryRes.data.deliveriesCompleted);
      setTotalGrossSales(summaryRes.data.totalGrossSales);
      setTotalFederationFees(summaryRes.data.totalFederationFees);
      setTotalCooperativeFees(summaryRes.data.totalCooperativeFees);
      setTotalShareCapital(summaryRes.data.totalShareCapital);
      setCooperativeSummary(summaryRes.data.cooperativeSummary || []);
      setMonthlyData(monthlyRes.data || []);
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number } };
      if (ax.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError("Failed to load federation ledger summary");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(
    1,
    Math.ceil(cooperativeSummary.length / pageSize),
  );
  const paginated = cooperativeSummary.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const mono = "font-[family-name:var(--font-mono)] tabular-nums";

  /* ── Derived chart data ── */
  const coopBarData = cooperativeSummary
    .filter((r) => r.totalGrossSales > 0)
    .map((r) => ({
      name: r.coopName.length > 16 ? r.coopName.slice(0, 14) + "…" : r.coopName,
      gross: r.totalGrossSales,
      fedFee: r.totalFederationFee,
      coopFee: r.totalCooperativeFee,
    }));

  const totalNetEarnings =
    totalGrossSales - totalFederationFees - totalCooperativeFees;
  const pieData = [
    { name: "Federation Fees", value: totalFederationFees },
    { name: "Cooperative Fees", value: totalCooperativeFees },
    { name: "Share Capital", value: totalShareCapital },
    { name: "Net Farmer Earnings", value: Math.max(0, totalNetEarnings - totalShareCapital) },
  ].filter((d) => d.value > 0);

  const monthlyChartData = monthlyData.map((r) => ({
    ...r,
    label: monthLabel(r.month),
  }));

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="mx-auto flex min-h-screen w-full flex-col px-6 py-8">
        <h1 className="text-xl font-bold text-foreground mb-2">
          FarmLedger — Federation Overview
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Read-only federation-wide financial summary across all cooperatives.
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        {!loading && !error && (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Deliveries Completed</CardDescription>
                  <CardTitle className={`text-2xl ${mono}`}>
                    {deliveriesCompleted.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Gross Sales</CardDescription>
                  <CardTitle className={`text-xl ${mono}`}>
                    {formatPhp(totalGrossSales)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Federation Fees</CardDescription>
                  <CardTitle className={`text-xl ${mono}`}>
                    {formatPhp(totalFederationFees)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Cooperative Fees</CardDescription>
                  <CardTitle className={`text-xl ${mono}`}>
                    {formatPhp(totalCooperativeFees)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Share Capital</CardDescription>
                  <CardTitle className={`text-xl ${mono}`}>
                    {formatPhp(totalShareCapital)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              {/* Monthly Sales Trend */}
              {monthlyChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Monthly Sales Trend
                    </CardTitle>
                    <CardDescription>
                      Gross sales, fees, and net earnings over the past 6 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={monthlyChartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip content={<CurrencyTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="gross"
                          name="Gross Sales"
                          stroke={COLORS.gross}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="fees"
                          name="Total Fees"
                          stroke={COLORS.coopFee}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="net"
                          name="Net Earnings"
                          stroke={COLORS.netEarnings}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Fee Distribution Donut */}
              {pieData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Revenue Distribution
                    </CardTitle>
                    <CardDescription>
                      Federation-wide breakdown of how gross sales are allocated
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={110}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(1)}%)`
                          }
                          labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        >
                          {pieData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => formatPhp(v)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Cooperative Revenue Bar Chart ── */}
            {coopBarData.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-base">
                    Cooperative Revenue Comparison
                  </CardTitle>
                  <CardDescription>
                    Gross sales and fee contributions by cooperative
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={coopBarData}
                      layout="vertical"
                      margin={{ left: 10, right: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip content={<CurrencyTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="gross"
                        name="Gross Sales"
                        fill={COLORS.gross}
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="fedFee"
                        name="Federation Fee"
                        fill={COLORS.fedFee}
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="coopFee"
                        name="Cooperative Fee"
                        fill={COLORS.coopFee}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* ── Cooperative Summary Table ── */}
            <Card className="flex min-h-0 flex-1 flex-col">
              <CardHeader>
                <CardTitle className="text-base">Cooperative Summary</CardTitle>
                <CardDescription>
                  Gross sales and fees aggregated per primary cooperative.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
                <div className="flex min-h-0 flex-1 flex-col">
                  <ScrollArea className="min-h-0 flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 z-10 bg-muted/40 hover:bg-muted/40">
                          <TableHead>Cooperative</TableHead>
                          <TableHead className="text-right">
                            Farmers w/ accounts
                          </TableHead>
                          <TableHead className={`text-right ${mono}`}>
                            Gross sales
                          </TableHead>
                          <TableHead className={`text-right ${mono}`}>
                            Net earnings
                          </TableHead>
                          <TableHead className={`text-right ${mono}`}>
                            Fed. fee
                          </TableHead>
                          <TableHead className={`text-right ${mono}`}>
                            Coop fee
                          </TableHead>
                          <TableHead className="text-right">Ledger</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginated.map((row) => (
                          <TableRow key={row.primaryCoopID}>
                            <TableCell className="font-medium">
                              {row.coopName}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {row.farmersWithAccounts}
                            </TableCell>
                            <TableCell className={`text-right ${mono}`}>
                              {formatPhp(row.totalGrossSales)}
                            </TableCell>
                            <TableCell className={`text-right ${mono}`}>
                              {formatPhp(row.totalNetEarnings)}
                            </TableCell>
                            <TableCell className={`text-right ${mono}`}>
                              {formatPhp(row.totalFederationFee)}
                            </TableCell>
                            <TableCell className={`text-right ${mono}`}>
                              {formatPhp(row.totalCooperativeFee)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Link
                                to={`/admin/farmledger/coops/${row.primaryCoopID}`}
                                className="text-primary text-sm underline-offset-4 hover:underline"
                              >
                                View cooperative ledger
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
                    totalCount={cooperativeSummary.length}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
