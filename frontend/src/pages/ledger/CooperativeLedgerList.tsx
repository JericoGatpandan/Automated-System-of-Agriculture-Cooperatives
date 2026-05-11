import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
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
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Loader2, ChevronLeft } from "lucide-react";
import { formatPhp } from "../../lib/money";
import { TablePaginationFooter } from "../../components/table-pagination-footer";

const BASE = "http://localhost:8800/api/ledger";

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
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
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
        ...(period === "custom" && customStart && customEnd
          ? { startDate: customStart, endDate: customEnd }
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
      setError("Failed to load cooperative ledger");
    } finally {
      setLoading(false);
    }
  }, [
    coopId,
    customEnd,
    customStart,
    listUrl,
    logout,
    navigate,
    mode,
    period,
    statusFilter,
  ]);

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
  }, [search, statusFilter, period, customStart, customEnd]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <div className="min-h-screen bg-background">
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
          Cooperative ledger
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {coopName ? (
            <span className="font-medium text-foreground">{coopName}</span>
          ) : (
            "Loading cooperative…"
          )}
        </p>

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
              <>
                <Input
                  type="date"
                  className="w-[160px]"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  aria-label="Custom period start"
                />
                <Input
                  type="date"
                  className="w-[160px]"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  aria-label="Custom period end"
                />
              </>
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
