import CustomerLoginPage from "./pages/CustomerLoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";

const authRoutes = [
  {
    path: "/login",
    element: <CustomerLoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
];

export default authRoutes;
