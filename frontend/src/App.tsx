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
import { ProfilePage } from "./pages/profile/ProfilePage"
import { AdminFarmerRegistry } from "./pages/admin/AdminFarmerRegistry"
import { CoopFarmerRegistry } from "./pages/coop/CoopFarmerRegistry"
import { FarmerForm } from "./pages/coop/FarmerForm"
import { FarmerDetail } from "./pages/coop/FarmerDetail"
import { OrderList } from "./pages/admin/OrderList"
import { OrderForm } from "./pages/admin/OrderForm"
import { OrderDetail } from "./pages/admin/OrderDetail"
import { CoopAssignments } from "./pages/coop/CoopAssignments"
import { AssignmentDetail } from "./pages/coop/AssignmentDetail"

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
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="farmers" element={<AdminFarmerRegistry />} />
                    <Route path="farmers/:id" element={<FarmerDetail />} />
                    <Route path="orders" element={<OrderList />} />
                    <Route path="orders/new" element={<OrderForm />} />
                    <Route path="orders/:id" element={<OrderDetail />} />
                    <Route path="orders/:id/edit" element={<OrderForm />} />
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
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="farmers" element={<CoopFarmerRegistry />} />
                    <Route path="farmers/new" element={<FarmerForm />} />
                    <Route path="farmers/:id" element={<FarmerDetail />} />
                    <Route path="farmers/:id/edit" element={<FarmerForm />} />
                    <Route path="assignments" element={<CoopAssignments />} />
                    <Route path="assignments/:id" element={<AssignmentDetail />} />
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
                    <Route path="profile" element={<ProfilePage />} />
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
