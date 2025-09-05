import React from 'react';
import { Activity, Tag, Megaphone, Users, FileText } from 'lucide-react';

interface ActivityItem {
  id: number;
  type: 'category' | 'advertisement' | 'user' | 'tender';
  action: string;
  target: string;
  user: string;
  timestamp: string;
}

const RecentActivity: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: 1,
      type: 'category',
      action: 'created',
      target: 'Medical Equipment',
      user: 'John Doe',
      timestamp: '2 minutes ago'
    },
    {
      id: 2,
      type: 'advertisement',
      action: 'updated',
      target: 'Construction Equipment Sale',
      user: 'Jane Smith',
      timestamp: '15 minutes ago'
    },
    {
      id: 3,
      type: 'user',
      action: 'registered',
      target: 'New Customer',
      user: 'System',
      timestamp: '1 hour ago'
    },
    {
      id: 4,
      type: 'tender',
      action: 'published',
      target: 'Road Construction Project',
      user: 'Mike Johnson',
      timestamp: '2 hours ago'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'category': return Tag;
      case 'advertisement': return Megaphone;
      case 'user': return Users;
      case 'tender': return FileText;
      default: return Activity;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'category': return 'text-indigo-600 bg-indigo-100';
      case 'advertisement': return 'text-amber-600 bg-amber-100';
      case 'user': return 'text-emerald-600 bg-emerald-100';
      case 'tender': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
        <Activity className="w-6 h-6 text-indigo-600" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          const colorClasses = getColor(activity.type);
          
          return (
            <div 
              key={activity.id} 
              className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user} {activity.action} <span className="text-indigo-600">{activity.target}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;