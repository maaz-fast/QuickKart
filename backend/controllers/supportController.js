const Support = require('../models/Support');

// @desc    Submit a support query
// @route   POST /api/support
// @access  Public
const submitQuery = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const query = await Support.create({
      user: req.user ? req.user._id : null,
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Query submitted successfully. We will get back to you soon!',
      query
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all support queries (Admin)
// @route   GET /api/admin/support
// @access  Private/Admin
const getQueries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const queryObj = {};
    if (status) queryObj.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Support.countDocuments(queryObj);

    const queries = await Support.find(queryObj)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: queries.length,
      totalPages: Math.ceil(total / Number(limit)),
      totalCount: total,
      queries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update query status (Admin)
// @route   PUT /api/admin/support/:id
// @access  Private/Admin
const updateQueryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const query = await Support.findById(req.params.id);

    if (!query) {
      res.status(404);
      throw new Error('Query not found');
    }

    query.status = status;
    await query.save();

    res.status(200).json({
      success: true,
      message: `Query marked as ${status}`,
      query
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitQuery,
  getQueries,
  updateQueryStatus
};
