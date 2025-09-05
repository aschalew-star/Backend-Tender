import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, Calendar, Edit2, Trash2 } from 'lucide-react';
import Modal from './common/Modal';
import Table from './common/Table';
import Button from './common/Button';

interface Category {
  id: number;
  name: string;
  createdAt: string;
  createdBy: number;
  status: 'active' | 'inactive';
  subcategoryCount: number;
  tenderCount: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 5, totalPages: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    status: 'active' as 'active' | 'inactive',
    createdBy: 1, // Replace with auth context user ID
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch categories with pagination
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/catagory/all?page=${meta.page}&limit=${meta.limit}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        console.log(response)
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        const { data, meta: responseMeta } = await response.json();
        setCategories(data);
        setMeta(responseMeta);
      } catch (error: any) {
        console.error('Error fetching categories:', error.message);
        setError(`Failed to load categories: ${error.message}`);
      }
    };
    fetchCategories();
  }, [meta.page, meta.limit]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    if (!formData.name.trim()) return 'Category name is required';
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
        status: formData.status,
        createdBy: formData.createdBy,
      };

      if (editingCategory) {
        const response = await fetch(`http://localhost:4000/api/catagory/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error('Failed to update category');
        const { data } = await response.json();
        setCategories(categories.map((cat) => (cat.id === editingCategory.id ? data : cat)));
      } else {
        const response = await fetch('http://localhost:4000/api/catagory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error('Failed to create category');
        const { data } = await response.json();
        setCategories([...categories, data]);
      }
      closeModal();
    } catch (error: any) {
      setError('Failed to save category: ' + error.message);
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:4000/api/catagory/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (error: any) {
      setError('Failed to delete category: ' + error.message);
      console.error('Delete error:', error);
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const category = categories.find((cat) => cat.id === id);
      if (!category) return;
      const newStatus = category.status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const { data } = await response.json();
      setCategories(categories.map((cat) => (cat.id === id ? data : cat)));
    } catch (error: any) {
      setError('Failed to update status: ' + error.message);
      console.error('Toggle status error:', error);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', status: 'active', createdBy: 1 }); // Replace createdBy with auth context
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, status: category.status, createdBy: category.createdBy });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
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
      header: 'Category Name',
      render: (category: Category) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{category.name}</p>
            <p className="text-sm text-gray-500">{category.subcategoryCount} subcategories</p>
          </div>
        </div>
      ),
    },
    {
      key: 'tenderCount',
      header: 'Tenders',
      render: (category: Category) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {category.tenderCount}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (category: Category) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
            category.status === 'active'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => toggleStatus(category.id)}
        >
          {category.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (category: Category) => (
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{new Date(category.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (category: Category) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(category)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(category.id)}
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
oying styles).
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage tender categories and their subcategories</p>
        </div>
        <Button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Category
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
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          data={filteredCategories}
          columns={columns}
          emptyMessage="No categories found"
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {(meta.page - 1) * meta.limit + 1} to{' '}
          {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} categories
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
                  ? 'bg-indigo-600 text-white'
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
        title={editingCategory ? 'Edit Category' : 'Create Category'}
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
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                placeholder="Enter category name"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;