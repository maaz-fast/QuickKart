import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import Pagination from '../components/common/Pagination';
import BrandedLoader from '../components/common/BrandedLoader';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ActionMenu, { PencilIcon, TrashIcon } from '../components/common/ActionMenu';
import { toast } from 'react-toastify';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const fileInputRef = useRef(null);

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

  // CSV Export Handler
  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/products/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'quickkart_products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Products exported to CSV');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  // CSV Import Handler
  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    setImportSummary(null);

    try {
      const { data } = await api.post('/admin/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setImportSummary(data.summary);
        toast.success(`Import complete: ${data.summary.createdCount} created, ${data.summary.updatedCount} updated`);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const csvHeader = "name,description,price,category,stock,image\n";
    const sampleRows = [
      '"Wireless Noise-Canceling Headphones","Premium over-ear Bluetooth headphones with active noise cancellation.",15999.00,"Electronics",45,"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"',
      '"Organic Cotton Hoodie","Soft heavyweight fleece hoodie made from 100% organic cotton.",4500.00,"Fashion",80,"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500"'
    ].join('\n');
    
    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('CSV Template downloaded!');
  };

  if (loading) return <BrandedLoader fullPage message="Listing Catalog Items..." />;

  return (
    <div className="admin-products-page" data-testid="admin-products-page">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Products</h1>
          <p>Manage your store catalog ({totalProducts} items)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportCSV}
            data-testid="admin-export-csv-button"
          >
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowImportModal(true)}
            data-testid="admin-import-csv-button"
          >
            Import CSV
          </button>
          <Link to="/admin/products/add" className="btn btn-primary" data-testid="add-product-button">
            + Add Product
          </Link>
        </div>
      </div>

      <div className="admin-card admin-mt-4">
        <div className="admin-table-container">
          <table className="admin-table" data-testid="admin-products-table">
            <thead>
              <tr>
                <th data-testid="column-image">Image</th>
                <th data-testid="column-name">Name</th>
                <th data-testid="column-category">Category</th>
                <th data-testid="column-price">Price</th>
                <th data-testid="column-stock">Stock</th>
                <th style={{ textAlign: 'right' }} data-testid="column-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} data-testid={`admin-product-row-${product._id}`}>
                  <td data-testid="product-image-cell">
                    <img src={product.image} alt={product.name} className="product-img-mini" />
                  </td>
                  <td data-testid="product-name">
                    <strong>{product.name}</strong>
                  </td>
                  <td data-testid="product-category">{product.category?.name || 'Uncategorized'}</td>
                  <td data-testid="product-price">Rs. {product.price.toFixed(2)}</td>
                  <td data-testid="product-stock">
                    <span className={product.stock < 10 ? 'text-error' : ''}>
                      {product.stock} units
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <ActionMenu
                      items={[
                        {
                          label: 'Edit',
                          icon: <PencilIcon />,
                          onClick: () => navigate(`/admin/products/edit/${product._id}`),
                          testId: `edit-product-${product._id}`
                        },
                        {
                          label: 'Delete',
                          icon: <TrashIcon />,
                          isDelete: true,
                          onClick: () => handleDeleteClick(product._id),
                          testId: `delete-product-${product._id}`
                        }
                      ]}
                      testId={`product-actions-${product._id}`}
                    />
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

      {/* CSV Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: '550px',
            padding: '24px',
          }}>
            <h3 style={{ marginTop: 0 }}>Bulk Import Products via CSV</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                Upload a CSV file containing columns: <code>name</code>, <code>description</code>, <code>price</code>, <code>category</code>, <code>stock</code>, <code>image</code>.
              </p>
              <button 
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleDownloadTemplate}
                data-testid="download-csv-template-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Template
              </button>
            </div>

            <div style={{ margin: '20px 0' }}>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleImportCSV}
                data-testid="admin-import-file-input"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--bg-input)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                }}
              />
              {importing && <p style={{ color: 'var(--accent)', marginTop: '8px' }}>Processing CSV file...</p>}
            </div>

            {importSummary && (
              <div
                className="import-results-summary"
                data-testid="admin-import-results-summary"
                style={{
                  background: 'var(--bg-input)',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', color: '#10b981' }}>Import Results Summary</h4>
                <p style={{ margin: '0 0 4px 0' }}><strong>Created:</strong> {importSummary.createdCount}</p>
                <p style={{ margin: '0 0 4px 0' }}><strong>Updated:</strong> {importSummary.updatedCount}</p>
                <p style={{ margin: '0 0 8px 0', color: importSummary.failedCount > 0 ? 'var(--error)' : 'inherit' }}>
                  <strong>Failed:</strong> {importSummary.failedCount}
                </p>

                {importSummary.failedRows?.length > 0 && (
                  <div style={{ marginTop: '10px', maxHeight: '120px', overflowY: 'auto' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: 'var(--error)' }}>Failure Details:</p>
                    {importSummary.failedRows.map((f, i) => (
                      <p key={i} style={{ margin: '2px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Row {f.row} ({f.name}): {f.reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn btn-outline"
                onClick={() => { setShowImportModal(false); setImportSummary(null); }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
