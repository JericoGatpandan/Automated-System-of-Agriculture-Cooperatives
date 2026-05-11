import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../components/ui/card";

import { ClipboardList, Eye, Loader2 } from "lucide-react";

const API = "http://localhost:8800/api/assignments";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-500/50",
  matched: "bg-blue-50 text-blue-700 border-blue-500/50",
  ready: "bg-green-50 text-green-700 border-green-500/50",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function CoopAssignments() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/my-coop`);
      setAssignments(res.data.assignments);
    } catch (err: any) {
      if (err.response?.status === 401) { logout(); navigate("/login"); return; }
      setError(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">My Assignments</h1>
            <p className="text-sm text-muted-foreground">Orders assigned to your cooperative</p>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50 mb-6"><CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetch}>Retry</Button>
          </CardContent></Card>
        )}

        {loading ? (
          <Card><CardContent className="py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading assignments…</p>
          </CardContent></Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cooperative Assignments</CardTitle>
              <CardDescription>{assignments.length} assignment{assignments.length !== 1 ? "s" : ""}</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No assignments yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      <TableHead className="font-semibold text-muted-foreground">Order #</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Buyer</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Crop</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">Qty Required</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Assigned</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-center">Status</TableHead>
                      <TableHead className="font-semibold text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((a: any) => (
                      <TableRow key={a.assignmentID}>
                        <TableCell className="py-4 font-semibold">ORD-{a.BuyerOrder?.orderID || a.orderID}</TableCell>
                        <TableCell className="py-4">{a.BuyerOrder?.buyerName || "—"}</TableCell>
                        <TableCell className="py-4">{a.BuyerOrder?.CropType?.cropName || "—"}</TableCell>
                        <TableCell className="py-4 text-right font-mono">{a.quantityRequired?.toLocaleString()}</TableCell>
                        <TableCell className="py-4">{fmtDate(a.assignedDate)}</TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge variant="outline" className={STATUS_COLORS[a.status] || ""}>{a.status}</Badge>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/coop/assignments/${a.assignmentID}`)}
                            id={`view-assignment-${a.assignmentID}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
