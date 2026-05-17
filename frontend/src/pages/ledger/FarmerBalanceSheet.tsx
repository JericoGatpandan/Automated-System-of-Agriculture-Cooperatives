import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Download, Loader2, Printer } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "../../lib/api";

const LEDGER_API = `${API_URL}/api/ledger`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const php = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-1.5 border-b border-gray-300">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-gray-900">
        {children}
      </h2>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-[12px]">
      <span className="w-36 shrink-0 text-gray-400">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function loanBadgeClass(status: string) {
  switch (status) {
    case "paid":
      return "border-green-500/50 text-green-700 bg-green-50";
    case "partial":
      return "border-blue-500/50 text-blue-700 bg-blue-50";
    case "overdue":
      return "border-red-500/50 text-red-700 bg-red-50";
    default:
      return "border-gray-300 text-gray-600 bg-gray-50";
  }
}

export function FarmerBalanceSheet() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const [searchParams] = useSearchParams();
  const coopIdParam = searchParams.get("coopId");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  /* Determine the back link based on role */
  const backHref = useMemo(() => {
    if (user?.role === "Admin" && farmerId)
      return coopIdParam
        ? `/admin/farmledger/farmers/${farmerId}?coopId=${coopIdParam}`
        : `/admin/farmledger/farmers/${farmerId}`;
    if (user?.role === "Officer" && farmerId)
      return `/coop/farmledger/farmers/${farmerId}`;
    return "/farmer/ledger";
  }, [user, farmerId, coopIdParam]);

  useEffect(() => {
    async function fetchLedger() {
      try {
        setLoading(true);
        const isSelf = !farmerId;
        const url = isSelf
          ? `${LEDGER_API}/farmers/me`
          : `${LEDGER_API}/farmers/${farmerId}`;
        const params: any = {};
        if (coopIdParam) params.coopId = coopIdParam;

        const res = await axios.get(url, { params });
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load ledger data.");
      } finally {
        setLoading(false);
      }
    }
    fetchLedger();
  }, [farmerId, coopIdParam]);

  const ledger = data?.ledgers?.[0];

  const farmerInfo = useMemo(() => {
    if (!data?.farmer) return null;
    const f = data.farmer;
    const name = [f.firstName, f.middleName, f.lastName, f.suffixName]
      .filter(Boolean)
      .join(" ");

    return {
      name,
      membershipNo: ledger?.farmerAccount?.farmerAccountID
        ? `ACC-${String(ledger.farmerAccount.farmerAccountID).padStart(4, "0")}`
        : "—",
      address:
        [f.barangay, f.cityMunicipality, f.province].filter(Boolean).join(", ") ||
        "—",
      farmSize: f.farmArea ? `${f.farmArea} ha` : "—",
      cooperative: ledger?.cooperative?.coopName || "—",
      cooperativeFullName: ledger?.cooperative?.coopName || "—",
      officer: "Cooperative Officer",
      dateGenerated: fmtDate(new Date().toISOString()),
      accountStatus: ledger?.farmerAccount?.status || "active",
    };
  }, [data, ledger]);

  const salesTransactions = useMemo(() => {
    if (!ledger?.salesRecords) return [];
    return ledger.salesRecords.map((s: any) => ({
      order: `DEL-${s.deliveryID}`,
      date: fmtDate(s.transactionDate),
      crop: s.remarks || "Harvest Delivery",
      gross: s.grossAmount,
      deductions: s.commissionAmount,
      net: s.netAmount,
    }));
  }, [ledger]);

  const commissions = useMemo(() => {
    if (!ledger?.feeRecords) return [];
    const agg: Record<string, number> = {};
    ledger.feeRecords.forEach((f: any) => {
      if (f.feeType === "capitalContribution" || f.feeType === "capitalRetention")
        return;
      agg[f.feeType] = (agg[f.feeType] || 0) + f.amount;
    });

    const out = [];
    if (agg.federationFee)
      out.push({ label: "Federation Fee", amount: agg.federationFee });
    if (agg.coopFee)
      out.push({ label: "Cooperative Service Fee", amount: agg.coopFee });
    return out;
  }, [ledger]);

  const shareCapital = useMemo(() => {
    const acc = ledger?.summary?.totalShareCapital || 0;
    return { accumulated: acc };
  }, [ledger]);

  const loans = useMemo(() => {
    if (!ledger?.loans) return [];
    return ledger.loans.map((l: any) => ({
      purpose: l.purpose || "General Loan",
      released: fmtDate(l.releaseDate),
      due: fmtDate(l.dueDate),
      principal: l.loanAmount,
      repaid: l.amountRepaid,
      outstanding: l.outstandingBalance,
      status: l.status,
    }));
  }, [ledger]);

  const salesTotal = {
    gross: salesTransactions.reduce((s: number, r: any) => s + r.gross, 0),
    deductions: salesTransactions.reduce(
      (s: number, r: any) => s + r.deductions,
      0,
    ),
    net: salesTransactions.reduce((s: number, r: any) => s + r.net, 0),
  };
  const totalDeductions = commissions.reduce(
    (s: number, c: any) => s + c.amount,
    0,
  );
  const totalOutstanding = loans.reduce(
    (s: number, l: any) => s + l.outstanding,
    0,
  );
  const netBalance = salesTotal.net - totalOutstanding;

  if (loading) {
    return (
      <div className="ml-64 flex min-h-screen items-center justify-center bg-gray-50/50">
        <Loader2 className="h-6 w-6 animate-spin text-green-800" />
      </div>
    );
  }

  if (error || !farmerInfo) {
    return (
      <div className="ml-64 flex min-h-screen flex-col items-center justify-center bg-gray-50/50 gap-4">
        <div className="text-destructive">{error || "No data found."}</div>
        <Button variant="outline" size="sm" onClick={() => navigate(backHref)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to ledger
        </Button>
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50 pb-12">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl pt-6 px-4 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => navigate(backHref)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to ledger
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 bg-green-800 hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Quick Summary Bar */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg border px-4 py-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Gross Sales
            </p>
            <p className="text-base font-semibold font-mono text-gray-900">
              {php(salesTotal.gross)}
            </p>
          </div>
          <div className="bg-white rounded-lg border px-4 py-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Net Earnings
            </p>
            <p className="text-base font-semibold font-mono text-gray-900">
              {php(salesTotal.net)}
            </p>
          </div>
          <div className="bg-white rounded-lg border px-4 py-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Loans Outstanding
            </p>
            <p className="text-base font-semibold font-mono text-red-600">
              {php(totalOutstanding)}
            </p>
          </div>
          <div className="bg-white rounded-lg border px-4 py-3 border-green-200 bg-green-50/50">
            <p className="text-[11px] text-green-700 uppercase tracking-wide font-medium">
              Net Balance
            </p>
            <p className="text-base font-bold font-mono text-green-800">
              {php(netBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Document Body ───────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl bg-white px-10 py-10 shadow-sm border rounded-xl print:shadow-none print:border-none print:p-0 print:rounded-none space-y-6">
        {/* Document Header */}
        <div className="text-center pb-5 border-b-2 border-gray-800 space-y-1">
          <p className="text-[11px] tracking-widest uppercase text-gray-500">
            Republic of the Philippines
          </p>
          <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
            Farmer Balance Sheet
          </h1>
          <p className="text-[12px] font-medium text-gray-600 mt-2">
            Federation of Agriculture Cooperatives of Camarines Sur (FACCS)
          </p>
          <p className="text-[12px] text-gray-500">
            {farmerInfo.cooperativeFullName}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            As of {farmerInfo.dateGenerated}
          </p>
        </div>

        {/* Farmer Info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 pb-5 border-b border-gray-200">
          <InfoRow label="Farmer Name:" value={farmerInfo.name} />
          <InfoRow label="Cooperative:" value={farmerInfo.cooperative} />
          <InfoRow label="Membership No.:" value={farmerInfo.membershipNo} />
          <InfoRow label="Address:" value={farmerInfo.address} />
          <InfoRow label="Farm Size:" value={farmerInfo.farmSize} />
          <InfoRow
            label="Account Status:"
            value={
              <Badge
                variant="outline"
                className={
                  farmerInfo.accountStatus === "active"
                    ? "border-green-500/50 text-green-700 bg-green-50 text-[10px]"
                    : "text-[10px]"
                }
              >
                {farmerInfo.accountStatus}
              </Badge>
            }
          />
          <InfoRow label="Date Generated:" value={farmerInfo.dateGenerated} />
          <InfoRow
            label="Sales Records:"
            value={`${salesTransactions.length} transaction${salesTransactions.length !== 1 ? "s" : ""}`}
          />
        </div>

        {/* I. Sales Transactions */}
        <section className="space-y-3">
          <SectionHeading>I. Sales Transactions</SectionHeading>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                {["Reference", "Date", "Details", "Gross", "Deductions", "Net"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`py-2 font-semibold ${i >= 3 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {salesTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 text-center text-gray-400 italic"
                  >
                    No sales records found.
                  </td>
                </tr>
              ) : (
                salesTransactions.map((row: any, idx: number) => (
                  <tr
                    key={`${row.order}-${idx}`}
                    className="border-b border-gray-100 text-gray-900"
                  >
                    <td className="py-2">{row.order}</td>
                    <td className="py-2">{row.date}</td>
                    <td className="py-2 max-w-[200px] truncate">{row.crop}</td>
                    <td className="text-right py-2 font-mono">
                      {php(row.gross)}
                    </td>
                    <td className="text-right py-2 text-red-600 font-mono">
                      ({php(row.deductions)})
                    </td>
                    <td className="text-right py-2 font-mono font-medium">
                      {php(row.net)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {salesTransactions.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-800 text-gray-900 font-bold">
                  <td className="pt-2" colSpan={3}>
                    TOTAL
                  </td>
                  <td className="text-right pt-2 font-mono">
                    {php(salesTotal.gross)}
                  </td>
                  <td className="text-right pt-2 text-red-600 font-mono">
                    ({php(salesTotal.deductions)})
                  </td>
                  <td className="text-right pt-2 font-mono">
                    {php(salesTotal.net)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </section>

        {/* II. Commission Breakdown */}
        <section className="space-y-3">
          <SectionHeading>II. Commission Breakdown</SectionHeading>
          <div className="space-y-2 text-[12px]">
            {commissions.length === 0 ? (
              <div className="text-gray-400 italic">
                No commissions recorded.
              </div>
            ) : (
              commissions.map((c: any) => (
                <div
                  key={c.label}
                  className="flex justify-between border-b border-gray-100 pb-1.5"
                >
                  <span className="text-gray-700">{c.label}</span>
                  <span className="text-gray-900 font-mono">
                    {php(c.amount)}
                  </span>
                </div>
              ))
            )}
            <div className="flex justify-between pt-1">
              <span className="font-bold text-gray-900">Total Deductions</span>
              <span className="font-bold text-gray-900 font-mono">
                {php(totalDeductions)}
              </span>
            </div>
          </div>
        </section>

        {/* III. Share Capital Account */}
        <section className="space-y-3">
          <SectionHeading>III. Share Capital Account</SectionHeading>
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between border-b border-gray-100 pb-1.5">
              <span className="text-gray-700">
                Total Share Capital Accumulated
              </span>
              <span className="text-gray-900 font-mono">
                {php(shareCapital.accumulated)}
              </span>
            </div>
          </div>
        </section>

        {/* IV. Loan Records */}
        <section className="space-y-3">
          <SectionHeading>IV. Loan Records</SectionHeading>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                <th className="text-left py-2 font-semibold w-[28%]">
                  Purpose
                </th>
                <th className="text-left py-2 font-semibold w-[10%]">
                  Released
                </th>
                <th className="text-left py-2 font-semibold w-[10%]">Due</th>
                <th className="text-right py-2 font-semibold w-[14%]">
                  Principal
                </th>
                <th className="text-right py-2 font-semibold w-[14%]">
                  Repaid
                </th>
                <th className="text-right py-2 font-semibold w-[14%]">
                  Outstanding
                </th>
                <th className="text-center py-2 font-semibold w-[10%]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-gray-400 italic"
                  >
                    No loans recorded.
                  </td>
                </tr>
              ) : (
                loans.map((loan: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 text-gray-900"
                  >
                    <td className="py-2">{loan.purpose}</td>
                    <td className="py-2">{loan.released}</td>
                    <td className="py-2">{loan.due}</td>
                    <td className="text-right py-2 font-mono">
                      {php(loan.principal)}
                    </td>
                    <td className="text-right py-2 font-mono text-green-700">
                      {php(loan.repaid)}
                    </td>
                    <td className="text-right py-2 font-mono font-medium">
                      {php(loan.outstanding)}
                    </td>
                    <td className="text-center py-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-sans font-medium uppercase ${loanBadgeClass(loan.status)}`}
                      >
                        {loan.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {loans.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-800 text-gray-900 font-bold">
                  <td className="pt-2" colSpan={5}>
                    TOTAL OUTSTANDING LOANS
                  </td>
                  <td className="text-right pt-2 font-mono">
                    {php(totalOutstanding)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </section>

        {/* V. Net Balance Summary */}
        <section className="border-2 border-gray-900 rounded-lg px-6 py-5 bg-gray-50/50 space-y-3 mt-8">
          <SectionHeading>V. Net Balance Summary</SectionHeading>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Gross Sales</span>
              <span className="text-gray-900 font-mono font-medium">
                {php(salesTotal.gross)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Less: Total Deductions (8%)</span>
              <span className="text-gray-900 font-mono text-red-600">
                ({php(salesTotal.deductions)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Net Sales Earnings</span>
              <span className="text-gray-900 font-mono font-medium">
                {php(salesTotal.net)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Less: Outstanding Loans</span>
              <span className="text-gray-900 font-mono text-red-600">
                ({php(totalOutstanding)})
              </span>
            </div>
            <Separator className="my-2 bg-gray-400" />
            <div className="flex justify-between items-center pt-2">
              <span className="text-[16px] font-bold text-gray-900 uppercase tracking-wider">
                Net Balance
              </span>
              <span className="text-[18px] font-bold text-green-800 font-mono border-b-2 border-green-800 pb-0.5">
                {php(netBalance)}
              </span>
            </div>
          </div>
        </section>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 pt-8 text-[12px] break-inside-avoid">
          {[
            {
              name: farmerInfo.name,
              role: "Farmer-Member Signature / Thumb Mark",
            },
            {
              name: farmerInfo.officer,
              role: "Cooperative Officer / Authorized Signature",
            },
          ].map((sig) => (
            <div key={sig.role} className="space-y-1 text-center">
              <div className="h-10 border-b border-gray-800" />
              <p className="text-gray-900 font-bold pt-1">{sig.name}</p>
              <p className="text-gray-500">{sig.role}</p>
              <p className="text-gray-400 mt-2">
                Date: _______________________
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-5 mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest print:mb-0">
          Generated by ASAC — Automated System of Agriculture Cooperatives ·
          FACCS · {farmerInfo.dateGenerated}
        </div>
      </div>
    </div>
  );
}
