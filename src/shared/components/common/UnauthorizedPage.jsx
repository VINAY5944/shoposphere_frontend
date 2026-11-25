import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
      <h1 className="text-6xl font-bold text-red-500">403</h1>

      <h2 className="mt-4 text-2xl font-semibold">
        Access Denied
      </h2>

      <p className="mt-2 text-gray-500">
        You don't have permission to access this page.
      </p>

      <Link
        to="/login"
        className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white"
      >
        Back to Login
      </Link>
    </div>
  );
}

export default UnauthorizedPage;