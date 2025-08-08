import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  UserCog,
  Calendar,
  Mail,
  Phone,
  Plus,
  Shield,
  AlertCircle,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SystemUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo?: string;
  role: 'SUPERUSER' | 'ADMIN' | 'CUSTOMER' | 'DATAENTRY';
  createdAt: string;
  tendersPosted: number;
  tendersApproved: number;
  paymentsApproved: number;
}

interface Stats {
  totalUsers: number;
  totalSuperusers: number;
  totalAdmins: number;
  totalDataEntry: number;
}

interface ApiResponse {
  users: SystemUser[];
  total: number;
  stats: Stats;
}

const SystemUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSuperusers: 0,
    totalAdmins: 0,
    totalDataEntry: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'view'>('view');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
  const pageSize = 15;

  // Fetch system users from backend
  useEffect(() => {
    const fetchSystemUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || '';
        const response = await axios.get<ApiResponse>('http://localhost:4000/api/users/systemuser', {
          params: {
            page: currentPage,
            limit: pageSize,
            search: searchTerm || undefined,
            role: filterRole === 'all' ? undefined : filterRole,
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
    // console.log(response)
        setSystemUsers(response.data.users || []);
        setStats(response.data.stats || {
          totalUsers: 0,
          totalSuperusers: 0,
          totalAdmins: 0,
          totalDataEntry: 0,
        });
        setTotalPages(Math.ceil(response.data.total / pageSize) || 1);
      } catch (error: any) {
        console.error('Error fetching system users:', error);
        setError(error.response?.data?.message || 'Failed to load system users');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSystemUsers();
  }, [currentPage, searchTerm, filterRole]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleEdit = (user: SystemUser) => {
    setModalMode('edit');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleView = (user: SystemUser) => {
    setModalMode('view');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    setUserIdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userIdToDelete) return;
    try {
      const token = localStorage.getItem('token') || '';
      await axios.delete(`http://localhost:4000/api/users/deletesystem/${userIdToDelete}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setSystemUsers(systemUsers.filter((user) => user.id !== userIdToDelete));
      setStats((prev) => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        totalSuperusers: systemUsers.find((u) => u.id === userIdToDelete)?.role === 'SUPERUSER' ? prev.totalSuperusers - 1 : prev.totalSuperusers,
        totalAdmins: systemUsers.find((u) => u.id === userIdToDelete)?.role === 'ADMIN' ? prev.totalAdmins - 1 : prev.totalAdmins,
        totalDataEntry: systemUsers.find((u) => u.id === userIdToDelete)?.role === 'DATAENTRY' ? prev.totalDataEntry - 1 : prev.totalDataEntry,
      }));
      setError(null);
      setShowDeleteModal(false);
      setUserIdToDelete(null);
    } catch (error: any) {
      console.error('Error deleting system user:', error);
      setError(error.response?.data?.message || 'Failed to delete system user');
      setShowDeleteModal(false);
      setUserIdToDelete(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      SUPERUSER: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Shield },
      ADMIN: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: UserCog },
      CUSTOMER: { bg: 'bg-green-100', text: 'text-green-800', icon: UserCog },
      DATAENTRY: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Edit },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.DATAENTRY;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {role}
      </span>
    );
  };

  const UserModal = () => {
    if (!showModal || !selectedUser) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (modalMode !== 'edit') return;

      const formData = new FormData(e.currentTarget);
      const userData = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phoneNo: formData.get('phoneNo') as string || undefined,
        role: formData.get('role') as string,
        password: formData.get('password') as string || undefined,
      };

      try {
        const token = localStorage.getItem('token') || '';
        const response = await axios.put<SystemUser>(`http://localhost:4000/api/users/systemuser/${selectedUser.id}`, userData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        // console.log(response)
        
        setSystemUsers(systemUsers.map((user) => (user.id === selectedUser.id ? response.data : user)));
        setStats((prev) => ({
          ...prev,
          totalSuperusers:
            selectedUser.role === 'SUPERUSER' && userData.role !== 'SUPERUSER'
              ? prev.totalSuperusers - 1
              : userData.role === 'SUPERUSER' && selectedUser.role !== 'SUPERUSER'
              ? prev.totalSuperusers + 1
              : prev.totalSuperusers,
          totalAdmins:
            selectedUser.role === 'ADMIN' && userData.role !== 'ADMIN'
              ? prev.totalAdmins - 1
              : userData.role === 'ADMIN' && selectedUser.role !== 'ADMIN'
              ? prev.totalAdmins + 1
              : prev.totalAdmins,
          totalDataEntry:
            selectedUser.role === 'DATAENTRY' && userData.role !== 'DATAENTRY'
              ? prev.totalDataEntry - 1
              : userData.role === 'DATAENTRY' && selectedUser.role !== 'DATAENTRY'
              ? prev.totalDataEntry + 1
              : prev.totalDataEntry,
        }));
        setShowModal(false);
        setError(null);
      } catch (error: any) {
        console.error('Error updating system user:', error);
        setError(error.response?.data?.message || 'Failed to update system user');
      }
    };

    return (
      <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'edit' ? 'Edit System User' : 'System User Details'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="firstName"
                      defaultValue={selectedUser.firstName}
                      disabled={modalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="lastName"
                      defaultValue={selectedUser.lastName}
                      disabled={modalMode === 'view'}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                        modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                      }`}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedUser.email}
                    disabled={modalMode === 'view'}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNo"
                    defaultValue={selectedUser.phoneNo || ''}
                    disabled={modalMode === 'view'}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role <span className="text-red-500">*</span></label>
                  <select
                    name="role"
                    defaultValue={selectedUser.role}
                    disabled={modalMode === 'view'}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      modalMode === 'view' ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="SUPERUSER">Superuser</option>
                    <option value="ADMIN">Admin</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="DATAENTRY">Data Entry</option>
                  </select>
                </div>
                {modalMode === 'edit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter new password (leave blank to keep current)"
                    />
                  </div>
                )}
                {modalMode === 'view' && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tenders Posted</label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 text-center">
                        {selectedUser.tendersPosted}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tenders Approved</label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 text-center">
                        {selectedUser.tendersApproved}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payments Approved</label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 text-center">
                        {selectedUser.paymentsApproved}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {modalMode === 'edit' && (
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

    const user = systemUsers.find((u) => u.id === userIdToDelete);

    return (
      <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setUserIdToDelete(null);
              }}
              className="p-1 rounded-full hover:bg-gray-200 transition-all duration-200"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the system user <span className="font-medium">{user ? `${user.firstName} ${user.lastName}` : 'this user'}</span>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setUserIdToDelete(null);
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
       

        {/* Header */}
        <div className="mb-10 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Users</h1>
            <p className="text-gray-600 text-sm mt-1">Manage system administrators and staff members.</p>
          </div>
           <Link to="/admin/SystemUser/create">
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add System-User
            </button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-600">
                <UserCog className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Superusers</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSuperusers}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-600">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalAdmins}</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-600">
                <UserCog className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Entry</p>
                <p className="text-2xl font-bold text-gray-600">{stats.totalDataEntry}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-600">
                <Edit className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search system users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Roles</option>
                  <option value="SUPERUSER">Superuser</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="DATAENTRY">Data Entry</option>
                </select>
                <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Users Table */}
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
            ) : systemUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No system users found.</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {systemUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                            <UserCog className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Mail className="w-4 h-4 mr-1 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phoneNo && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1 text-gray-400" />
                              {user.phoneNo}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Posted: {user.tendersPosted}</div>
                          <div>Approved: {user.tendersApproved}</div>
                          <div>Payments: {user.paymentsApproved}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {user.createdAt}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(user)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete user"
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

          {/* Pagination */}
          {!isLoading && systemUsers.length > 0 && (
            <div className="p-4 flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>

        <UserModal />
        <DeleteConfirmationModal />
      </div>
    </div>
  );
};

export default SystemUsers;