import React from 'react';
import { Plus, Tag, Megaphone, BarChart3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Add Category',
      description: 'Create a new tender category',
      icon: Tag,
      color: 'indigo',
      href: '/admin/Categories'
    },
    {
      title: 'Create Ad',
      description: 'Launch a new advertisement',
      icon: Megaphone,
      color: 'amber',
      href: '/admin/Advertisement'
    },
    {
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: BarChart3,
      color: 'emerald',
      href: '#'
    },
    {
      title: 'Manage Users',
      description: 'User administration',
      icon: Users,
      color: 'rose',
      href: '#'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'indigo': return 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700';
      case 'amber': return 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700';
      case 'emerald': return 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700';
      case 'rose': return 'from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700';
      default: return 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
        <Plus className="w-6 h-6 text-indigo-600" />
      </div>
      
      <div className="space-y-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const colorClasses = getColorClasses(action.color);
          
          return (
            <Link
              key={action.title}
              to={action.href}
              className={`block p-4 bg-gradient-to-r ${colorClasses} rounded-xl text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-6 h-6" />
                <div>
                  <h4 className="font-semibold">{action.title}</h4>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;