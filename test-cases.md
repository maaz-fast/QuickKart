# QuickKart – Playwright (.NET/C#) Test Cases

> **Tech Stack:** Playwright + C# (.NET)  
> **Base URL:** `https://<your-deployed-url>` (or `http://localhost:5173` locally)  
> **Test Data Ids:** All elements use the `data-testid` attribute for easy selection.

---

## 🧑‍💻 Section 1: Customer (User) Test Cases

### 1. Account & Authentication
These tests make sure users can sign up, log in, and manage their passwords.

**TC-USER-AUTH-001: Successful User Registration**
- **Steps:** Go to the signup page, fill in a new name, email, and password, and click sign up.
- **Expected:** The user is logged in and redirected to the Home Page.

**TC-USER-AUTH-002: Registration with Already Used Email**
- **Steps:** Try to sign up with an email that already belongs to another account.
- **Expected:** An error message shows "user already exists".

**TC-USER-AUTH-003: Registration Validation Errors**
- **Steps:** Try to sign up with an empty form, mismatched passwords, or a very short password.
- **Expected:** The system prevents the signup and shows the correct error message for each mistake.

**TC-USER-AUTH-004: Password Visibility Toggle**
- **Steps:** Click the "eye" icon next to the password box during signup or login.
- **Expected:** The password changes from dots (hidden) to readable text.

**TC-USER-AUTH-005: Successful Login**
- **Steps:** Go to the login page and enter a valid email and password.
- **Expected:** The user logs in successfully and sees their account in the top menu.

**TC-USER-AUTH-006: Login with Incorrect Password or Email**
- **Steps:** Try to log in with the wrong password or a fake email address.
- **Expected:** An error message says "Invalid credentials" or "Email not found".

**TC-USER-AUTH-007: Forgot & Reset Password Flow**
- **Steps:** Use the "Forgot Password" link, enter an email, and then reset the password on the next screen.
- **Expected:** The password is successfully changed, and the user can log in with the new password.

**TC-USER-AUTH-008: Secure Page Protection**
- **Steps:** Try to go directly to `/checkout` or `/cart` without logging in.
- **Expected:** The website forces the user back to the login page.

**TC-USER-AUTH-009: Successful Logout**
- **Steps:** Click the "Logout" button in the menu.
- **Expected:** The user is logged out, the session is cleared, and they are sent to the login page.

---

### 2. Home Page & Searching for Products
These tests ensure users can browse, search, and find products easily.

**TC-USER-HOME-001: Products Load Correctly**
- **Steps:** Log in and look at the home page.
- **Expected:** A list of products appears with their images, names, and prices.

**TC-USER-HOME-002: Search for a Product**
- **Steps:** Type a product's name into the search bar.
- **Expected:** Only products that match the typed name appear on the screen.

**TC-USER-HOME-003: Search Returns No Results**
- **Steps:** Type a fake product name (like "xyzfakeitem") into the search bar.
- **Expected:** The screen shows a "No products found" message.

**TC-USER-HOME-004: Filter by Category**
- **Steps:** Click on a category tab (like "Electronics" or "Clothing").
- **Expected:** The page updates to show only items from that category.

**TC-USER-HOME-005: Filter by Price Range**
- **Steps:** Enter a minimum price (e.g., $10) and a maximum price (e.g., $50).
- **Expected:** Only products priced between $10 and $50 are shown.

**TC-USER-HOME-006: Clear All Filters**
- **Steps:** Apply a search, category, and price filter, then click the "Reset All Filters" button.
- **Expected:** All filters are removed, and the full list of products comes back.

**TC-USER-HOME-007: Pagination (Next & Previous Pages)**
- **Steps:** Click the "Next" button at the bottom of the home page.
- **Expected:** The next set of products loads. The "Previous" button becomes clickable.

---

### 3. Shopping Cart
These tests make sure the cart adds items, removes items, and calculates money correctly.

**TC-USER-CART-001: Add Item to Cart from Home Page**
- **Steps:** Click the "+ Cart" button on any product card.
- **Expected:** The button briefly changes to "✓ Added". The cart number in the top menu goes up by 1.

**TC-USER-CART-002: Add Item from Product Detail Page**
- **Steps:** Click on a product to view its details, then click "Add to Cart".
- **Expected:** A success message appears, and the cart updates.

**TC-USER-CART-003: View Cart Items**
- **Steps:** Go to the Cart page after adding a few items.
- **Expected:** All added items are listed with their correct pictures, names, and prices.

**TC-USER-CART-004: Remove Item from Cart**
- **Steps:** Click the "Delete/Trash" icon next to an item in the cart.
- **Expected:** The item disappears, and the total cart price goes down.

**TC-USER-CART-005: Cart Math is Correct**
- **Steps:** Add multiple items with different prices. Check the Order Summary box.
- **Expected:** The Subtotal, Tax (8%), and Grand Total are calculated perfectly.

**TC-USER-CART-006: Empty Cart Message**
- **Steps:** Go to the cart page when you haven't added anything.
- **Expected:** The page shows an "Empty Cart" message with a button to go shopping.

---

### 4. Checkout Process
These tests make sure customers can actually buy their items safely.

**TC-USER-CHK-001: Proceed to Checkout Button Works**
- **Steps:** Click "Proceed to Checkout" from the cart page.
- **Expected:** The Checkout page loads and shows the shipping form.

**TC-USER-CHK-002: Checkout Form Validations**
- **Steps:** Leave all fields empty and click "Place Order".
- **Expected:** Red warning messages appear under every required box (First name, address, card number, etc.).

**TC-USER-CHK-003: Credit Card Validations**
- **Steps:** Enter a card number that is too short, or an expiry date that is in the past.
- **Expected:** The system stops the order and tells the user to fix their card details.

**TC-USER-CHK-004: Successful Order Placement**
- **Steps:** Fill in a correct shipping address and valid credit card details, then submit.
- **Expected:** A "Success" screen appears showing the new Order ID. The cart is emptied.

---

### 5. My Orders History
These tests ensure customers can track what they bought.

**TC-USER-ORD-001: View Order History**
- **Steps:** Go to the "Orders" page.
- **Expected:** A list of all past orders appears showing the date, total money spent, and current status (e.g., Pending, Shipped).

**TC-USER-ORD-002: View Specific Order Details**
- **Steps:** Click on one of the past orders.
- **Expected:** The details page loads, showing the exact items bought, the shipping address, and the total cost.

**TC-USER-ORD-003: Cannot View Other People's Orders**
- **Steps:** Try to type in the URL of an order that belongs to a different user.
- **Expected:** The system blocks access and shows an error.

---

## ⚙️ Section 2: Admin Test Cases

### 1. Admin Security & Dashboard
These tests ensure only authorized staff can manage the store.

**TC-ADMIN-SEC-001: Regular Users Cannot Access Admin Panel**
- **Steps:** Log in as a regular customer and try to go to `/admin/dashboard`.
- **Expected:** The user is blocked and redirected back to the home page.

**TC-ADMIN-DASH-001: Dashboard Stats Load Correctly**
- **Steps:** Log in as an Admin and view the Dashboard.
- **Expected:** Boxes showing "Total Revenue", "Total Orders", and "Total Users" display actual numbers.

**TC-ADMIN-DASH-002: Change Chart Time Range**
- **Steps:** Change the dropdown on the Revenue Chart from "Last 6 Months" to "Last 7 Days".
- **Expected:** The chart instantly updates its lines to show the new timeframe.

---

### 2. Product Management (Add, Edit, Delete)
These tests ensure the Admin can control what items are sold in the store.

**TC-ADMIN-PROD-001: View All Products**
- **Steps:** Go to the Admin Products list.
- **Expected:** A table appears showing all items currently in the store.

**TC-ADMIN-PROD-002: Create a New Product Successfully**
- **Steps:** Click "Add Product", fill in the name, price, description, and image, then save.
- **Expected:** The new product is created and immediately shows up on the customer Home Page.

**TC-ADMIN-PROD-003: Create Product Error Handling**
- **Steps:** Try to save a new product with a negative price (e.g., -$10) or empty name.
- **Expected:** An error appears and the product is NOT saved.

**TC-ADMIN-PROD-004: Edit an Existing Product**
- **Steps:** Click "Edit" on a product, change its price, and save.
- **Expected:** The price updates in the Admin list and on the customer store.

**TC-ADMIN-PROD-005: Delete a Product**
- **Steps:** Click the "Delete" button next to a product.
- **Expected:** The product is permanently removed from the store.

---

### 3. Category Management
These tests make sure Admins can organize products correctly.

**TC-ADMIN-CAT-001: Create a New Category**
- **Steps:** Go to Admin Categories, type a new name (e.g., "Winter Wear"), and click Add.
- **Expected:** The category is added to the list and becomes available when adding new products.

**TC-ADMIN-CAT-002: Prevent Duplicate Categories**
- **Steps:** Try to create a category name that already exists.
- **Expected:** An error prevents the duplicate from being made.

**TC-ADMIN-CAT-003: Edit and Delete Categories**
- **Steps:** Edit a category's name, then try deleting it.
- **Expected:** The name changes successfully. When deleted, it disappears from the list.

---

### 4. Order Management
These tests ensure Admins can process and ship customer orders.

**TC-ADMIN-ORD-001: View All Global Orders**
- **Steps:** Go to the Admin Orders page.
- **Expected:** A table shows orders from ALL customers on the website.

**TC-ADMIN-ORD-002: Filter Orders by Status**
- **Steps:** Click the filter dropdown and select "Pending".
- **Expected:** The table updates to only show orders that haven't been processed yet.

**TC-ADMIN-ORD-003: Update an Order's Status**
- **Steps:** Find a "Pending" order, click its status dropdown, and change it to "Shipped".
- **Expected:** The status updates instantly. When the customer checks their account, they will see it is "Shipped".

---

### 5. User Management
These tests ensure Admins can see who is registered on the website.

**TC-ADMIN-USR-001: View Registered Users List**
- **Steps:** Go to the Admin Users page.
- **Expected:** A list displays all customers, their emails, and whether they are a normal "User" or an "Admin".

---

## 🎨 Section 3: Visual & Website General Tests

**TC-GEN-001: Dark Mode / Light Mode Toggle**
- **Steps:** Click the moon/sun icon in the top menu.
- **Expected:** The website colors completely change from light to dark (or vice versa).

**TC-GEN-002: Mobile Phone View (Responsiveness)**
- **Steps:** Shrink the web browser window to the size of a mobile phone screen.
- **Expected:** The menu turns into a dropdown (hamburger icon), and the product grid stacks neatly in a single column without breaking the layout.

**TC-GEN-003: "Page Not Found" Handling**
- **Steps:** Type a random, non-existent URL (like `/random-fake-page`).
- **Expected:** The website catches the mistake and safely redirects the user back to the Home page.
