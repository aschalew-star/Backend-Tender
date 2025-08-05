import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn } from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

interface MessageState {
  visible: boolean;
  type: "success" | "error";
  message: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState>({
    visible: false,
    type: "success",
    message: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (message.visible) {
      setMessage({ ...message, visible: false });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage({
        visible: true,
        type: "error",
        message: "Please correct the errors in the form.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/api/users/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Include cookies for CSRF token if needed
        }
      );

      setMessage({
        visible: true,
        type: "success",
        message: response.data.message || "Login successful!",
      });

      // Reset form
      setFormData({ email: "", password: "" });
      // Redirect or handle successful login (e.g., store token, navigate to dashboard)
      // Example: window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to login. Please try again.";
      setMessage({
        visible: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-full shadow-md">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Sign in to access your tender dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-indigo-600" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              placeholder="Enter your email"
              aria-required="true"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-indigo-600" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 pr-10 ${
                  errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Enter your password"
                aria-required="true"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600 transition-colors duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <a
              href="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-all duration-200"
            >
              Forgot Password?
            </a>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center w-32 py-2 rounded-lg font-semibold text-white transition-all duration-200 ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>

        {message.visible && (
          <div
            className={`mt-6 p-4 rounded-lg border-l-4 ${
              message.type === "success"
                ? "bg-green-100 border-green-500"
                : "bg-red-100 border-red-500"
            } transition-all duration-300`}
          >
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-700" : "text-red-700"
              } flex items-center`}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {message.message}
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-indigo-600 hover:text-indigo-800 hover:underline transition-all duration-200"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;