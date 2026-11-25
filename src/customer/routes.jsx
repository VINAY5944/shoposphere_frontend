import ProtectedRoute from "../shared/components/common/ProtectedRoute";
import HomePage from "./pages/home/HomePage";
import ProductDetailsPage from "./pages/products/ProductDetailsPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutConfirmationPage from "./pages/checkout/CheckoutConfirmationPage";
import MyOrdersPage from "./pages/orders/MyOrdersPage";
import CustomerOrderDetailsPage from "./pages/orders/OrderDetailsPage";

const customerRoutes = [
  {
    element: <ProtectedRoute allowedRoles={["CUSTOMER"]} />,
    children: [
      {
        path: "/customer",
        element: <HomePage />,
      },
      {
        path: "/customer/products/:productId",
        element: <ProductDetailsPage />,
      },
      {
        path: "/customer/cart",
        element: <CartPage />,
      },
      {
        path: "/customer/checkout/confirm",
        element: <CheckoutConfirmationPage />,
      },
      {
        path: "/customer/orders",
        element: <MyOrdersPage />,
      },
      {
        path: "/customer/orders/:orderId",
        element: <CustomerOrderDetailsPage />,
      },
    ],
  },
];

export default customerRoutes;
