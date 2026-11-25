
import { createBrowserRouter, Navigate } from "react-router-dom";

import authRoutes from "../auth/routes";
import customerRoutes from "../customer/routes";
import adminRoutes from "../admin/routes";
import UnauthorizedPage from "../shared/components/common/UnauthorizedPage";
import NotFoundPage from "../shared/components/common/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  ...authRoutes,
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  ...customerRoutes,
  ...adminRoutes,
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
