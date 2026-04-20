# QuickKart — Premium MERN E-Commerce Application

A fully functional mini e-commerce web application built with MongoDB, Express, React, and Node.js. Designed with a premium dark-mode aesthetic and optimized for UI automation testing with stable `data-testid` locators.

## 🚀 Features

- **Storefront & Admin Portals**: High-fidelity, mobile-responsive e-commerce platform with a dedicated administrative dashboard.
- **Branded Design System**: Modern dark-mode aesthetic featuring glassmorphism, dynamic animations, and a custom branded loading experience.
- **Authentication & RBAC**: JWT-based authentication with Role-Based Access Control restricting admin features from customers.
- **Product & Cart Control**: Dynamic catalog fetching, real-time cart synchronization, and contextual empty states.
- **Wishlist Management**: Save products for later with interactive heart icons.
- **In-App Notifications**: Real-time background polling for user events and administrative broadcast alerts.
- **Order Management**: Multi-step checkout, real-time status tracking, and global order management for administrators.
- **API Documentation**: Comprehensive, 24-endpoint interactive Swagger/OpenAPI 3.0 docs available at `/api-docs`.
- **Automation Ready**: Every interactive element is tagged with `data-testid` for Selenium/Playwright/Cypress.

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (connection string already configured in `.env`)

### 2. Global Setup (New!)
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

### Backend (`/backend`)
- `models/`: Mongoose schemas (User, Product, Cart)
- `controllers/`: Request handling logic
- `routes/`: API endpoint definitions with Swagger annotations
- `middleware/`: JWT authentication & Error handling
- `utils/`: Database seeding utility

### Frontend (`/frontend`)
- `src/api/`: Axios configuration with interceptors
- `src/context/`: Auth, Cart, Wishlist, and Notification state management (Context API)
- `src/pages/`: All UI pages (Login, Home, Cart, etc.)
- `src/components/`: Reusable components (Navbar, ProtectedRoute)
- `src/index.css`: Global design system and animations

---

## 🧪 Automation Testing
Use the following locators for stable testing:
- **Login Email**: `[data-testid="email-input"]`
- **Login Password**: `[data-testid="password-input"]`
- **Login Button**: `[data-testid="login-button"]`
- **Add to Cart**: `[data-testid="add-to-cart-button"]`
- **Cart Icon**: `[data-testid="cart-icon"]`
- **Place Order**: `[data-testid="place-order-button"]`

---

## 📝 Important Notes
- The MongoDB connection string used is for educational purposes.
- Passwords are encrypted using `bcryptjs`.
- Session tokens are stored in `localStorage`.
