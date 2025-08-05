import React, { useState, useEffect, Component } from 'react';
import type { ReactNode } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Building2,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';

interface Bank {
  id: number;
  name: string;
  account: string;
  logo?: string;
  createdAt: string;
}

// Error Boundary Component
class BankErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in Banks component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600">
          <h2>Something went wrong while loading banks.</h2>
          <p>Please refresh the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const BankModal: React.FC<{
  showModal: boolean;
  modalMode: 'add' | 'edit' | 'view';
  selectedBank: Bank | null;
  formData: { name: string; account: string; logo: string };
  setShowModal: (show: boolean) => void;
  setFormData: (data: { name: string; account: string; logo: string }) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  error: string | null;
}> = ({ showModal, modalMode, selectedBank, formData, setShowModal, setFormData, handleFormSubmit, error }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-transform duration-300 scale-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalMode === 'add' ? 'Add New Bank' : 
             modalMode === 'edit' ? 'Edit Bank' : 'Bank Details'}
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleFormSubmit} className="p-6">
          {error && (
            <div className="mb-4 text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={modalMode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter bank name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                disabled={modalMode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter account number"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                disabled={modalMode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter logo URL"
              />
            </div>

            {modalMode === 'view' && selectedBank && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created At
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {new Date(selectedBank.createdAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
          
          {modalMode !== 'view' && (
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={formData.name.trim() === '' || formData.account.trim() === ''}
              >
                {modalMode === 'add' ? 'Add Bank' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  bankName: string;
}> = ({ show, onConfirm, onCancel, bankName }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 transform transition-transform duration-300 scale-100">
        <div className="flex items-center space-x-4 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div>
            <h3 className="font-bold text-lg text-gray-900">Delete Bank</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete the bank "{bankName}"?</p>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Banks: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [formData, setFormData] = useState({ name: '', account: '', logo: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);

  // Fetch all banks on component mount
  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/bank/all?page=1&limit=100');
      const result = await response.json();
      if (result.status === 'success') {
        setBanks(result.data);
      } else {
        setError(result.message || 'Failed to fetch banks');
      }
    } catch (err) {
      setError('An error occurred while fetching banks');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode('add');
    setSelectedBank(null);
    setFormData({ name: '', account: '', logo: '' });
    setShowModal(true);
    setError(null);
  };

  const handleEdit = (bank: Bank) => {
    setModalMode('edit');
    setSelectedBank(bank);
    setFormData({ name: bank.name, account: bank.account, logo: bank.logo || '' });
    setShowModal(true);
    setError(null);
  };

  const handleView = (bank: Bank) => {
    setModalMode('view');
    setSelectedBank(bank);
    setShowModal(true);
    setError(null);
  };

  const handleDeleteClick = (bank: Bank) => {
    setBankToDelete(bank);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bankToDelete) return;

    try {
      const response = await fetch(`http://localhost:4000/api/bank/${bankToDelete.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setBanks(banks.filter((bank) => bank.id !== bankToDelete.id));
      } else {
        const result = await response.json();
        setError(result.message || 'Failed to delete bank');
      }
    } catch (err) {
      setError('An error occurred while deleting the bank');
    } finally {
      setShowDeleteModal(false);
      setBankToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBankToDelete(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prepare data, sending undefined for empty logo
    const payload = {
      name: formData.name.trim(),
      account: formData.account.trim(),
      logo: formData.logo || undefined,
    };

    if (!payload.name || !payload.account) {
      setError('Bank name and account number are required');
      return;
    }

    if (modalMode === 'add') {
      try {
        const response = await fetch('http://localhost:4000/api/bank/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (response.status === 201) {
          setBanks([...banks, result.data]);
          setShowModal(false);
          setFormData({ name: '', account: '', logo: '' });
        } else {
          setError(result.message || 'Failed to create bank');
        }
      } catch (err) {
        setError('An error occurred while creating the bank');
      }
    } else if (modalMode === 'edit' && selectedBank) {
      try {
        const response = await fetch(`http://localhost:4000/api/bank/${selectedBank.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (response.ok) {
          setBanks(banks.map((bank) => (bank.id === selectedBank.id ? result.data : bank)));
          setShowModal(false);
          setFormData({ name: '', account: '', logo: '' });
        } else {
          setError(result.message || 'Failed to update bank');
        }
      } catch (err) {
        setError('An error occurred while updating the bank');
      }
    }
  };

  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.account.includes(searchTerm)
  );

  return (
    <BankErrorBoundary>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bank Management</h1>
              <p className="text-gray-600">Manage banking partners and payment methods.</p>
            </div>
            <button
              onClick={handleAdd}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bank
            </button>
          </div>
        </div>

        {loading && (
          <div className="mb-6 text-gray-600 text-center">Loading banks...</div>
        )}

        {error && (
          <div className="mb-6 text-red-600 text-sm flex items-center justify-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search banks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Banks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanks.map((bank) => (
            <div key={bank.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  {bank.logo ? (
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{bank.name}</h3>
                    <p className="text-sm text-gray-500">Account: {bank.account}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(bank.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(bank)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(bank)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit bank"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(bank)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete bank"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <BankModal
          showModal={showModal}
          modalMode={modalMode}
          selectedBank={selectedBank}
          formData={formData}
          setShowModal={setShowModal}
          setFormData={setFormData}
          handleFormSubmit={handleFormSubmit}
          error={error}
        />

        {bankToDelete && (
          <DeleteConfirmationModal
            show={showDeleteModal}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            bankName={bankToDelete.name}
          />
        )}
      </div>
    </BankErrorBoundary>
  );
};

export default Banks;