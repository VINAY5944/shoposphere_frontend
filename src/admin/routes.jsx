import { Navigate } from "react-router-dom";

import ProtectedRoute from "../shared/components/common/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductsPage from "./pages/Products/ProductsPage";
import ProductCreatePage from "./pages/Products/ProductCreatePage";
import ProductEditPage from "./pages/Products/ProductEditPage";
import CategoriesPage from "./pages/category/CategoriesPage";
import CategoryCreatePage from "./pages/category/CategoryCreatePage";
import CategoryEditPage from "./pages/category/CategoryEditPage";
import OrdersPage from "./pages/order/OrdersPage";
import AdminOrderDetailsPage from "./pages/order/OrderDetailsPage";
import CustomersPage from "./pages/customer/CustomersPage";
import CustomerDetailsPage from "./pages/customer/CustomerDetailsPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import InventoryDetailsPage from "./pages/inventory/InventoryDetailsPage";
import InventoryHistoryPage from "./pages/inventory/InventoryHistoryPage";
import NotificationsPage from "./pages/notification/NotificationsPage";

const adminRoutes = [
  {
    element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "products",
            element: <ProductsPage />,
          },
          {
            path: "products/new",
            element: <ProductCreatePage />,
          },
          {
            path: "products/:productId/edit",
            element: <ProductEditPage />,
          },
          {
            path: "categories",
            element: <CategoriesPage />,
          },
          {
            path: "categories/new",
            element: <CategoryCreatePage />,
          },
          {
            path: "categories/:categoryId/edit",
            element: <CategoryEditPage />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
          {
            path: "orders/:orderId",
            element: <AdminOrderDetailsPage />,
          },
          {
            path: "customers",
            element: <CustomersPage />,
          },
          {
            path: "customers/:customerId",
            element: <CustomerDetailsPage />,
          },
          {
            path: "inventory",
            element: <InventoryPage />,
          },
          {
            path: "inventory/:productId/history",
            element: <InventoryHistoryPage />,
          },
          {
            path: "inventory/:productId",
            element: <InventoryDetailsPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "users",
            element: <Navigate to="/admin/customers" replace />,
          },
        ],
      },
    ],
  },
];

export default adminRoutes;
