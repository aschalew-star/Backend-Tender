import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  FileText,
  Home,
  MapPin,
  Settings,
  Users,
  Activity,
  ChevronRight,
  Menu,
  X,
  Megaphone, // Added for Advertisement
  Tag,       // Added for Category
} from 'lucide-react';

interface SubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url?: string;
  icon: React.ComponentType<any>;
  items?: SubItem[];
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Home,
    },
    {
      title: "Users",
      icon: Users,
      items: [
        {
          title: "System Users",
          url: "/admin/SystemUser",
        },
        {
          title: "Customers",
          url: "/admin/Customers",
        },
      ],
    },
    {
      title: "Tenders",
      icon: FileText,
      items: [
        {
          title: "All Tenders",
          url: "/admin/Tenders",
        },
        {
          title: "Create Tender",
          url: "/admin/tender-create",
        },
      ],
    },
    {
      title: "Categories",
      icon: Tag,
      items: [
        {
          title: "All Categories",
          url: "/admin/Categories",
        },
        {
          title: "Subcategories",
          url: "/admin/Subcategories",
        },
        {
          title: "Create Category",
          url: "/admin/category-create",
        },
      ],
    },
    {
      title: "Advertisements",
      url: "/admin/Advertisement",
      icon: Megaphone,
    },
    {
      title: "Payments",
      url: "/admin/Payment",
      icon: CreditCard,
    },
    {
      title: "Banks",
      url: "/admin/Bank",
      icon: Building2,
    },
    {
      title: "Notifications",
      url: "/admin/Notification",
      icon: Bell,
    },
    {
      title: "Regions",
      url: "/admin/Region",
      icon: MapPin,
    },
    {
      title: "Activity Logs",
      url: "/admin/Activity",
      icon: Activity,
    },
  ],
};

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpanded = (title: string) => {
    setExpandedItem((prev) => (prev === title ? null : title));
  };

  const SidebarItem: React.FC<{ item: NavItem }> = ({ item }) => {
    const isExpanded = expandedItem === item.title;
    const hasSubItems = item.items && item.items.length > 0;
    const isActive = item.url === currentPath || item.items?.some((sub) => sub.url === currentPath);

    if (hasSubItems) {
      return (
        <div className="mb-2">
          <button
            onClick={() => toggleExpanded(item.title)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 hover:bg-indigo-50 group ${
              isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-800'
            }`}
            aria-expanded={isExpanded}
            aria-controls={`submenu-${item.title}`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors" />
              <span className="font-semibold text-sm tracking-wide">
                {item.title}
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
                isExpanded ? 'rotate-90 text-indigo-600' : 'group-hover:text-indigo-600'
              }`}
            />
          </button>
          <div
            id={`submenu-${item.title}`}
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="ml-10 mt-2 space-y-1">
              {item.items?.map((subItem) => (
                <a
                  key={subItem.title}
                  href={subItem.url}
                  onClick={() => setCurrentPath(subItem.url)}
                  className={`block px-4 py-2 text-sm rounded-md transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 ${
                    subItem.url === currentPath ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-600'
                  }`}
                >
                  {subItem.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-2">
        <a
          href={item.url}
          onClick={() => setCurrentPath(item.url || '')}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-indigo-50 group ${
            isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-800'
          }`}
        >
          <item.icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors" />
          <span className="font-semibold text-sm tracking-wide">{item.title}</span>
        </a>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden bg-indigo-600 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-gray-100 text-gray-800 shadow-md z-50 transition-all duration-500 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:shadow-sm w-80`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col items-center space-x-3">
            <h1 className="font-bold text-2xl text-gray-800 tracking-tight mb-2">Tender Dashboard</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-gray-100">
          <nav className="space-y-1">
            {data.navMain.map((item) => (
              <SidebarItem key={item.title} item={item} />
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 mb-16">
          <a
            href="/settings"
            onClick={() => setCurrentPath('/settings')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-indigo-50 group ${
              currentPath === '/settings' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-800'
            }`}
          >
            <Settings className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors" />
            <span className="font-semibold text-sm tracking-wide">Settings</span>
          </a>
        </div>

        {/* Decorative accent line */}
        <div className="absolute right-0 top-0 w-1 h-full bg-indigo-600 opacity-30"></div>
      </div>

      {/* Main content spacer for desktop */}
      <div className="hidden lg:block w-80 flex-shrink-0"></div>
    </>
  );
}