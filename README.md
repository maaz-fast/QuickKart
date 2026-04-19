# QuickKart — Premium MERN E-Commerce Application

A fully functional mini e-commerce web application built with MongoDB, Express, React, and Node.js. Designed with a premium dark-mode aesthetic and optimized for UI automation testing with stable `data-testid` locators.

## 🚀 Features

- **Authentication**: JWT-based login, signup, and forgot/reset password flow.
- **Product Management**: Dynamic product listing with search, category filtering, and detailed views.
- **Cart System**: Real-time cart updates, quantity management, and subtotal calculations.
- **Checkout**: Multi-step checkout form with real-time validation and order simulation.
- **API Documentation**: Interactive Swagger/OpenAPI 3.0 docs at `/api-docs`.
- **Automation Ready**: Every interactive element is tagged with `data-testid` for Selenium/Playwright/Cypress.
- **Design**: Modern dark-mode aesthetic with glassmorphism, gradients, and micro-animations.

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (connection string already configured in `.env`)

### 2. Backend Setup
```bash
cd backend
npm install
npm dev
```
- Server runs at: `http://localhost:5000`
- Swagger Docs: `http://localhost:5000/api-docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- App runs at: `http://localhost:5173` (default Vite port)

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
- `src/context/`: Auth and Cart state management (Context API)
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
