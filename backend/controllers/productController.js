const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { 
      q,
      search, 
      category, 
      minPrice, 
      maxPrice, 
      minRating,
      sortBy,
      page = 1, 
      limit = 10 
    } = req.query;

    const queryText = q || search;
    const query = {};

    // 1. Build Query Filter
    if (queryText && queryText.trim() !== '') {
      const sanitizedSearch = queryText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ 
          $or: [
            { name: { $regex: `^${category}$`, $options: 'i' } },
            { slug: category.toLowerCase() }
          ]
        });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          query.category = new mongoose.Types.ObjectId(); 
        }
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // 2. Determine Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'rating') {
      sortOptions = { averageRating: -1, numReviews: -1 };
    } else if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    // 3. Pagination Logic
    const skip = (Number(page) - 1) * Number(limit);
    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / Number(limit)) || 1;

    // 4. Fetch Products
    const products = await Product.find(query)
      .populate('category')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      totalItems: totalCount,
      totalCount,
      totalPages,
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.status(200).json({
      success: true,
      product: await product.populate('category'),
    });

    // Log Activity (only if user is logged in)
    if (req.user) {
      await logActivity(req.user, 'PRODUCT_VIEW', `Viewed: ${product.name}`, { productId: product._id });
    }
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      res.status(400);
      return next(new Error('Invalid product ID format'));
    }
    next(error);
  }
};

// @desc    Get all unique categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({
      success: true,
      categories: ['All', ...categories],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, getCategories };
