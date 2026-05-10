import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../components/ui/card";

import { Users, Eye, Search, Loader2 } from "lucide-react";

const API = "http://localhost:8800/api/farmers";

interface FarmerRow {
  farmerID: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffixName: string | null;
  farmName: string | null;
  farmLocation: string;
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
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function AdminFarmerRegistry() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [farmers, setFarmers] = useState<FarmerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchFarmers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API);
      setFarmers(res.data.farmers);
    } catch (err: any) {
      if (err.response?.status === 401) { logout(); navigate("/login"); return; }
      setError(err.response?.data?.message || "Failed to load farmers");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => { fetchFarmers(); }, [fetchFarmers]);

  const filtered = farmers.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.firstName.toLowerCase().includes(q) ||
      f.lastName.toLowerCase().includes(q) ||
      (f.farmName || "").toLowerCase().includes(q) ||
      f.farmLocation.toLowerCase().includes(q) ||
      f.FarmerCooperatives?.some((fc) =>
        (fc.PrimaryCooperative?.coopName || "").toLowerCase().includes(q)
      )
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Farmer Registry</h1>
            <p className="text-sm text-muted-foreground">View farmer memberships across all cooperatives</p>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50 mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={fetchFarmers}>Retry</Button>
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">All Registered Farmers</CardTitle>
              <CardDescription>{filtered.length} of {farmers.length} farmer{farmers.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    {search ? "No farmers match your search" : "No farmers registered yet"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="font-semibold text-muted-foreground">Farmer Name</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Farm</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Location</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Cooperative</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Crops</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Joined</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-center">Status</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((f) => {
                      const membership = f.FarmerCooperatives?.[0];
                      const crops = f.Products?.map((p) => p.CropType?.cropName).filter(Boolean).join(", ") || "—";

                      return (
                        <TableRow key={f.farmerID}>
                          <TableCell className="py-4 font-semibold">
                            {f.lastName}, {f.firstName}{f.middleName ? ` ${f.middleName}` : ""}
                          </TableCell>
                          <TableCell className="py-4">{f.farmName || "—"}</TableCell>
                          <TableCell className="py-4">{f.farmLocation}</TableCell>
                          <TableCell className="py-4">
                            {membership?.PrimaryCooperative?.coopName || "—"}
                          </TableCell>
                          <TableCell className="py-4">{crops}</TableCell>
                          <TableCell className="py-4">
                            {membership ? fmtDate(membership.joinedDate) : "—"}
                          </TableCell>
                          <TableCell className="py-4 text-center">
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
                          <TableCell className="py-4 text-right">
                            <Button
                              variant="ghost" size="icon"
                              onClick={() => navigate(`/admin/farmers/${f.farmerID}`)}
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
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
