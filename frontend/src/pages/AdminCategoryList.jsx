import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Pagination from '../components/common/Pagination';
import BrandedLoader from '../components/common/BrandedLoader';
import ConfirmationModal from '../components/common/ConfirmationModal';

const AdminCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/categories?page=${currentPage}&limit=10`);
      setCategories(data.categories);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    
    if (!newCategory.trim()) {
      setCreateError('Category name cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/admin/categories', { name: newCategory });
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setCategoryToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/categories/${categoryToDelete}`);
      setCategories(categories.filter(c => c._id !== categoryToDelete));
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  if (loading) return <BrandedLoader fullPage message="Fetching Categories..." />;

  return (
    <div className="admin-categories-page" data-testid="admin-categories-page">
      <div className="admin-card-header">
        <div>
          <h1>Categories</h1>
          <p>Manage your product classification system</p>
        </div>
      </div>

      <div className="admin-card admin-mt-4 admin-p-4">
        <form onSubmit={handleCreate} className="admin-form" style={{ maxWidth: '500px' }}>
          <div className="form-group">
            <label htmlFor="categoryName">Add New Category</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                id="categoryName"
                type="text"
                placeholder="Category Name (e.g. Gaming)"
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  if (createError) setCreateError('');
                }}
                data-testid="new-category-input"
                className={createError ? 'admin-input-error' : ''}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting}
                data-testid="add-category-btn"
                style={{ whiteSpace: 'nowrap' }}
              >
                {submitting ? 'Adding...' : 'Add Category'}
              </button>
            </div>
            {createError && <span className="admin-field-error">{createError}</span>}
          </div>
        </form>
      </div>

      <div className="admin-card admin-mt-4">
        <div className="admin-table-container">
          <table className="admin-table" data-testid="admin-categories-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} data-testid={`category-row-${cat._id}`}>
                  <td><strong>{cat.name}</strong></td>
                  <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-sm btn-error"
                        onClick={() => handleDeleteClick(cat._id)}
                        data-testid={`delete-category-${cat._id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? This may affect products categorized under it."
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
        confirmText="Delete Category"
      />
    </div>
  );
};

export default AdminCategoryList;
