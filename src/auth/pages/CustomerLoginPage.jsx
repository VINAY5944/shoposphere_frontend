
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { loginCustomer } from "../authThunks";
import { clearAuthError } from "../authSlice";

import Input from "../../shared/components/ui/Input";
import Button from "../../shared/components/ui/Button";

function CustomerLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await dispatch(loginCustomer(formData)).unwrap();

      navigate("/customer");
    } catch (error) {
      console.error("Customer login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            ShopSphere
          </h1>

          <p className="mt-2 text-gray-500">
            Sign in to your customer account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Create an account
          </Link>
        </p>

        <div className="mt-6 border-t pt-5 text-center">
          <Link
            to="/admin/login"
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CustomerLoginPage;
