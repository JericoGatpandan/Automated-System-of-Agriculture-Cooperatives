import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Building2, Users, ShoppingCart, BookOpen } from "lucide-react";

export function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-8">System modules overview</p>

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

          {/* FarmLedger */}
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md border-border"
            id="module-farmledger"
            onClick={() => navigate("/admin/farmledger")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">FarmLedger Accounting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Federation overview, cooperative ledgers, farmer accounts, loans, and printable balance sheets.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
