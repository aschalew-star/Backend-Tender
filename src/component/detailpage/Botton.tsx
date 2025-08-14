import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'ghost' | 'outline' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'default' | 'lg';
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  onClick,
  disabled = false,
  variant = 'default',
  size = 'default',
  type = 'button',
}) => {
  const baseStyles = `
    inline-flex items-center justify-center rounded-lg font-medium 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    default: `
      bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
      hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 
      shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
    `,
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900',
    outline: 'border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300',
    success: `
      bg-gradient-to-r from-green-500 to-emerald-600 text-white 
      hover:from-green-600 hover:to-emerald-700 focus:ring-green-500
    `,
    warning: `
      bg-gradient-to-r from-orange-500 to-red-500 text-white 
      hover:from-orange-600 hover:to-red-600 focus:ring-orange-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-600 text-white 
      hover:from-red-600 hover:to-pink-700 focus:ring-red-500
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};