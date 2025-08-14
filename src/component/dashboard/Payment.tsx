import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Define TypeScript interfaces
interface Customer {
  name: string;
  email: string;
}

interface Bank {
  name: string;
}

interface Payment {
  id: number;
  customer: Customer;
  price: number;
  bank: Bank;
  approvedAt: string | null;
  howLong: string;
  status: string;
  createdAt: string;
}

interface ApiResponse {
  status: string;
  data?: {
    payments: Payment[];
    total: number;
  };
  message: string;
}

const Payments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams({
          skip: ((currentPage - 1) * pageSize).toString(),
          take: pageSize.toString(),
          search: debouncedSearchTerm,
          status: filterStatus === "all" ? "" : filterStatus,
        }).toString();
        const response = await fetch(`http://localhost:4000/api/payment/all?${query}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || `Failed to fetch payments: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        const data: ApiResponse = await response.json();
        if (data.status !== "success" || !data.data) {
          throw new Error(data.message || "Invalid response format");
        }
        setPayments(data.data.payments || []);
        setTotalPages(Math.ceil((data.data.total || 0) / pageSize));
        setLoading(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setPayments([]); // Reset payments to empty array on error
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentPage, pageSize, debouncedSearchTerm, filterStatus]);

  // Approve payment
  const handleApprovePayment = async (paymentId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/api/payment/${paymentId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedAt: new Date().toISOString(), status: "approved" }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to approve payment: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const updatedPayment: Payment = await response.json().then((res) => res.data);
      setPayments((prev) =>
        prev.map((payment) => (payment.id === paymentId ? updatedPayment : payment))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // Reject payment
  const handleRejectPayment = async (paymentId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/api/payment/${paymentId}/rejected`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to reject payment: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const updatedPayment: Payment = await response.json().then((res) => res.data);
      setPayments((prev) =>
        prev.map((payment) => (payment.id === paymentId ? updatedPayment : payment))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (!payments || payments.length === 0) return;
    const headers = ["Customer,Payment ID,Price,Bank,Approved At,Status,Subscription"];
    const rows = payments.map((p) => [
      p.customer.name,
      p.id,
      p.price.toFixed(2),
      p.bank.name,
      p.approvedAt ? new Date(p.approvedAt).toLocaleDateString() : "N/A",
      p.status,
      p.howLong.replace("_", " "),
    ].join(","));
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Status badge rendering
  const getStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: { bg: string; text: string; icon: React.ComponentType<{ className: string }> };
    } = {
      pending: {
        bg: "bg-gradient-to-r from-yellow-200 to-yellow-300",
        text: "text-yellow-800",
        icon: Clock,
      },
      approved: {
        bg: "bg-gradient-to-r from-green-200 to-green-300",
        text: "text-green-800",
        icon: Check,
      },
      rejected: {
        bg: "bg-gradient-to-r from-red-200 to-red-300",
        text: "text-red-800",
        icon: X,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} transition-all duration-300 hover:shadow-md`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Calculate stats with defensive checks
  const totalPayments = payments?.length ? payments.reduce((sum, payment) => sum + payment.price, 0) : 0;
  const pendingCount = payments?.length ? payments.filter((p) => p.status === "pending").length : 0;
  const approvedCount = payments?.length ? payments.filter((p) => p.status === "approved").length : 0;
  const thisMonthPayments = payments?.length
    ? payments
        .filter((p) => {
          const paymentDate = new Date(p.approvedAt || p.createdAt);
          const now = new Date();
          return (
            paymentDate.getMonth() === now.getMonth() &&
            paymentDate.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum, p) => sum + p.price, 0)
    : 0;

  // Pagination navigation
  const renderPagination = () => {
    const pages: React.ReactNode[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
            currentPage === i
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-4 px-6 py-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Show
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="mx-2 p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            per page
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 disabled:opacity-50 transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {pages}
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 disabled:opacity-50 transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // console.log(first)

  // Skeleton loader
  const renderSkeleton = () => (
    <tbody className="bg-white divide-y divide-gray-200">
      <tr>
        <td colSpan={7} className="px-6 py-4 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        </td>
      </tr>
      {Array.from({ length: pageSize }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </td>
        </tr>
      ))}
    </tbody>
  );

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 text-red-600 bg-red-100 rounded-lg shadow-md mx-auto max-w-2xl"
      >
        <p className="font-medium">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Payment Management
          </h1>
          <p className="text-gray-600 mt-1">
            Seamlessly review and manage customer payments and subscriptions.
          </p>
        </div>
        <Link to="/admin/Payment/create">
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
            <DollarSign className="w-4 h-4 mr-2" />
            Add Payment
          </button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Payments",
            value: `${totalPayments.toFixed(2)} Birr`,
            color: "from-blue-500 to-blue-600",
            icon: DollarSign,
          },
          {
            title: "Pending",
            value: pendingCount,
            color: "from-yellow-500 to-yellow-600",
            icon: Clock,
          },
          {
            title: "Approved",
            value: approvedCount,
            color: "from-green-500 to-green-600",
            icon: Check,
          },
          {
            title: "This Month",
            value: `${thisMonthPayments.toFixed(2)} Birr`,
            color: "from-purple-500 to-purple-600",
            icon: Calendar,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6"
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 shadow-sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
              <tr>
                {[
                  "Customer",
                  "Payment ID",
                  "Price",
                  "Bank",
                  "Approved At",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            {loading ? (
              renderSkeleton()
            ) : (
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No payments found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.customer.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {payment.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${payment.price.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.howLong.replace("_", " ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.bank.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.approvedAt
                            ? new Date(payment.approvedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 transition-colors duration-300">
                              <Eye className="w-4 h-4" />
                            </button>
                            {payment.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprovePayment(payment.id)}
                                  className="text-green-600 hover:text-green-800 transition-colors duration-300"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(payment.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors duration-300"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            )}
          </table>
        </div>
        {!loading && renderPagination()}
      </motion.div>
    </div>
  );
};

export default Payments;