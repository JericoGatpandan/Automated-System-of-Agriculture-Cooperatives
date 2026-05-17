import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { FileText, Printer, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const LEDGER_API = "http://localhost:8800/api/ledger";

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

export function FarmerBalanceSheet() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const [searchParams] = useSearchParams();
  const coopIdParam = searchParams.get("coopId");
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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

  const ledger = data?.ledgers?.[0]; // Default to first account

  const farmerInfo = useMemo(() => {
    if (!data?.farmer) return null;
    const f = data.farmer;
    const name = [f.firstName, f.middleName, f.lastName, f.suffixName].filter(Boolean).join(" ");
    
    return {
      name,
      membershipNo: ledger?.farmerAccount?.farmerAccountID ? `ACC-${String(ledger.farmerAccount.farmerAccountID).padStart(4, '0')}` : "—",
      address: [f.barangay, f.cityMunicipality, f.province].filter(Boolean).join(", ") || "—",
      farmSize: f.farmArea ? `${f.farmArea} ha` : "—",
      cooperative: ledger?.cooperative?.coopName || "—",
      cooperativeFullName: ledger?.cooperative?.coopName || "—",
      officer: "Cooperative Officer", // Usually dynamic based on coop
      dateGenerated: fmtDate(new Date().toISOString()),
      period: "All Time", // Could be dynamic based on filters
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
    // Aggregate by fee type
    const agg: Record<string, number> = {};
    ledger.feeRecords.forEach((f: any) => {
      if (f.feeType === "capitalContribution" || f.feeType === "capitalRetention") return;
      agg[f.feeType] = (agg[f.feeType] || 0) + f.amount;
    });

    const out = [];
    if (agg.federationFee) out.push({ label: "Federation Fee", amount: agg.federationFee });
    if (agg.coopFee) out.push({ label: "Cooperative Service Fee", amount: agg.coopFee });
    return out;
  }, [ledger]);

  const shareCapital = useMemo(() => {
    const acc = ledger?.summary?.totalShareCapital || 0;
    return {
      accumulated: acc,
      thisPeriod: acc, // Update if period filtering is added
    };
  }, [ledger]);

  const loans = useMemo(() => {
    if (!ledger?.loans) return [];
    return ledger.loans.map((l: any) => ({
      purpose: l.purpose || "General Loan",
      released: fmtDate(l.releaseDate),
      principal: l.loanAmount,
      repaid: l.amountRepaid,
      outstanding: l.outstandingBalance,
      status: l.status,
    }));
  }, [ledger]);

  const salesTotal = {
    gross: salesTransactions.reduce((s: number, r: any) => s + r.gross, 0),
    deductions: salesTransactions.reduce((s: number, r: any) => s + r.deductions, 0),
    net: salesTransactions.reduce((s: number, r: any) => s + r.net, 0),
  };
  const totalDeductions = commissions.reduce((s: number, c: any) => s + c.amount, 0);
  const totalOutstanding = loans.reduce((s: number, l: any) => s + l.outstanding, 0);
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
      <div className="ml-64 flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="text-red-500">{error || "No data found."}</div>
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50 pb-12">
      <div className="mx-auto max-w-5xl pt-4 px-4 print:hidden">
        <div className="bg-white rounded-xl p-3 shadow-sm border flex flex-col gap-3 mb-4">
          {/* ── Filters ─────────────────────────────────────────────────────────── */}
          <div className="flex gap-3">
            {/* Select Farmer (Readonly — shows current farmer) */}
            <div className="flex-1 flex flex-col gap-1.5">
              <Label htmlFor="farmer-select" className="text-xs text-gray-500">Farmer Account</Label>
              <Input
                id="farmer-select"
                readOnly
                value={farmerInfo?.name || "Loading…"}
                className="h-9 bg-muted cursor-default"
              />
            </div>

            {/* Select Period */}
            <div className="flex-1 flex flex-col gap-1.5">
              <Label htmlFor="period-input" className="text-xs text-gray-500">Period (Optional)</Label>
              <DateRangePicker 
                date={dateRange} 
                onDateChange={setDateRange} 
                className="w-[260px]"
              />
            </div>
          </div>

          {/* ── Actions ─────────────────────────────────────────────────────────── */}
          <div className="flex gap-3">
            <Button
              className="flex-1 h-9 bg-green-900 hover:bg-green-800 text-white font-medium gap-1.5"
            >
              <FileText className="size-4 opacity-80" />
              Preview Mode
            </Button>

            <Button
              variant="outline"
              className="flex-1 h-9 border border-neutral-300 text-green-900 hover:border-green-900 hover:text-green-900 font-medium gap-1.5"
              onClick={() => window.print()}
            >
              <Printer className="size-4" />
              Print / Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-2.5 bg-white border border-b-0 rounded-t-xl print:hidden shadow-sm">
        <span className="text-xs text-gray-400 font-sans">
          Preview — {farmerInfo.name}
        </span>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs font-medium text-green-800 hover:text-green-700 transition-colors font-sans"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>
      </div>

      {/* ── Document Body ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl bg-white px-10 py-10 shadow-sm border rounded-b-xl print:shadow-none print:border-none print:p-0 space-y-6">

        {/* Document Header */}
        <div className="text-center pb-5 border-b-2 border-gray-800 space-y-1">
          <p className="text-[11px] tracking-widest uppercase text-gray-500">
            Republic of the Philippines
          </p>
          <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
            Farmer Balance Sheet
          </h1>
          <p className="text-[12px] font-medium text-gray-600 mt-2">
            Federation of Agriculture Cooperatives of the Cordillera System (FACCS)
          </p>
          <p className="text-[12px] text-gray-500">{farmerInfo.cooperativeFullName}</p>
          <p className="text-[11px] text-gray-400 mt-1">Period: {farmerInfo.period}</p>
        </div>

        {/* Farmer Info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 pb-5 border-b border-gray-200">
          <InfoRow label="Farmer Name:" value={farmerInfo.name} />
          <InfoRow label="Cooperative:" value={farmerInfo.cooperative} />
          <InfoRow label="Membership No.:" value={farmerInfo.membershipNo} />
          <InfoRow label="Address:" value={farmerInfo.address} />
          <InfoRow label="Farm Size:" value={farmerInfo.farmSize} />
          <InfoRow label="Date Generated:" value={farmerInfo.dateGenerated} />
        </div>

        {/* I. Sales Transactions */}
        <section className="space-y-3">
          <SectionHeading>I. Sales Transactions</SectionHeading>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                {["Reference", "Date", "Details", "Gross", "Deductions", "Net"].map((h, i) => (
                  <th
                    key={h}
                    className={`py-2 font-semibold ${i >= 3 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salesTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400 italic">No sales records found.</td>
                </tr>
              ) : salesTransactions.map((row: any) => (
                <tr key={row.order} className="border-b border-gray-100 text-gray-900">
                  <td className="py-2">{row.order}</td>
                  <td className="py-2">{row.date}</td>
                  <td className="py-2">{row.crop}</td>
                  <td className="text-right py-2 font-mono">{php(row.gross)}</td>
                  <td className="text-right py-2 text-red-600 font-mono">({php(row.deductions)})</td>
                  <td className="text-right py-2 font-mono font-medium">{php(row.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-800 text-gray-900 font-bold">
                <td className="pt-2" colSpan={3}>TOTAL</td>
                <td className="text-right pt-2 font-mono">{php(salesTotal.gross)}</td>
                <td className="text-right pt-2 text-red-600 font-mono">({php(salesTotal.deductions)})</td>
                <td className="text-right pt-2 font-mono">{php(salesTotal.net)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* II. Commission Breakdown */}
        <section className="space-y-3">
          <SectionHeading>II. Commission Breakdown</SectionHeading>
          <div className="space-y-2 text-[12px]">
            {commissions.length === 0 ? (
               <div className="text-gray-400 italic">No commissions recorded.</div>
            ) : commissions.map((c: any) => (
              <div key={c.label} className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-700">{c.label}</span>
                <span className="text-gray-900 font-mono">{php(c.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1">
              <span className="font-bold text-gray-900">Total Deductions</span>
              <span className="font-bold text-gray-900 font-mono">{php(totalDeductions)}</span>
            </div>
          </div>
        </section>

        {/* III. Share Capital Account */}
        <section className="space-y-3">
          <SectionHeading>III. Share Capital Account</SectionHeading>
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between border-b border-gray-100 pb-1.5">
              <span className="text-gray-700">Total Share Capital Accumulated (All Time)</span>
              <span className="text-gray-900 font-mono">{php(shareCapital.accumulated)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-700">Contribution This Period</span>
              <span className="text-gray-900 font-mono">{php(shareCapital.thisPeriod)}</span>
            </div>
          </div>
        </section>

        {/* IV. Loan Records */}
        <section className="space-y-3">
          <SectionHeading>IV. Loan Records</SectionHeading>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                <th className="text-left py-2 font-semibold w-[35%]">Purpose</th>
                <th className="text-left py-2 font-semibold w-[12%]">Released</th>
                <th className="text-right py-2 font-semibold w-[15%]">Principal</th>
                <th className="text-right py-2 font-semibold w-[13%]">Repaid</th>
                <th className="text-right py-2 font-semibold w-[15%]">Outstanding</th>
                <th className="text-center py-2 font-semibold w-[10%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400 italic">No loans recorded.</td>
                </tr>
              ) : loans.map((loan: any, i: number) => (
                <tr key={i} className="border-b border-gray-100 text-gray-900">
                  <td className="py-2">{loan.purpose}</td>
                  <td className="py-2">{loan.released}</td>
                  <td className="text-right py-2 font-mono">{php(loan.principal)}</td>
                  <td className="text-right py-2 font-mono text-green-700">{php(loan.repaid)}</td>
                  <td className="text-right py-2 font-mono font-medium">{php(loan.outstanding)}</td>
                  <td className="text-center py-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-sans font-medium uppercase"
                    >
                      {loan.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-800 text-gray-900 font-bold">
                <td className="pt-2" colSpan={4}>TOTAL OUTSTANDING LOANS</td>
                <td className="text-right pt-2 font-mono">{php(totalOutstanding)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </section>

        {/* V. Net Balance Summary */}
        <section className="border-2 border-gray-900 rounded-lg px-6 py-5 bg-gray-50/50 space-y-3 mt-8">
          <SectionHeading>V. Net Balance Summary</SectionHeading>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-gray-700">Total Net Sales (Period)</span>
              <span className="text-gray-900 font-mono font-medium">{php(salesTotal.net)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Less: Outstanding Loans</span>
              <span className="text-gray-900 font-mono text-red-600">({php(totalOutstanding)})</span>
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
            { name: farmerInfo.name, role: "Farmer-Member Signature / Thumb Mark" },
            { name: farmerInfo.officer, role: "Cooperative Officer / Authorized Signature" },
          ].map((sig) => (
            <div key={sig.name} className="space-y-1 text-center">
              <div className="h-10 border-b border-gray-800" />
              <p className="text-gray-900 font-bold pt-1">{sig.name}</p>
              <p className="text-gray-500">{sig.role}</p>
              <p className="text-gray-400 mt-2">Date: _______________________</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-5 mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest print:mb-0">
          Generated by ASAC — Accounting System of Agriculture Cooperatives · FACCS ·{" "}
          {farmerInfo.dateGenerated}
        </div>

      </div>
    </div>
  );
}
