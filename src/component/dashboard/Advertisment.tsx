import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ExternalLink, Calendar } from 'lucide-react';
import Modal from './common/Modal';
import Table from './common/Table';
import Button from './common/Button';

interface Advertisement {
  id: number;
  title: string;
  image: string;
  url: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const Advertisements: React.FC = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 5, totalPages: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    image: null as File | null,
    url: '',
    status: 'pending',
    startDate: '',
    endDate: '',
    createdBy: 1, // Replace with auth context user ID
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch advertisements with pagination
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/advertisement/all?page=${meta.page}&limit=${meta.limit}`);
        if (!response.ok) throw new Error('Failed to fetch advertisements');
        const { data, meta: responseMeta } = await response.json();
        setAdvertisements(data);
        setMeta(responseMeta);
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setError('Failed to load advertisements');
      }
    };
    fetchAds();
  }, [meta.page, meta.limit]);

  const filteredAds = advertisements.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDateForInput = (date: string): string => {
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (e) {
      console.error('Invalid date format:', date, e);
      return '';
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!editingAd && !formData.image) return 'Image file is required';
    if (!formData.url.trim()) return 'Target URL is required';
    if (!formData.startDate) return 'Start date is required';
    if (!formData.endDate) return 'End date is required';
    if (new Date(formData.endDate) < new Date(formData.startDate))
      return 'End date must be after start date';
    if (!['active', 'inactive', 'pending'].includes(formData.status))
      return 'Invalid status';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      console.error('Validation error:', validationError);
      return;
    }
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('url', formData.url);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('createdBy', String(formData.createdBy));
      if (formData.image) formDataToSend.append('image', formData.image);

      if (editingAd) {
        const response = await fetch(`http://localhost:4000/api/advertisement/${editingAd.id}`, {
          method: 'PUT',
          body: formDataToSend,
        });
        if (!response.ok) throw new Error('Failed to update advertisement');
        const { data } = await response.json();
        setAdvertisements(
          advertisements.map((ad) => (ad.id === editingAd.id ? data : ad))
        );
      } else {
        const response = await fetch('http://localhost:4000/api/advertisement/create', {
          method: 'POST',
          body: formDataToSend,
        });
        console.log(response)
        if (!response.ok) throw new Error('Failed to create advertisement');
        const { data } = await response.json();
        setAdvertisements([...advertisements, data]);
      }
      closeModal();
    } catch (error) {
      setError('Failed to save advertisement');
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:4000/api/advertisement/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete advertisement');
      setAdvertisements(advertisements.filter((ad) => ad.id !== id));
    } catch (error) {
      setError('Failed to delete advertisement');
      console.error('Delete error:', error);
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const ad = advertisements.find((ad) => ad.id === id);
      if (!ad) return;
      const newStatus =
        ad.status === 'active'
          ? 'inactive'
          : ad.status === 'inactive'
          ? 'active'
          : 'pending';
      const response = await fetch(`/api/advertisements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const { data } = await response.json();
      setAdvertisements(
        advertisements.map((ad) => (ad.id === id ? data : ad))
      );
    } catch (error) {
      setError('Failed to update status');
      console.error('Toggle status error:', error);
    }
  };

  const openCreateModal = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      image: null,
      url: '',
      status: 'pending',
      startDate: '',
      endDate: '',
      createdBy: 1, // Replace with auth context user ID
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image: null, // File input is cleared; existing image is kept unless replaced
      url: ad.url,
      status: ad.status,
      startDate: formatDateForInput(ad.startDate),
      endDate: formatDateForInput(ad.endDate),
      createdBy: ad.createdBy,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAd(null);
    setError(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setMeta({ ...meta, page: newPage });
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Advertisement',
      render: (ad: Advertisement) => (
        <div className="flex items-center space-x-4">
          <img
            src={ad.image}
            alt={ad.title}
            className="w-16 h-16 rounded-lg object-cover shadow-sm"
          />
          <div>
            <p className="font-semibold text-gray-900">{ad.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (ad: Advertisement) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
            ad.status === 'active'
              ? 'bg-emerald-100 text-emerald-800'
              : ad.status === 'pending'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => toggleStatus(ad.id)}
        >
          {ad.status}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (ad: Advertisement) => (
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(ad.startDate).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            to {new Date(ad.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (ad: Advertisement) => (
        <div className="text-sm text-gray-600">
          {new Date(ad.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (ad: Advertisement) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(ad.url, '_blank')}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(ad)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(ad.id)}
            className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertisements</h1>
          <p className="text-gray-600 mt-1">Manage promotional content and campaigns</p>
        </div>
        <Button onClick={openCreateModal} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-5 h-5 mr-2" />
          Create Ad
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            />
            <input
              type="text"
              placeholder="Search advertisements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Advertisements Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table data={filteredAds} columns={columns} emptyMessage="No advertisements found" />
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {(meta.page - 1) * meta.limit + 1} to{' '}
          {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} advertisements
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => handlePageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-50"
          >
            Previous
          </Button>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 ${
                meta.page === page
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {page}
            </Button>
          ))}
          <Button
            onClick={() => handlePageChange(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAd ? 'Edit Advertisement' : 'Create Advertisement'}
        size="large"
        className="z-50"
      >
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeModal} />
          )}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 relative z-50 bg-white rounded-lg"
            encType="multipart/form-data"
          >
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Advertisement Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                  placeholder="Enter advertisement title"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Image File {editingAd ? '(Optional)' : '(Required)'}
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files?.[0] || null })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900"
                  required={!editingAd}
                />
                {editingAd && formData.image && (
                  <p className="text-sm text-gray-500 mt-1">New file selected: {formData.image.name}</p>
                )}
                {editingAd && !formData.image && (
                  <p className="text-sm text-gray-500 mt-1">Current image: {editingAd.image}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Target URL
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                placeholder="Enter target URL"
                required
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {editingAd ? 'Update' : 'Create'} Advertisement
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Advertisements;