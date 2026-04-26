# QuickKart — Premium MERN E-Commerce Application

A fully functional mini e-commerce web application built with MongoDB, Express, React, and Node.js. Designed with a premium dark-mode aesthetic and optimized for UI automation testing with stable `data-testid` locators.

## 🚀 Features

- **Storefront & Admin Portals**: High-fidelity, mobile-responsive e-commerce platform with a dedicated administrative dashboard.
- **Activity Logging System**: Comprehensive audit trail tracking critical business events (Logins, Orders, Inventory changes) with a premium explorer interface.
- **Branded Design System**: Modern dark-mode aesthetic featuring glassmorphism, dynamic animations, and a custom branded loading experience.
- **Authentication & RBAC**: JWT-based authentication with Role-Based Access Control restricting admin features from customers.
- **Product & Cart Control**: Dynamic catalog fetching, real-time cart synchronization, and contextual empty states.
- **Wishlist Management**: Save products for later with interactive heart icons.
- **In-App Notifications**: Real-time background polling for user events and administrative broadcast alerts.
- **Order Management**: Multi-step checkout, real-time status tracking, and global order management for administrators.
- **API Documentation**: Comprehensive, 25-endpoint interactive Swagger/OpenAPI 3.0 docs available at `/api-docs`.
- **Automation Ready**: Every interactive element is tagged with `data-testid` for Selenium/Playwright/Cypress.

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (connection string already configured in `.env`)

### 2. Global Setup
I have implemented a **Master Launch Script** using `concurrently` so you don't need to open multiple terminals.

```bash
# 1. Install dependencies for BOTH backend and frontend
npm run install-all

# 2. Start BOTH servers simultaneously
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Swagger Docs**: `http://localhost:5000/api-docs`

---

## 📂 Project Structure

```text
└── maaz-fast-quickkart/
    ├── README.md
    ├── package.json
    ├── Project_Structure.md
    ├── test-cases.md
    ├── test_suites.md
    ├── vercel.json
    ├── backend/
    │   ├── package.json
    │   ├── server.js
    │   ├── config/
    │   │   ├── cloudinary.js
    │   │   ├── db.js
    │   │   └── swagger.js
    │   ├── controllers/
    │   │   ├── adminController.js
    │   │   ├── authController.js
    │   │   ├── cartController.js
    │   │   ├── categoryController.js
    │   │   ├── notificationController.js
    │   │   ├── orderController.js
    │   │   ├── productController.js
    │   │   ├── supportController.js
    │   │   ├── userController.js
    │   │   └── wishlistController.js
    │   ├── middleware/
    │   │   ├── authMiddleware.js
    │   │   └── errorHandler.js
    │   ├── models/
    │   │   ├── ActivityLog.js
    │   │   ├── Cart.js
    │   │   ├── Category.js
    │   │   ├── Notification.js
    │   │   ├── Order.js
    │   │   ├── Product.js
    │   │   ├── Support.js
    │   │   ├── User.js
    │   │   └── Wishlist.js
    │   ├── routes/
    │   │   ├── adminRoutes.js
    │   │   ├── authRoutes.js
    │   │   ├── cartRoutes.js
    │   │   ├── notificationRoutes.js
    │   │   ├── orderRoutes.js
    │   │   ├── productRoutes.js
    │   │   ├── supportRoutes.js
    │   │   ├── userRoutes.js
    │   │   └── wishlistRoutes.js
    │   ├── scratch/
    │   │   ├── checkCategory.js
    │   │   └── showCategoryProducts.js
    │   ├── scripts/
    │   │   ├── migrateCategories.js
    │   │   ├── promoteAdmin.js
    │   │   └── seedProducts.js
    │   └── utils/
    │       ├── activityLogger.js
    │       ├── notificationService.js
    │       └── seedData.js
    └── frontend/
        ├── index.html
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── App.jsx
            ├── counter.ts
            ├── main.jsx
            ├── main.ts
            ├── style.css
            ├── api/
            │   └── axiosConfig.js
            ├── components/
            │   ├── AdminLayout.jsx
            │   ├── AdminRoute.jsx
            │   ├── AdminSidebar.jsx
            │   ├── Navbar.jsx
            │   ├── NotificationDropdown.jsx
            │   ├── ProtectedRoute.jsx
            │   └── common/
            │       ├── BrandedLoader.jsx
            │       ├── ConfirmationModal.jsx
            │       └── Pagination.jsx
            ├── context/
            │   ├── AuthContext.jsx
            │   ├── CartContext.jsx
            │   ├── NotificationContext.jsx
            │   ├── ThemeContext.jsx
            │   └── WishlistContext.jsx
            ├── hooks/
            │   └── useDebounce.js
            └── pages/
                ├── AdminActivityLogs.jsx
                ├── AdminCategoryList.jsx
                ├── AdminDashboard.jsx
                ├── AdminOrderList.jsx
                ├── AdminProductForm.jsx
                ├── AdminProductList.jsx
                ├── AdminSupport.jsx
                ├── AdminUserList.jsx
                ├── CartPage.jsx
                ├── CheckoutPage.jsx
                ├── ContactPage.jsx
                ├── ForgotPasswordPage.jsx
                ├── HomePage.jsx
                ├── LoginPage.jsx
                ├── NotFoundPage.jsx
                ├── NotificationsPage.jsx
                ├── OrderDetailsPage.jsx
                ├── OrdersPage.jsx
                ├── ProductDetailPage.jsx
                ├── ProfilePage.jsx
                ├── ResetPasswordPage.jsx
                ├── SignupPage.jsx
                └── WishlistPage.jsx
```

---

## 🧪 Automation Testing
Use the following locators for stable testing:
- **Login Email**: `[data-testid="email-input"]`
- **Login Password**: `[data-testid="password-input"]`
- **Activity Log Table**: `[data-testid="activity-log-table"]`
- **Activity Log Role Filter**: `[data-testid="activity-log-filter-role"]`
- **Activity Log User Info**: `[data-testid="activity-log-user"]`
- **Add to Cart**: `[data-testid="add-to-cart-button"]`
- **Place Order**: `[data-testid="place-order-button"]`

---

## 📝 Important Notes
- The MongoDB connection string used is for educational purposes.
- Passwords are encrypted using `bcryptjs`.
- Session tokens are stored in `localStorage`.
