import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";

export function FarmerDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Welcome back{user?.email ? `, ${user.email}` : ""}.
        </p>
        <div className="bg-card text-card-foreground border rounded-lg p-6 max-w-md">
          <p className="text-sm text-muted-foreground mb-4">
            View your sales history, fees, share capital, and loans on your FarmLedger.
          </p>
          <Button asChild>
            <Link to="/farmer/ledger">Open My Ledger</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
