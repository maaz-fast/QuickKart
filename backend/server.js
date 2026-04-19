const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const seedProducts = require('./utils/seedData');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Error handler middleware
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB and seed data
connectDB().then(() => seedProducts());

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'QuickKart API Docs',
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Vercel Serverless Fallbacks (Handles when Vercel automatically strips the /api prefix)
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🛒 Welcome to QuickKart API',
    docs: 'http://localhost:5000/api-docs',
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only listen locally, Vercel Serverless Functions handle binding automatically
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Swagger Docs at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
