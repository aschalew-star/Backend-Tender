import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye,
  Activity,
  Calendar,
  User,
  X,
  Download,
  RefreshCw
} from 'lucide-react';

interface ActivityLog {
  id: number;
  method: string;
  role: string;
  action: string;
  userId: number;
  userName: string;
  customerId?: number;
  customerName?: string;
  detail?: string;
  createdAt: string;
}

const ActivityLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const activityLogs: ActivityLog[] = [
    {
      id: 1,
      method: 'POST',
      role: 'ADMIN',
      action: 'Created new tender',
      userId: 101,
      userName: 'John Admin',
      detail: 'Created tender: Road Construction Project Phase 2',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      method: 'PUT',
      role: 'ADMIN',
      action: 'Approved payment',
      userId: 101,
      userName: 'John Admin',
      customerId: 501,
      customerName: 'Sarah Johnson',
      detail: 'Approved payment of $299.99 for 3-month subscription',
      createdAt: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      method: 'POST',
      role: 'CUSTOMER',
      action: 'Registered account',
      userId: 102,
      userName: 'Mike Davis',
      customerId: 502,
      customerName: 'Mike Davis',
      detail: 'New customer registration completed',
      createdAt: '2024-01-15T08:45:00Z'
    },
    {
      id: 4,
      method: 'GET',
      role: 'CUSTOMER',
      action: 'Downloaded tender document',
      userId: 103,
      userName: 'Emma Wilson',
      customerId: 503,
      customerName: 'Emma Wilson',
      detail: 'Downloaded: IT Equipment Procurement specifications',
      createdAt: '2024-01-14T16:20:00Z'
    },
    {
      id: 5,
      method: 'DELETE',
      role: 'SUPERUSER',
      action: 'Deleted user account',
      userId: 100,
      userName: 'Super Admin',
      detail: 'Deleted inactive customer account',
      createdAt: '2024-01-14T14:30:00Z'
    },
    {
      id: 6,
      method: 'PUT',
      role: 'DATAENTRY',
      action: 'Updated tender details',
      userId: 104,
      userName: 'Data Entry User',
      detail: 'Updated bidding close date for Medical Supplies Contract',
      createdAt: '2024-01-14T11:15:00Z'
    }
  ];

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      GET: { bg: 'bg-blue-100', text: 'text-blue-800' },
      POST: { bg: 'bg-green-100', text: 'text-green-800' },
      PUT: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      DELETE: { bg: 'bg-red-100', text: 'text-red-800' }
    };

    const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.GET;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {method}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      SUPERUSER: { bg: 'bg-purple-100', text: 'text-purple-800' },
      ADMIN: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      CUSTOMER: { bg: 'bg-green-100', text: 'text-green-800' },
      DATAENTRY: { bg: 'bg-gray-100', text: 'text-gray-800' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.CUSTOMER;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {role}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.detail && log.detail.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || log.role === filterRole;
    const matchesMethod = filterMethod === 'all' || log.method === filterMethod;
    return matchesSearch && matchesRole && matchesMethod;
  });

  const handleView = (log: ActivityLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const LogModal = () => {
    if (!showModal || !selectedLog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Activity Log Details</h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <div>{getMethodBadge(selectedLog.method)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div>{getRoleBadge(selectedLog.role)}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {selectedLog.action}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {selectedLog.userName} (ID: {selectedLog.userId})
                </div>
              </div>
              
              {selectedLog.customerName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {selectedLog.customerName} (ID: {selectedLog.customerId})
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {selectedLog.detail || 'No additional details'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {formatTimestamp(selectedLog.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            <p className="text-gray-600">Monitor system activities and user actions.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search activity logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="SUPERUSER">Super User</option>
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Customer</option>
                <option value="DATAENTRY">Data Entry</option>
              </select>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getMethodBadge(log.method)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(log.role)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{log.action}</div>
                    {log.detail && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{log.detail}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                        {log.customerName && (
                          <div className="text-sm text-gray-500">Customer: {log.customerName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatTimestamp(log.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(log)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LogModal />
    </div>
  );
};

export default ActivityLogs;