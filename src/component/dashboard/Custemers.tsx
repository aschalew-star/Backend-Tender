import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  UserCheck,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  CreditCard,
  Plus,
  AlertCircle,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isSubscribed: boolean;
  endDate?: string;
  role?: string;
  createdAt: string;
}

interface Stats {
  totalCustomers: number;
  totalSubscribed: number;
  totalFree: number;
  totalPayments: number;
}

interface ApiResponse {
  customers: Customer[];
  total: number;
  stats: Stats;
}

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubscription, setFilterSubscription] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "view">("view");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalSubscribed: 0,
    totalFree: 0,
    totalPayments: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerIdToDelete, setCustomerIdToDelete] = useState<number | null>(null);
  const pageSize = 15;

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<ApiResponse>("http://localhost:4000/api/users/customers", {
          params: {
            page: currentPage,
            limit: pageSize,
            search: searchTerm || undefined,
            subscription: filterSubscription === "all" ? undefined : filterSubscription,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        setCustomers(response.data.customers || []);
        setStats(response.data.stats || {
          totalCustomers: 0,
          totalSubscribed: 0,
          totalFree: 0,
          totalPayments: 0,
        });
        setTotalPages(Math.ceil(response.data.total / pageSize) || 1);
      } catch (error: any) {
        console.error("Error fetching customers:", error);
        setError(error.response?.data?.message || "Failed to load customers");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [currentPage, searchTerm, filterSubscription]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleEdit = (customer: Customer) => {
    setModalMode("edit");
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleView = (customer: Customer) => {
    setModalMode("view");
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    setCustomerIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerIdToDelete) return;
    try {
      await axios.delete(`http://localhost:4000/api/users/deletecustomer/${customerIdToDelete}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setCustomers(customers.filter((customer) => customer.id !== customerIdToDelete));
      setStats((prev) => ({
        ...prev,
        totalCustomers: prev.totalCustomers - 1,
        totalSubscribed: customers.find((c) => c.id === customerIdToDelete)?.isSubscribed
          ? prev.totalSubscribed - 1
          : prev.totalSubscribed,
        totalFree: customers.find((c) => c.id === customerIdToDelete)?.isSubscribed
          ? prev.totalFree
          : prev.totalFree - 1,
      }));
      setError(null);
      setShowDeleteModal(false);
      setCustomerIdToDelete(null);
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      setError(error.response?.data?.message || "Failed to delete customer");
      setShowDeleteModal(false);
      setCustomerIdToDelete(null);
    }
  };

  const getSubscriptionBadge = (isSubscribed: boolean, endDate?: string) => {
    if (!isSubscribed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-4 h-4 mr-1" />
          Free
        </span>
      );
    }

    const isExpiringSoon =
      endDate && new Date(endDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isExpiringSoon ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
        }`}
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Subscribed
      </span>
    );
  };

  const CustomerModal = () => {
    if (!showModal || !selectedCustomer) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (modalMode !== "edit") return;

      const formData = new FormData(e.currentTarget);
      const customerData = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string || undefined,
        isSubscribed: formData.get("isSubscribed") === "true",
        endDate: formData.get("endDate") as string || undefined,
        password: formData.get("password") as string || undefined,
        role: "CUSTOMER",
      };
      try {
        const response = await axios.put<Customer>(
          `http://localhost:4000/api/users/updateUser/${selectedCustomer.id}`,
          customerData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        console.log(response)
        setCustomers(customers.map((customer) => (customer.id === selectedCustomer.id ? response.data : customer)));
        setStats((prev) => ({
          ...prev,
          totalSubscribed:
            selectedCustomer.isSubscribed && !customerData.isSubscribed
              ? prev.totalSubscribed - 1
              : !selectedCustomer.isSubscribed && customerData.isSubscribed
              ? prev.totalSubscribed + 1
              : prev.totalSubscribed,
          totalFree:
            selectedCustomer.isSubscribed && !customerData.isSubscribed
              ? prev.totalFree + 1
              : !selectedCustomer.isSubscribed && customerData.isSubscribed
              ? prev.totalFree - 1
              : prev.totalFree,
        }));
        setShowModal(false);
        setError(null);
      } catch (error: any) {
        console.error("Error updating customer:", error);
        setError(error.response?.data?.message || "Failed to update customer");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === "edit" ? "Edit Customer" : "Customer Details"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      defaultValue={selectedCustomer.firstName}
                      disabled={modalMode === "view"}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        modalMode === "view" ? "bg-gray-50 border-gray-200" : "border-gray-300"
                      }`}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      defaultValue={selectedCustomer.lastName}
                      disabled={modalMode === "view"}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        modalMode === "view" ? "bg-gray-50 border-gray-200" : "border-gray-300"
                      }`}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedCustomer.email}
                    disabled={modalMode === "view"}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      modalMode === "view" ? "bg-gray-50 border-gray-200" : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={selectedCustomer.phone || ""}
                    disabled={modalMode === "view"}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      modalMode === "view" ? "bg-gray-50 border-gray-200" : "border-gray-300"
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="isSubscribed"
                      defaultValue={selectedCustomer.isSubscribed ? "true" : "false"}
                      disabled={modalMode === "view"}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        modalMode === "view" ? "bg-gray-50 border-gray-200" : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="false">Free</option>
                      <option value="true">Subscribed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={selectedCustomer.endDate || ""}
                      disabled={modalMode === "view"}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        modalMode === "view" ? "bg-gray-50 border-gray-200" : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>
                {modalMode === "edit" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter new password (leave blank to keep current)"
                    />
                  </div>
                )}
              </div>
            </div>
            {modalMode === "edit" && (
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  };

  const DeleteConfirmationModal = () => {
    if (!showDeleteModal) return null;

    const customer = customers.find((c) => c.id === customerIdToDelete);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setCustomerIdToDelete(null);
              }}
              className="p-1 rounded-full hover:bg-gray-200 transition-all duration-200"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the customer <span className="font-medium">{customer ? `${customer.firstName} ${customer.lastName}` : 'this customer'}</span>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setCustomerIdToDelete(null);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter'] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
      

        /* Header */
        <div className="mb-10 flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600 text-sm mt-1">Manage customer accounts and subscriptions.</p>
          </div>
            <Link to="/Signup">
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </button>
          </Link>
        </div>

        /* Stats Overview */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-600">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subscribed</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalSubscribed}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-600">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Free Users</p>
                <p className="text-2xl font-bold text-gray-600">{stats.totalFree}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-600">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-600">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        /* Search and Filters */
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={filterSubscription}
                  onChange={(e) => setFilterSubscription(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Customers</option>
                  <option value="subscribed">Subscribed</option>
                  <option value="free">Free Users</option>
                </select>
                <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        /* Error Display */
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        /* Customers Table */
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500 flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-indigo-600"
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
                Loading...
              </div>
            ) : customers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No customers found.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                            <UserCheck className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Mail className="w-4 h-4 mr-1 text-gray-400" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1 text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {getSubscriptionBadge(customer.isSubscribed, customer.endDate)}
                          {customer.endDate && (
                            <div className="text-xs text-gray-500 mt-1">Expires: {customer.endDate}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {customer.createdAt}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(customer)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Edit customer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          /* Pagination */
          {!isLoading && customers.length > 0 && (
            <div className="p-4 flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>

        <CustomerModal />
        <DeleteConfirmationModal />
      </div>
    </div>
  );
};

export default Customers;