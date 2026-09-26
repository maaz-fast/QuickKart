import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import NotificationsPage from './pages/NotificationsPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminProductList from './pages/AdminProductList';
import AdminProductForm from './pages/AdminProductForm';
import AdminCategoryList from './pages/AdminCategoryList';
import AdminOrderList from './pages/AdminOrderList';
import AdminUserList from './pages/AdminUserList';
import AdminSupport from './pages/AdminSupport';
import AdminActivityLogs from './pages/AdminActivityLogs';
import AdminSwaggerSettings from './pages/AdminSwaggerSettings';

// Observer to set global ready flag for automation
const GlobalReadyObserver = ({ children }) => {
  const { loading: authLoading } = useAuth();
  const { loading: cartLoading } = useCart();

  useEffect(() => {
    const isReady = !authLoading && !cartLoading;
    document.body.setAttribute('data-app-ready', isReady.toString());
  }, [authLoading, cartLoading]);

  return children;
};

// Auth-aware root: anonymous visitors see the public Landing Page,
// authenticated users land directly on the product catalog.
const RootSwitch = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return isAuthenticated ? <HomePage /> : <LandingPage />;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <NotificationProvider>
                <GlobalReadyObserver>
                  <div className="app-wrapper">
                    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
                    <Navbar />
                    <main className="main-content">
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/contact" element={<ContactPage />} />

                        {/* Root: public landing for visitors, catalog for authenticated users */}
                        <Route
                          path="/"
                          element={
                            <RootSwitch />
                          }
                        />
                        <Route
                          path="/products/:id"
                          element={
                            <ProtectedRoute>
                              <ProductDetailPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/cart"
                          element={
                            <ProtectedRoute>
                              <CartPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute>
                              <CheckoutPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute>
                              <OrdersPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/orders/:id"
                          element={
                            <ProtectedRoute>
                              <OrderDetailsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/wishlist"
                          element={
                            <ProtectedRoute>
                              <WishlistPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/notifications"
                          element={
                            <ProtectedRoute>
                              <NotificationsPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Admin Routes */}
                        <Route element={<AdminRoute />}>
                          <Route element={<AdminLayout />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/products" element={<AdminProductList />} />
                            <Route path="/admin/products/add" element={<AdminProductForm />} />
                            <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
                            <Route path="/admin/categories" element={<AdminCategoryList />} />
                            <Route path="/admin/orders" element={<AdminOrderList />} />
                            <Route path="/admin/users" element={<AdminUserList />} />
                            <Route path="/admin/support" element={<AdminSupport />} />
                            <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
                            <Route path="/admin/swagger-settings" element={<AdminSwaggerSettings />} />
                          </Route>
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </main>
                  </div>
                </GlobalReadyObserver>
              </NotificationProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
