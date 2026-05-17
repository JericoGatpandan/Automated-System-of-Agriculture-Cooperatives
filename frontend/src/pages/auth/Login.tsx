import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

import asacLogo from "../../assets/logo.png";
import { API_URL } from "../../lib/api";
// import logotext from "../../assets/logo-text.png";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
        },
      );

      const { token, user } = response.data;
      login(token, user);

      // Redirect based on role
      switch (user.role) {
        case "Admin":
          navigate("/admin");
          break;
        case "Officer":
          navigate("/coop");
          break;
        case "Farmer":
          navigate("/farmer");
          break;
        default:
          setError("Unknown role.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Failed to sign in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Column: Logo & Branding */}
      <div className="w-[50vw] self-stretch px-16 py-40 bg-white inline-flex flex-col justify-center items-center gap-3 overflow-hidden">
        <div className="max-w-md space-y-4">
          <img
            src={asacLogo}
            alt="ASAC Logo"
            className="size-60 object-contain mx-auto"
          />
          <h1 className="text-5xl font-bold tracking-tight text-sidebar-foreground text-center">
            ASAC
          </h1>
          <p className="text-xl text-muted-foreground text-center font-bold">
            Automated System of Agriculture Cooperatives
          </p>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-4 sm:p-12">
        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader className="space-y-1 text-center sm:text-left">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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

              {error && (
                <div className="text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="inline-flex justify-center items-center gap-2 mt-4 w-full">
              <div className="text-sm text-muted-foreground">Not yet part of the federation?</div>
              <Button variant="link" onClick={() => navigate("/register")} className="p-0 h-auto text-primary">
                Join FACCS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
