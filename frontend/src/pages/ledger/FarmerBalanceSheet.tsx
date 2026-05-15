import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const farmer = {
  name: "Juan R. dela Cruz",
  membershipNo: "BHFC-001",
  address: "Shilan, La Trinidad, Benguet",
  farmSize: "1.5 ha",
  cooperative: "BHFC",
  cooperativeFullName: "Benguet Highland Farmers Cooperative",
  officer: "Maria T. Santos",
  dateGenerated: "March 16, 2026",
  period: "2025-01-01 to 2026-12-31",
};

const salesTransactions = [
  { order: "ORD-2026-001", date: "2026-01-15", crop: "Potatoes 500kg", gross: 40000, deductions: 2400, net: 37600 },
  { order: "ORD-2025-012", date: "2025-12-10", crop: "Carrots 200kg",  gross: 18000, deductions: 1080, net: 16920 },
];

const commissions = [
  { label: "Federation Fee (2% of Gross)",            amount: 1160 },
  { label: "Cooperative Service Fee (3% of Gross)",   amount: 1740 },
  { label: "Share Capital Contribution (1% of Gross)", amount: 580 },
];

const shareCapital = {
  accumulated: 580,
  thisPeriod: 580,
};

const loans = [
  {
    purpose: "Seeds and fertilizer for planting season",
    released: "2025-11-01",
    principal: 5000,
    repaid: 0,
    outstanding: 5000,
    status: "Active",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const php = (n) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);

const salesTotal = {
  gross: salesTransactions.reduce((s, r) => s + r.gross, 0),
  deductions: salesTransactions.reduce((s, r) => s + r.deductions, 0),
  net: salesTransactions.reduce((s, r) => s + r.net, 0),
};
const totalDeductions = commissions.reduce((s, c) => s + c.amount, 0);
const totalOutstanding = loans.reduce((s, l) => s + l.outstanding, 0);
const netBalance = salesTotal.net - totalOutstanding;

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeading({ children }) {
  return (
    <div className="pb-1.5 border-b border-gray-300">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-gray-900">
        {children}
      </h2>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3 text-[12px]">
      <span className="w-36 shrink-0 text-gray-400">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function FarmerBalanceSheet() {
  return (
    
    <div className="ml-74 min-h-screen bg-gray-50/50">
        

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="text-xs text-gray-400 font-sans">
          Preview — {farmer.name}
        </span>
        <button className="flex items-center gap-1.5 text-xs font-medium text-green-800 hover:text-green-700 transition-colors font-sans">
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>
      </div>

      {/* ── Document Body ───────────────────────────────────────────────────── */}
      <div className="px-10 py-8 space-y-6">

        {/* Document Header */}
        <div className="text-center pb-5 border-b-2 border-gray-800 space-y-1">
          <p className="text-[11px] tracking-widest uppercase text-gray-500">
            Republic of the Philippines
          </p>
          <h1 className="text-xl font-semibold uppercase tracking-wide text-gray-900">
            Farmer Balance Sheet
          </h1>
          <p className="text-[12px] text-gray-500">
            Federation of Agriculture Cooperatives of the Cordillera System (FACCS)
          </p>
          <p className="text-[12px] text-gray-500">{farmer.cooperativeFullName}</p>
          <p className="text-[11px] text-gray-400">Period: {farmer.period}</p>
        </div>

        {/* Farmer Info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 pb-5 border-b border-gray-200">
          <InfoRow label="Farmer Name:"    value={farmer.name} />
          <InfoRow label="Cooperative:"    value={farmer.cooperative} />
          <InfoRow label="Membership No.:" value={farmer.membershipNo} />
          <InfoRow label="Full Name:"      value={farmer.cooperativeFullName} />
          <InfoRow label="Address:"        value={farmer.address} />
          <InfoRow label="Officer:"        value={farmer.officer} />
          <InfoRow label="Farm Size:"      value={farmer.farmSize} />
          <InfoRow label="Date Generated:" value={farmer.dateGenerated} />
        </div>

        {/* I. Sales Transactions */}
        <section className="space-y-3">
          <SectionHeading>I. Sales Transactions</SectionHeading>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                {["Order", "Date", "Crop / Qty", "Gross", "Deductions", "Net"].map((h, i) => (
                  <th
                    key={h}
                    className={`py-1.5 font-semibold ${i >= 3 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salesTransactions.map((row) => (
                <tr key={row.order} className="border-b border-gray-100 text-gray-900">
                  <td className="py-1.5">{row.order}</td>
                  <td className="py-1.5">{row.date}</td>
                  <td className="py-1.5">{row.crop}</td>
                  <td className="text-right py-1.5">{php(row.gross)}</td>
                  <td className="text-right py-1.5 text-red-600">({php(row.deductions)})</td>
                  <td className="text-right py-1.5">{php(row.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-400 text-gray-900 font-semibold">
                <td className="pt-1.5" colSpan={3}>TOTAL</td>
                <td className="text-right pt-1.5">{php(salesTotal.gross)}</td>
                <td className="text-right pt-1.5 text-red-600">({php(salesTotal.deductions)})</td>
                <td className="text-right pt-1.5">{php(salesTotal.net)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* II. Commission Breakdown */}
        <section className="space-y-3">
          <SectionHeading>II. Commission Breakdown</SectionHeading>
          <div className="space-y-1.5 text-[12px]">
            {commissions.map((c) => (
              <div key={c.label} className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-800">{c.label}</span>
                <span className="text-gray-900">{php(c.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1">
              <span className="font-semibold text-gray-900">Total Deductions (6%)</span>
              <span className="font-semibold text-gray-900">{php(totalDeductions)}</span>
            </div>
          </div>
        </section>

        {/* III. Share Capital Account */}
        <section className="space-y-3">
          <SectionHeading>III. Share Capital Account</SectionHeading>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Share Capital Accumulated (All Time)</span>
              <span className="text-gray-900">{php(shareCapital.accumulated)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Contribution This Period</span>
              <span className="text-gray-900">{php(shareCapital.thisPeriod)}</span>
            </div>
          </div>
        </section>

        {/* IV. Loan Records */}
        <section className="space-y-3">
          <SectionHeading>IV. Loan Records</SectionHeading>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="text-left py-1.5 font-semibold w-[38%]">Purpose</th>
                <th className="text-left py-1.5 font-semibold w-[13%]">Released</th>
                <th className="text-right py-1.5 font-semibold w-[13%]">Principal</th>
                <th className="text-right py-1.5 font-semibold w-[10%]">Repaid</th>
                <th className="text-right py-1.5 font-semibold w-[14%]">Outstanding</th>
                <th className="text-center py-1.5 font-semibold w-[12%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, i) => (
                <tr key={i} className="border-b border-gray-100 text-gray-900">
                  <td className="py-1.5">{loan.purpose}</td>
                  <td className="py-1.5">{loan.released}</td>
                  <td className="text-right py-1.5">{php(loan.principal)}</td>
                  <td className="text-right py-1.5">{php(loan.repaid)}</td>
                  <td className="text-right py-1.5">{php(loan.outstanding)}</td>
                  <td className="text-center py-1.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-sans font-medium bg-amber-50 text-amber-700 border-amber-200"
                    >
                      {loan.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-400 text-gray-900 font-semibold">
                <td className="pt-1.5" colSpan={4}>TOTAL OUTSTANDING LOANS</td>
                <td className="text-right pt-1.5">{php(totalOutstanding)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </section>

        {/* V. Net Balance Summary */}
        <section className="border-2 border-gray-800 rounded-sm px-5 py-4 space-y-3">
          <SectionHeading>V. Net Balance Summary</SectionHeading>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Net Sales (Period)</span>
              <span className="text-gray-900">{php(salesTotal.net)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Less: Outstanding Loans</span>
              <span className="text-gray-900">({php(totalOutstanding)})</span>
            </div>
            <Separator className="my-1 bg-gray-500" />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[14px] font-semibold text-gray-900 uppercase tracking-wide">
                Net Balance
              </span>
              <span className="text-[14px] font-semibold text-green-800">
                {php(netBalance)}
              </span>
            </div>
          </div>
        </section>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-2 text-[12px]">
          {[
            { name: farmer.name,    role: "Farmer-Member Signature / Thumb Mark" },
            { name: farmer.officer, role: "Cooperative Officer Signature" },
          ].map((sig) => (
            <div key={sig.name} className="space-y-1 text-center">
              <div className="h-8 border-b border-gray-800" />
              <p className="text-gray-900">{sig.name}</p>
              <p className="text-gray-400">{sig.role}</p>
              <p className="text-gray-300">Date: _______________________</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-center text-[11px] text-gray-300">
          Generated by ASAC — Accounting System of Agriculture Cooperatives · FACCS ·{" "}
          {farmer.dateGenerated}
        </div>

      </div>
    </div>
  );
}
