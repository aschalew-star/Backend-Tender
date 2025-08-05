import React, { useState, useEffect, useMemo, Component } from "react";
import axios from "axios";
import {
  User,
  Ban,
  DollarSign,
  Calendar,
  Save,
  X,
  AlertCircle,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Default API configuration
const apiClient = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interfaces
interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isSubscribed?: boolean;
  endDate?: string | null;
  createdAt?: string;
}

interface FormData {
  customerId: number | "";
  bankId: number | "";
  price: number;
  howLong: string;
}

interface MessageState {
  visible: boolean;
  type: "success" | "error" | "warning";
  message: string;
}

interface Bank {
  id: number;
  name: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught an error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-['Inter'] flex items-center justify-center">
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-xl max-w-md w-full">
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-red-600">
              {this.state.errorMessage || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MessageModal = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "warning";
  onClose: () => void;
}) => {
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-500"
      : type === "warning"
      ? "bg-yellow-100 border-yellow-500"
      : "bg-red-100 border-red-500";
  const textColor =
    type === "success"
      ? "text-green-700"
      : type === "warning"
      ? "text-yellow-700"
      : "text-red-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div
        className={`modal rounded-xl border-l-4 p-4 shadow-xl ${bgColor} max-w-sm w-full relative transform transition-all duration-300 scale-100`}
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-2">
          <p className={`font-semibold ${textColor}`}>
            {type === "success"
              ? "Success"
              : type === "warning"
              ? "Warning"
              : "Error"}
          </p>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 transition-all duration-200"
          >
            <X className={`w-4 h-4 ${textColor}`} />
          </button>
        </div>
        <p className={`text-sm ${textColor}`}>{message}</p>
      </div>
    </div>
  );
};

export function PaymentForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    customerId: "",
    bankId: "",
    price: 0, // Set to 0 to allow typing from scratch
    howLong: "TENDER",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<MessageState>({
    visible: false,
    type: "success",
    message: "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const subscriptionOptions = useMemo(
    () => [
      "TENDER",
      "THREEMONTHLY",
      "SIXMONTHLY",
      "YEARLY",
    ],
    []
  );

  // Debounce function
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchCustomers = async (query: string = "") => {
    try {
      if (!query.trim()) {
        // Fetch list of customers (initial load)
        const response = await apiClient.get("/api/users/customers", {
          params: {
            page: 1,
            limit: 10,
          },
        });

        // Expect response.data.customers to be an array
        const customerData = Array.isArray(response.data.customers)
          ? response.data.customers
          : [];
        setCustomers(customerData);
        return customerData;
      }

      // Search for customers by email
      const response = await apiClient.get("/api/users/email", {
        params: {
          email: query.trim(),
        },
      });
      console.log("response from search", response);

      // Handle search response, expecting { customers: [...] } or similar
      const customerData = Array.isArray(response.data.customers)
        ? response.data.customers
        : Array.isArray(response.data)
        ? response.data
        : response.data.customer
        ? [response.data.customer]
        : [];
      setCustomers(customerData);
      return customerData;
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      const errorMessage =
        err.response?.data?.message ||
        (err.response?.status === 400
          ? "Bad request to API. Check query parameters."
          : err.response?.status === 401
          ? "Unauthorized. Please log in again."
          : err.response?.status === 404
          ? "No customer found with this email."
          : "Failed to load customers. Please try again.");
      setMessage({
        visible: true,
        type: "error",
        message: errorMessage,
      });
      setCustomers([]);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [customerData, bankRes] = await Promise.all([
          fetchCustomers(""),
          apiClient.get("/api/bank/all?page=1&limit=100"),
        ]);

        let bankData: Bank[] = [];
        if (Array.isArray(bankRes.data)) {
          bankData = bankRes.data;
        } else if (bankRes.data && Array.isArray(bankRes.data.banks)) {
          bankData = bankRes.data.banks;
        } else if (bankRes.data && Array.isArray(bankRes.data.data)) {
          bankData = bankRes.data.data;
        } else {
          console.warn("Unexpected bank response structure:", bankRes.data);
          setMessage({
            visible: true,
            type: "warning",
            message: "Unexpected bank data format. Please check the API.",
          });
        }

        setBanks(bankData);

        if (!customerData.length && !bankData.length) {
          setMessage({
            visible: true,
            type: "error",
            message: "No customers or banks available. Please add data first.",
          });
        } else if (!customerData.length) {
          setMessage({
            visible: true,
            type: "error",
            message: "No customers available. Please add customers first.",
          });
        } else if (!bankData.length) {
          setMessage({
            visible: true,
            type: "warning",
            message:
              "No banks available. Please add banks to proceed with payments.",
          });
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        const errorMessage =
          err.response?.status === 400
            ? "Bad request to API. Check endpoint URLs or query parameters."
            : err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : err.response?.status === 404
            ? "API endpoint not found. Please check the backend server."
            : err.response?.data?.message ||
              "Failed to load customers or banks. Please try again.";
        setMessage({
          visible: true,
          type: "error",
          message: errorMessage,
        });
        setCustomers([]);
        setBanks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle search query changes
  const handleSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
        fetchCustomers(query);
      }, 5000),
    []
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === "price" ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }
    if (!formData.bankId && banks.length > 0) {
      newErrors.bankId = "Bank is required";
    }
    if (
      !subscriptionOptions.includes(formData.howLong)
    ) {
      newErrors.howLong = "Invalid subscription type selected";
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be a positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

    if (banks.length === 0) {
      setMessage({
        visible: true,
        type: "error",
        message:
          "Cannot submit payment: No banks available. Please add banks first.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerId: formData.customerId
          ? parseInt(String(formData.customerId))
          : 0,
        bankId: formData.bankId ? parseInt(String(formData.bankId)) : 0,
        price: formData.price,
        howLong: formData.howLong,
      };

      const response = await apiClient.post("/api/payment/create", payload);

      setMessage({
        visible: true,
        type: "success",
        message: response.data.message || "Payment created successfully!",
      });

      setTimeout(() => {
        setMessage({ visible: false, type: "success", message: "" });
        navigate("/payments");
      }, 2000);

      setFormData({
        customerId: "",
        bankId: "",
        price: 0,
        howLong: "TENDER",
      });
    } catch (error: any) {
      console.error("Error creating payment:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        "Failed to create payment. Please check your inputs and try again.";

      setMessage({
        visible: true,
        type: "error",
        message: errorMessage,
      });
      setTimeout(() => {
        setMessage({ visible: false, type: "error", message: "" });
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter'] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-6 flex items-center text-sm text-gray-600">
          <a
            href="/"
            className="hover:text-indigo-600 transition-colors duration-200"
          >
            Home
          </a>
          <span className="mx-2">/</span>
          <a
            href="/payments"
            className="hover:text-indigo-600 transition-colors duration-200"
          >
            Payments
          </a>
          <span className="mx-2">/</span>
          <span className="text-indigo-600">Create</span>
        </nav>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-3 rounded-lg shadow-md">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Payment
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Add a new payment for a customer subscription
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600 mx-auto"
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
            <p className="text-gray-600 mt-2">Loading data...</p>
          </div>
        ) : (
          <>
            {(customers.length === 0 || banks.length === 0) && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-xl mb-6">
                <p className="text-yellow-700">
                  {customers.length === 0 && banks.length === 0
                    ? "No customers or banks available. Please add data to proceed."
                    : customers.length === 0
                    ? "No customers available. Please add customers first."
                    : "No banks available. You can still select a customer and subscription, but you must add banks to submit payments."}
                </p>
                {customers.length === 0 && (
                  <button
                    onClick={() => navigate("/customers")}
                    className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200"
                  >
                    Add Customers
                  </button>
                )}
                {banks.length === 0 && (
                  <button
                    onClick={() => navigate("/banks")}
                    className="mt-4 ml-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200"
                  >
                    Add Banks
                  </button>
                )}
              </div>
            )}
            {customers.length > 0 && (
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-indigo-600" />
                    Payment Information
                    <span className="text-red-500 ml-1">*</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search Customer
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch(e.target.value);
                          }}
                          placeholder="Search by customer email..."
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          name="customerId"
                          value={formData.customerId}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            errors.customerId
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          aria-required="true"
                        >
                          <option value="">Select a customer</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.firstName} {customer.lastName}
                              {customer.email && ` (${customer.email})`}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.customerId && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.customerId}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Ban className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          name="bankId"
                          value={formData.bankId}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            errors.bankId
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          aria-required="true"
                          disabled={banks.length === 0}
                        >
                          <option value="">Select a bank</option>
                          {banks.map((bank) => (
                            <option key={bank.id} value={bank.id}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.bankId && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.bankId}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          name="price"
                          value={formData.price === 0 ? "" : formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          placeholder="Enter price"
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            errors.price
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          aria-required="true"
                        />
                      </div>
                      {errors.price && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.price}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subscription Type{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          name="howLong"
                          value={formData.howLong}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            errors.howLong
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          aria-required="true"
                        >
                          <option value="">Select a subscription type</option>
                          {subscriptionOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.howLong && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.howLong}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate("/payments")}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    aria-label="Cancel payment creation"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || banks.length === 0}
                    className={`flex items-center px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 ${
                      isSubmitting || banks.length === 0
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:scale-105"
                    }`}
                    aria-label="Create payment"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Create Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {message.visible && (
          <MessageModal
            message={message.message}
            type={message.type}
            onClose={() => setMessage({ ...message, visible: false })}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PaymentForm />
    </ErrorBoundary>
  );
}