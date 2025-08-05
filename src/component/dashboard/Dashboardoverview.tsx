import React from 'react';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

const Overview: React.FC = () => {
  const stats = [
    {
      title: 'Total Tenders',
      value: '2,847',
      change: '+12.3%',
      changeType: 'increase',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Customers',
      value: '1,234',
      change: '+5.2%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Total Revenue',
      value: '$45,678',
      change: '+18.7%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Pending Approvals',
      value: '23',
      change: '-2.1%',
      changeType: 'decrease',
      icon: Clock,
      color: 'bg-red-500'
    }
  ];

  const recentTenders = [
    {
      id: 1,
      title: 'Road Construction Project Phase 2',
      category: 'Infrastructure',
      status: 'Active',
      biddingClose: '2024-02-15',
      views: 145
    },
    {
      id: 2,
      title: 'IT Equipment Procurement',
      category: 'Technology',
      status: 'Pending',
      biddingClose: '2024-02-20',
      views: 89
    },
    {
      id: 3,
      title: 'Medical Supplies Contract',
      category: 'Healthcare',
      status: 'Active',
      biddingClose: '2024-02-18',
      views: 203
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New tender published',
      detail: 'Road Construction Project Phase 2',
      time: '2 hours ago',
      type: 'tender'
    },
    {
      id: 2,
      action: 'Payment approved',
      detail: 'Customer subscription renewal',
      time: '4 hours ago',
      type: 'payment'
    },
    {
      id: 3,
      action: 'User registered',
      detail: 'New customer account created',
      time: '6 hours ago',
      type: 'user'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your tender platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`w-4 h-4 mr-1 ${
                      stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tenders</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTenders.map((tender) => (
                <div key={tender.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{tender.title}</h3>
                    <p className="text-sm text-gray-500">{tender.category}</p>
                    <p className="text-xs text-gray-400">Closes: {tender.biddingClose}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-gray-500">
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="text-sm">{tender.views}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tender.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tender.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'tender' ? 'bg-blue-100' :
                    activity.type === 'payment' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'tender' && <FileText className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'payment' && <DollarSign className="w-4 h-4 text-green-600" />}
                    {activity.type === 'user' && <Users className="w-4 h-4 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.detail}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;