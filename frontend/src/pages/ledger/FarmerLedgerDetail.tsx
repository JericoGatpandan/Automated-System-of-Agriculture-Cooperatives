import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Loader2,
  ChevronLeft,
  FileText,
  Plus,
  Banknote,
} from "lucide-react";
import { formatPhp, formatRate } from "../../lib/money";

const LEDGER = "http://localhost:8800/api/ledger";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DetailResponse | null>(null);
  const [tab, setTab] = useState("0");

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
        url = `${LEDGER}/farmers/${farmerId}`;
        if (variant === "admin" && coopIdParam) {
          params.coopId = coopIdParam;
        }
      }
      const res = await axios.get(url, { params });
      setData(res.data);
      if (res.data.needsCoopId && res.data.membershipChoices?.length && !coopIdParam) {
        /* wait for user selection */
      }
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { message?: string } } };
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

  const showOfficerActions = user?.role === "Officer" && variant === "coop";
  const showStatement =
    user?.role === "Admin" ||
    user?.role === "Officer" ||
    user?.role === "Farmer";

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
  const [stmtStart, setStmtStart] = useState("");
  const [stmtEnd, setStmtEnd] = useState("");
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
    if (!fid || !activeLedger) return;
    setStmtSaving(true);
    try {
      const res = await axios.post(`${LEDGER}/farmers/${fid}/statement`, {
        periodStart: stmtStart,
        periodEnd: stmtEnd,
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
          This farmer has multiple cooperative accounts. Choose one to open the ledger.
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
              <SelectItem key={m.farmerAccountID} value={String(m.primaryCoopID)}>
                {m.coopName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
              <Button size="sm" onClick={() => setLoanOpen(true)} id="btn-add-loan">
                <Plus className="h-4 w-4 mr-2" />
                Add loan
              </Button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}

        {ledgers.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No farmer account or sales records yet. Ledger entries are created when a delivery is marked delivered.
            </CardContent>
          </Card>
        )}

        {ledgers.length > 1 && (
          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList>
              {ledgers.map((L, i) => (
                <TabsTrigger key={L.farmerAccount.farmerAccountID} value={String(i)}>
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
                  <Badge variant="outline">{activeLedger.farmerAccount.status}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Gross sales</p>
                  <p className={`text-lg ${mono}`}>{formatPhp(activeLedger.summary.totalGrossSales)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Commission</p>
                  <p className={`text-lg ${mono}`}>{formatPhp(activeLedger.summary.totalCommission)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Share capital</p>
                  <p className={`text-lg ${mono}`}>{formatPhp(activeLedger.summary.totalShareCapital)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Outstanding loans</p>
                  <p className={`text-lg ${mono}`}>{formatPhp(activeLedger.summary.outstandingLoans)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net balance</p>
                  <p className={`text-lg ${mono}`}>{formatPhp(activeLedger.summary.netBalance)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Sales records</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Delivery ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className={`text-right ${mono}`}>Gross</TableHead>
                      <TableHead className={`text-right ${mono}`}>Commission</TableHead>
                      <TableHead className={`text-right ${mono}`}>Net</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLedger.salesRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No sales records yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeLedger.salesRecords.map((s) => (
                        <TableRow key={s.salesRecordID}>
                          <TableCell className="tabular-nums">{s.deliveryID}</TableCell>
                          <TableCell>{fmtDate(s.transactionDate)}</TableCell>
                          <TableCell className={`text-right ${mono}`}>{formatPhp(s.grossAmount)}</TableCell>
                          <TableCell className={`text-right ${mono}`}>{formatPhp(s.commissionAmount)}</TableCell>
                          <TableCell className={`text-right ${mono}`}>{formatPhp(s.netAmount)}</TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {s.remarks || "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Fee breakdown</CardTitle>
                <CardDescription>
                  Share capital lines show 0.00% until contribution rates are confirmed.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Type</TableHead>
                      <TableHead className={`text-right ${mono}`}>Rate</TableHead>
                      <TableHead className={`text-right ${mono}`}>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLedger.feeRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No fee records.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeLedger.feeRecords.map((f) => (
                        <TableRow key={f.feeRecordID}>
                          <TableCell>{FEE_LABELS[f.feeType] || f.feeType}</TableCell>
                          <TableCell className={`text-right ${mono}`}>
                            {formatRate(f.rate)}
                          </TableCell>
                          <TableCell className={`text-right ${mono}`}>{formatPhp(f.amount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{f.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Loans</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className={`text-right ${mono}`}>Amount</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Release</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className={`text-right ${mono}`}>Repaid</TableHead>
                      <TableHead className={`text-right ${mono}`}>Outstanding</TableHead>
                      <TableHead>Status</TableHead>
                      {showOfficerActions && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLedger.loans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={showOfficerActions ? 8 : 7} className="text-center text-muted-foreground py-8">
                          No loans recorded.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeLedger.loans.map((l) => (
                        <TableRow key={l.loanRecordID}>
                          <TableCell className={`text-right ${mono}`}>{formatPhp(l.loanAmount)}</TableCell>
                          <TableCell className="max-w-[180px] truncate">{l.purpose}</TableCell>
                          <TableCell>{fmtDate(l.releaseDate)}</TableCell>
                          <TableCell>{fmtDate(l.dueDate)}</TableCell>
                          <TableCell className={`text-right ${mono}`}>{formatPhp(l.amountRepaid)}</TableCell>
                          <TableCell className={`text-right ${mono}`}>{formatPhp(l.outstandingBalance)}</TableCell>
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={loanOpen} onOpenChange={setLoanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add loan</DialogTitle>
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
              <Textarea id="lpurp" value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lrel">Release date</Label>
                <Input id="lrel" type="date" value={loanRelease} onChange={(e) => setLoanRelease(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ldue">Due date</Label>
                <Input id="ldue" type="date" value={loanDue} onChange={(e) => setLoanDue(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoanOpen(false)}>Cancel</Button>
            <Button onClick={submitLoan} disabled={loanSaving}>
              {loanSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={repayOpen} onOpenChange={setRepayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record repayment</DialogTitle>
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
              <Input id="rdate" type="date" value={repayDate} onChange={(e) => setRepayDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRepayOpen(false)}>Cancel</Button>
            <Button onClick={submitRepay} disabled={repaySaving}>
              {repaySaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stmtOpen} onOpenChange={setStmtOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Statement period</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <Label htmlFor="ps">Period start</Label>
              <Input id="ps" type="date" value={stmtStart} onChange={(e) => setStmtStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pe">Period end</Label>
              <Input id="pe" type="date" value={stmtEnd} onChange={(e) => setStmtEnd(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStmtOpen(false)}>Cancel</Button>
            <Button onClick={submitStatement} disabled={stmtSaving || !stmtStart || !stmtEnd}>
              {stmtSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
