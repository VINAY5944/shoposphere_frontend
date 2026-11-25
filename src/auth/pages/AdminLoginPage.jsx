
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { loginAdmin } from "../authThunks";
import Input from "../../shared/components/ui/Input";
import Button from "../../shared/components/ui/Button";

function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      await dispatch(
        loginAdmin({
          email: email.trim(),
          password,
        })
      ).unwrap();

      toast.success("Admin login successful!");

      navigate("/admin", { replace: true });
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.message || "Invalid admin credentials.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 text-2xl text-white">
            A
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your ShopSphere store.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Admin Email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter admin email"
            autoComplete="username"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="dark"
            loading={loading}
            loadingText="Signing in..."
            className="w-full"
          >
            Sign In as Admin
          </Button>
        </form>

        <div className="mt-6 border-t pt-5 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
