import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  File as FileIcon,
  Users,
  Loader2,
} from "lucide-react";

// Sanitization function to prevent XSS
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>"'&]/g, (match) => ({
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;',
    }[match] || match))
    .trim();
};

// Type guard for File
const isFile = (value: any): value is File => {
  return typeof window !== "undefined" && value instanceof window.File;
};

// Interfaces
interface Document {
  name?: string;
  title: string;
  type: string;
  price?: string;
  description?: string;
  company?: string;
  file?: File | string;
  existingFile?: string;
  fileRequired?: boolean;
}

interface Tender {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  biddingOpen: string;
  biddingClosed: string;
  type: string;
  tenderDocs?: Document[];
  biddingDocs?: Document[];
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

interface DeleteConfirmation {
  visible: boolean;
  docType: "tenderDocs" | "biddingDocs" | null;
  index: number | null;
}

// Modal component for messages
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`rounded-xl border-l-4 p-4 shadow-xl ${bgColor} max-w-sm w-full relative`}>
        <div className="flex justify-between items-center mb-2">
          <p className={`font-semibold ${textColor}`}>{type === "success" ? "Success" : "Error"}</p>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X className={`w-4 h-4 ${textColor}`} />
          </button>
        </div>
        <p className={`text-sm ${textColor}`}>{message}</p>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this document? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main EditTender component
export function EditTender() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const tender = location.state?.tender as Tender | undefined;

  const [formData, setFormData] = useState({
    title: tender?.title ? sanitizeInput(tender.title) : "",
    description: tender?.description ? sanitizeInput(tender.description) : "",
    biddingOpen: tender?.biddingOpen ? new Date(tender.biddingOpen).toISOString().slice(0, 16) : "",
    biddingClosed: tender?.biddingClosed ? new Date(tender.biddingClosed).toISOString().slice(0, 16) : "",
    categoryName: tender?.category ? sanitizeInput(tender.category) : "",
    subcategoryName: tender?.subcategory ? sanitizeInput(tender.subcategory) : "",
    type: tender?.type || "FREE",
  });
  const [tenderDocs, setTenderDocs] = useState<Document[]>(
    tender?.tenderDocs?.map(doc => ({
      name: sanitizeInput(doc.name || ""),
      title: sanitizeInput(doc.title),
      type: doc.type,
      price: doc.price || "",
      existingFile: typeof doc.file === "string" ? doc.file : undefined,
      fileRequired: false,
      file: undefined,
    })) || []
  );
  const [biddingDocs, setBiddingDocs] = useState<Document[]>(
    tender?.biddingDocs?.map(doc => ({
      title: sanitizeInput(doc.title),
      description: sanitizeInput(doc.description || ""),
      company: sanitizeInput(doc.company || ""),
      type: doc.type,
      price: doc.price || "",
      existingFile: typeof doc.file === "string" ? doc.file : undefined,
      fileRequired: false,
      file: undefined,
    })) || []
  );
  const [showTenderDocs, setShowTenderDocs] = useState(false);
  const [showBiddingDocs, setShowBiddingDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<MessageState>({
    visible: false,
    type: "success",
    message: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    visible: false,
    docType: null,
    index: null,
  });
  const tenderDocsRef = useRef<HTMLDivElement>(null);
  const biddingDocsRef = useRef<HTMLDivElement>(null);

  const docTypes = ["FREE", "PAID"];
  const tenderTypes = ["FREE", "PAID"];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        const fetchedCategories = Array.isArray(response.data)
          ? response.data
          : response.data.categories || [];
        setCategories(fetchedCategories.filter(
          (cat: any) => typeof cat === "object" && cat.name && Array.isArray(cat.subcategories)
        ));
      } catch (error) {
        setMessage({
          visible: true,
          type: "error",
          message: "Failed to load categories.",
        });
      }
    };
    fetchCategories();
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: sanitizeInput(value) }));
    if (name === "categoryName") {
      setFormData(prev => ({ ...prev, subcategoryName: "" }));
    }
    setErrors(prev => ({ ...prev, [name]: "" }));
  }, [setFormData, setErrors]);

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-indigo-500", "bg-indigo-50");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50");
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
    docType: "tenderDocs" | "biddingDocs"
  ) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-indigo-500", "bg-indigo-50");
    const file = e.dataTransfer.files[0];
    if (file && /\.(pdf|doc|docx)$/i.test(file.name)) {
      updateDoc(index, "file", file, docType);
      updateDoc(index, "fileRequired", true, docType);
    } else {
      setMessage({
        visible: true,
        type: "error",
        message: "Only PDF, DOC, or DOCX files are allowed.",
      });
    }
  };

  // Update document
  const updateDoc = (
    index: number,
    field: keyof Document,
    value: string | File | boolean | undefined,
    docType: "tenderDocs" | "biddingDocs"
  ) => {
    const setter = docType === "tenderDocs" ? setTenderDocs : setBiddingDocs;
    setter(prev =>
      prev.map((doc, i) =>
        i === index ? { ...doc, [field]: field === "name" || field === "title" || field === "description" || field === "company" ? sanitizeInput(value as string) : value } : doc
      )
    );
    setErrors(prev => ({ ...prev, [`${docType}_${index}_${field}`]: "" }));
  };

  // Add document
  const addDoc = (docType: "tenderDocs" | "biddingDocs") => {
    const newDoc: Document = {
      title: "",
      type: "",
      price: "",
      fileRequired: false,
      ...(docType === "tenderDocs" ? { name: "" } : { description: "", company: "" }),
    };
    if (docType === "tenderDocs") {
      setTenderDocs(prev => [...prev, newDoc]);
      setShowTenderDocs(true);
    } else {
      setBiddingDocs(prev => [...prev, newDoc]);
      setShowBiddingDocs(true);
    }
  };

  // Initiate document deletion
  const initiateDeleteDoc = (index: number, docType: "tenderDocs" | "biddingDocs") => {
    setDeleteConfirmation({ visible: true, docType, index });
  };

  // Confirm document deletion
  const confirmDeleteDoc = () => {
    const { docType, index } = deleteConfirmation;
    if (docType && index !== null) {
      const setter = docType === "tenderDocs" ? setTenderDocs : setBiddingDocs;
      setter(prev => prev.filter((_, i) => i !== index));
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`${docType}_${index}_`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
    setDeleteConfirmation({ visible: false, docType: null, index: null });
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.biddingOpen) newErrors.biddingOpen = "Bidding open date is required";
    if (!formData.biddingClosed) newErrors.biddingClosed = "Bidding close date is required";
    if (!formData.categoryName) newErrors.categoryName = "Category is required";
    if (!formData.subcategoryName) newErrors.subcategoryName = "Subcategory is required";
    if (formData.biddingOpen && formData.biddingClosed) {
      const openDate = new Date(formData.biddingOpen);
      const closeDate = new Date(formData.biddingClosed);
      if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) {
        newErrors.biddingOpen = "Invalid date format";
      } else if (closeDate <= openDate) {
        newErrors.biddingClosed = "Close date must be after open date";
      }
    }

    tenderDocs.forEach((doc, index) => {
      const hasAnyField = doc.name || doc.title || doc.type || doc.price || doc.file || doc.existingFile;
      if (hasAnyField) {
        if (!doc.name) newErrors[`tenderDocs_${index}_name`] = "Document name is required";
        if (!doc.title) newErrors[`tenderDocs_${index}_title`] = "Document title is required";
        if (!doc.type) newErrors[`tenderDocs_${index}_type`] = "Document type is required";
        if (doc.price && isNaN(parseFloat(doc.price))) {
          newErrors[`tenderDocs_${index}_price`] = "Price must be a valid number";
        }
      }
    });

    biddingDocs.forEach((doc, index) => {
      const hasAnyField = doc.title || doc.description || doc.company || doc.type || doc.price || doc.file || doc.existingFile;
      if (hasAnyField) {
        if (!doc.title) newErrors[`biddingDocs_${index}_title`] = "Document title is required";
        if (!doc.description) newErrors[`biddingDocs_${index}_description`] = "Description is required";
        if (!doc.company) newErrors[`biddingDocs_${index}_company`] = "Company name is required";
        if (!doc.type) newErrors[`biddingDocs_${index}_type`] = "Document type is required";
        if (doc.price && isNaN(parseFloat(doc.price))) {
          newErrors[`biddingDocs_${index}_price`] = "Price must be a valid number";
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
    setUploadProgress(0);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("biddingOpen", new Date(formData.biddingOpen).toISOString());
    formDataToSend.append("biddingClosed", new Date(formData.biddingClosed).toISOString());
    formDataToSend.append("categoryName", formData.categoryName);
    formDataToSend.append("subcategoryName", formData.subcategoryName);
    formDataToSend.append("type", formData.type);

    const validTenderDocs = tenderDocs
      .filter(doc => doc.name && doc.title && doc.type)
      .map(doc => ({
        name: doc.name,
        title: doc.title,
        type: doc.type,
        price: doc.price,
        existingFile: isFile(doc.file) ? undefined : doc.existingFile,
        fileRequired: isFile(doc.file) || !doc.existingFile,
      }));

    if (validTenderDocs.length > 0) {
      formDataToSend.append("tenderDocs", JSON.stringify(validTenderDocs));
      tenderDocs.forEach((doc, index) => {
        if (isFile(doc.file)) {
          formDataToSend.append(`tenderDocsFiles[${index}]`, doc.file);
        }
      });
    }

    const validBiddingDocs = biddingDocs
      .filter(doc => doc.title && doc.description && doc.company && doc.type)
      .map(doc => ({
        title: doc.title,
        description: doc.description,
        company: doc.company,
        type: doc.type,
        price: doc.price,
        existingFile: isFile(doc.file) ? undefined : doc.existingFile,
        fileRequired: isFile(doc.file) || !doc.existingFile,
      }));

    if (validBiddingDocs.length > 0) {
      formDataToSend.append("biddingDocs", JSON.stringify(validBiddingDocs));
      biddingDocs.forEach((doc, index) => {
        if (isFile(doc.file)) {
          formDataToSend.append(`biddingDocsFiles[${index}]`, doc.file);
        }
      });
    }

    try {
      const response = await axios.patch(
        `http://localhost:4000/api/tender/update/${id}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          },
        }
      );

      setMessage({
        visible: true,
        type: "success",
        message: response.data.message || "Tender updated successfully!",
      });

      // setTimeout(() => navigate("/tenders"), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
        error.response?.status === 404 ? `Tender with ID ${id} not found.` :
        error.response?.status === 400 ? "Invalid input data." :
        "Failed to update tender.";
      setMessage({ visible: true, type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 font-['Inter']">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-3 rounded-lg shadow-md">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Tender</h1>
              <p className="text-gray-600 text-sm mt-1">
                Update tender details and manage documents
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${errors.title ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                  placeholder="Enter tender title"
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none ${errors.description ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                  placeholder="Provide detailed description"
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${errors.categoryName ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                  placeholder="Select or type a category"
                  aria-required="true"
                />
                <datalist id="categoryList">
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name} />
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${errors.subcategoryName ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                  placeholder="Select or type a subcategory"
                  aria-required="true"
                />
                <datalist id="subcategoryList">
                  {formData.categoryName &&
                    categories.find(cat => cat.name === formData.categoryName)?.subcategories.map(sub => (
                      <option key={sub} value={sub} />
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${errors.biddingOpen ? "border-red-500 bg-red-50" : "border-gray-300"}`}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${errors.biddingClosed ? "border-red-500 bg-red-50" : "border-gray-300"}`}
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
                  {tenderTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
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
              className="w-full p-5 flex items-center justify-between hover:bg-indigo-50 transition-all duration-200"
              aria-expanded={showTenderDocs}
              aria-controls="tender-docs-section"
            >
              <div className="flex items-center">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="text-left ml-3">
                  <h3 className="text-lg font-semibold text-gray-800">Tender Documents</h3>
                  <p className="text-gray-600 text-sm">Manage tender specifications</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {tenderDocs.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                    {tenderDocs.length} document{tenderDocs.length !== 1 ? "s" : ""}
                  </span>
                )}
                {showTenderDocs ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
            <div
              id="tender-docs-section"
              className={`transition-all duration-300 ${showTenderDocs ? "max-h-none opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
            >
              <div
                className="p-5 border-t border-gray-200 bg-indigo-50/30"
                ref={tenderDocsRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, tenderDocs.length - 1, "tenderDocs")}
              >
                {tenderDocs.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-5 mb-4 border border-indigo-100 shadow-sm"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index, "tenderDocs")}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <FileIcon className="w-5 h-5 mr-2 text-indigo-600" />
                        Tender Document {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => initiateDeleteDoc(index, "tenderDocs")}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg"
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
                          placeholder="e.g., Technical Specs"
                          value={doc.name || ""}
                          onChange={(e) => updateDoc(index, "name", e.target.value, "tenderDocs")}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors[`tenderDocs_${index}_name`] ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          aria-required="true"
                        />
                        {errors[`tenderDocs_${index}_name`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`tenderDocs_${index}_name`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Project Requirements"
                          value={doc.title}
                          onChange={(e) => updateDoc(index, "title", e.target.value, "tenderDocs")}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors[`tenderDocs_${index}_title`] ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          aria-required="true"
                        />
                        {errors[`tenderDocs_${index}_title`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`tenderDocs_${index}_title`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={doc.type}
                          onChange={(e) => updateDoc(index, "type", e.target.value, "tenderDocs")}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors[`tenderDocs_${index}_type`] ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          aria-required="true"
                        >
                          <option value="" disabled>Select a type</option>
                          {docTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {errors[`tenderDocs_${index}_type`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`tenderDocs_${index}_type`]}</p>
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
                          value={doc.price || ""}
                          onChange={(e) => updateDoc(index, "price", e.target.value, "tenderDocs")}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload File (Optional)
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateDoc(index, "file", file, "tenderDocs");
                              updateDoc(index, "fileRequired", true, "tenderDocs");
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border-gray-300"
                        />
                        {doc.existingFile && !isFile(doc.file) && (
                          <a
                            href={`http://localhost:4000/${doc.existingFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 underline text-sm mt-2 inline-block"
                          >
                            View existing file: {decodeURIComponent(doc.existingFile.split('/').pop() || '')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addDoc("tenderDocs")}
                  className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
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
              className="w-full p-5 flex items-center justify-between hover:bg-indigo-50 transition-all duration-200"
              aria-expanded={showBiddingDocs}
              aria-controls="bidding-docs-section"
            >
              <div className="flex items-center">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left ml-3">
                  <h3 className="text-lg font-semibold text-gray-800">Bidding Documents</h3>
                  <p className="text-gray-600 text-sm">Manage bidding process documents</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {biddingDocs.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                    {biddingDocs.length} document{biddingDocs.length !== 1 ? "s" : ""}
                  </span>
                )}
                {showBiddingDocs ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
            <div
              id="bidding-docs-section"
              className={`transition-all duration-300 ${showBiddingDocs ? "max-h-none opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
            >
              <div
                className="p-5 border-t border-gray-200 bg-indigo-50/30"
                ref={biddingDocsRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, biddingDocs.length - 1, "biddingDocs")}
              >
                {biddingDocs.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-5 mb-4 border border-indigo-100 shadow-sm"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index, "biddingDocs")}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                        Bidding Document {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => initiateDeleteDoc(index, "biddingDocs")}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg"
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
                          onChange={(e) => updateDoc(index, "title", e.target.value, "biddingDocs")}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors[`biddingDocs_${index}_title`] ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          aria-required="true"
                        />
                        {errors[`biddingDocs_${index}_title`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`biddingDocs_${index}_title`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., ABC Construction"
                          value={doc.company || ""}
                          onChange={(e) => updateDoc(index, "company", e.target.value, "biddingDocs")}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors[`biddingDocs_${index}_company`] ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          aria-required="true"
                        />
                        {errors[`biddingDocs_${index}_company`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`biddingDocs_${index}_company`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={doc.type}
                          onChange={(e) => updateDoc(index, "type", e.target.value, "biddingDocs")}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors[`biddingDocs_${index}_type`] ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          aria-required="true"
                        >
                          <option value="" disabled>Select a type</option>
                          {docTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        {errors[`biddingDocs_${index}_type`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`biddingDocs_${index}_type`]}</p>
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
                          value={doc.price || ""}
                          onChange={(e) => updateDoc(index, "price", e.target.value, "biddingDocs")}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Describe the document"
                          value={doc.description || ""}
                          onChange={(e) => updateDoc(index, "description", e.target.value, "biddingDocs")}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${errors[`biddingDocs_${index}_description`] ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                          aria-required="true"
                        />
                        {errors[`biddingDocs_${index}_description`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`biddingDocs_${index}_description`]}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload File (Optional)
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateDoc(index, "file", file, "biddingDocs");
                              updateDoc(index, "fileRequired", true, "biddingDocs");
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border-gray-300"
                        />
                        {doc.existingFile && !isFile(doc.file) && (
                          <a
                            href={`http://localhost:4000/${doc.existingFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 underline text-sm mt-2 inline-block"
                          >
                            View existing file: {decodeURIComponent(doc.existingFile.split('/').pop() || '')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addDoc("biddingDocs")}
                  className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Bidding Document
                </button>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress !== null && (
            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Uploading Files...</p>
                <p className="text-sm text-indigo-600">{uploadProgress}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end p-5 bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${isSubmitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-md"}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Updating Tender...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Update Tender
                </>
              )}
            </button>
          </div>
        </form>

        {/* Modals */}
        {message.visible && (
          <MessageModal
            message={message.message}
            type={message.type}
            onClose={() => setMessage({ ...message, visible: false })}
          />
        )}
        <DeleteConfirmationModal
          visible={deleteConfirmation.visible}
          onConfirm={confirmDeleteDoc}
          onCancel={() => setDeleteConfirmation({ visible: false, docType: null, index: null })}
        />
      </div>
    </div>
  );
}

export default EditTender;