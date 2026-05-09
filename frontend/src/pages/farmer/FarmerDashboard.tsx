import { useAuth } from "../../context/AuthContext";

export function FarmerDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-foreground mb-2">My Ledger</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Your personal FarmLedger
        </p>
        <div className="bg-card text-card-foreground border rounded-lg p-6">
          <p>Welcome, {user?.email}. Your financial ledger will appear here.</p>
        </div>
      </div>
    </div>
  );
}
