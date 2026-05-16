import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";
import { applyTheme, getStoredTheme } from "./lib/theme";

import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { CooperativeRegistry } from "./pages/admin/CooperativeRegistry";
import { CoopDashboard } from "./pages/coop/CoopDashboard";
import { FarmerDashboard } from "./pages/farmer/FarmerDashboard";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { AdminFarmerRegistry } from "./pages/admin/AdminFarmerRegistry";
import { AdminRequests } from "./pages/admin/AdminRequests";
import { CoopFarmerRegistry } from "./pages/coop/CoopFarmerRegistry";
import { FarmerForm } from "./pages/coop/FarmerForm";
import { FarmerDetail } from "./pages/coop/FarmerDetail";
import { ProductInventoryPage } from "./pages/inventory/ProductInventoryPage";
import { OrderList } from "./pages/admin/OrderList";
import { OrderForm } from "./pages/admin/OrderForm";
import { OrderDetail } from "./pages/admin/OrderDetail";
import { CoopAssignments } from "./pages/coop/CoopAssignments";
import { AssignmentDetail } from "./pages/coop/AssignmentDetail";
import { DeliveryList } from "./pages/admin/DeliveryList";
import { DeliveryForm } from "./pages/admin/DeliveryForm";
import { DeliveryDetail } from "./pages/admin/DeliveryDetail";
import { FederationFarmLedger } from "./pages/admin/FederationFarmLedger";
import { CooperativeLedgerList } from "./pages/ledger/CooperativeLedgerList";
import { FarmerLedgerDetail } from "./pages/ledger/FarmerLedgerDetail";
import { FarmerBalanceSheet } from "./pages/ledger/FarmerBalanceSheet";
import { LandingPage } from "./pages/landing/LandingPage";
import { DocumentationPage } from "./pages/landing/DocumentationPage";
import { AboutPage } from "./pages/landing/AboutPage";
import { SettingsPage } from "./pages/settings/SettingsPage";

function App() {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AppShell>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route
                        path="cooperatives"
                        element={<CooperativeRegistry />}
                      />
                      <Route path="register" element={<Register />} />
                      <Route path="requests" element={<AdminRequests />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="farmers" element={<AdminFarmerRegistry />} />
                      <Route path="farmers/:id" element={<FarmerDetail />} />
                      <Route
                        path="products"
                        element={<ProductInventoryPage mode="admin" />}
                      />
                      <Route path="orders" element={<OrderList />} />
                      <Route path="orders/new" element={<OrderForm />} />
                      <Route path="orders/:id" element={<OrderDetail />} />
                      <Route path="orders/:id/edit" element={<OrderForm />} />
                      <Route path="deliveries" element={<DeliveryList />} />
                      <Route path="deliveries/new" element={<DeliveryForm />} />
                      <Route
                        path="deliveries/:id"
                        element={<DeliveryDetail />}
                      />
                      <Route
                        path="deliveries/:id/edit"
                        element={<DeliveryForm />}
                      />
                      <Route
                        path="farmledger/coops/:coopId"
                        element={<CooperativeLedgerList mode="admin" />}
                      />
                      <Route
                        path="farmledger/farmers/:farmerId/statement"
                        element={<FarmerBalanceSheet />}
                      />
                      <Route
                        path="farmledger/farmers/:farmerId"
                        element={<FarmerLedgerDetail variant="admin" />}
                      />
                      <Route
                        path="farmledger"
                        element={<FederationFarmLedger />}
                      />
                    </Routes>
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Coop Officer Routes */}
            <Route
              path="/coop/*"
              element={
                <ProtectedRoute allowedRoles={["Officer"]}>
                  <AppShell>
                    <Routes>
                      <Route index element={<CoopDashboard />} />
                      <Route path="register" element={<Register />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="farmers" element={<CoopFarmerRegistry />} />
                      <Route path="farmers/new" element={<FarmerForm />} />
                      <Route path="farmers/:id" element={<FarmerDetail />} />
                      <Route path="farmers/:id/edit" element={<FarmerForm />} />
                      <Route
                        path="products"
                        element={<ProductInventoryPage mode="coop" />}
                      />
                      <Route path="assignments" element={<CoopAssignments />} />
                      <Route
                        path="assignments/:id"
                        element={<AssignmentDetail />}
                      />
                      <Route
                        path="farmledger/farmers/:farmerId/statement"
                        element={<FarmerBalanceSheet />}
                      />
                      <Route
                        path="farmledger/farmers/:farmerId"
                        element={<FarmerLedgerDetail variant="coop" />}
                      />
                      <Route
                        path="farmledger"
                        element={<CooperativeLedgerList mode="officer" />}
                      />
                    </Routes>
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Farmer Routes */}
            <Route
              path="/farmer/*"
              element={
                <ProtectedRoute allowedRoles={["Farmer"]}>
                  <AppShell>
                    <Routes>
                      <Route index element={<FarmerDashboard />} />
                      <Route
                        path="ledger/statement"
                        element={<FarmerBalanceSheet />}
                      />
                      <Route
                        path="ledger"
                        element={<FarmerLedgerDetail variant="farmer" self />}
                      />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Legacy /register redirect */}
            <Route path="/register" element={<Register />} />

            {/* Fallback → public landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
