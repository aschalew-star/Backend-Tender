"use client";

import React from 'react';
import { FileText, Calendar, Download, Eye } from 'lucide-react';

// --- START: Recreated shadcn/ui components ---
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }) => {
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'h-8 px-3 text-sm';
      break;
    case 'lg':
      sizeClasses = 'h-11 px-8 text-lg';
      break;
    default:
      sizeClasses = 'h-10 px-4 py-2 text-base';
  }

  let variantClasses = '';
  switch (variant) {
    case 'outline':
      variantClasses = 'border border-gray-200 bg-white text-gray-900 shadow-sm hover:bg-gray-100';
      break;
    case 'ghost':
      variantClasses = 'hover:bg-gray-100 text-gray-900';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-100 text-gray-900 hover:bg-gray-200';
      break;
    default:
      variantClasses = 'bg-gray-900 text-white shadow-sm hover:bg-gray-800';
  }

  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses} ${sizeClasses} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = '', variant = 'default', ...props }) => {
  let variantClasses = '';
  switch (variant) {
    case 'secondary':
      variantClasses = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
      break;
    case 'outline':
      variantClasses = 'text-gray-900 border border-gray-200';
      break;
    case 'default':
      variantClasses = 'bg-gray-900 text-white';
      break;
  }
  return (
    <div 
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

const Card = ({ children, className = '', ...props }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);
// --- END: Recreated shadcn/ui components ---

// --- START: Interface ---
interface TenderDoc {
  id: number;
  name: string;
  title: string;
  file: string;
  price?: number | null;
  type: "FREE" | "PAID";
  createdAt: Date;
  tenderId: number;
  customers: number;
}

interface DocumentCardProps {
  document: TenderDoc;
  delay: number;
  canAccess: boolean;
  onDownload: () => void;
  onPreview: () => void;
}
// --- END: Interface ---

// Custom CSS for animations
const customStyles = `
  .animate-slide-in {
    animation: slideIn 0.6s ease-out;
    animation-delay: var(--delay);
  }
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const DocumentCard = ({ document, delay, canAccess, onDownload, onPreview }: DocumentCardProps) => (
  <Card className="document-card border-0 shadow-sm bg-white animate-slide-in" style={{ '--delay': `${delay}ms` } as React.CSSProperties}>
    <style>{customStyles}</style>
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{document.title}</h3>
            <p className="text-sm text-gray-500">Document ID: {document.name}</p>
          </div>
        </div>
        <Badge variant={document.type === "FREE" ? "secondary" : "default"}>
          {document.type === "FREE" ? "Free" : `$${document.price}`}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          {/* Published: {document.createdAt.toLocaleDateString()} */}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button 
          size="sm" 
          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
          onClick={onDownload}
          disabled={!canAccess && document.type === "PAID"}
        >
          <Download className="w-4 h-4 mr-2" />
          {document.type === "FREE" ? "Download" : "Purchase & Download"}
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-transparent"
          onClick={onPreview}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default DocumentCard;