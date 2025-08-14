import React from 'react';
import { Info, FileText, Clock, MessageCircle } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'contact', label: 'Contact', icon: MessageCircle },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => (
  <div className="flex space-x-1 bg-white/80 backdrop-blur-md p-1 rounded-xl border border-gray-200">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium 
          transition-all duration-200 transform hover:scale-105
          ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }
        `}
      >
        <tab.icon className="w-4 h-4" />
        {tab.label}
      </button>
    ))}
  </div>
);