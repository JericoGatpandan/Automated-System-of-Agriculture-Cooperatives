import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  ClipboardList,
  Banknote,
  TrendingUp,
  UserPlus,
  FileText,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useAuth } from "../../context/AuthContext";

interface CoopStats {
  primaryCoopID: number;
  coopName: string;
  activeFarmers: number;
  pendingAssignments: number;
  totalLoansOut: string | number;
  totalCoopSales: string | number;
}

interface RecentAssignment {
  assignmentID: number;
  orderID: number;
  assignedDate: string;
  quantityRequired: number;
  status: string;
  BuyerOrder?: {
    buyerCompany: string;
    urgencyLevel: string;
    CropType?: { cropName: string };
  };
}

export function CoopDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<CoopStats | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<
    RecentAssignment[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Assuming user object has primaryCoopID or it's fetched via profile context
      // For this prototype, we'll fetch the user's coop ID first, or pass a default if not fully implemented in AuthContext
      try {
        const token = localStorage.getItem("asac_token");
        // Temp mock: assuming user.primaryCoopID is 1 for now if not present, in a real app this comes from profile
        const coopId = user?.primaryCoopID || 1;

        const res = await axios.get(
          `http://localhost:8800/api/dashboard/coop/${coopId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setStats(res.data.stats);
        setRecentAssignments(res.data.recentActivity);
      } catch (err) {
        console.error("Failed to load coop dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="ml-64 min-h-screen bg-gray-50/50 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(num || 0);
  };

  return (
    <div className="ml-64 min-h-screen bg-bg-canvas">
      <div className="w-full mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-strong">
            {stats?.coopName || "Cooperative"} Dashboard
          </h1>
          <p className="text-text-muted">
            Welcome back, {user?.email}. Here is your cooperative overview.
          </p>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-text-muted">
                Active Farmers
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.activeFarmers || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-text-muted">
                Pending Assignments
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pendingAssignments || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-text-muted">
                Active Loans Out
              </CardTitle>
              <Banknote className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.totalLoansOut || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-text-muted">
                Total Coop Sales
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.totalCoopSales || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <div>
          <h2 className="text-lg font-semibold text-text-strong mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => navigate("/coop/farmers/new")}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Register Farmer
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/coop/assignments")}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              View Assignments
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/coop/farmledger")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Process Loan
            </Button>
          </div>
        </div>

        {/* Recent Activity Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Order Assignments</CardTitle>
            <CardDescription>
              The 5 most recent orders assigned to your cooperative.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAssignments.length === 0 ? (
              <p className="text-sm text-text-muted">
                No recent assignments found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Assigned</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Crop Request</TableHead>
                    <TableHead>Qty Required</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAssignments.map((assignment) => (
                    <TableRow
                      key={assignment.assignmentID}
                      className="cursor-pointer"
                      onClick={() =>
                        navigate(`/coop/assignments/${assignment.assignmentID}`)
                      }
                    >
                      <TableCell>
                        {new Date(assignment.assignedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {assignment.BuyerOrder?.buyerCompany}
                      </TableCell>
                      <TableCell>
                        {assignment.BuyerOrder?.CropType?.cropName}
                      </TableCell>
                      <TableCell>{assignment.quantityRequired} kg</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            assignment.BuyerOrder?.urgencyLevel === "High"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {assignment.BuyerOrder?.urgencyLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            assignment.status === "pending"
                              ? "outline"
                              : "default"
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 text-right">
              <Button
                variant="link"
                onClick={() => navigate("/coop/assignments")}
              >
                View all assignments →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
