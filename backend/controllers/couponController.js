const Coupon = require('../models/Coupon');
const { logActivity } = require('../utils/activityLogger');

// @desc    Validate coupon code (Customer)
// @route   POST /api/coupons/validate
// @access  Public / Private
const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      res.status(400);
      throw new Error('Coupon code is required');
    }

    const uppercaseCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: uppercaseCode });

    if (!coupon) {
      res.status(404);
      throw new Error('Invalid coupon code');
    }

    if (!coupon.isActive) {
      res.status(400);
      throw new Error('Coupon is no longer active');
    }

    if (new Date() > new Date(coupon.expiresAt)) {
      res.status(400);
      throw new Error('Coupon has expired');
    }

    if (coupon.usedCount >= coupon.maxUses) {
      res.status(400);
      throw new Error('Coupon has reached its maximum usage limit');
    }

    const subtotal = Number(orderAmount || 0);
    if (subtotal < coupon.minOrderValue) {
      res.status(400);
      throw new Error(`Order amount must be at least $${coupon.minOrderValue} to use this coupon`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Number(discountAmount.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/admin/coupons
// @access  Private/Admin
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/admin/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxUses, expiresAt, isActive } = req.body;

    if (!code || !discountValue || !expiresAt) {
      res.status(400);
      throw new Error('Please provide code, discountValue, and expiresAt');
    }

    const uppercaseCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: uppercaseCode });
    if (existing) {
      res.status(400);
      throw new Error('Coupon code already exists');
    }

    const coupon = await Coupon.create({
      code: uppercaseCode,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxUses: Number(maxUses || 100),
      expiresAt: new Date(expiresAt),
      isActive: isActive !== undefined ? isActive : true,
    });

    await logActivity(req.user, 'CREATE_COUPON', `Created coupon: ${coupon.code}`, { couponId: coupon._id });

    res.status(201).json({
      success: true,
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }

    const { code, discountType, discountValue, minOrderValue, maxUses, expiresAt, isActive } = req.body;

    if (code) coupon.code = code.trim().toUpperCase();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) coupon.minOrderValue = Number(minOrderValue);
    if (maxUses !== undefined) coupon.maxUses = Number(maxUses);
    if (expiresAt) coupon.expiresAt = new Date(expiresAt);
    if (isActive !== undefined) coupon.isActive = isActive;

    const updated = await coupon.save();

    await logActivity(req.user, 'UPDATE_COUPON', `Updated coupon: ${updated.code}`, { couponId: updated._id });

    res.json({
      success: true,
      coupon: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }

    await coupon.deleteOne();

    await logActivity(req.user, 'DELETE_COUPON', `Deleted coupon: ${coupon.code}`, { couponId: req.params.id });

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
