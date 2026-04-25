import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import Pagination from '../components/common/Pagination';
import BrandedLoader from '../components/common/BrandedLoader';
import ConfirmationModal from '../components/common/ConfirmationModal';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products?page=${currentPage}&limit=10`);
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setTotalProducts(data.totalCount);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/products/${productToDelete}`);
      setProducts(products.filter(p => p._id !== productToDelete));
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  if (loading) return <BrandedLoader fullPage message="Listing Catalog Items..." />;

  return (
    <div className="admin-products-page" data-testid="admin-products-page">
      <div className="admin-card-header">
        <div>
          <h1>Products</h1>
          <p>Manage your store catalog ({totalProducts} items)</p>
        </div>
        <Link to="/admin/products/add" className="btn btn-primary" data-testid="add-product-button">
          + Add Product
        </Link>
      </div>

      <div className="admin-card admin-mt-4">
        <div className="admin-table-container">
          <table className="admin-table" data-testid="admin-products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} data-testid={`admin-product-row-${product._id}`}>
                  <td>
                    <img src={product.image} alt={product.name} className="product-img-mini" />
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.category?.name || 'Uncategorized'}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span className={product.stock < 10 ? 'text-error' : ''}>
                      {product.stock} units
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-sm btn-outline" 
                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                        data-testid={`edit-product-${product._id}`}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-error" 
                        onClick={() => handleDeleteClick(product._id)}
                        data-testid={`delete-product-${product._id}`}
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
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
        confirmText="Delete Product"
      />
    </div>
  );
};

export default AdminProductList;
