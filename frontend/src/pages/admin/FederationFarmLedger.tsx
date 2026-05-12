import axios from "axios";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

interface CoopRow {
  primaryCoopID: number;
  coopName: string;
  farmersWithAccounts: number;
  totalGrossSales: number;
  totalNetEarnings: number;
  totalFederationFee: number;
  totalCooperativeFee: number;
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
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API);
      setDeliveriesCompleted(res.data.deliveriesCompleted);
      setTotalGrossSales(res.data.totalGrossSales);
      setTotalFederationFees(res.data.totalFederationFees);
      setTotalCooperativeFees(res.data.totalCooperativeFees);
      setTotalShareCapital(res.data.totalShareCapital);
      setCooperativeSummary(res.data.cooperativeSummary || []);
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

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="mx-auto flex min-h-screen w-full flex-col px-6 py-8">
        <h1 className="text-xl font-bold text-foreground mb-2">
          Farm Ledger — Federation Overview
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Deliveries completed</CardDescription>
                  <CardTitle className={`text-2xl ${mono}`}>
                    {deliveriesCompleted.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total gross sales</CardDescription>
                  <CardTitle className={`text-xl ${mono}`}>
                    {formatPhp(totalGrossSales)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Federation fees</CardDescription>
                  <CardTitle className={`text-xl ${mono}`}>
                    {formatPhp(totalFederationFees)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Cooperative fees</CardDescription>
                  <CardTitle className={`text-xl ${mono}`}>
                    {formatPhp(totalCooperativeFees)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Share capital</CardDescription>
                  <CardTitle className={`text-xl ${mono}`}>
                    {formatPhp(totalShareCapital)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="flex min-h-0 flex-1 flex-col">
              <CardHeader>
                <CardTitle className="text-base">Cooperative summary</CardTitle>
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
