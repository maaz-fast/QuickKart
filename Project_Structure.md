# QuickKart - Project File Structure

Detailed breakdown of the QuickKart monolithic codebase structure separating frontend UI components from backend API services.

## 📦 Root Workspace (`/`)
- `package.json` — Master configuration and root scripts (e.g., `npm run dev`)
- `README.md` — Platform documentation and setup guide
- `Project_Structure.md` — This file
- `.gitignore` — Global git exclusions

---

## 🖥️ Frontend Client (`/frontend`)
The React SPA built with Vite.

### Core Configuration
- `package.json` — Frontend dependencies and build scripts
- `vite.config.js` — Vite bundler configuration
- `eslint.config.js` — JavaScript linting rules
- `index.html` — Base HTML template

### Source Code (`/frontend/src`)
- `main.jsx` — React root rendering entry point
- `App.jsx` — Application router and global context provider wrapper
- `index.css` — Global CSS, design tokens, and branded animations

#### `/components` - Modular UI Building Blocks
- **`/common`**
  - `Pagination.jsx` — Reusable pagination controls
  - `BrandedLoader.jsx` — Custom platform loading animations
- `Navbar.jsx` — Top navigation with mobile hamburger and auth states
- `ProtectedRoute.jsx` — Higher-order component preventing unauthorized access
- `AdminRoute.jsx` — Strict route guard for `/admin` paths
- `AdminLayout.jsx` — Admin-specific frame wrapping dashboard content
- `AdminSidebar.jsx` — Slide-out navigation drawer for admin pages

#### `/pages` - Routed Views
**Storefront (Customer)**
- `HomePage.jsx` — Catalog browser with keyword search
- `ProductDetailPage.jsx` — Single item viewing and cart addition
- `CartPage.jsx` — Item subtotals and checkout initiation
- `CheckoutPage.jsx` — Order placement and validation
- `OrdersPage.jsx` — Customer order history list
- `OrderDetailsPage.jsx` — Specific executed order receipt

**Admin Portal (Restricted)**
- `AdminDashboard.jsx` — Statistical overview and metric charts
- `AdminProductList.jsx` — Product catalog management grid
- `AdminCategoryList.jsx` — Dynamic category management
- `AdminOrderList.jsx` — Global fulfillment queue
- `AdminUserList.jsx` — Customer directory management

**Authentication**
- `LoginPage.jsx` — User login gateway
- `SignupPage.jsx` — New user registration
- `ForgotPasswordPage.jsx` — Credential recovery workflow
- `ResetPasswordPage.jsx` — Secure password resetting

#### `/context` - Global State Management
- `AuthContext.jsx` — Stores active user profile, JWT validity, and RBAC roles
- `CartContext.jsx` — Manages cart array, subtotals, and persistence

#### `/api` - Network Layer
- `axiosConfig.js` — Base API configuration injecting Bearer tokens into requests

---

## ⚙️ Backend Server (`/backend`)
The Node.js/Express REST API serving the storefront.

### Core Configuration
- `package.json` — Server dependencies and startup scripts
- `server.js` — Express application instantiation, middleware stacking, and port binding
- `.env` — Secure cryptographic keys and database URIs

### Application Logic

#### `/config` - System Configurations
- `db.js` — MongoDB Atlas connection logic
- `swagger.js` — OpenAPI 3.0 specification generator

#### `/controllers` - Request Handlers
- `authController.js` — JWT generation, signup, login, and recovery logic
- `productController.js` — Catalog fetching and detail retrieval
- `categoryController.js` — Category taxonomy management
- `cartController.js` — User cart state persistence
- `orderController.js` — Order processing and user retrieval
- `adminController.js` — Elevated actions (e.g., dashboard metrics, global order edits)

#### `/routes` - Endpoint Routing Maps
- `authRoutes.js` — Mounts `/api/auth` endpoints
- `productRoutes.js` — Mounts `/api/products` endpoints
- `cartRoutes.js` — Mounts `/api/cart` endpoints
- `orderRoutes.js` — Mounts `/api/orders` endpoints
- `adminRoutes.js` — Mounts `/api/admin` endpoints

#### `/models` - MongoDB Schemas
- `User.js` — User accounts, role definitions, and password hashing hooks
- `Product.js` — Product definitions, inventory count, and pricing
- `Category.js` — Taxonomy definitions
- `Cart.js` — Persistent cart contents linked to User IDs
- `Order.js` — Archived transaction receipts and fulfillment statuses

#### `/middleware` - Request Interceptors
- `authMiddleware.js` — Verifies JWTs and validates Admin role flags before execution
- `errorHandler.js` — Standardized JSON error response formatting

#### `/utils` & `/scripts` - Utilities
- `seedData.js` — Automated database population for testing
- `promoteAdmin.js` — CLI tool to manually elevate user privileges
- `migrateCategories.js` — Schema migration tooling