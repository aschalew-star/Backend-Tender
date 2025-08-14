"use client";

import React, { useState, useMemo } from "react";
import { Search, FileText, Building2 } from "lucide-react";
import DocumentCard from "../component/DocumentCard";
import BiddingDocCard from "../component/BiddingCard";
import Navbar from "../component/Layout/Navbar";
import  TenderDocPage  from "./TenderDetailpage";

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

const Input = (props) => (
  <input 
    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50" 
    {...props} 
  />
);

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

// --- START: Updated Interfaces and Static Data ---
interface TenderDoc {
  id: number;
  name: string;
  title: string;
  file: string;
  price?: number;
  type: "FREE" | "PAID";
  createdAt: string;
  tenderId: number;
  customers: number;
}

interface BiddingDoc {
  id: number;
  title: string;
  description?: string;
  company: string;
  file: string;
  price?: number;
  type: "FREE" | "PAID";
  tenderId: number;
  customers: number;
}

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
}

interface Region {
  id: number;
  name: string;
}

interface Tender {
  id: number;
  title: string;
  description?: string;
  type: "FREE" | "PAID";
  biddingOpen?: string;
  biddingClosed?: string;
  categoryId: number;
  category: Category;
  subcategoryId: number;
  subcategory: Subcategory;
  regionId?: number;
  region?: Region;
}

const mockTenders: Tender[] = [
  {
    id: 1,
    title: "National Highway Development",
    description: "A major infrastructure project to develop highways across the northern region.",
    type: "FREE",
    biddingOpen: "2024-01-01T00:00:00Z",
    biddingClosed: "2024-12-31T23:59:59Z",
    categoryId: 1,
    category: { id: 1, name: "Infrastructure" },
    subcategoryId: 1,
    subcategory: { id: 1, name: "Roads" },
    regionId: 1,
    region: { id: 1, name: "North Region" },
  },
  {
    id: 2,
    title: "Digital Transformation Initiative",
    description: "A project to implement enterprise software solutions for government services.",
    type: "PAID",
    biddingOpen: "2024-01-01T00:00:00Z",
    biddingClosed: "2024-12-31T23:59:59Z",
    categoryId: 2,
    category: { id: 2, name: "Technology" },
    subcategoryId: 2,
    subcategory: { id: 2, name: "Software" },
    regionId: 2,
    region: { id: 2, name: "South Region" },
  },
  {
    id: 3,
    title: "Healthcare Infrastructure Upgrade",
    description: "Procurement of medical equipment for hospitals in the eastern region.",
    type: "FREE",
    biddingOpen: "2024-01-01T00:00:00Z",
    biddingClosed: "2024-12-31T23:59:59Z",
    categoryId: 3,
    category: { id: 3, name: "Healthcare" },
    subcategoryId: 3,
    subcategory: { id: 3, name: "Equipment" },
    regionId: 3,
    region: { id: 3, name: "East Region" },
  },
];

const mockTenderDocs: TenderDoc[] = [
  {
    id: 1,
    name: "highway_construction_tender.pdf",
    title: "Highway Construction Project - Phase 1",
    file: "highway-construction-tender.pdf",
    price: undefined,
    type: "FREE",
    createdAt: "2024-01-15T00:00:00Z",
    tenderId: 1,
    customers: 150,
  },
  {
    id: 2,
    name: "enterprise_software_tender.pdf",
    title: "Enterprise Software Solutions",
    file: "enterprise-software-tender.pdf",
    price: 25.0,
    type: "PAID",
    createdAt: "2024-01-20T00:00:00Z",
    tenderId: 2,
    customers: 120,
  },
  {
    id: 3,
    name: "medical_equipment_tender.pdf",
    title: "Hospital Equipment Procurement",
    file: "medical-equipment-tender.pdf",
    price: undefined,
    type: "FREE",
    createdAt: "2024-01-25T00:00:00Z",
    tenderId: 3,
    customers: 80,
  },
];

const mockBiddingDocs: BiddingDoc[] = [
  {
    id: 1,
    title: "Construction Proposal - ABC Corp",
    description: "Comprehensive construction proposal with detailed timeline and cost breakdown",
    company: "ABC Construction Ltd.",
    file: "abc-construction-proposal.pdf",
    price: 15.0,
    type: "PAID",
    tenderId: 1,
    customers: 100,
  },
  {
    id: 2,
    title: "Software Development Bid - TechSolutions",
    description: "Complete software architecture and development proposal",
    company: "TechSolutions Inc.",
    file: "techsolutions-bid.pdf",
    price: undefined,
    type: "FREE",
    tenderId: 2,
    customers: 90,
  },
  {
    id: 3,
    title: "Medical Equipment Supply Proposal",
    description: "Detailed proposal for hospital equipment supply and installation",
    company: "MedEquip Solutions",
    file: "medequip-proposal.pdf",
    price: 20.0,
    type: "PAID",
    tenderId: 3,
    customers: 110,
  },
];
// --- END: Updated Interfaces and Static Data ---

// Custom CSS for animations
const customStyles = `
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  .animate-slide-in {
    animation: slideIn 0.6s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const App = () => {
  const [activeTab, setActiveTab] = useState<"tender" | "bidding" | "tenderPage">("tender");
  const [selectedTenderId, setSelectedTenderId] = useState<number | null>(null);
  const [tenderSearch, setTenderSearch] = useState("");
  const [biddingSearch, setBiddingSearch] = useState("");

  const filteredTenderDocs = useMemo(() => {
    return mockTenderDocs.filter(
      (doc) =>
        doc.name.toLowerCase().includes(tenderSearch.toLowerCase()) ||
        doc.title.toLowerCase().includes(tenderSearch.toLowerCase())
    );
  }, [tenderSearch]);

  const filteredBiddingDocs = useMemo(() => {
    return mockBiddingDocs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(biddingSearch.toLowerCase()) ||
        (doc.description?.toLowerCase().includes(biddingSearch.toLowerCase()) ?? false) ||
        doc.company.toLowerCase().includes(biddingSearch.toLowerCase())
    );
  }, [biddingSearch]);

  const handleViewTender = (tenderId: number) => {
    setSelectedTenderId(tenderId);
    setActiveTab("tenderPage");
  };

  if (activeTab === "tenderPage" && selectedTenderId !== null) {
    const tender = mockTenders.find((t) => t.id === selectedTenderId);
    return (
      <TenderDocPage
        tender={tender || null}
        isSubscribed={false} // Replace with actual subscription logic later
        onBack={() => setActiveTab("tender")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <style>{customStyles}</style>

      <div className="max-w-[1600px] mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="font-bold text-4xl text-gray-900 mb-2">Document Library</h1>
          <p className="text-lg text-gray-600">Browse and access tender documents and bidding proposals</p>
        </div>

        {/* Tabbed Interface */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 max-w-7xl">
            <button
              onClick={() => setActiveTab("tender")}
              className={`flex-1 px-8 py-6 text-center font-bold text-lg transition-all duration-300 ${
                activeTab === "tender"
                  ? "text-cyan-600 bg-cyan-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              Tender Documents
              <span className="ml-2 px-2 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-full">
                {filteredTenderDocs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("bidding")}
              className={`flex-1 px-8 py-6 text-center font-bold text-lg transition-all duration-300 ${
                activeTab === "bidding"
                  ? "text-orange-600 bg-orange-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Building2 className="w-5 h-5 inline-block mr-2" />
              Bidding Proposals
              <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                {filteredBiddingDocs.length}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "tender" && (
              <div className="animate-fade-in">
                {/* Search Bar */}
                <div className="mb-8">
                  <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search tender documents..."
                      value={tenderSearch}
                      onChange={(e) => setTenderSearch(e.target.value)}
                      className="pl-10 py-3 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTenderDocs.map((doc) => (
                    <div key={doc.id} className="cursor-pointer" onClick={() => handleViewTender(doc.tenderId)}>
                      <DocumentCard
                        document={doc}
                        delay={0}
                        canAccess={true} // Adjust based on subscription logic later
                        onDownload={() => console.log("Downloading:", doc.name)}
                        onPreview={() => console.log("Previewing:", doc.name)}
                      />
                    </div>
                  ))}
                </div>

                {filteredTenderDocs.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-xl text-gray-500 mb-2">No documents found</h3>
                    <p className="text-gray-400">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "bidding" && (
              <div className="animate-fade-in">
                {/* Search Bar */}
                <div className="mb-8">
                  <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search proposals by company or description..."
                      value={biddingSearch}
                      onChange={(e) => setBiddingSearch(e.target.value)}
                      className="pl-10 py-3 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBiddingDocs.map((doc) => (
                    <BiddingDocCard key={doc.id} doc={doc} />
                  ))}
                </div>

                {filteredBiddingDocs.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-xl text-gray-500 mb-2">No proposals found</h3>
                    <p className="text-gray-400">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;