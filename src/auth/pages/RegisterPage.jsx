
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import registerService from "../registerService";
import Button from "../../shared/components/ui/Button";
import Input from "../../shared/components/ui/Input";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (name.length < 2 || name.length > 100) {
      setError("Name must contain between 2 and 100 characters.");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (new TextEncoder().encode(formData.password).length < 8) {
      setError("Password must be at least 8 bytes long.");
      return;
    }

    if (new TextEncoder().encode(formData.password).length > 72) {
      setError("Password must not exceed 72 bytes.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerService.registerCustomer({
        name,
        email,
        password: formData.password,
      });

      toast.success(response.message || "Registration successful!");

      navigate("/login", {
        replace: true,
        state: {
          registeredEmail: response.data.email,
        },
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Join ShopSphere and start shopping.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            minLength={2}
            maxLength={100}
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum 8 bytes, maximum 72 bytes.
            </p>
          </div>

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            loadingText="Creating account..."
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
