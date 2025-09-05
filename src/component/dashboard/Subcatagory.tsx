import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, Calendar, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import Modal from './common/Modal';
import Table from './common/Table';
import Button from './common/Button';

interface Subcategory {
  id: number;
  name: string;
  categoryName: string;
  categoryId: number;
  createdAt: string;
  createdBy: number;
  tenderCount: number;
  status: 'active' | 'inactive';
}

interface Category {
  id: number;
  name: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const Subcategories: React.FC = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 5, totalPages: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    categoryId: 0,
    status: 'active' as 'active' | 'inactive',
    createdBy: 1, // Replace with useAuth().user.id
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/catagory/all?page=${meta.page}&limit=${meta.limit}', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        const { data } = await response.json();
        setCategories(data.map((cat: any) => ({ id: cat.id, name: cat.name })));
      } catch (error: any) {
        console.error('Error fetching categories:', error.message);
        setError(`Failed to load categories: ${error.message}`);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories with pagination
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/subcatagory/all?page=${meta.page}&limit=${meta.limit}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        const { data, meta: responseMeta } = await response.json();
        setSubcategories(data);
        setMeta(responseMeta);
      } catch (error: any) {
        console.error('Error fetching subcategories:', error.message);
        setError(`Failed to load subcategories: ${error.message}`);
      }
    };
    fetchSubcategories();
  }, [meta.page, meta.limit]);

  const filteredSubcategories = subcategories.filter((subcategory) => {
    const matchesSearch =
      subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subcategory.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || subcategory.categoryId.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const validateForm = () => {
    if (!formData.name.trim()) return 'Subcategory name is required';
    if (!formData.categoryId || formData.categoryId === 0) return 'Parent category is required';
    if (!['active', 'inactive'].includes(formData.status)) return 'Invalid status';
    if (!formData.createdBy || isNaN(formData.createdBy)) return 'Valid creator ID is required';
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
      const body = {
        name: formData.name,
        categoryId: formData.categoryId,
        status: formData.status,
        createdBy: formData.createdBy,
      };

      if (editingSubcategory) {
        const response = await fetch(`http://localhost:4000/api/subcatagory/${editingSubcategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error('Failed to update subcategory');
        const { data } = await response.json();
        setSubcategories(subcategories.map((sub) => (sub.id === editingSubcategory.id ? data : sub)));
      } else {
        const response = await fetch('http://localhost:4000/api/subcatagory/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error('Failed to create subcategory');
        const { data } = await response.json();
        setSubcategories([...subcategories, data]);
      }
      closeModal();
    } catch (error: any) {
      setError('Failed to save subcategory: ' + error.message);
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:4000/api/subcatagory/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete subcategory');
      setSubcategories(subcategories.filter((sub) => sub.id !== id));
    } catch (error: any) {
      setError('Failed to delete subcategory: ' + error.message);
      console.error('Delete error:', error);
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const subcategory = subcategories.find((sub) => sub.id === id);
      if (!subcategory) return;
      const newStatus = subcategory.status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`http://localhost:4000/api/subcatagory//${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const { data } = await response.json();
      setSubcategories(subcategories.map((sub) => (sub.id === id ? data : sub)));
    } catch (error: any) {
      setError('Failed to update status: ' + error.message);
      console.error('Toggle status error:', error);
    }
  };

  const openCreateModal = () => {
    setEditingSubcategory(null);
    setFormData({ name: '', categoryId: 0, status: 'active', createdBy: 1 }); // Replace createdBy with auth context
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      categoryId: subcategory.categoryId,
      status: subcategory.status,
      createdBy: subcategory.createdBy,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubcategory(null);
    setError(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setMeta({ ...meta, page: newPage });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Subcategory',
      render: (subcategory: Subcategory) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{subcategory.name}</p>
            <p className="text-sm text-gray-500">{subcategory.tenderCount} tenders</p>
          </div>
        </div>
      ),
    },
    {
      key: 'categoryName',
      header: 'Parent Category',
      render: (subcategory: Subcategory) => (
        <div className="flex items-center space-x-2">
          <LinkIcon className="w-4 h-4 text-indigo-600" />
          <span className="text-indigo-600 font-medium">{subcategory.categoryName}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (subcategory: Subcategory) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
            subcategory.status === 'active'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => toggleStatus(subcategory.id)}
        >
          {subcategory.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (subcategory: Subcategory) => (
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{new Date(subcategory.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (subcategory: Subcategory) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(subcategory)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(subcategory.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">Subcategories</h1>
          <p className="text-gray-600 mt-1">Manage subcategories within parent categories</p>
        </div>
        <Button onClick={openCreateModal} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Subcategory
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
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>
      )}

      {/* Subcategories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          data={filteredSubcategories}
          columns={columns}
          emptyMessage="No subcategories found"
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {(meta.page - 1) * meta.limit + 1} to{' '}
          {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} subcategories
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
                  ? 'bg-emerald-600 text-white'
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
        title={editingSubcategory ? 'Edit Subcategory' : 'Create Subcategory'}
        size="large"
        className="z-50"
      >
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeModal} />
          )}
          <form onSubmit={handleSubmit} className="space-y-6 p-6 relative z-50 bg-white rounded-lg">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>
            )}
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Parent Category
              </label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                required
              >
                <option value={0}>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Subcategory Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                placeholder="Enter subcategory name"
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
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {editingSubcategory ? 'Update' : 'Create'} Subcategory
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Subcategories;