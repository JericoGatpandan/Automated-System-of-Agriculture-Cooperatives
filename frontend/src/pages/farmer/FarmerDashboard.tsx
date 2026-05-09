import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";

export function FarmerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
          <Button variant="outline" onClick={logout}>Sign Out</Button>
        </div>
        <div className="bg-card text-card-foreground border rounded-lg p-6">
          <p>Welcome, {user?.email}. You have successfully accessed the Farmer protected route.</p>
        </div>
      </div>
    </div>
  );
}
