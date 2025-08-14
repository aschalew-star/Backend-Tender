import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200',
    warning: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200',
    danger: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200',
    outline: 'border-2 border-gray-200 bg-white text-gray-700',
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full
        ${variantStyles[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
};