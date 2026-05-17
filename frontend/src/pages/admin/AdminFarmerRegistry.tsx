import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { Eye, Loader2, Search, Users } from "lucide-react";
import { API_URL } from "../../lib/api";

const API = `${API_URL}/api/farmers`;

interface FarmerRow {
  farmerID: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffixName: string | null;
  farmName: string | null;
  municipality: string;
  barangay: string;
  FarmerCooperatives?: {
    joinedDate: string;
    status: string;
    PrimaryCooperative?: { coopName: string };
  }[];
  Products?: {
    CropType?: { cropName: string };
  }[];
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AdminFarmerRegistry() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pageSize = 10;

  const [farmers, setFarmers] = useState<FarmerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFarmers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API);
      setFarmers(res.data.farmers);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load farmers");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  const filtered = farmers.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.firstName.toLowerCase().includes(q) ||
      f.lastName.toLowerCase().includes(q) ||
      (f.farmName || "").toLowerCase().includes(q) ||
      f.municipality.toLowerCase().includes(q) ||
      f.barangay.toLowerCase().includes(q) ||
      f.FarmerCooperatives?.some((fc) =>
        (fc.PrimaryCooperative?.coopName || "").toLowerCase().includes(q),
      )
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="mx-auto flex min-h-screen w-full flex-col px-6 py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Farmer Registry
            </h1>
            <p className="text-sm text-muted-foreground">
              View farmer memberships across all cooperatives
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-farmers"
              placeholder="Search by name, farm, location, or cooperative…"
              className="pl-9 h-10 text-sm"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50 mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={fetchFarmers}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading farmers…</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <Card className="flex min-h-0 flex-1 flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                All Registered Farmers
              </CardTitle>
              <CardDescription>
                {filtered.length} of {farmers.length} farmer
                {farmers.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    {search
                      ? "No farmers match your search"
                      : "No farmers registered yet"}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <ScrollArea className="min-h-0 flex-1">
                    <div className="min-w-[900px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="sticky top-0 z-10 bg-muted hover:bg-muted">
                            <TableHead className="font-semibold text-muted-foreground w-[18%]">
                              Farmer Name
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground w-[12%]">
                              Farm
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground w-[16%]">
                              Location
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground w-[16%]">
                              Cooperative
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground w-[12%]">
                              Crops
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground w-[10%]">
                              Joined
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-center w-[8%]">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-right w-[8%] pr-4">
                              View
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginated.map((f) => {
                            const membership = f.FarmerCooperatives?.[0];
                            const crops =
                              f.Products?.map((p) => p.CropType?.cropName)
                                .filter(Boolean)
                                .join(", ") || "—";

                            return (
                              <TableRow
                                key={f.farmerID}
                                className="cursor-pointer"
                                onClick={() =>
                                  navigate(`/admin/farmers/${f.farmerID}`)
                                }
                              >
                                <TableCell className="py-3 font-semibold">
                                  {f.lastName}, {f.firstName}
                                  {f.middleName ? ` ${f.middleName}` : ""}
                                </TableCell>
                                <TableCell className="py-3 truncate max-w-[120px]">
                                  {f.farmName || "—"}
                                </TableCell>
                                <TableCell className="py-3 truncate max-w-[160px]">
                                  {f.barangay}, {f.municipality}
                                </TableCell>
                                <TableCell className="py-3 truncate max-w-[160px]">
                                  {membership?.PrimaryCooperative?.coopName ||
                                    "—"}
                                </TableCell>
                                <TableCell className="py-3 truncate max-w-[120px]">
                                  {crops}
                                </TableCell>
                                <TableCell className="py-3">
                                  {membership
                                    ? fmtDate(membership.joinedDate)
                                    : "—"}
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                  <Badge
                                    variant="outline"
                                    className={
                                      membership?.status === "active"
                                        ? "border-green-500/50 text-green-700 bg-green-50"
                                        : "border-gray-300 text-gray-500 bg-gray-50"
                                    }
                                  >
                                    {membership?.status || "unknown"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-3 text-right pr-4">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/admin/farmers/${f.farmerID}`);
                                    }}
                                    id={`view-farmer-${f.farmerID}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
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
