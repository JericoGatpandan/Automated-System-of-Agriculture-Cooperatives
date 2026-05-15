import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Building2, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  PlusCircle, 
  UserPlus, 
  FileText,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
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

interface AdminStats {
  totalCooperatives: number;
  totalFarmers: number;
  pendingOrders: number;
  totalSalesVolume: string | number;
}

interface RecentOrder {
  orderID: number;
  buyerCompany: string;
  requestedQuantity: number;
  urgencyLevel: string;
  status: string;
  createdAt: string;
  CropType?: { cropName: string };
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8800/api/dashboard/admin", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.stats);
        setRecentOrders(res.data.recentActivity);
      } catch (err) {
        console.error("Failed to load admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          <h1 className="text-2xl font-bold text-text-strong">Welcome back, {user?.email}</h1>
          <p className="text-text-muted">Here is your federation overview for today.</p>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-text-muted">Total Cooperatives</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCooperatives || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-text-muted">Registered Farmers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalFarmers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-text-muted">Pending Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-text-muted">Total Sales Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalSalesVolume || 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <div>
          <h2 className="text-lg font-semibold text-text-strong mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/admin/orders/new")} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Order
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/cooperatives")} className="gap-2">
              <Building2 className="h-4 w-4" />
              Manage Cooperatives
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/register")} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Register Officer
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/farmledger")} className="gap-2">
              <FileText className="h-4 w-4" />
              View Federation Ledger
            </Button>
          </div>
        </div>

        {/* Recent Activity Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Recent Buyer Orders</CardTitle>
            <CardDescription>The 5 most recently created orders in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-text-muted">No recent orders found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Crop Request</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.orderID} className="cursor-pointer" onClick={() => navigate(`/admin/orders/${order.orderID}`)}>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{order.buyerCompany}</TableCell>
                      <TableCell>{order.CropType?.cropName}</TableCell>
                      <TableCell>{order.requestedQuantity} kg</TableCell>
                      <TableCell>
                        <Badge variant={order.urgencyLevel === "High" ? "destructive" : "secondary"}>
                          {order.urgencyLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === "pending" ? "outline" : "default"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 text-right">
              <Button variant="link" onClick={() => navigate("/admin/orders")}>
                View all orders →
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
