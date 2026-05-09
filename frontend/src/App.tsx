import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"

import { Login } from "./pages/auth/Login"
import { Register } from "./pages/auth/Register"
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { CooperativeRegistry } from "./pages/admin/CooperativeRegistry"
import { CoopDashboard } from "./pages/coop/CoopDashboard"
import { FarmerDashboard } from "./pages/farmer/FarmerDashboard"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/cooperatives" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <CooperativeRegistry />
            </ProtectedRoute>
          } />
          
          <Route path="/register" element={
            <ProtectedRoute allowedRoles={["Admin", "Officer"]}>
              <Register />
            </ProtectedRoute>
          } />

          <Route path="/coop" element={
            <ProtectedRoute allowedRoles={["Officer"]}>
              <CoopDashboard />
            </ProtectedRoute>
          } />

          <Route path="/farmer" element={
            <ProtectedRoute allowedRoles={["Farmer"]}>
              <FarmerDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
