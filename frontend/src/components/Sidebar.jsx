import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Box, Users, Truck, Package, ShoppingCart, ClipboardList } from "lucide-react";

function Sidebar() {

  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Products", path: "/products", icon: <Box size={18} /> },
    { name: "Inventory", path: "/inventory", icon: <Package size={18} /> },
    { name: "Customers", path: "/customers", icon: <Users size={18} /> },
    { name: "Suppliers", path: "/suppliers", icon: <Truck size={18} /> },
    { name: "Sales Orders", path: "/sales-orders", icon: <ShoppingCart size={18} /> },
    { name: "Purchase Orders", path: "/purchase-orders", icon: <ClipboardList size={18} /> }
  ];

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
                  location.pathname === item.path
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
