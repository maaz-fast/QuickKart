========================
Phase 1
========================

You are a senior full-stack MERN developer. Generate a complete, production-ready mini e-commerce web application (QuickKart) using MongoDB, Express.js, React.js, and Node.js.

The application must be fully functional end-to-end with authentication, cart system, Swagger API documentation, and automation-ready frontend.

========================

1. OUTPUT REQUIREMENTS
========================

* Provide the COMPLETE project code
* Show a clear folder structure first
* Then provide code FILE-BY-FILE (with file paths as headings)
* Do NOT skip any file
* Ensure imports/exports are correct
* Code must run without errors
* Follow best practices and clean architecture

========================
2. FRONTEND (React)
===================

* Use React with functional components and hooks
* Use React Router for navigation
* Use Axios for API calls
* Use Context API for state management (Auth + Cart)

Pages:

* Signup Page
* Login Page
* Forgot Password Page
* Reset Password Page
* Home Page (product listing)
* Product Details Page
* Cart Page
* Checkout Page

Features:

* JWT authentication (store token in localStorage)
* Protected routes (Home, Cart, Checkout only accessible when logged in)
* Product listing with image, name, price, description
* Add to cart / remove from cart
* Cart total calculation
* Logout functionality
* Forgot Password flow (basic, no email service)

========================
3. BACKEND (Node.js + Express)
==============================

* Use MVC architecture (models, controllers, routes)
* Use Express.js
* Use MongoDB with Mongoose
* Use dotenv for environment variables
* Enable CORS

Auth APIs:

* POST /api/auth/signup
* POST /api/auth/login
* POST /api/auth/forgot-password
* POST /api/auth/reset-password

Product APIs:

* GET /api/products
* GET /api/products/:id

Cart APIs (Protected):

* POST /api/cart
* GET /api/cart
* DELETE /api/cart/:id

========================
4. DATABASE (MongoDB)
=====================

User Schema:

* name (string)
* email (string, unique)
* password (hashed)

Product Schema:

* name (string)
* price (number)
* description (string)
* image (string URL)

Cart Schema:

* userId (reference to User)
* productId (reference to Product)
* quantity (number)

========================
5. AUTHENTICATION
=================

* Use bcrypt to hash passwords
* Use JWT for authentication
* Create authentication middleware
* Protect cart routes using middleware
* Return JWT token on login

========================
6. FORGOT PASSWORD (BASIC - NO EMAIL SERVICE)
=============================================

Implement a simple forgot password flow for learning purposes only.

Flow:

* User enters email on Forgot Password page
* Backend checks if email exists
* If email exists → allow password reset
* Redirect user to Reset Password page
* User enters new password and confirm password
* Password is hashed using bcrypt and updated in database

Frontend Pages:

* Forgot Password Page (email input)
* Reset Password Page (new password + confirm password)

Backend APIs:

* POST /api/auth/forgot-password → check email existence
* POST /api/auth/reset-password → update password

Validation:

* Show error if email does not exist
* Ensure password and confirm password match

IMPORTANT:

* NO email service
* NO tokens
* Keep it simple and educational

========================
7. AUTOMATION-FRIENDLY LOCATORS (VERY IMPORTANT)
================================================

This project will be used for UI automation testing (Selenium / Cypress / Playwright).

Rules:

* Every interactive element MUST have a data-testid attribute
* Do NOT rely only on class names or CSS selectors
* Keep locators stable and meaningful

Naming Convention:
feature-action-element

Examples:

* Login button → data-testid="login-button"
* Email input → data-testid="email-input"
* Password input → data-testid="password-input"
* Signup button → data-testid="signup-button"
* Add to cart button → data-testid="add-to-cart-button"
* Cart icon → data-testid="cart-icon"
* Checkout button → data-testid="checkout-button"

Guidelines:

* Apply data-testid to ALL inputs, buttons, links, and clickable elements
* Do not change these dynamically
* Ensure the app is fully automation-test ready
* UI must support reliable end-to-end testing

========================
8. SWAGGER API DOCUMENTATION (IMPORTANT)
========================================

Integrate Swagger for backend API documentation using:

Swagger UI (interactive API documentation tool)

Requirements:

* Use swagger-ui-express and swagger-jsdoc
* Create Swagger configuration file in backend
* Add Swagger annotations to ALL APIs (Auth, Products, Cart)
* Include request bodies, responses, and status codes
* Group APIs into sections (Auth, Products, Cart)

Swagger Setup:

* Serve Swagger UI at: /api-docs
* Example: http://localhost:5000/api-docs

Features:

* Interactive API testing ("Try it out")
* JWT authorization support in Swagger
* Clean, professional API documentation for developers and testers

========================
9. BEST PRACTICES
=================

* Centralized error handling middleware
* Input validation for all APIs
* Clean folder structure (MVC)
* Use async/await everywhere
* Proper HTTP status codes
* No hardcoded secrets
* Secure authentication flow

========================
10. SEED DATA
============

* Automatically insert sample products into MongoDB on server start

========================
11. RUN INSTRUCTIONS
====================

Provide step-by-step instructions:

* Install dependencies
* Setup .env files
* Run backend server
* Run frontend app
* Seed database
* Open Swagger UI

========================
IMPORTANT FINAL RULE:
=====================

* Project must run without errors
* Code must be clean, modular, and professional
* Ensure full end-to-end working system
* No missing files

========================
Phase 2
========================


You are a senior full-stack MERN developer. Update the existing QuickKart e-commerce application by adding advanced product browsing, pagination, UI improvements, and full order management system.

The application must remain production-ready, fully functional, and consistent with existing architecture.

========================
1. PRODUCT SEARCH & FILTERING
========================

Implement advanced product browsing features.

Frontend:
* Add search bar to search products by name
* Add filters for:
  - Category
  - Price range (min/max)
* Allow combining search + filters together
* Update UI dynamically based on filter selection

Backend APIs:
* GET /api/products?page=&limit=&search=&category=&minPrice=&maxPrice=

Rules:
* Search should be case-insensitive
* Filters should work together
* Return filtered + paginated results

========================
2. PAGINATION (IMPORTANT)
========================

Implement pagination for product listing.

Backend:
* Add pagination using query params:
  - page
  - limit

Frontend:
* Show limited products per page (e.g., 10 per page)
* Add pagination controls:
  - Next page
  - Previous page
  - Page numbers (optional)
* Disable buttons when no more pages available

Rules:
* Ensure pagination works with search and filters combined
* Return total pages and current page from backend

========================
3. ORDERS SYSTEM (FULL IMPLEMENTATION)
========================

Implement a complete order management system.

Flow:
* User clicks checkout
* Cart items are converted into an order
* Order is saved in database
* Cart is cleared after successful order

Backend APIs:
* POST /api/orders (create order from cart)
* GET /api/orders/my-orders (get logged-in user orders)
* GET /api/orders/:id (get order details)

Order Schema:
* userId (reference User)
* products (array of productId, quantity, price)
* totalAmount
* status (Pending, Processing, Shipped, Delivered)
* createdAt timestamp

Frontend:
* My Orders Page
* Order Details Page
* Display order status clearly
* Show order summary with products and total

========================
4. UI/UX IMPROVEMENTS (LOADING STATES)
========================

Improve frontend user experience with proper loading handling.

Requirements:

* Show loading spinner during:
  - Product fetching
  - Login / Signup
  - Add to cart
  - Checkout process
  - Order creation

* Use skeleton loaders for:
  - Product listing page
  - Product cards

* Handle empty states:
  - No products found
  - Empty cart
  - No orders available

* Disable buttons while API requests are in progress

Rules:
* UI must feel smooth and responsive
* No sudden layout shifts
* Improve perceived performance using skeleton UI

========================
IMPORTANT RULES
========================

* Keep code clean and consistent with existing project structure
* Use React hooks and Context API where needed
* Use proper error handling in backend APIs
* Ensure all features work together (search + filter + pagination)
* Do NOT break existing authentication or cart system

========================
Phase 3 
========================

