import React, { useState, useEffect, Component } from "react";
import axios from "axios";
import {
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Building2,
  DollarSign,
  Upload,
  Save,
  X,
  AlertCircle,
  File,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

// Define interfaces
interface BankDoc {
  id?: number;
  title: string;
  type: string;
  price: string;
  file?: File;
  fileUrl?: string;
}

interface Bank {
  id: number;
  name: string;
  branch?: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  bankDocs: BankDoc[];
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

// Main EditBank Component
export function EditBank() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
  });
  const [bankDocs, setBankDocs] = useState<BankDoc[]>([]);
  const [showBankDocs, setShowBankDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<MessageState>({
    visible: false,
    type: "success",
    message: "",
  });

  const docTypes = ["FREE", "PAID"];

  // Fetch bank data
  useEffect(() => {
    const fetchBank = async () => {
      try {
        const response = await axios.get(`/api/banks/${id}`);
        const bank: Bank = response.data;
        setFormData({
          name: bank.name || "",
          branch: bank.branch || "",
          accountNumber: bank.accountNumber || "",
          routingNumber: bank.routingNumber || "",
          swiftCode: bank.swiftCode || "",
        });
        setBankDocs(bank.bankDocs || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch bank:", error);
        setMessage({
          visible: true,
          type: "error",
          message: "Failed to load bank data. Please try again.",
        });
        setLoading(false);
      }
    };

    fetchBank();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Add a new bank document
  const addBankDoc = () => {
    setBankDocs((prev) => [
      ...prev,
      { title: "", type: "", price: "" },
    ]);
  };

  // Remove a bank document
  const removeBankDoc = (index: number) => {
    setBankDocs((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`bankDoc_${index}_`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Update a bank document field
  const updateBankDoc = (
    index: number,
    field: keyof BankDoc,
    value: string | File | undefined
  ) => {
    const isFile = (val: any): val is File => {
      return val && typeof val === "object" && val instanceof window.File;
    };

    if (field === "file") {
      if (isFile(value)) {
        if (value.size > 50 * 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            [`bankDoc_${index}_file`]: "File size must not exceed 50MB",
          }));
          return;
        }
        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedTypes.includes(value.type)) {
          setErrors((prev) => ({
            ...prev,
            [`bankDoc_${index}_file`]: "Only PDF, DOC, or DOCX files are allowed",
          }));
          return;
        }
      } else if (value !== undefined) {
        setErrors((prev) => ({
          ...prev,
          [`bankDoc_${index}_file`]: "Invalid file selected",
        }));
        return;
      }
    }
    setBankDocs((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
    if (errors[`bankDoc_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`bankDoc_${index}_${field}`]: "" }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Bank name is required";
    }
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{8,20}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be 8-20 digits";
    }
    if (formData.routingNumber && !/^\d{9}$/.test(formData.routingNumber)) {
      newErrors.routingNumber = "Routing number must be 9 digits";
    }
    if (formData.swiftCode && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(formData.swiftCode)) {
      newErrors.swiftCode = "Invalid SWIFT code format (e.g., BOFAUS3N)";
    }

    // Validate bankDocs
    bankDocs.forEach((doc, index) => {
      const hasAnyField = doc.title.trim() || doc.type || doc.price || doc.file;
      if (hasAnyField || !doc.id) {
        if (!doc.title.trim()) {
          newErrors[`bankDoc_${index}_title`] = "Document title is required";
        }
        if (!doc.type) {
          newErrors[`bankDoc_${index}_type`] = "Document type is required";
        }
        if (!doc.id && (!doc.file || !(doc.file instanceof window.File))) {
          newErrors[`bankDoc_${index}_file`] = "Valid document file is required";
        }
      }
    });

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
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      if (formData.branch) formDataToSend.append("branch", formData.branch);
      formDataToSend.append("accountNumber", formData.accountNumber);
      if (formData.routingNumber) formDataToSend.append("routingNumber", formData.routingNumber);
      if (formData.swiftCode) formDataToSend.append("swiftCode", formData.swiftCode);

      const validBankDocs = bankDocs
        .filter((doc) => doc.title.trim() && doc.type && (doc.file || doc.fileUrl))
        .map(({ file, ...doc }) => doc);

      if (validBankDocs.length > 0) {
        formDataToSend.append("bankDocs", JSON.stringify(validBankDocs));
        bankDocs.forEach((doc) => {
          if (doc.file && doc.file instanceof window.File) {
            formDataToSend.append(`bankDocsFiles`, doc.file);
          }
        });
      }

      const response = await axios.put(`/api/banks/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({
        visible: true,
        type: "success",
        message: response.data.message || "Bank updated successfully!",
      });
      setTimeout(() => navigate("/banks"), 2000);
    } catch (error: any) {
      console.error("Error updating bank:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage = error.response?.data?.message?.includes("Invalid file type")
        ? "Only PDF, DOC, or DOCX files are allowed."
        : error.response?.data?.message?.includes("Number of bankDoc files")
        ? "The number of bank document files does not match the metadata."
        : error.response?.data?.message?.includes("Unexpected field")
        ? "Invalid form data structure. Please ensure all fields are correct."
        : error.response?.data?.message || "Failed to update bank. Please check your inputs and try again.";

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
          <p className="mt-4 text-gray-900 text-lg">Loading bank...</p>
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
            href="/banks"
            className="hover:text-indigo-600 transition-colors duration-200"
          >
            Banks
          </a>
          <span className="mx-2">/</span>
          <span className="text-indigo-600">Edit</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-3 rounded-lg shadow-md">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Bank
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Update bank details for tender payments
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Bank Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
              Bank Information
              <span className="text-red-500 ml-1">*</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="e.g., Bank of America"
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
                  Branch (Optional)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border-gray-300"
                    placeholder="e.g., Downtown Branch"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.accountNumber ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="e.g., 1234567890"
                    aria-required="true"
                  />
                </div>
                {errors.accountNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.accountNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Routing Number (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.routingNumber ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="e.g., 021000021"
                  />
                </div>
                {errors.routingNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.routingNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SWIFT Code (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.swiftCode ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="e.g., BOFAUS3N"
                  />
                </div>
                {errors.swiftCode && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.swiftCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bank Documents */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setShowBankDocs(!showBankDocs)}
              className="w-full p-5 flex items-center justify-between hover:bg-indigo-50 transition-all duration-200 group"
              aria-expanded={showBankDocs}
              aria-controls="bank-docs-section"
            >
              <div className="flex items-center">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="text-left ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    Bank Documents
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Optional)
                    </span>
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Manage documents like bank guarantees or statements
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {bankDocs.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                    {bankDocs.length} document{bankDocs.length !== 1 ? "s" : ""}
                  </span>
                )}
                {showBankDocs ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                )}
              </div>
            </button>
            <div
              id="bank-docs-section"
              className={`transition-all duration-300 ${
                showBankDocs ? "max-h-none opacity-100" : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="p-5 border-t border-gray-200 bg-indigo-50/30">
                {bankDocs.map((doc, index) => (
                  <div
                    key={doc.id || `new-${index}`}
                    className="bg-white rounded-lg p-5 mb-4 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <File className="w-5 h-5 mr-2 text-indigo-600" />
                        Bank Document {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeBankDoc(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-all duration-200"
                        aria-label={`Remove bank document ${index + 1}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Bank Guarantee"
                          value={doc.title}
                          onChange={(e) => updateBankDoc(index, "title", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            errors[`bankDoc_${index}_title`] ? "border-red-500 bg-red-50" : "border-gray-300"
                          }`}
                          aria-required="true"
                        />
                        {errors[`bankDoc_${index}_title`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`bankDoc_${index}_title`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={doc.type}
                          onChange={(e) => updateBankDoc(index, "type", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                            errors[`bankDoc_${index}_type`] ? "border-red-500 bg-red-50" : "border-gray-300"
                          }`}
                          aria-required="true"
                        >
                          <option value="" disabled>
                            Select a type
                          </option>
                          {docTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors[`bankDoc_${index}_type`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`bankDoc_${index}_type`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (Optional)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={doc.price}
                          onChange={(e) => updateBankDoc(index, "price", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload File {doc.id ? "(Optional)" : <span className="text-red-500">*</span>}
                        </label>
                        {doc.fileUrl && (
                          <p className="text-sm text-gray-600 mb-2">
                            Current: <a href={doc.fileUrl} target="_blank" className="text-indigo-600 hover:underline">
                              {doc.title}
                            </a>
                          </p>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => updateBankDoc(index, "file", e.target.files?.[0])}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 ${
                            errors[`bankDoc_${index}_file`] ? "border-red-500 bg-red-50" : "border-gray-300"
                          }`}
                        />
                        {errors[`bankDoc_${index}_file`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`bankDoc_${index}_file`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBankDoc}
                  className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center group"
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Add Bank Document
                </button>
              </div>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/banks")}
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

// Wrap EditBank with ErrorBoundary
export default function App() {
  return (
    <ErrorBoundary>
      <EditBank />
    </ErrorBoundary>
  );
}