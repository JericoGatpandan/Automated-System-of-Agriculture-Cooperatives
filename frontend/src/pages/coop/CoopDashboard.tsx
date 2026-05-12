import { useAuth } from "../../context/AuthContext";

export function CoopDashboard() {
  const { user } = useAuth();

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="w-full mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Cooperative Officer overview
        </p>
        <div className="bg-card text-card-foreground border rounded-lg p-6">
          <p>Welcome, {user?.email}. Your cooperative management modules will appear here.</p>
        </div>
      </div>
    </div>
  );
}
