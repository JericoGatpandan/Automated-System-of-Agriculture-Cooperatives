import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

import { useAuth } from "../../context/AuthContext";

export function Register() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(isAdmin ? "Officer" : "Farmer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("http://localhost:8800/api/auth/register", {
        email,
        password,
        role,
      });

      setSuccess(`Successfully registered ${email} as ${role}.`);
      setEmail("");
      setPassword("");
      // Reset role or keep it
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register user. Please check the details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Column: Logo & Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-sidebar border-r border-border p-12">
        <div className="max-w-md space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-sidebar-foreground">
            {isAdmin ? "ASAC Admin" : "Cooperative Officer"}
          </h1>
          <p className="text-xl text-muted-foreground">
            System Registration Portal
          </p>
          <div className="h-1 w-12 bg-primary mt-4 rounded"></div>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-4 sm:p-12 relative">
        <Button 
          variant="outline" 
          className="absolute top-4 right-4" 
          onClick={() => navigate(isAdmin ? "/admin" : "/coop")}
        >
          Back to Dashboard
        </Button>
        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader className="space-y-1 text-center sm:text-left">
            <CardTitle className="text-2xl font-bold">Register New User</CardTitle>
            <CardDescription>
              {isAdmin 
                ? "Create a new account for a Cooperative Officer." 
                : "Register a new Farmer to your cooperative."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {isAdmin ? (
                      <SelectItem value="Officer">Cooperative Officer</SelectItem>
                    ) : (
                      <SelectItem value="Farmer">Farmer</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {error && (
                <div className="text-sm font-medium text-destructive">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm font-medium text-success">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register User"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
