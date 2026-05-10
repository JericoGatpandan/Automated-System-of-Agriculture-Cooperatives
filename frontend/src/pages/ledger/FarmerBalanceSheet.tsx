import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Printer } from "lucide-react";
import { formatPhp } from "../../lib/money";

interface StatementState {
  statement: {
    periodStart: string;
    periodEnd: string;
    generatedDate: string;
    totalGrossSales: number;
    totalCommission: number;
    totalShareCapital: number;
    totalLoans: number;
    netBalance: number;
  };
  farmerName?: string;
  coopName?: string;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function FarmerBalanceSheet() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as StatementState | null;

  useEffect(() => {
    if (!state?.statement) {
      navigate(-1);
    }
  }, [state, navigate]);

  if (!state?.statement) {
    return null;
  }

  const { statement, farmerName, coopName } = state;
  const mono = "font-[family-name:var(--font-mono)] tabular-nums";

  return (
    <div className="min-h-screen bg-white text-black print:bg-white print:text-black">
      <div className="max-w-3xl mx-auto px-8 py-10 print:py-6 print:max-w-none">
        <div className="flex justify-end mb-6 print:hidden">
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        <header className="border-b border-black pb-4 mb-6">
          <h1 className="text-xl font-bold uppercase tracking-tight">
            Farmer balance sheet
          </h1>
          <p className="text-sm mt-2">
            <span className="font-semibold">Farmer:</span> {farmerName || "—"}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Cooperative:</span> {coopName || "—"}
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold">Period:</span>{" "}
            {fmtDate(statement.periodStart)} — {fmtDate(statement.periodEnd)}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Generated:</span>{" "}
            {fmtDate(statement.generatedDate)}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8 text-sm">
          <div className="flex justify-between border-b border-black/20 py-1">
            <span>Total gross sales</span>
            <span className={mono}>{formatPhp(statement.totalGrossSales)}</span>
          </div>
          <div className="flex justify-between border-b border-black/20 py-1">
            <span>Total commission</span>
            <span className={mono}>{formatPhp(statement.totalCommission)}</span>
          </div>
          <div className="flex justify-between border-b border-black/20 py-1">
            <span>Total share capital</span>
            <span className={mono}>{formatPhp(statement.totalShareCapital)}</span>
          </div>
          <div className="flex justify-between border-b border-black/20 py-1">
            <span>Total loans (outstanding)</span>
            <span className={mono}>{formatPhp(statement.totalLoans)}</span>
          </div>
          <div className="flex justify-between border-b-2 border-black py-2 font-semibold col-span-2">
            <span>Net balance</span>
            <span className={mono}>{formatPhp(statement.netBalance)}</span>
          </div>
        </section>

        <p className="text-xs text-black/70 mb-12">
          This statement is a snapshot generated from persisted ledger records and does not change after creation.
        </p>

        <div className="grid grid-cols-2 gap-16 mt-16 print:mt-12">
          <div>
            <div className="border-t border-black pt-2 text-sm">
              <p className="font-semibold mb-8">Farmer signature</p>
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-2 text-sm">
              <p className="font-semibold mb-8">Officer / Authorized signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
