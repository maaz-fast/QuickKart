# QuickKart - Project File Structure (Phase-Wise Timeline)

Detailed breakdown of the QuickKart monolithic codebase structure, organized by the implementation phases to show the evolution of the application.

## 📦 Root Workspace (`/`)
- `package.json` — Master configuration and root scripts (e.g., `npm run dev`)
- `README.md` — Platform documentation and setup guide
- `Project_Structure.md` — This file
- `.gitignore` — Global git exclusions

---

## 🚀 Phase 1: Core Setup, Auth, & Product Catalog
*The foundational phase establishing the MERN stack, user authentication, and storefront catalog.*

### Frontend Client
- `src/main.jsx` & `src/App.jsx` — React root and application router wrapper
- `src/index.css` — Global CSS, design tokens, and branded aesthetics
- `src/api/axiosConfig.js` — Base API configuration for network requests
- `src/context/AuthContext.jsx` — Stores active user profile, JWT, and roles
- `src/components/Navbar.jsx` — Top navigation with auth states
- `src/components/ProtectedRoute.jsx` — Route guard for authenticated paths
- `src/pages/HomePage.jsx` — Catalog browser
- `src/pages/ProductDetailPage.jsx` — Single item viewing
- `src/pages/LoginPage.jsx` & `src/pages/SignupPage.jsx` — User onboarding

### Backend Server
- `server.js` — Express application instantiation
- `config/db.js` — MongoDB Atlas connection logic
- `config/swagger.js` — OpenAPI 3.0 specification generator
- `middleware/authMiddleware.js` — JWT verification and Admin role validation
- `middleware/errorHandler.js` — Standardized JSON error response formatting
- `models/User.js`, `models/Product.js`, `models/Category.js` — Core Mongoose schemas
- `controllers/authController.js`, `controllers/productController.js`, `controllers/categoryController.js` — Core endpoints
- `routes/authRoutes.js`, `routes/productRoutes.js`, `routes/categoryRoutes.js` — Route definitions
- `utils/seedData.js` — Database population utility

---

## 🛒 Phase 2: Cart & Checkout Features
*Implementing persistent cart management linked to user accounts.*

### Frontend Client
- `src/context/CartContext.jsx` — Manages cart array, subtotals, and persistence
- `src/pages/CartPage.jsx` — Item subtotals and modification
- `src/pages/CheckoutPage.jsx` — Order placement workflow

### Backend Server
- `models/Cart.js` — Persistent cart contents linked to User IDs
- `controllers/cartController.js` — Cart state management
- `routes/cartRoutes.js` — Cart endpoints

---

## 👔 Phase 3: Admin Portal & Order Management
*Adding global transaction tracking and restricted administrative dashboards.*

### Frontend Client
- `src/components/AdminLayout.jsx` & `src/components/AdminSidebar.jsx` — Admin frame and navigation drawer
- `src/components/AdminRoute.jsx` — Strict route guard for `/admin` paths
- `src/components/common/Pagination.jsx` — Reusable pagination controls
- `src/pages/AdminDashboard.jsx` — Statistical overview and metric charts
- `src/pages/AdminProductList.jsx`, `src/pages/AdminCategoryList.jsx`, `src/pages/AdminUserList.jsx` — Entity management grids
- `src/pages/AdminOrderList.jsx` — Global fulfillment queue
- `src/pages/OrdersPage.jsx` — Customer order history list
- `src/pages/OrderDetailsPage.jsx` — Specific executed order receipt

### Backend Server
- `models/Order.js` — Archived transaction receipts and fulfillment statuses
- `controllers/orderController.js` — Order processing and user retrieval
- `controllers/adminController.js` — Elevated actions (dashboard metrics, global edits)
- `routes/orderRoutes.js` & `routes/adminRoutes.js` — Restricted route definitions
- `utils/promoteAdmin.js` — CLI tool to manually elevate user privileges

---

## ✨ Phase 4: UX & Profile Enhancements
*Polishing the application with wishlists, custom loaders, and profile management.*

### Frontend Client
- `src/context/WishlistContext.jsx` — Manages favorited items
- `src/pages/WishlistPage.jsx` — Wishlist viewing and management
- `src/pages/ProfilePage.jsx` — User details and password editing
- `src/pages/ForgotPasswordPage.jsx` & `src/pages/ResetPasswordPage.jsx` — Password recovery flow
- `src/pages/NotFoundPage.jsx` — 404 catch-all route
- `src/components/common/BrandedLoader.jsx` — Custom platform loading animations

### Backend Server
- `models/Wishlist.js` — Wishlist schema linked to users and products
- `controllers/wishlistController.js` & `routes/wishlistRoutes.js` — Wishlist endpoints

---

## 🔔 Phase 5: In-App Notification System
*Providing real-time system alerts and broadcast notifications for both users and admins.*

### Frontend Client
- `src/context/NotificationContext.jsx` — Global unread counts with 15-second silent background polling
- `src/components/NotificationDropdown.jsx` — Interactive bell dropdown with unread dot indicators
- `src/pages/NotificationsPage.jsx` — Dedicated view-all page for notification history

### Backend Server
- `models/Notification.js` — Stores user-specific system alerts with read status
- `utils/notificationService.js` — Reusable service to trigger targeted alerts or broadcast to admins
- `controllers/notificationController.js` — Notification retrieval and mark-as-read logic
- `routes/notificationRoutes.js` — Endpoints for the notification system