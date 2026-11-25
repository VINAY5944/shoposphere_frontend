# ShopSphere Frontend

ShopSphere is a React storefront and admin portal for an online shop. This
repository contains the frontend; it requires the ShopSphere backend API to
support authentication and data operations.

## Features

### Customer storefront

- Browse products and filter by search or category.
- View product information and add products to the cart.
- Check out selected cart items or buy a product directly.
- View order history and order details.

### Admin portal

- Review dashboard metrics and recent orders.
- Manage products and categories.
- View customers and activate or deactivate accounts.
- Review inventory, restock products, and view inventory movement history.
- Review notification delivery history and failed notifications.

## Tech stack

- React
- Vite
- React Router
- Redux Toolkit
- Axios
- Tailwind CSS

## Requirements

- Node.js and npm versions supported by the installed Vite release.
- A running ShopSphere backend API.

## Getting started

1. Install frontend dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from the example:

   ```powershell
   Copy-Item .env.example .env
   ```

   On macOS or Linux:

   ```bash
   cp .env.example .env
   ```

3. Configure the backend URL in `.env`:

   ```dotenv
   VITE_BACKEND_URL=http://localhost:5000
   VITE_API_BASE_URL=${VITE_BACKEND_URL}/api/v1
   VITE_ASSET_BASE_URL=${VITE_BACKEND_URL}
   ```

   Update `VITE_BACKEND_URL` to match the address where your backend is
   running. API paths for authentication, customer operations, and admin
   features are configured in the same file.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open the local URL printed by Vite in your browser. Restart the dev server
   after changing environment variables.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run Oxlint on the project. |

## Project structure

```text
src/
├── admin/       # Admin routes, layout, pages, and feature services
├── app/         # App router and Redux store
├── assets/      # Static frontend assets
├── auth/        # Login, registration, auth state, and auth routes
├── customer/    # Storefront pages, feature services, and customer routes
└── shared/      # Reusable components, hooks, API client, and utilities
```

Routes are defined within their owning modules (`auth/routes.jsx`,
`customer/routes.jsx`, and `admin/routes.jsx`) and composed by
`app/router.jsx`.

## Environment and security

- `.env.example` contains local development defaults; use `.env` for machine-
  specific configuration.
- Do not commit credentials, private keys, or other secrets.
- Vite variables prefixed with `VITE_` are included in browser code and are
  public. Never put secrets in them.
- Admin pages require an authenticated account with the `ADMIN` role. Customer
  pages require an authenticated account with the `CUSTOMER` role.

## Backend dependency

The backend runs separately from this frontend repository. Make sure it is
available at the configured URL and allows requests from the frontend origin.
Authentication, product, order, inventory, customer, and notification API
behavior is provided by the backend.
