
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { logout } from "../../auth/authSlice";
import Button from "../../shared/components/ui/Button";

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: "📊",
      end: true,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: "📦",
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: "🏷️",
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: "🛒",
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: "📋",
    },
    {
      name: "Customers",
      path: "/admin/customers",
      icon: "👥",
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: "✉️",
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-700 px-6">
          <Link
            to="/admin"
            className="text-2xl font-bold tracking-wide"
          >
            ShopSphere
          </Link>

          <Button
            variant="custom"
            onClick={() => setSidebarOpen(false)}
            className="text-2xl text-gray-300 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            ×
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Administration
          </p>

          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-700 p-4">
          <p className="text-xs text-gray-400">
            ShopSphere Admin Panel
          </p>
        </div>
      </aside>

      {/* Main section */}
      <div className="min-h-screen lg:pl-64">
        {/* Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="custom"
              onClick={() => setSidebarOpen(true)}
              className="text-2xl text-gray-700 lg:hidden"
              aria-label="Open sidebar"
            >
              ☰
            </Button>

            <h1 className="text-lg font-semibold text-gray-800">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || "Administrator"}
              </p>

              <p className="text-xs text-gray-500">
                {user?.email || ""}
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
