# QuickKart — Manual Test Suites

> **Test Type**: Manual  
> **Application**: QuickKart E-Commerce Platform  
> **Version**: Phase 6  
> **Date**: April 2026

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Product Listing & Filtering](#2-product-listing--filtering)
3. [Cart Functionality](#3-cart-functionality)
4. [Checkout & Order Placement](#4-checkout--order-placement)
5. [Admin Panel](#5-admin-panel)
6. [Notifications System](#6-notifications-system)

---

## 1. Authentication

### TC-AUTH-001 — Successful User Signup

| Field | Details |
|---|---|
| **Test Case ID** | TC-AUTH-001 |
| **Scenario** | A new user registers with valid credentials |
| **Preconditions** | User is not logged in; email is not already registered |

**Steps:**
1. Navigate to `/signup`
2. Enter a valid name, e.g. `John Doe`
3. Enter a valid email, e.g. `john@example.com`
4. Enter a password with 6+ characters
5. Click **Sign Up**

**Expected Result:** User is redirected to the homepage and a welcome toast/notification appears. JWT token is stored in `localStorage`.

---

### TC-AUTH-002 — Signup with Duplicate Email

| Field | Details |
|---|---|
| **Test Case ID** | TC-AUTH-002 |
| **Scenario** | A user tries to sign up with an already-registered email |

**Steps:**
1. Navigate to `/signup`
2. Enter an email that already exists in the system
3. Fill remaining fields and click **Sign Up**

**Expected Result:** Error message `"User already exists"` appears. No new account is created.

---

### TC-AUTH-003 — Successful Login

| Field | Details |
|---|---|
| **Test Case ID** | TC-AUTH-003 |
| **Scenario** | A registered user logs in with correct credentials |

**Steps:**
1. Navigate to `/login`
2. Enter a valid registered email and password
3. Click **Login**

**Expected Result:** User is redirected to homepage. Navbar shows the user's name and cart icon. Token is stored.

---

### TC-AUTH-004 — Login with Wrong Password

| Field | Details |
|---|---|
| **Test Case ID** | TC-AUTH-004 |
| **Scenario** | User attempts login with incorrect password |

**Steps:**
1. Navigate to `/login`
2. Enter a valid email but an incorrect password
3. Click **Login**

**Expected Result:** Error message `"Invalid credentials"` appears. User remains on the login page.

---

### TC-AUTH-005 — Rate Limiting on Login

| Field | Details |
|---|---|
| **Test Case ID** | TC-AUTH-005 |
| **Scenario** | User hits the login endpoint more than 10 times within 15 minutes |

**Steps:**
1. Attempt to login with wrong credentials 11 times in quick succession

**Expected Result:** After the 10th request, the server returns HTTP `429 Too Many Requests` with the message `"Too many attempts from this IP..."`.

---

### TC-AUTH-006 — Logout

| Field | Details |
|---|---|
| **Test Case ID** | TC-AUTH-006 |
| **Scenario** | A logged-in user logs out |

**Steps:**
1. Log in as any user
2. Click on the profile/user menu
3. Click **Logout**

**Expected Result:** User is redirected to the login page. JWT token and user data are cleared from `localStorage`. Cart is cleared from state.

---

### TC-AUTH-007 — Forgot Password Flow

| Field | Details |
|---|---|
| **Test Case ID** | TC-AUTH-007 |
| **Scenario** | User resets their password via the forgot-password flow |

**Steps:**
1. Navigate to `/forgot-password`
2. Enter a registered email
3. On the reset page, enter a new password and confirm it
4. Submit

**Expected Result:** Success message is shown. User can now log in with the new password.

---

## 2. Product Listing & Filtering

### TC-PROD-001 — View All Products

| Field | Details |
|---|---|
| **Test Case ID** | TC-PROD-001 |
| **Scenario** | User views the homepage product listing |

**Steps:**
1. Navigate to `/`
2. Wait for the page to load

**Expected Result:** A grid of product cards is displayed. Each card shows image, name, category, description snippet, and price.

---

### TC-PROD-002 — Filter by Category

| Field | Details |
|---|---|
| **Test Case ID** | TC-PROD-002 |
| **Scenario** | User filters products by a specific category |

**Steps:**
1. Navigate to `/`
2. Click on a category tab (e.g., `Electronics`)

**Expected Result:** Only products belonging to the selected category are shown. The active tab is highlighted.

---

### TC-PROD-003 — Search by Product Name

| Field | Details |
|---|---|
| **Test Case ID** | TC-PROD-003 |
| **Scenario** | User searches for a product by keyword |

**Steps:**
1. Navigate to `/`
2. Type a keyword in the search bar (e.g., `laptop`)

**Expected Result:** Products whose names or descriptions match the keyword are displayed. Non-matching products are hidden.

---

### TC-PROD-004 — Filter by Price Range

| Field | Details |
|---|---|
| **Test Case ID** | TC-PROD-004 |
| **Scenario** | User filters products within a price range |

**Steps:**
1. Navigate to `/`
2. Enter a Min Price (e.g., `10`) and Max Price (e.g., `100`)

**Expected Result:** Only products priced between $10 and $100 are displayed.

---

### TC-PROD-005 — No Products Found (Empty State)

| Field | Details |
|---|---|
| **Test Case ID** | TC-PROD-005 |
| **Scenario** | Search/filter returns no results |

**Steps:**
1. Navigate to `/`
2. Search for a product name that does not exist (e.g., `xyznonexistent`)

**Expected Result:** An "empty state" illustration or message is displayed (e.g., "No products found").

---

### TC-PROD-006 — View Product Detail

| Field | Details |
|---|---|
| **Test Case ID** | TC-PROD-006 |
| **Scenario** | User views a product's detail page |

**Steps:**
1. Navigate to `/`
2. Click on any product card

**Expected Result:** User is redirected to `/products/:id`. Full product image, name, description, price, stock, and "Add to Cart" / "Add to Wishlist" buttons are visible.

---

## 3. Cart Functionality

### TC-CART-001 — Add Product to Cart

| Field | Details |
|---|---|
| **Test Case ID** | TC-CART-001 |
| **Scenario** | A logged-in user adds a product to the cart |

**Steps:**
1. Log in
2. Navigate to any product detail page
3. Select a quantity and click **Add to Cart**

**Expected Result:** Cart badge count in the navbar increases. A success toast appears.

---

### TC-CART-002 — View Cart Items

| Field | Details |
|---|---|
| **Test Case ID** | TC-CART-002 |
| **Scenario** | User views all items in their cart |

**Steps:**
1. Log in and add at least one item to the cart
2. Click the cart icon in the navbar

**Expected Result:** All cart items are listed with image, name, quantity, price per item, and subtotal.

---

### TC-CART-003 — Remove Item from Cart

| Field | Details |
|---|---|
| **Test Case ID** | TC-CART-003 |
| **Scenario** | User removes an item from the cart |

**Steps:**
1. Navigate to `/cart`
2. Click the remove (🗑) button on any item

**Expected Result:** The item is removed from the list. Cart total and item count update accordingly.

---

### TC-CART-004 — Empty Cart State

| Field | Details |
|---|---|
| **Test Case ID** | TC-CART-004 |
| **Scenario** | User views an empty cart |

**Steps:**
1. Log in with a user that has no cart items
2. Navigate to `/cart`

**Expected Result:** An empty state is displayed with message "Your cart is empty" and a "Continue Shopping" button.

---

### TC-CART-005 — Cart Persists After Reload

| Field | Details |
|---|---|
| **Test Case ID** | TC-CART-005 |
| **Scenario** | Cart items are retained after a page reload |

**Steps:**
1. Add an item to the cart
2. Reload the page
3. Navigate to `/cart`

**Expected Result:** Previously added items are still present in the cart.

---

## 4. Checkout & Order Placement

### TC-CHECKOUT-001 — Successful Order Placement

| Field | Details |
|---|---|
| **Test Case ID** | TC-CHECKOUT-001 |
| **Scenario** | User successfully places an order |

**Steps:**
1. Add at least one item to the cart
2. Navigate to `/checkout`
3. Fill in all required shipping fields
4. Select a payment method
5. Click **Place Order**

**Expected Result:** User is redirected to the order confirmation / order details page. A "Order Placed" notification appears.

---

### TC-CHECKOUT-002 — Checkout with Empty Cart

| Field | Details |
|---|---|
| **Test Case ID** | TC-CHECKOUT-002 |
| **Scenario** | User attempts checkout with no items |

**Steps:**
1. Ensure cart is empty
2. Navigate to `/checkout`

**Expected Result:** User is redirected back to the cart page or an error message is shown. Order cannot be placed.

---

### TC-CHECKOUT-003 — Order Receipt / Invoice View

| Field | Details |
|---|---|
| **Test Case ID** | TC-CHECKOUT-003 |
| **Scenario** | User views the branded invoice for a placed order |

**Steps:**
1. Place an order
2. Navigate to `/orders`
3. Click on the order to go to `/orders/:id`

**Expected Result:** A QuickKart-branded invoice is displayed with: logo, order ID, date, status badge, Bill To, Ship To, itemised product table, tax, shipping, and grand total.

---

### TC-CHECKOUT-004 — Download Invoice

| Field | Details |
|---|---|
| **Test Case ID** | TC-CHECKOUT-004 |
| **Scenario** | User downloads/prints the invoice |

**Steps:**
1. Navigate to `/orders/:id`
2. Click the **Download Invoice** button

**Expected Result:** The browser print dialog opens. The printed page shows only the branded invoice (no navbar, no buttons). Colors and gradients are preserved.

---

### TC-CHECKOUT-005 — Empty Orders State

| Field | Details |
|---|---|
| **Test Case ID** | TC-CHECKOUT-005 |
| **Scenario** | User visits the orders page with no orders |

**Steps:**
1. Log in as a new user with no orders
2. Navigate to `/orders`

**Expected Result:** An empty state is displayed with "No orders yet" and a "Start Shopping" button.

---

## 5. Admin Panel

### TC-ADMIN-001 — Admin Login & Dashboard Access

| Field | Details |
|---|---|
| **Test Case ID** | TC-ADMIN-001 |
| **Scenario** | Admin logs in and views the dashboard |

**Steps:**
1. Log in with admin credentials
2. Navigate to `/admin/dashboard`

**Expected Result:** Admin dashboard loads with stats cards (Revenue, Orders, Products, Users), a Revenue chart, and an Order Status pie chart.

---

### TC-ADMIN-002 — View Analytics Section

| Field | Details |
|---|---|
| **Test Case ID** | TC-ADMIN-002 |
| **Scenario** | Admin views the Advanced Analytics section |

**Steps:**
1. Log in as admin
2. Navigate to `/admin/dashboard`
3. Scroll down to the "Advanced Analytics" section

**Expected Result:** Two cards are visible: "Top 5 Most Ordered Products" (ranked list with image and sold count) and "Orders Per Day" (area chart for the last 30 days).

---

### TC-ADMIN-003 — Create New Product

| Field | Details |
|---|---|
| **Test Case ID** | TC-ADMIN-003 |
| **Scenario** | Admin creates a new product |

**Steps:**
1. Navigate to `/admin/products`
2. Click **Add Product**
3. Fill in all required fields (name, price, description, category, stock, image URL)
4. Click **Save**

**Expected Result:** New product appears in the product list and on the storefront.

---

### TC-ADMIN-004 — Update Order Status

| Field | Details |
|---|---|
| **Test Case ID** | TC-ADMIN-004 |
| **Scenario** | Admin updates the status of an existing order |

**Steps:**
1. Navigate to `/admin/orders`
2. Find an order with status `Pending`
3. Change the status to `Shipped` and save

**Expected Result:** The order status updates. The customer receives a notification about the status change.

---

### TC-ADMIN-005 — Non-Admin Access Restriction

| Field | Details |
|---|---|
| **Test Case ID** | TC-ADMIN-005 |
| **Scenario** | A regular user tries to access an admin route |

**Steps:**
1. Log in as a non-admin user
2. Manually navigate to `/admin/dashboard`

**Expected Result:** User is redirected away or shown an "Access Denied" / 403 error. Admin data is not exposed.

---

## 6. Notifications System

### TC-NOTIF-001 — Notification on Registration

| Field | Details |
|---|---|
| **Test Case ID** | TC-NOTIF-001 |
| **Scenario** | New user receives a welcome notification after signup |

**Steps:**
1. Sign up as a new user

**Expected Result:** A welcome notification is visible in the notification bell dropdown.

---

### TC-NOTIF-002 — Notification on Order Placement

| Field | Details |
|---|---|
| **Test Case ID** | TC-NOTIF-002 |
| **Scenario** | User receives a notification when they place an order |

**Steps:**
1. Place an order
2. Click the notification bell

**Expected Result:** A new notification about the order placement appears (e.g., "Your order has been placed successfully").

---

### TC-NOTIF-003 — Notification on Order Status Update

| Field | Details |
|---|---|
| **Test Case ID** | TC-NOTIF-003 |
| **Scenario** | User receives a notification when admin updates their order status |

**Steps:**
1. Admin updates an order's status (e.g., from `Pending` to `Shipped`)
2. Log in as the corresponding user
3. Click the notification bell

**Expected Result:** A notification reads `"Your order status has been updated to Shipped"`.

---

### TC-NOTIF-004 — Mark Notification as Read

| Field | Details |
|---|---|
| **Test Case ID** | TC-NOTIF-004 |
| **Scenario** | User marks a notification as read |

**Steps:**
1. Open the notification dropdown (unread notifications have a purple dot)
2. Click on an unread notification

**Expected Result:** The unread indicator disappears. The unread count in the bell badge decreases by 1.

---

### TC-NOTIF-005 — Real-Time Polling

| Field | Details |
|---|---|
| **Test Case ID** | TC-NOTIF-005 |
| **Scenario** | Notifications update automatically without page reload |

**Steps:**
1. Log in as a user and stay on any page
2. As admin (in a separate browser/session), update the user's order status
3. Wait up to 15 seconds

**Expected Result:** The notification bell badge count increases automatically within 15 seconds (due to polling), without the user needing to refresh.

---

### TC-NOTIF-006 — View All Notifications Page

| Field | Details |
|---|---|
| **Test Case ID** | TC-NOTIF-006 |
| **Scenario** | User views the full notification history |

**Steps:**
1. Open the notification dropdown
2. Click **View All**

**Expected Result:** User is navigated to `/notifications`. All past notifications are listed with timestamps and read/unread status.

---

*End of Test Suites Document*
