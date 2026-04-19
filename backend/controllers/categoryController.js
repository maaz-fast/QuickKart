const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const { page, limit, usedOnly } = req.query;
    
    // storefront default: return only non-empty categories
    if (usedOnly === 'true') {
      const usedCategoryIds = await Product.distinct('category');
      const categories = await Category.find({ _id: { $in: usedCategoryIds } }).sort({ name: 1 });
      return res.status(200).json({ success: true, categories });
    }

    // Default for Admin or non-filtered fetch
    if (!page && !limit) {
      const categories = await Category.find({}).sort({ name: 1 });
      return res.status(200).json({ success: true, categories });
    }

    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;

    const totalCount = await Category.countDocuments({});
    const totalPages = Math.ceil(totalCount / pageLimit);

    const categories = await Category.find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(pageLimit);

    res.status(200).json({ 
       success: true, 
       categories,
       totalCount,
       totalPages,
       currentPage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) {
      res.status(400);
      throw new Error('Category already exists');
    }
    const category = await Category.create({ name });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    category.name = name;
    await category.save();
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
