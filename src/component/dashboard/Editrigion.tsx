import React, { useState, useEffect, Component } from "react";
import axios from "axios";
import { MapPin, Save, X, AlertCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

// Define interfaces
interface Region {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

interface MessageState {
  visible: boolean;
  type: "success" | "error";
  message: string;
}

// Error Boundary Component
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

// Message Modal Component
const MessageModal = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  const bgColor = type === "success" ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500";
  const textColor = type === "success" ? "text-green-700" : "text-red-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div
        className={`rounded-xl border-l-4 p-4 shadow-xl ${bgColor} max-w-sm w-full relative transform transition-all duration-300 scale-100`}
      >
        <div className="flex justify-between items-center mb-2">
          <p className={`font-semibold ${textColor}`}>
            {type === "success" ? "Success" : "Error"}
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

// Main EditRegion Component
export function EditRegion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<MessageState>({
    visible: false,
    type: "success",
    message: "",
  });

  // Fetch region data
  useEffect(() => {
    const fetchRegion = async () => {
      try {
        const response = await axios.get(`/api/regions/${id}`);
        const region: Region = response.data;
        setFormData({
          name: region.name || "",
          code: region.code || "",
          description: region.description || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch region:", error);
        setMessage({
          visible: true,
          type: "error",
          message: "Failed to load region data. Please try again.",
        });
        setLoading(false);
      }
    };

    fetchRegion();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Region name is required";
    }
    if (formData.code && !/^[A-Z0-9-]{3,10}$/.test(formData.code)) {
      newErrors.code = "Code must be 3-10 characters (alphanumeric or dashes)";
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
      const payload = {
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || undefined,
      };

      const response = await axios.put(`/api/regions/${id}`, payload);

      setMessage({
        visible: true,
        type: "success",
        message: response.data.message || "Region updated successfully!",
      });
      setTimeout(() => navigate("/regions"), 2000);
    } catch (error: any) {
      console.error("Error updating region:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message || "Failed to update region. Please check your inputs and try again.";

      setMessage({
        visible: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-['Inter'] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600"
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
          <p className="mt-4 text-gray-900 text-lg">Loading region...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter'] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center text-sm text-gray-600">
          <a
            href="/"
            className="hover:text-indigo-600 transition-colors duration-200"
          >
            Home
          </a>
          <span className="mx-2">/</span>
          <a
            href="/regions"
            className="hover:text-indigo-600 transition-colors duration-200"
          >
            Regions
          </a>
          <span className="mx-2">/</span>
          <span className="text-indigo-600">Edit</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-3 rounded-lg shadow-md">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Region
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Update region details for tender management
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Region Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
              Region Information
              <span className="text-red-500 ml-1">*</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="e.g., Nairobi County"
                    aria-required="true"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region Code (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.code ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="e.g., KE-NAI"
                  />
                </div>
                {errors.code && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.code}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Primary region for tender operations"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/regions")}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg hover:scale-105"
              }`}
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

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

// Wrap EditRegion with ErrorBoundary
export default function App() {
  return (
    <ErrorBoundary>
      <EditRegion />
    </ErrorBoundary>
  );
}