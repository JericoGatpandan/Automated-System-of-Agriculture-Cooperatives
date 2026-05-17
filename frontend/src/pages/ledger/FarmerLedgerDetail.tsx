import axios from "axios";
import { format, parseISO } from "date-fns";
import { Banknote, ChevronLeft, FileText, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
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
import { DatePicker } from "../../components/ui/date-picker";
import { DateRangePicker } from "../../components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ScrollArea } from "../../components/ui/scroll-area";
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
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../context/AuthContext";
import { formatPhp, formatRate } from "../../lib/money";
import { API_URL } from "../../lib/api";

const LEDGER = `${API_URL}/api/ledger`;

const FEE_LABELS: Record<string, string> = {
  federationFee: "Federation fee",
  coopFee: "Cooperative fee",
  capitalContribution: "Capital contribution",
  capitalRetention: "Capital retention",
};

function fmtDate(d: string | Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface LedgerPayload {
  farmerAccount: {
    farmerAccountID: number;
    primaryCoopID: number;
    status: string;
  };
  cooperative: { coopName: string };
  summary: {
    totalGrossSales: number;
    totalCommission: number;
    totalShareCapital: number;
    netBalance: number;
    outstandingLoans: number;
  };
  salesRecords: {
    salesRecordID: number;
    deliveryID: number;
    grossAmount: number;
    commissionAmount: number;
    netAmount: number;
    transactionDate: string;
    remarks: string | null;
  }[];
  feeRecords: {
    feeRecordID: number;
    feeType: string;
    rate: number;
    amount: number;
    status: string;
    transactionDate: string | null;
  }[];
  loans: {
    loanRecordID: number;
    loanAmount: number;
    purpose: string;
    releaseDate: string;
    dueDate: string;
    amountRepaid: number;
    outstandingBalance: number;
    status: string;
  }[];
}

interface DetailResponse {
  farmer?: { farmerID: number; firstName: string; lastName: string };
  needsCoopId?: boolean;
  membershipChoices?: {
    farmerAccountID: number;
    primaryCoopID: number;
    coopName: string;
    status: string;
  }[];
  ledgers?: LedgerPayload[];
}

function loanBadge(status: string) {
  const map: Record<string, string> = {
    paid: "border-green-500/50 text-green-700 bg-green-50",
    partial: "border-blue-500/50 text-blue-800 bg-blue-50",
    active: "border-gray-300 text-gray-700 bg-gray-50",
    overdue: "border-red-500/50 text-red-800 bg-red-50",
  };
  return (
    <Badge variant="outline" className={map[status] || map.active}>
      {status}
    </Badge>
  );
}

interface FarmerLedgerDetailProps {
  variant: "admin" | "coop" | "farmer";
  self?: boolean;
}

export function FarmerLedgerDetail({ variant, self }: FarmerLedgerDetailProps) {
  const { farmerId } = useParams<{ farmerId: string }>();
  const [searchParams] = useSearchParams();
  const coopIdParam = searchParams.get("coopId");
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DetailResponse | null>(null);
  const [tab, setTab] = useState("0");
  const [salesPage, setSalesPage] = useState(1);
  const [feePage, setFeePage] = useState(1);
  const [loanPage, setLoanPage] = useState(1);

  const backHref =
    variant === "farmer"
      ? "/farmer"
      : variant === "admin"
        ? coopIdParam
          ? `/admin/farmledger/coops/${coopIdParam}`
          : "/admin/farmledger"
        : "/coop/farmledger";

  const mono = "font-[family-name:var(--font-mono)] tabular-nums";

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      let url = `${LEDGER}/farmers/me`;
      const params: Record<string, string> = {};
      if (!self) {
        if (!farmerId) return;
        url = `${LEDGER}/farmers/${farmerId}`;
        if (variant === "admin" && coopIdParam) {
          params.coopId = coopIdParam;
        }
      }
      const res = await axios.get(url, { params });
      setData(res.data);
      if (
        res.data.needsCoopId &&
        res.data.membershipChoices?.length &&
        !coopIdParam
      ) {
        /* wait for user selection */
      }
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (ax.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError(ax.response?.data?.message || "Failed to load ledger");
    } finally {
      setLoading(false);
    }
  }, [self, farmerId, variant, coopIdParam, logout, navigate]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const ledgers = data?.ledgers || [];
  const activeLedger = ledgers[parseInt(tab, 10)] || ledgers[0];

  useEffect(() => {
    setSalesPage(1);
    setFeePage(1);
    setLoanPage(1);
  }, [activeLedger?.farmerAccount.farmerAccountID]);

  const showOfficerActions = user?.role === "Officer" && variant === "coop";
  const showStatement =
    user?.role === "Admin" ||
    user?.role === "Officer" ||
    user?.role === "Farmer";

  const salesRecords = activeLedger?.salesRecords || [];
  const feeRecords = activeLedger?.feeRecords || [];
  const loans = activeLedger?.loans || [];

  const salesTotalPages = Math.max(
    1,
    Math.ceil(salesRecords.length / pageSize),
  );
  const feeTotalPages = Math.max(1, Math.ceil(feeRecords.length / pageSize));
  const loanTotalPages = Math.max(1, Math.ceil(loans.length / pageSize));

  const paginatedSales = salesRecords.slice(
    (salesPage - 1) * pageSize,
    salesPage * pageSize,
  );
  const paginatedFees = feeRecords.slice(
    (feePage - 1) * pageSize,
    feePage * pageSize,
  );
  const paginatedLoans = loans.slice(
    (loanPage - 1) * pageSize,
    loanPage * pageSize,
  );

  useEffect(() => {
    setSalesPage((page) => Math.min(page, salesTotalPages));
  }, [salesTotalPages]);

  useEffect(() => {
    setFeePage((page) => Math.min(page, feeTotalPages));
  }, [feeTotalPages]);

  useEffect(() => {
    setLoanPage((page) => Math.min(page, loanTotalPages));
  }, [loanTotalPages]);

  /* ── Dialogs ── */
  const [loanOpen, setLoanOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanRelease, setLoanRelease] = useState("");
  const [loanDue, setLoanDue] = useState("");
  const [loanSaving, setLoanSaving] = useState(false);

  const [repayOpen, setRepayOpen] = useState(false);
  const [repayLoanId, setRepayLoanId] = useState<number | null>(null);
  const [repayAmount, setRepayAmount] = useState("");
  const [repayDate, setRepayDate] = useState("");
  const [repaySaving, setRepaySaving] = useState(false);

  const [stmtOpen, setStmtOpen] = useState(false);
  const [stmtDateRange, setStmtDateRange] = useState<DateRange | undefined>();
  const [stmtSaving, setStmtSaving] = useState(false);

  const navigateStatementBase =
    variant === "admin"
      ? `/admin/farmledger/farmers/${farmerId}/statement`
      : variant === "coop"
        ? `/coop/farmledger/farmers/${farmerId}/statement`
        : "/farmer/ledger/statement";

  async function submitLoan() {
    const fid = self ? String(data?.farmer?.farmerID ?? "") : farmerId;
    if (!activeLedger || !fid) return;
    setLoanSaving(true);
    try {
      await axios.post(`${LEDGER}/farmers/${fid}/loans`, {
        loanAmount: parseFloat(loanAmount),
        purpose: loanPurpose,
        releaseDate: loanRelease,
        dueDate: loanDue,
        farmerAccountID: activeLedger.farmerAccount.farmerAccountID,
      });
      setLoanOpen(false);
      setLoanAmount("");
      setLoanPurpose("");
      setLoanRelease("");
      setLoanDue("");
      await fetchLedger();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || "Could not create loan");
    } finally {
      setLoanSaving(false);
    }
  }

  async function submitRepay() {
    if (!repayLoanId) return;
    setRepaySaving(true);
    try {
      await axios.put(`${LEDGER}/loans/${repayLoanId}/repayment`, {
        repaymentAmount: parseFloat(repayAmount),
        repaymentDate: repayDate || undefined,
      });
      setRepayOpen(false);
      setRepayLoanId(null);
      setRepayAmount("");
      setRepayDate("");
      await fetchLedger();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || "Could not record repayment");
    } finally {
      setRepaySaving(false);
    }
  }

  async function submitStatement() {
    const fid = self ? String(data?.farmer?.farmerID) : farmerId;
    if (!fid || !activeLedger || !stmtDateRange?.from || !stmtDateRange?.to)
      return;
    setStmtSaving(true);
    try {
      const res = await axios.post(`${LEDGER}/farmers/${fid}/statement`, {
        periodStart: stmtDateRange.from.toISOString().split("T")[0],
        periodEnd: stmtDateRange.to.toISOString().split("T")[0],
        farmerAccountID: activeLedger.farmerAccount.farmerAccountID,
      });
      navigate(navigateStatementBase, {
        state: {
          statement: res.data.statement,
          farmerName: data?.farmer
            ? `${data.farmer.firstName} ${data.farmer.lastName}`
            : "",
          coopName: activeLedger.cooperative?.coopName || "",
        },
      });
      setStmtOpen(false);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || "Could not generate statement");
    } finally {
      setStmtSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center gap-2 px-6 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading ledger…
      </div>
    );
  }

  if (data?.needsCoopId && data.membershipChoices?.length && !coopIdParam) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto px-6 py-12">
        <h1 className="text-lg font-semibold mb-4">Select cooperative</h1>
        <p className="text-sm text-muted-foreground mb-4">
          This farmer has multiple cooperative accounts. Choose one to open the
          ledger.
        </p>
        <Select
          onValueChange={(v) => {
            navigate(
              { pathname: location.pathname, search: `?coopId=${v}` },
              { replace: true },
            );
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Cooperative" />
          </SelectTrigger>
          <SelectContent>
            {data.membershipChoices.map((m) => (
              <SelectItem
                key={m.farmerAccountID}
                value={String(m.primaryCoopID)}
              >
                {m.coopName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="w-full mx-auto px-6 py-8">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link to={backHref}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Farmer ledger</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {data?.farmer
                ? `${data.farmer.firstName} ${data.farmer.lastName}`
                : "Your account"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {showStatement && activeLedger && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStmtOpen(true)}
                id="btn-generate-statement"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate statement
              </Button>
            )}
            {showOfficerActions && activeLedger && (
              <Button
                size="sm"
                onClick={() => setLoanOpen(true)}
                id="btn-add-loan"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add loan
              </Button>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        {ledgers.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No farmer account or sales records yet. Ledger entries are created
              when a delivery is marked delivered.
            </CardContent>
          </Card>
        )}

        {ledgers.length > 1 && (
          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList>
              {ledgers.map((L, i) => (
                <TabsTrigger
                  key={L.farmerAccount.farmerAccountID}
                  value={String(i)}
                >
                  {L.cooperative?.coopName || `Account ${i + 1}`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {activeLedger && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
                <CardDescription>
                  {activeLedger.cooperative?.coopName} · Account status{" "}
                  <Badge variant="outline">
                    {activeLedger.farmerAccount.status}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Gross sales</p>
                  <p className={`text-lg ${mono}`}>
                    {formatPhp(activeLedger.summary.totalGrossSales)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Commission</p>
                  <p className={`text-lg ${mono}`}>
                    {formatPhp(activeLedger.summary.totalCommission)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Share capital</p>
                  <p className={`text-lg ${mono}`}>
                    {formatPhp(activeLedger.summary.totalShareCapital)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Outstanding loans
                  </p>
                  <p className={`text-lg ${mono}`}>
                    {formatPhp(activeLedger.summary.outstandingLoans)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net balance</p>
                  <p className={`text-lg ${mono}`}>
                    {formatPhp(activeLedger.summary.netBalance)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Sales records</CardTitle>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-col px-0 pb-0">
                <div className="flex min-h-0 flex-1 flex-col">
                  {salesRecords.length === 0 ? (
                    <div className="px-6 py-8 text-center text-muted-foreground">
                      No sales records yet.
                    </div>
                  ) : (
                    <ScrollArea className="min-h-0 flex-1">
                      <Table>
                        <TableHeader>
                          <TableRow className="sticky top-0 z-10 bg-muted/40 hover:bg-muted/40">
                            <TableHead>Delivery ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className={`text-right ${mono}`}>
                              Gross
                            </TableHead>
                            <TableHead className={`text-right ${mono}`}>
                              Commission
                            </TableHead>
                            <TableHead className={`text-right ${mono}`}>
                              Net
                            </TableHead>
                            <TableHead>Remarks</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedSales.map((s) => (
                            <TableRow key={s.salesRecordID}>
                              <TableCell className="tabular-nums">
                                {s.deliveryID}
                              </TableCell>
                              <TableCell>
                                {fmtDate(s.transactionDate)}
                              </TableCell>
                              <TableCell className={`text-right ${mono}`}>
                                {formatPhp(s.grossAmount)}
                              </TableCell>
                              <TableCell className={`text-right ${mono}`}>
                                {formatPhp(s.commissionAmount)}
                              </TableCell>
                              <TableCell className={`text-right ${mono}`}>
                                {formatPhp(s.netAmount)}
                              </TableCell>
                              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                {s.remarks || "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                  {salesRecords.length > 0 && (
                    <TablePaginationFooter
                      currentPage={salesPage}
                      pageSize={pageSize}
                      totalCount={salesRecords.length}
                      onPageChange={setSalesPage}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Fee breakdown</CardTitle>
                <CardDescription>
                  Share capital lines show 0.00% until contribution rates are
                  confirmed.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-col px-0 pb-0">
                <div className="flex min-h-0 flex-1 flex-col">
                  {feeRecords.length === 0 ? (
                    <div className="px-6 py-8 text-center text-muted-foreground">
                      No fee records.
                    </div>
                  ) : (
                    <ScrollArea className="min-h-0 flex-1">
                      <Table>
                        <TableHeader>
                          <TableRow className="sticky top-0 z-10 bg-muted/40 hover:bg-muted/40">
                            <TableHead>Type</TableHead>
                            <TableHead className={`text-right ${mono}`}>
                              Rate
                            </TableHead>
                            <TableHead className={`text-right ${mono}`}>
                              Amount
                            </TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedFees.map((f) => (
                            <TableRow key={f.feeRecordID}>
                              <TableCell>
                                {FEE_LABELS[f.feeType] || f.feeType}
                              </TableCell>
                              <TableCell className={`text-right ${mono}`}>
                                {formatRate(f.rate)}
                              </TableCell>
                              <TableCell className={`text-right ${mono}`}>
                                {formatPhp(f.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{f.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                  {feeRecords.length > 0 && (
                    <TablePaginationFooter
                      currentPage={feePage}
                      pageSize={pageSize}
                      totalCount={feeRecords.length}
                      onPageChange={setFeePage}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Loans</CardTitle>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-col px-0 pb-0">
                <div className="flex min-h-0 flex-1 flex-col">
                  {loans.length === 0 ? (
                    <div className="px-6 py-8 text-center text-muted-foreground">
                      No loans recorded.
                    </div>
                  ) : (
                    <ScrollArea className="min-h-0 flex-1">
                      <Table>
                        <TableHeader>
                          <TableRow className="sticky top-0 z-10 bg-muted/40 hover:bg-muted/40">
                            <TableHead className={`text-right ${mono}`}>
                              Amount
                            </TableHead>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Release</TableHead>
                            <TableHead>Due</TableHead>
                            <TableHead className={`text-right ${mono}`}>
                              Repaid
                            </TableHead>
                            <TableHead className={`text-right ${mono}`}>
                              Outstanding
                            </TableHead>
                            <TableHead>Status</TableHead>
                            {showOfficerActions && (
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedLoans.map((l) => (
                            <TableRow key={l.loanRecordID}>
                              <TableCell className={`text-right ${mono}`}>
                                {formatPhp(l.loanAmount)}
                              </TableCell>
                              <TableCell className="max-w-[180px] truncate">
                                {l.purpose}
                              </TableCell>
                              <TableCell>{fmtDate(l.releaseDate)}</TableCell>
                              <TableCell>{fmtDate(l.dueDate)}</TableCell>
                              <TableCell className={`text-right ${mono}`}>
                                {formatPhp(l.amountRepaid)}
                              </TableCell>
                              <TableCell className={`text-right ${mono}`}>
                                {formatPhp(l.outstandingBalance)}
                              </TableCell>
                              <TableCell>{loanBadge(l.status)}</TableCell>
                              {showOfficerActions && (
                                <TableCell className="text-right">
                                  {l.status !== "paid" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setRepayLoanId(l.loanRecordID);
                                        setRepayOpen(true);
                                      }}
                                    >
                                      <Banknote className="h-3 w-3 mr-1" />
                                      Repay
                                    </Button>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                  {loans.length > 0 && (
                    <TablePaginationFooter
                      currentPage={loanPage}
                      pageSize={pageSize}
                      totalCount={loans.length}
                      onPageChange={setLoanPage}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={loanOpen} onOpenChange={setLoanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add loan</DialogTitle>
            <DialogDescription>Record a new loan for this farmer account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label htmlFor="lamt">Loan amount (PHP)</Label>
              <Input
                id="lamt"
                type="number"
                step="0.01"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lpurp">Purpose</Label>
              <Textarea
                id="lpurp"
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lrel">Release date</Label>
                <DatePicker
                  id="lrel"
                  date={loanRelease ? parseISO(loanRelease) : undefined}
                  onDateChange={(value) =>
                    setLoanRelease(value ? format(value, "yyyy-MM-dd") : "")
                  }
                />
              </div>
              <div>
                <Label htmlFor="ldue">Due date</Label>
                <DatePicker
                  id="ldue"
                  date={loanDue ? parseISO(loanDue) : undefined}
                  onDateChange={(value) =>
                    setLoanDue(value ? format(value, "yyyy-MM-dd") : "")
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitLoan} disabled={loanSaving}>
              {loanSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={repayOpen} onOpenChange={setRepayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record repayment</DialogTitle>
            <DialogDescription>Enter the repayment amount and date.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label htmlFor="ramt">Repayment amount</Label>
              <Input
                id="ramt"
                type="number"
                step="0.01"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rdate">Repayment date</Label>
              <DatePicker
                id="rdate"
                date={repayDate ? parseISO(repayDate) : undefined}
                onDateChange={(value) =>
                  setRepayDate(value ? format(value, "yyyy-MM-dd") : "")
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRepayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRepay} disabled={repaySaving}>
              {repaySaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stmtOpen} onOpenChange={setStmtOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Statement period</DialogTitle>
            <DialogDescription>Select a date range to generate the farmer statement.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="flex flex-col gap-2">
              <Label>Statement period</Label>
              <DateRangePicker
                date={stmtDateRange}
                onDateChange={setStmtDateRange}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStmtOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitStatement}
              disabled={
                stmtSaving || !stmtDateRange?.from || !stmtDateRange?.to
              }
            >
              {stmtSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
