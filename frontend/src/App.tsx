import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { AppShell } from "./components/layout/AppShell"
import { TooltipProvider } from "./components/ui/tooltip"

import { Login } from "./pages/auth/Login"
import { Register } from "./pages/auth/Register"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { CooperativeRegistry } from "./pages/admin/CooperativeRegistry"
import { CoopDashboard } from "./pages/coop/CoopDashboard"
import { FarmerDashboard } from "./pages/farmer/FarmerDashboard"

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AppShell>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="cooperatives" element={<CooperativeRegistry />} />
                    <Route path="register" element={<Register />} />
                  </Routes>
                </AppShell>
              </ProtectedRoute>
            } />

            {/* Coop Officer Routes */}
            <Route path="/coop/*" element={
              <ProtectedRoute allowedRoles={["Officer"]}>
                <AppShell>
                  <Routes>
                    <Route index element={<CoopDashboard />} />
                    <Route path="register" element={<Register />} />
                  </Routes>
                </AppShell>
              </ProtectedRoute>
            } />

            {/* Farmer Routes */}
            <Route path="/farmer/*" element={
              <ProtectedRoute allowedRoles={["Farmer"]}>
                <AppShell>
                  <Routes>
                    <Route index element={<FarmerDashboard />} />
                  </Routes>
                </AppShell>
              </ProtectedRoute>
            } />

            {/* Legacy /register redirect */}
            <Route path="/register" element={<Navigate to="/admin/register" replace />} />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  )
}

export default App
