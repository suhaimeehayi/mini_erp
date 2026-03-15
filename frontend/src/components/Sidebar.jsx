import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Box, Users, Truck, Package, ShoppingCart, ClipboardList, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Sidebar() {

  const location = useLocation();
  const navigate = useNavigate();
  const { hasAnyPermission, hasPermission } = useAuth();

  const menu = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    ...(hasAnyPermission(["view_users", "view_roles", "add_users", "change_users", "add_roles", "change_roles"]) ? [{ name: "Accounts", path: "/accounts", icon: <ShieldCheck size={18} /> }] : []),
    ...(hasPermission("view_products") ? [{ name: "Products", path: "/products", icon: <Box size={18} /> }] : []),
    ...(hasPermission("view_inventory") ? [{ name: "Inventory", path: "/inventory", icon: <Package size={18} /> }] : []),
    ...(hasPermission("view_customers") ? [{ name: "Customers", path: "/customers", icon: <Users size={18} /> }] : []),
    ...(hasPermission("view_suppliers") ? [{ name: "Suppliers", path: "/suppliers", icon: <Truck size={18} /> }] : []),
    ...(hasPermission("view_sales_orders") ? [{ name: "Sales", path: "/sales", icon: <ShoppingCart size={18} /> }] : []),
    ...(hasPermission("view_purchase_orders") ? [{ name: "Purchases", path: "/purchases", icon: <ClipboardList size={18} /> }] : []),
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path) => {

    if (location.pathname === path) return;

    navigate(path);

  };

  return (

    <div className="w-64 bg-gray-900 text-gray-200 flex flex-col min-h-screen">

      {/* Logo */}

      <div className="px-6 py-5 border-b border-gray-800">

        <h1 className="text-xl font-bold text-white">
          Mini ERP
        </h1>

        <p className="text-xs text-gray-400 mt-1">
          Management System
        </p>

      </div>

      {/* Menu */}

      <nav className="flex-1 px-4 py-6">

        <ul className="space-y-2">

          {menu.map((item) => (

            <li key={item.name}>

              <button
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition
                ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800"
                }`}
              >

                {item.icon}

                {item.name}

              </button>

            </li>

          ))}

        </ul>

      </nav>

      {/* Footer */}

      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-400">

        © 2026 Mini ERP

      </div>

    </div>

  );

}

export default Sidebar;
