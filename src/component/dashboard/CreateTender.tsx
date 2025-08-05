import React, { useState, useEffect, Component } from "react";
import axios from "axios";
import {
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2,
  DollarSign,
  Upload,
  Save,
  X,
  AlertCircle,
  File,
  Users,
} from "lucide-react";

// Define interfaces
interface TenderDoc {
  name: string;
  title: string;
  type: string;
  price: string;
  file?: File;
}

interface BiddingDoc {
  title: string;
  description: string;
  company: string;
  type: string;
  price: string;
  file?: File;
}

interface MessageState {
  visible: boolean;
  type: "success" | "error";
  message: string;
}

interface Category {
  name: string;
  subcategories: string[];
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
        <div className="min-h-screen bg-gray-100 p-4 lg:p-8 font-['Inter'] flex items-center justify-center">
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-xl max-w-md w-full">
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-red-600">
              {this.state.errorMessage || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

// Custom Modal component
const MessageModal = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-500"
      : "bg-red-100 border-red-500";
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
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X className={`w-4 h-4 ${textColor}`} />
          </button>
        </div>
        <p className={`text-sm ${textColor}`}>{message}</p>
      </div>
    </div>
  );
};

// Main component for creating a tender
export function CreateTender() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    biddingOpen: "",
    biddingClosed: "",
    categoryName: "",
    subcategoryName: "",
    type: "FREE",
  });
  const [tenderDocs, setTenderDocs] = useState<TenderDoc[]>([]);
  const [biddingDocs, setBiddingDocs] = useState<BiddingDoc[]>([]);
  const [showTenderDocs, setShowTenderDocs] = useState(false);
  const [showBiddingDocs, setShowBiddingDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<MessageState>({
    visible: false,
    type: "success",
    message: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);

  // Align docTypes with backend allowed file types
  const docTypes = [ "FREE",
  "PAID"];
  const tenderTypes = ["FREE", "PAID"];

  // Fetch categories and subcategories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        const fetchedCategories = Array.isArray(response.data)
          ? response.data
          : response.data.categories || [];
        const validCategories = fetchedCategories.filter(
          (cat: any) =>
            typeof cat === "object" &&
            cat.name &&
            Array.isArray(cat.subcategories)
        );
        setCategories(validCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setMessage({
          visible: true,
          type: "error",
          message: "Failed to load categories. Please try again.",
        });
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    if (name === "categoryName") {
      setFormData((prev) => ({ ...prev, subcategoryName: "" }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Add a new tender document
  const addTenderDoc = () => {
    setTenderDocs((prev) => [
      ...prev,
      { name: "", title: "", type: "", price: "" },
    ]);
  };

  // Remove a tender document
  const removeTenderDoc = (index: number) => {
    setTenderDocs((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`tenderDoc_${index}_`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Update a tender document field
  const updateTenderDoc = (
    index: number,
    field: keyof TenderDoc,
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
            [`tenderDoc_${index}_file`]: "File size must not exceed 50MB",
          }));
          return;
        }
      } else if (value !== undefined) {
        setErrors((prev) => ({
          ...prev,
          [`tenderDoc_${index}_file`]: "Invalid file selected",
        }));
        return;
      }
    }
    setTenderDocs((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
    if (errors[`tenderDoc_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`tenderDoc_${index}_${field}`]: "" }));
    }
  };

  // Add a new bidding document
  const addBiddingDoc = () => {
    setBiddingDocs((prev) => [
      ...prev,
      { title: "", description: "", company: "", type: "", price: "" },
    ]);
  };

  // Remove a bidding document
  const removeBiddingDoc = (index: number) => {
    setBiddingDocs((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`biddingDoc_${index}_`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Update a bidding document field
  const updateBiddingDoc = (
    index: number,
    field: keyof BiddingDoc,
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
            [`biddingDoc_${index}_file`]: "File size must not exceed 50MB",
          }));
          return;
        }
      } else if (value !== undefined) {
        setErrors((prev) => ({
          ...prev,
          [`biddingDoc_${index}_file`]: "Invalid file selected",
        }));
        return;
      }
    }
    setBiddingDocs((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
    if (errors[`biddingDoc_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`biddingDoc_${index}_${field}`]: "" }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.biddingOpen) {
      newErrors.biddingOpen = "Bidding open date is required";
    }
    if (!formData.biddingClosed) {
      newErrors.biddingClosed = "Bidding close date is required";
    }
    if (!formData.categoryName.trim()) {
      newErrors.categoryName = "Category is required";
    }
    if (!formData.subcategoryName.trim()) {
      newErrors.subcategoryName = "Subcategory is required";
    }
    if (formData.biddingOpen && formData.biddingClosed) {
      const openDate = new Date(formData.biddingOpen);
      const closeDate = new Date(formData.biddingClosed);
      if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) {
        newErrors.biddingOpen = "Invalid date format";
      } else if (closeDate <= openDate) {
        newErrors.biddingClosed = "Close date must be after open date";
      }
    }

    // Validate tenderDocs: all fields required if any are filled
    tenderDocs.forEach((doc, index) => {
      const hasAnyField =
        doc.name.trim() || doc.title.trim() || doc.type || doc.price || doc.file;
      if (hasAnyField) {
        if (!doc.name.trim()) {
          newErrors[`tenderDoc_${index}_name`] = "Document name is required";
        }
        if (!doc.title.trim()) {
          newErrors[`tenderDoc_${index}_title`] = "Document title is required";
        }
        if (!doc.type) {
          newErrors[`tenderDoc_${index}_type`] = "Document type is required";
        }
        if (!doc.file || !(doc.file instanceof window.File)) {
          newErrors[`tenderDoc_${index}_file`] = "Valid document file is required";
        }
      }
    });

    // Validate biddingDocs: all fields required if any are filled
    biddingDocs.forEach((doc, index) => {
      const hasAnyField =
        doc.title.trim() ||
        doc.description.trim() ||
        doc.company.trim() ||
        doc.type ||
        doc.price ||
        doc.file;
      if (hasAnyField) {
        if (!doc.title.trim()) {
          newErrors[`biddingDoc_${index}_title`] = "Document title is required";
        }
        if (!doc.description.trim()) {
          newErrors[`biddingDoc_${index}_description`] =
            "Description is required";
        }
        if (!doc.company.trim()) {
          newErrors[`biddingDoc_${index}_company`] = "Company name is required";
        }
        if (!doc.type) {
          newErrors[`biddingDoc_${index}_type`] = "Document type is required";
        }
        if (!doc.file || !(doc.file instanceof window.File)) {
          newErrors[`biddingDoc_${index}_file`] = "Valid document file is required";
        }
      }
    });

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with Axios
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
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("biddingOpen", new Date(formData.biddingOpen).toISOString());
    formDataToSend.append("biddingClosed", new Date(formData.biddingClosed).toISOString());
    formDataToSend.append("categoryName", formData.categoryName);
    formDataToSend.append("subcategoryName", formData.subcategoryName);
    formDataToSend.append("type", formData.type);

    const validTenderDocs = tenderDocs
      .filter(
        (doc) => doc.name.trim() && doc.title.trim() && doc.type && doc.file && doc.file instanceof window.File
      )
      .map(({ file, ...doc }) => doc);

    if (validTenderDocs.length > 0) {
      formDataToSend.append("tenderDocs", JSON.stringify(validTenderDocs));
      tenderDocs.forEach((doc) => {
        if (doc.file && doc.file instanceof window.File) {
          formDataToSend.append('tenderDocsFiles', doc.file); // Use non-indexed name
        }
      });
    }

    const validBiddingDocs = biddingDocs
      .filter(
        (doc) =>
          doc.title.trim() &&
          doc.description.trim() &&
          doc.company.trim() &&
          doc.type &&
          doc.file &&
          doc.file instanceof window.File
      )
      .map(({ file, ...doc }) => doc);

    if (validBiddingDocs.length > 0) {
      formDataToSend.append("biddingDocs", JSON.stringify(validBiddingDocs));
      biddingDocs.forEach((doc) => {
        if (doc.file && doc.file instanceof window.File) {
          formDataToSend.append('biddingDocsFiles', doc.file); // Use non-indexed name
        }
      });
    }

    console.log("FormData to send:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await axios.post(
      "http://localhost:4000/api/tender/create",
      formDataToSend,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setMessage({
      visible: true,
      type: "success",
      message: response.data.message || "Tender created successfully!",
    });

    setFormData({
      title: "",
      description: "",
      biddingOpen: "",
      biddingClosed: "",
      categoryName: "",
      subcategoryName: "",
      type: "FREE",
    });
    setTenderDocs([]);
    setBiddingDocs([]);
    setShowTenderDocs(false);
    setShowBiddingDocs(false);
  } catch (error: any) {
    console.error("Error creating tender:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });

    const errorMessage = error.response?.data?.message?.includes("Invalid file type")
      ? "Only PDF, DOC, or DOCX files are allowed."
      : error.response?.data?.message?.includes("Number of tenderDoc files")
      ? "The number of tender document files does not match the metadata."
      : error.response?.data?.message?.includes("Number of biddingDoc files")
      ? "The number of bidding document files does not match the metadata."
      : error.response?.data?.message?.includes("Unexpected field")
      ? "Invalid form data structure. Please ensure all fields are correct."
      : error.response?.data?.message || "Failed to create tender. Please check your inputs and try again.";

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
    <div className="min-h-screenp-4 lg:p-8 font-['Inter']  md:mt-10 mt-5    rounded-2xl">
      <div className="">
      <div className="md:w-4xl justify-center mx-auto mt-10 flex-1 ">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-3 rounded-lg shadow-md">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Create New Tender
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Fill in the details to create a new tender opportunity
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="  ">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200  ">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
              Basic Information
              <span className="text-red-500 ml-1">*</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tender Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    errors.title
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter comprehensive tender title"
                  aria-required="true"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none ${
                    errors.description
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Provide detailed description of the tender requirements, scope, and expectations"
                  aria-required="true"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  list="categoryList"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    errors.categoryName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Select or type a category"
                  aria-required="true"
                />
                <datalist id="categoryList">
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </datalist>
                {errors.categoryName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.categoryName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subcategoryName"
                  value={formData.subcategoryName}
                  onChange={handleInputChange}
                  list="subcategoryList"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    errors.subcategoryName
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Select or type a subcategory"
                  aria-required="true"
                />
                <datalist id="subcategoryList">
                  {formData.categoryName &&
                    categories
                      .find((cat) => cat.name === formData.categoryName)
                      ?.subcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                </datalist>
                {errors.subcategoryName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.subcategoryName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Bidding Opens <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="biddingOpen"
                  value={formData.biddingOpen}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    errors.biddingOpen
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  aria-required="true"
                />
                {errors.biddingOpen && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.biddingOpen}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Bidding Closes <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="biddingClosed"
                  value={formData.biddingClosed}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    errors.biddingClosed
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  aria-required="true"
                />
                {errors.biddingClosed && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.biddingClosed}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Tender Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 border-gray-300"
                >
                  {tenderTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tender Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => setShowTenderDocs(!showTenderDocs)}
              className="w-full p-5 flex items-center justify-between hover:bg-indigo-50 transition-all duration-200 group"
              aria-expanded={showTenderDocs}
              aria-controls="tender-docs-section"
            >
              <div className="flex items-center">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="text-left ml-3">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    Tender Documents
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Optional)
                    </span>
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Add documents related to the tender specifications
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {tenderDocs.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                    {tenderDocs.length} document
                    {tenderDocs.length !== 1 ? "s" : ""}
                  </span>
                )}
                {showTenderDocs ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                )}
              </div>
            </button>
            <div
              id="tender-docs-section"
              className={`transition-all duration-300 ${
                showTenderDocs
                  ? "max-h-none opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="p-5 border-t border-gray-200 bg-indigo-50/30">
                {tenderDocs.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-5 mb-4 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <File className="w-5 h-5 mr-2 text-indigo-600" />
                        Tender Document {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeTenderDoc(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-all duration-200"
                        aria-label={`Remove tender document ${index + 1}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Technical Specifications"
                          value={doc.name}
                          onChange={(e) =>
                            updateTenderDoc(index, "name", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                            errors[`tenderDoc_${index}_name`]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          aria-required="true"
                        />
                        {errors[`tenderDoc_${index}_name`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`tenderDoc_${index}_name`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Project Requirements Document"
                          value={doc.title}
                          onChange={(e) =>
                            updateTenderDoc(index, "title", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                            errors[`tenderDoc_${index}_title`]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          aria-required="true"
                        />
                        {errors[`tenderDoc_${index}_title`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`tenderDoc_${index}_title`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={doc.type}
                          onChange={(e) =>
                            updateTenderDoc(index, "type", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                            errors[`tenderDoc_${index}_type`]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
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
                        {errors[`tenderDoc_${index}_type`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`tenderDoc_${index}_type`]}
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
                          onChange={(e) =>
                            updateTenderDoc(index, "price", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload File <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) =>
                            updateTenderDoc(index, "file", e.target.files?.[0])
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 ${
                            errors[`tenderDoc_${index}_file`]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[`tenderDoc_${index}_file`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`tenderDoc_${index}_file`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTenderDoc}
                  className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center group"
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Add Tender Document
                </button>
              </div>
            </div>
          </div>

          {/* Bidding Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => setShowBiddingDocs(!showBiddingDocs)}
              className="w-full p-5 flex items-center justify-between hover:bg-indigo-50 transition-all duration-200 group"
              aria-expanded={showBiddingDocs}
              aria-controls="bidding-docs-section"
            >
              <div className="flex items-center">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left ml-3">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    Bidding Documents
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Optional)
                    </span>
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Add documents for the bidding process and requirements
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {biddingDocs.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                    {biddingDocs.length} document
                    {biddingDocs.length !== 1 ? "s" : ""}
                  </span>
                )}
                {showBiddingDocs ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                )}
              </div>
            </button>
            <div
              id="bidding-docs-section"
              className={`transition-all duration-300 ${
                showBiddingDocs
                  ? "max-h-none opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="p-5 border-t border-gray-200 bg-indigo-50/30">
                {biddingDocs.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-5 mb-4 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                        Bidding Document {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeBiddingDoc(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-all duration-200"
                        aria-label={`Remove bidding document ${index + 1}`}
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
                          placeholder="e.g., Bidding Guidelines"
                          value={doc.title}
                          onChange={(e) =>
                            updateBiddingDoc(index, "title", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                            errors[`biddingDoc_${index}_title`]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          aria-required="true"
                        />
                        {errors[`biddingDoc_${index}_title`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`biddingDoc_${index}_title`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., ABC Construction Ltd."
                          value={doc.company}
                          onChange={(e) =>
                            updateBiddingDoc(index, "company", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                            errors[`biddingDoc_${index}_company`]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          aria-required="true"
                        />
                        {errors[`biddingDoc_${index}_company`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`biddingDoc_${index}_company`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={doc.type}
                          onChange={(e) =>
                            updateBiddingDoc(index, "type", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                            errors[`biddingDoc_${index}_type`]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
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
                        {errors[`biddingDoc_${index}_type`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`biddingDoc_${index}_type`]}
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
                          onChange={(e) =>
                            updateBiddingDoc(index, "price", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload File <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) =>
                            updateBiddingDoc(index, "file", e.target.files?.[0])
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 ${
                            errors[`biddingDoc_${index}_file`]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[`biddingDoc_${index}_file`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`biddingDoc_${index}_file`]}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Describe the document requirements for bidders"
                          value={doc.description}
                          onChange={(e) =>
                            updateBiddingDoc(index, "description", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none ${
                            errors[`biddingDoc_${index}_description`]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          aria-required="true"
                        />
                        {errors[`biddingDoc_${index}_description`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`biddingDoc_${index}_description`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addBiddingDoc}
                  className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center group"
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Add Bidding Document
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end p-5 bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
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
                  Creating Tender...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Tender
                </>
              )}
            </button>
          </div>
        </form>
      </div>
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

// Wrap CreateTender with ErrorBoundary
export default function App() {
  return (
    <ErrorBoundary>
      <CreateTender />
    </ErrorBoundary>
  );
}