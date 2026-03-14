
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers/Customers";
import Suppliers from "./pages/Suppliers";
import Inventory from "./pages/Inventory";
import SalesOrders from "./pages/SalesOrders";
import PurchaseOrders from "./pages/PurchaseOrders";

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

        <Route path="products" element={<Products />} />

        <Route path="inventory" element={<Inventory />} />

        <Route path="customers" element={<Customers />} />

        <Route path="suppliers" element={<Suppliers />} />

        <Route path="sales-orders" element={<SalesOrders />} />

        <Route path="purchase-orders" element={<PurchaseOrders />} />

      </Route>

    </Routes>

  );

}

export default App;

