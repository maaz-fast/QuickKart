import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import BrandedLoader from '../components/common/BrandedLoader';

const AdminProductForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    stock: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Categories for dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/admin/categories');
        setCategories(data.categories);
      } catch (err) {
        console.error('Failed to fetch categories');
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCats();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Enter a valid price greater than 0';
    if (!formData.description.trim()) newErrors.description = 'Enter product description';
    if (!formData.category.trim()) newErrors.category = 'Enter product category';
    if (!formData.image.trim()) newErrors.image = 'Provide a product image URL';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Stock cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          const p = data.product;
          setFormData({
            name: p.name,
            price: p.price,
            description: p.description,
            category: p.category?._id || '', // Store ID
            image: p.image,
            stock: p.stock
          });
        } catch (err) {
          setApiError('Failed to fetch product details');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleSelectCategory = (categoryId) => {
    setFormData({ ...formData, category: categoryId });
    setShowDropdown(false);
    if (errors.category) setErrors({ ...errors, category: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setApiError('');

    try {
      if (isEditMode) {
        await api.put(`/admin/products/${id}`, formData);
      } else {
        await api.post('/admin/products', formData);
      }
      navigate('/admin/products');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <BrandedLoader fullPage message={isEditMode ? "Loading Product Details..." : "Preparing Form..."} />;

  return (
    <div className="admin-product-form-page" data-testid="admin-product-form-page">
      <div className="admin-mb-4">
        <Link to="/admin/products" className="back-link">← Back to Products</Link>
      </div>

      <div className="page-header">
        <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
        <p>{isEditMode ? `Updating ${formData.name}` : 'Create a new item in your catalog'}</p>
      </div>

      <div className="admin-card admin-mt-4 admin-form-container">
        <form onSubmit={handleSubmit} className="admin-p-4 admin-form" noValidate>
          {apiError && <div className="error-message admin-mb-4">{apiError}</div>}

          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. Wireless Headphones"
              data-testid="product-name-input"
              className={errors.name ? 'admin-input-error' : ''}
            />
            {errors.name && <span className="admin-field-error">{errors.name}</span>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input 
                id="price" 
                name="price" 
                type="number" 
                step="0.01" 
                value={formData.price} 
                onChange={(e) => {
                  setFormData({...formData, price: e.target.value});
                  if (errors.price) setErrors({...errors, price: ''});
                }} 
                placeholder="99.99"
                data-testid="product-price-input"
                className={errors.price ? 'admin-input-error' : ''}
              />
              {errors.price && <span className="admin-field-error">{errors.price}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="stock">Stock Quantity</label>
              <input 
                id="stock" 
                name="stock" 
                type="number" 
                value={formData.stock} 
                onChange={(e) => {
                  setFormData({...formData, stock: e.target.value});
                  if (errors.stock) setErrors({...errors, stock: ''});
                }} 
                placeholder="50"
                data-testid="product-stock-input"
                className={errors.stock ? 'admin-input-error' : ''}
              />
              {errors.stock && <span className="admin-field-error">{errors.stock}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="custom-select-wrapper" ref={dropdownRef}>
              <div 
                className={`custom-select-header ${showDropdown ? 'open' : ''} ${errors.category ? 'admin-input-error' : ''}`}
                onClick={() => !fetchingCategories && setShowDropdown(!showDropdown)}
                data-testid="category-dropdown-header"
              >
                <span>
                  {fetchingCategories 
                    ? 'Loading...' 
                    : categories.find(c => c._id === formData.category)?.name || 'Select a Category'}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>

              {showDropdown && (
                <div className="custom-select-options">
                  <div 
                    className={`custom-select-option ${!formData.category ? 'selected' : ''}`}
                    onClick={() => handleSelectCategory('')}
                  >
                    Select a Category
                  </div>
                  {categories.map((cat) => (
                    <div 
                      key={cat._id}
                      className={`custom-select-option ${formData.category === cat._id ? 'selected' : ''}`}
                      onClick={() => handleSelectCategory(cat._id)}
                      data-testid={`category-option-${cat._id}`}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.category && <span className="admin-field-error">{errors.category}</span>}
            {categories.length === 0 && !fetchingCategories && (
              <p style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '4px' }}>
                No categories found. Please <Link to="/admin/categories" style={{ textDecoration: 'underline' }}>create one</Link> first.
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="image">Image URL</label>
            <input 
              id="image" 
              name="image" 
              type="url" 
              value={formData.image} 
              onChange={handleChange} 
              placeholder="https://images.unsplash.com/..."
              data-testid="product-image-input"
              className={errors.image ? 'admin-input-error' : ''}
            />
            {errors.image && <span className="admin-field-error">{errors.image}</span>}
            {formData.image && (
              <div className="admin-mt-4">
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Preview:</p>
                <img src={formData.image} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover', marginTop: '4px' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea 
              id="description" 
              name="description" 
              rows="4" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Enter product details..."
              data-testid="product-description-input"
              className={errors.description ? 'admin-input-error' : ''}
            ></textarea>
            {errors.description && <span className="admin-field-error">{errors.description}</span>}
          </div>

          <div className="mt-4">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              data-testid="submit-product-button"
              style={{ padding: '12px 32px' }}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
