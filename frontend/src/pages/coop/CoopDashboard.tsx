import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

export function CoopDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Cooperative Officer Dashboard</h1>
          <Button variant="outline" onClick={logout}>Sign Out</Button>
        </div>
        <div className="bg-card text-card-foreground border rounded-lg p-6">
          <p>Welcome, {user?.email}. You have successfully accessed the Coop Officer protected route.</p>
          <div className="mt-4 space-x-4">
            <Button onClick={() => navigate("/register")}>Register New Farmer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
