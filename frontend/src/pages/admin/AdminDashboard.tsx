import { BookOpen, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

export function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      {/* Content */}
      <div className="w-full mx-auto px-6 py-8">
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

          {/* Farmer Registry*/}
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md border-border"
            onClick={() => navigate("/admin/farmers")}
            id="module-farmer-registry"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Farmer Registry</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View farmer memberships across cooperatives.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Order Management*/}
    
           <Card
            className="cursor-pointer transition-shadow hover:shadow-md border-border"
            onClick={() => navigate("/admin/orders")}
            id="module-order-management"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Order Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Buyer order intake, coop assignment, and delivery tracking.
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
