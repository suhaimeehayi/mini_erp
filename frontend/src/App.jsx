
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Accounts from "./pages/Accounts/Accounts";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products/Products";
import Customers from "./pages/Customers/Customers";
import Suppliers from "./pages/Suppliers/Suppliers";
import Inventory from "./pages/Inventory/Inventory";
import SalesOrders from "./pages/SalesOrders/SalesOrders";
import PurchaseOrders from "./pages/PurchaseOrders/PurchaseOrders";

/* =========================
   Layout Component
========================= */

function Layout() {

  return (

    <div className="flex min-h-screen w-full bg-gray-100">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Navbar />

        <main className="flex-1 p-6">

          <Outlet />

        </main>

      </div>

    </div>

  );

}

/* =========================
   App Router
========================= */

function App() {

  const { isAuthenticated } = useAuth();

  return (

    <Routes>

      {/* Login */}

      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
      />

      {/* Protected Layout */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        {/* Child Routes */}

        <Route index element={<Dashboard />} />

        <Route path="accounts" element={<ProtectedRoute requiredPermissions={["view_users", "view_roles", "add_users", "change_users", "add_roles", "change_roles"]} requireAny><Accounts /></ProtectedRoute>} />

        <Route path="products" element={<ProtectedRoute requiredPermissions={["view_products"]}><Products /></ProtectedRoute>} />

        <Route path="inventory" element={<ProtectedRoute requiredPermissions={["view_inventory"]}><Inventory /></ProtectedRoute>} />

        <Route path="customers" element={<ProtectedRoute requiredPermissions={["view_customers"]}><Customers /></ProtectedRoute>} />

        <Route path="suppliers" element={<ProtectedRoute requiredPermissions={["view_suppliers"]}><Suppliers /></ProtectedRoute>} />

        <Route path="sales" element={<ProtectedRoute requiredPermissions={["view_sales_orders"]}><SalesOrders /></ProtectedRoute>} />

        <Route path="purchases" element={<ProtectedRoute requiredPermissions={["view_purchase_orders"]}><PurchaseOrders /></ProtectedRoute>} />

        <Route path="sales-orders" element={<Navigate to="/sales" replace />} />

        <Route path="purchase-orders" element={<Navigate to="/purchases" replace />} />

      </Route>

    </Routes>

  );

}

export default App;

