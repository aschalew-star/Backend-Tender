import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Filter, Download, Eye, Edit, Clock, Calendar,
  FileText, XCircle, Trash2, ChevronLeft, ChevronRight, AlertTriangle,
} from 'lucide-react';

interface Tender {
  id: number;
  title: string;
  category: string;
  subcategory: string;
  biddingOpen: string;
  biddingClosed: string;
  status: 'open' | 'closed' | 'pending';
  tenderId: string;
  description?: string;
  type?: string;
  tenderDocs?: { name: string; title: string; type: string; price: string }[];
  biddingDocs?: { title: string; description: string; company: string; type: string; price: string }[];
}

const Alltenders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTendersInDb, setTotalTendersInDb] = useState(0);
  const [openTendersInDb, setOpenTendersInDb] = useState(0);
  const [closedTendersInDb, setClosedTendersInDb] = useState(0);
  const [pendingTendersInDb, setPendingTendersInDb] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const limit = 15;
  const navigate = useNavigate();

  // Fetch tenders from backend
  useEffect(() => {
    const fetchTenders = async () => {
      try {
        setError(null);
        const params = { page, limit };
        const response = await axios.get('http://localhost:4000/api/tender/all', { params });

        if (response.data.status === 'success') {
          const now = new Date();

          const validatedTenders = (response.data.data || []).map((tender: any) => {
            const biddingOpen = new Date(tender.biddingOpen);
            const biddingClosed = new Date(tender.biddingClosed);

            let status: 'open' | 'closed' | 'pending' = 'pending';
            if (biddingClosed < now) status = 'closed';
            else if (biddingOpen > now) status = 'pending';
            else status = 'open';

            return { ...tender, status };
          });

          setTenders(validatedTenders);
          setTotalPages(response.data.meta?.totalPages || 1);
          setTotalTendersInDb(response.data.meta?.total || 0);
          setOpenTendersInDb(validatedTenders.filter((t) => t.status === 'open').length);
          setClosedTendersInDb(validatedTenders.filter((t) => t.status === 'closed').length);
          setPendingTendersInDb(validatedTenders.filter((t) => t.status === 'pending').length);
        } else {
          throw new Error(response.data.message || 'Failed to fetch tenders');
        }
      } catch (error: any) {
        console.error('Failed to fetch tenders:', error);
        setError(error.response?.data?.message || 'Failed to load tenders. Please try again.');
        setTenders([]);
        setTotalTendersInDb(0);
        setOpenTendersInDb(0);
        setClosedTendersInDb(0);
        setPendingTendersInDb(0);
      }
    };

    fetchTenders();
  }, [page]);

  const getStatusBadge = (status: string | undefined | null) => {
    const validStatus = ['open', 'closed', 'pending'].includes(status as string) ? status : 'pending';
    const statusConfig = {
      open: { bg: 'bg-green-100', text: 'text-green-800', icon: Calendar },
      closed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    };
    const config = statusConfig[validStatus as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} transition-transform duration-200 hover:scale-105`}>
        <Icon className="w-4 h-4 mr-1.5" />
        {validStatus.charAt(0).toUpperCase() + validStatus.slice(1)}
      </span>
    );
  };

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.tenderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tender.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewTender = (tenderId: number) => {
    console.log('Viewing tender:', tenderId);
  };

  const handleEditTender = (tenderId: number) => {
    const tender = tenders.find((t) => t.id === tenderId);
    if (tender) navigate(`/edit-tender/${tenderId}`, { state: { tender } });
  };

  const handleDeleteTender = async (tenderId: number) => {
    try {
      await axios.delete(`http://localhost:4000/api/tender/${tenderId}`);
      const deletedTender = tenders.find((t) => t.id === tenderId);
      setTenders(tenders.filter((t) => t.id !== tenderId));
      setTotalTendersInDb((prev) => Math.max(0, prev - 1));
      if (deletedTender) {
        if (deletedTender.status === 'open') setOpenTendersInDb((prev) => Math.max(0, prev - 1));
        else if (deletedTender.status === 'closed') setClosedTendersInDb((prev) => Math.max(0, prev - 1));
        else if (deletedTender.status === 'pending') setPendingTendersInDb((prev) => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete tender. Please try again.');
    }
  };

  const handlePreviousPage = () => { if (page > 1) setPage(page - 1); };
  const handleNextPage = () => { if (page < totalPages) setPage(page + 1); };

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter'] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">All Tenders</h1>
          <p className="text-gray-600 text-base mt-2">Manage and review all tender opportunities with ease</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'All Tenders', count: totalTendersInDb, color: 'blue', icon: FileText },
            { label: 'Open Tenders', count: openTendersInDb, color: 'yellow', icon: Calendar },
            { label: 'Closed Tenders', count: closedTendersInDb, color: 'green', icon: XCircle },
            { label: 'Pending Tenders', count: pendingTendersInDb, color: 'purple', icon: Clock },
          ].map(({ label, count, color, icon: Icon }, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-transform duration-200 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${color}-500`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tenders by title, ID, category, subcategory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
              <button className="flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Filter className="w-5 h-5 mr-2" /> Filter
              </button>
              <button className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="w-5 h-5 mr-2" /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tender</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tender ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Bidding Period</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenders.map((tender, index) => (
                <tr key={tender.id} className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{tender.title}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{tender.tenderId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{tender.category}<div className="text-sm text-gray-500">{tender.subcategory}</div></td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(tender.biddingOpen).toLocaleDateString()} <br />
                    to {new Date(tender.biddingClosed).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(tender.status)}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button onClick={() => handleViewTender(tender.id)} className="text-blue-600 hover:text-blue-900"><Eye className="w-5 h-5" /></button>
                      <button onClick={() => handleEditTender(tender.id)} className="text-blue-600 hover:text-blue-900"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteTender(tender.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg ${
              page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Previous
          </button>
          <span className="text-gray-700">Page {page} of {totalPages}</span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg ${
              page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            Next <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alltenders;
