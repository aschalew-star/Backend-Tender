import React from 'react';
import { Building2, Download, Eye } from 'lucide-react';

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
    default:
      variantClasses = 'bg-gray-900 text-white';
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

// --- START: Interfaces ---
interface BiddingDoc {
  id: number;
  title: string;
  description?: string;
  company: string;
  file: string;
  price?: string | null;
  type: "FREE" | "PAID";
  tenderId: number;
  customers: number;
}

interface BiddingDocCardProps {
  doc: BiddingDoc;
  onDownload: () => void;
  onPreview: () => void;
}
// --- END: Interfaces ---

// Custom CSS for animations
const customStyles = `
  .animate-slide-in {
    animation: slideIn 0.6s ease-out;
  }
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const BiddingDocCard = ({ doc, onDownload, onPreview }: BiddingDocCardProps) => (
  <Card className="document-card border-0 shadow-sm bg-white animate-slide-in">
    <style>{customStyles}</style>
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{doc.title}</h3>
            <p className="text-sm text-orange-600 font-semibold">{doc.company}</p>
          </div>
        </div>
        <Badge variant={doc.type === "FREE" ? "secondary" : "default"}>
          {doc.type === "FREE" ? "Free" : `$${doc.price}`}
        </Badge>
      </div>

      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{doc.description || 'No description available'}</p>

      <div className="flex space-x-2">
        <Button 
          size="sm" 
          className="flex-1 bg-orange-600 hover:bg-orange-700"
          onClick={onDownload}
          disabled={doc.type === "PAID" && false} // Replace false with !isSubscribed
        >
          <Download className="w-4 h-4 mr-2" />
          {doc.type === "FREE" ? "Download" : "Purchase & Download"}
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

export default BiddingDocCard;