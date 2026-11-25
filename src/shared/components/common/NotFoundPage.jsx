import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
        Error 404
      </p>
      <h1 className="mt-3 text-4xl font-bold text-gray-900">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-gray-600">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-700"
      >
        Back to home
      </Link>
    </main>
  );
}

export default NotFoundPage;
