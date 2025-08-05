import React, { useState, useEffect, Component, useCallback } from 'react';
import type { ReactNode } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  Edit,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';

// Region interface matching Prisma model
interface Region {
  id: number;
  name: string;
  createdAt: string;
}

// Error Boundary Component
class RegionErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error in Regions component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600">
          <h2>Something went wrong while loading regions.</h2>
          <p>Please refresh the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Custom Modal for adding/editing/viewing regions
const RegionModal = ({ show, mode, region, onSave, onClose, onInputChange, inputValue, error }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'add' ? 'Add New Region' : 
             mode === 'edit' ? 'Edit Region' : 'Region Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region Name
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={onInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                placeholder="Enter region name"
              />
            </div>

            {mode === 'view' && region && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created At
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {new Date(region.createdAt).toLocaleDateString()}
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </div>
        </div>
        
        {mode !== 'view' && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mode === 'add' ? 'Add Region' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Modal for delete confirmation
const DeleteConfirmationModal = ({ show, onConfirm, onCancel, regionName }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div>
            <h3 className="font-bold text-lg text-gray-900">Delete Region</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete the region "{regionName}"?</p>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Regions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [newRegionName, setNewRegionName] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // States for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);

  // Debounce search term
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Fetch regions with search and pagination
  useEffect(() => {
    let isMounted = true;
    const fetchRegions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:4000/api/region/all?search=${encodeURIComponent(debouncedSearchTerm)}&page=${page}&limit=10`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(response.status === 404 ? 'Region API endpoint not found. Please check if the server is running and the endpoint is configured.' : `HTTP ${response.status}: ${errorText}`);
        }
        const { data, meta } = await response.json();
        if (isMounted) {
          setRegions(Array.isArray(data) ? data : []);
          setTotalPages(meta?.totalPages || 1);
        }
      } catch (error: any) {
        if (isMounted) {
          console.error('Error fetching regions:', error);
          setError(error.message);
          setRegions([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchRegions();
    return () => { isMounted = false; };
  }, [debouncedSearchTerm, page]);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedRegion(null);
    setNewRegionName(''); // Reset the input state
    setShowModal(true);
    setError(null);
  };

  const handleEdit = (region: Region) => {
    setModalMode('edit');
    setSelectedRegion(region);
    setNewRegionName(region.name); // Set the input state to the region's name
    setShowModal(true);
    setError(null);
  };

  const handleView = (region: Region) => {
    setModalMode('view');
    setSelectedRegion(region);
    setNewRegionName(region.name); // Set the input state for viewing
    setShowModal(true);
    setError(null);
  };

  // Handler for delete button, opens the confirmation modal
  const handleDeleteClick = (region: Region) => {
    setRegionToDelete(region);
    setShowDeleteModal(true);
  };

  // Handler for confirming delete from the modal
  const handleDeleteConfirm = async () => {
    if (!regionToDelete) return;

    try {
      setError(null);
      const response = await fetch(`http://localhost:4000/api/region/${regionToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(response.status === 404 ? 'Region not found or endpoint unavailable.' : `HTTP ${response.status}: ${errorText}`);
      }
      setRegions(regions.filter(region => region.id !== regionToDelete.id));
    } catch (error: any) {
      console.error('Error deleting region:', error);
      setError(error.message);
    } finally {
      setShowDeleteModal(false);
      setRegionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setRegionToDelete(null);
  };

  const handleSave = async () => {
    const name = newRegionName.trim();
    if (!name) {
      setError('Region name is required');
      return;
    }

    try {
      setError(null);
      if (modalMode === 'add') {
        const response = await fetch('http://localhost:4000/api/region/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(response.status === 404 ? 'Region creation endpoint not found.' : `HTTP ${response.status}: ${errorText}`);
        }
        const { data } = await response.json();
        setRegions([...regions, data]);
      } else if (modalMode === 'edit' && selectedRegion) {
        const response = await fetch(`http://localhost:4000/api/region/${selectedRegion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(response.status === 404 ? 'Region update endpoint not found.' : `HTTP ${response.status}: ${errorText}`);
        }
        const { data } = await response.json();
        setRegions(regions.map(region => (region.id === data.id ? data : region)));
      }
      setShowModal(false);
      setNewRegionName(''); // Clear the input after saving
    } catch (error: any) {
      console.error('Error saving region:', error);
      setError(error.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const filteredRegions = Array.isArray(regions) ? regions : [];

  return (
    <RegionErrorBoundary>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Region Management</h1>
              <p className="text-gray-600">Manage geographical regions and locations.</p>
            </div>
            <button
              onClick={handleAdd}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Region
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="mb-6 text-gray-600">Loading regions...</div>
        )}

        {error && (
          <div className="mb-6 text-red-600 text-sm">{error}</div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search regions..."
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

        {/* Regions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegions.map((region) => (
            <div key={region.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{region.name}</h3>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(region.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(region)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(region)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit region"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(region)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete region"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
          >
            Next
          </button>
        </div>

        <RegionModal 
          show={showModal}
          mode={modalMode}
          region={selectedRegion}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setNewRegionName(''); }}
          onInputChange={(e) => setNewRegionName(e.target.value)}
          inputValue={newRegionName}
          error={error}
        />
        
        {regionToDelete && (
          <DeleteConfirmationModal
            show={showDeleteModal}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            regionName={regionToDelete.name}
          />
        )}
      </div>
    </RegionErrorBoundary>
  );
};

export default Regions;
