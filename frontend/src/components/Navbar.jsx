import { LogOut, Bell, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.full_name || user?.username || "User";
  const roleName = user?.role_name || (user?.is_staff ? "Staff" : "User");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (

    <div className="w-full flex-shrink-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between text-gray-200">

      {/* Left */}

      <div>

        <h2 className="text-lg font-semibold text-white">
          ERP Dashboard
        </h2>

        <p className="text-xs text-gray-400">
          Management System
        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        <button className="hover:text-white transition">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-2">

          <div className="bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center">
            <User size={16} />
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-300">{displayName}</span>
            <span className="text-xs text-gray-500">{roleName}</span>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm font-medium transition"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>

    </div>

  );

}

export default Navbar;