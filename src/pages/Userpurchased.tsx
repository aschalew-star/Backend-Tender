import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Search, FileText, Building2 } from 'lucide-react';
import DocumentCard from '../component/DocumentCard';
import BiddingDocCard from '../component/BiddingCard';
import Navbar from '../component/Layout/Navbar';
import TenderDocPage from './TenderDetailpage';

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

const Select = ({ value, onChange, children, className = '', ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
);
// --- END: shadcn/ui components ---

// --- START: Interfaces ---
interface TenderDoc {
  id: number;
  name: string;
  title: string;
  file: string;
  price?: string | null;
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
  price?: string | null;
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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
// --- END: Interfaces ---

// Custom CSS
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

const PurchasedDocuments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tender" | "bidding">("tender");
  const [tenderSearch, setTenderSearch] = useState("");
  const [biddingSearch, setBiddingSearch] = useState("");
  const [tenderPage, setTenderPage] = useState(1);
  const [biddingPage, setBiddingPage] = useState(1);
  const [tenderFilter, setTenderFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
  const [biddingFilter, setBiddingFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
  const [tenderDocs, setTenderDocs] = useState<TenderDoc[]>([]);
  const [biddingDocs, setBiddingDocs] = useState<BiddingDoc[]>([]);
  const [tenderPagination, setTenderPagination] = useState<Pagination | null>(null);
  const [biddingPagination, setBiddingPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 6;

  // Mock auth token and subscription status (replace with actual auth logic)
  const yourAuthToken = 'your-token-here'; // Replace with actual token
  const isSubscribed = false; // Replace with auth context or API check

  // Fetch purchased documents from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tenderParams = new URLSearchParams({
          page: tenderPage.toString(),
          limit: itemsPerPage.toString(),
          ...(tenderSearch && { search: tenderSearch }),
          ...(tenderFilter !== "ALL" && { type: tenderFilter }),
        });
        const tenderDocsResponse = await fetch(`http://localhost:4000/api/tender/purchased/tenderdoc?${tenderParams}`, {
          headers: {
            Authorization: `Bearer ${yourAuthToken}`,
          },
        });
        if (!tenderDocsResponse.ok) throw new Error('Failed to fetch purchased tender documents');
        const tenderDocsData = await tenderDocsResponse.json();
        console.log("Purchased TenderDocs data:", tenderDocsData);
        setTenderDocs(Array.isArray(tenderDocsData.data) ? tenderDocsData.data : []);
        setTenderPagination(tenderDocsData.pagination || null);

        const biddingParams = new URLSearchParams({
          page: biddingPage.toString(),
          limit: itemsPerPage.toString(),
          ...(biddingSearch && { search: biddingSearch }),
          ...(biddingFilter !== "ALL" && { type: biddingFilter }),
        });
        const biddingDocsResponse = await fetch(`http://localhost:4000/api/tender/purchased/tenderbid?${biddingParams}`, {
          headers: {
            Authorization: `Bearer ${yourAuthToken}`,
          },
        });
        if (!biddingDocsResponse.ok) throw new Error('Failed to fetch purchased bidding documents');
        const biddingDocsData = await biddingDocsResponse.json();
        console.log("Purchased BiddingDocs data:", biddingDocsData);
        setBiddingDocs(Array.isArray(biddingDocsData.data) ? biddingDocsData.data : []);
        setBiddingPagination(biddingDocsData.pagination || null);
      } catch (err) {
        setError('Error fetching purchased documents. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenderPage, biddingPage, tenderSearch, tenderFilter, biddingSearch, biddingFilter]);

  const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void) => (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => setPage(currentPage - 1)}
      >
        Previous
      </Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => setPage(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => setPage(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );

  const handleDownload = async (file: string, name: string, type: "FREE" | "PAID") => {
    try {
      const response = await fetch(file, {
        headers: type === "PAID" ? {
          Authorization: `Bearer ${yourAuthToken}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download the file. Please try again.');
    }
  };

  const PurchasedDocumentsLibrary = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <style>{customStyles}</style>
      <div className="max-w-[1600px] mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="font-bold text-4xl text-gray-900 mb-2">My Purchased Documents</h1>
          <p className="text-lg text-gray-600">Browse and access your purchased tender documents and bidding proposals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                {tenderPagination?.totalDocs || 0}
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
                {biddingPagination?.totalDocs || 0}
              </span>
            </button>
          </div>

          <div className="p-8">
            {activeTab === "tender" && (
              <div className="animate-fade-in">
                <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search purchased tender documents..."
                      value={tenderSearch}
                      onChange={(e) => {
                        setTenderSearch(e.target.value);
                        setTenderPage(1);
                      }}
                      className="pl-10 py-3 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                  <Select
                    value={tenderFilter}
                    onChange={(e) => {
                      setTenderFilter(e.target.value as "ALL" | "FREE" | "PAID");
                      setTenderPage(1);
                    }}
                    className="max-w-[150px]"
                  >
                    <option value="ALL">All</option>
                    <option value="FREE">Free</option>
                    <option value="PAID">Paid</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tenderDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      delay={0}
                      canAccess={true} // Purchased documents are always accessible
                      onDownload={() => handleDownload(doc.file, doc.name, doc.type)}
                      onPreview={() => navigate(`/purchased/tender/${doc.tenderId}`)}
                    />
                  ))}
                </div>

                {tenderDocs.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-xl text-gray-500 mb-2">No purchased tender documents found</h3>
                    <p className="text-gray-400">Try adjusting your search terms or filter</p>
                  </div>
                )}

                {tenderPagination && tenderPagination.totalPages > 1 && renderPagination(
                  tenderPagination.currentPage,
                  tenderPagination.totalPages,
                  setTenderPage
                )}
              </div>
            )}

            {activeTab === "bidding" && (
              <div className="animate-fade-in">
                <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search purchased proposals by company or description..."
                      value={biddingSearch}
                      onChange={(e) => {
                        setBiddingSearch(e.target.value);
                        setBiddingPage(1);
                      }}
                      className="pl-10 py-3 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <Select
                    value={biddingFilter}
                    onChange={(e) => {
                      setBiddingFilter(e.target.value as "ALL" | "FREE" | "PAID");
                      setBiddingPage(1);
                    }}
                    className="max-w-[150px]"
                  >
                    <option value="ALL">All</option>
                    <option value="FREE">Free</option>
                    <option value="PAID">Paid</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {biddingDocs.map((doc) => (
                    <BiddingDocCard
                      key={doc.id}
                      doc={doc}
                      onDownload={() => handleDownload(doc.file, doc.title, doc.type)}
                      onPreview={() => navigate(`/purchased/tender/${doc.tenderId}`)}
                    />
                  ))}
                </div>

                {biddingDocs.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-xl text-gray-500 mb-2">No purchased proposals found</h3>
                    <p className="text-gray-400">Try adjusting your search terms or filter</p>
                  </div>
                )}

                {biddingPagination && biddingPagination.totalPages > 1 && renderPagination(
                  biddingPagination.currentPage,
                  biddingPagination.totalPages,
                  setBiddingPage
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<PurchasedDocumentsLibrary />} />
      <Route path="/tender/:tenderId" element={<TenderDocPageWrapper />} />
    </Routes>
  );
};

// Wrapper to fetch tender data for TenderDocPage
const TenderDocPageWrapper = () => {
  const { tenderId } = useParams();
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTender = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/tender/${tenderId}`, {
          headers: {
            Authorization: `Bearer ${yourAuthToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch tender');
        const data = await response.json();
        setTender(data.data || null);
      } catch (err) {
        console.error(err);
        setTender(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTender();
  }, [tenderId]);

  if (loading) return <div>Loading...</div>;
  if (!tender) return <div>Tender not found</div>;

  return (
    <TenderDocPage
      tender={tender}
      isSubscribed={isSubscribed}
      onBack={() => navigate('/purchased')}
    />
  );
};

export default PurchasedDocuments;