import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Building2, Users, ShoppingCart, BookOpen } from "lucide-react";

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-card-foreground">FACCS Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={logout}>Sign Out</Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold mb-6 text-foreground">System Modules</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cooperative Registry */}
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md border-border"
            onClick={() => navigate("/admin/cooperatives")}
            id="module-cooperative-registry"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Cooperative Registry</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage federation cooperatives — register, update, and deactivate primary cooperatives and their officers.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Farmer Registry — coming soon */}
          <Card className="opacity-60 border-border" id="module-farmer-registry">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">Farmer Registry</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View farmer memberships across cooperatives. <em>Coming soon.</em>
              </CardDescription>
            </CardContent>
          </Card>

          {/* Order Management — coming soon */}
          <Card className="opacity-60 border-border" id="module-order-management">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">Order Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Buyer order intake, coop assignment, and delivery tracking. <em>Coming soon.</em>
              </CardDescription>
            </CardContent>
          </Card>

          {/* FarmLedger — coming soon */}
          <Card className="opacity-60 border-border" id="module-farmledger">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">FarmLedger Accounting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sales, fees, and share-capital tracking with printable statements. <em>Coming soon.</em>
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
