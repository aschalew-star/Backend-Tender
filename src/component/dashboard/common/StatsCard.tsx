import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
  index: number;
}

const colorVariants = {
  indigo: {
    bg: 'from-indigo-500 to-indigo-600',
    light: 'bg-indigo-50',
    text: 'text-indigo-600'
  },
  emerald: {
    bg: 'from-emerald-500 to-emerald-600',
    light: 'bg-emerald-50',
    text: 'text-emerald-600'
  },
  amber: {
    bg: 'from-amber-500 to-amber-600',
    light: 'bg-amber-50',
    text: 'text-amber-600'
  },
  rose: {
    bg: 'from-rose-500 to-rose-600',
    light: 'bg-rose-50',
    text: 'text-rose-600'
  }
};

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color,
  index 
}) => {
  const colorClasses = colorVariants[color];
  
  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center space-x-1">
            {changeType === 'increase' ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
            <span className={`text-sm font-medium ${
              changeType === 'increase' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {change}
            </span>
            <span className="text-sm text-gray-500">from last month</span>
          </div>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;