const Address = require('../models/Address');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all user addresses
// @route   GET /api/users/me/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new address
// @route   POST /api/users/me/addresses
// @access  Private
const createAddress = async (req, res, next) => {
  try {
    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !postalCode || !country) {
      res.status(400);
      throw new Error('Please provide all required fields (fullName, phone, addressLine1, city, postalCode, country)');
    }

    const existingAddressesCount = await Address.countDocuments({ user: req.user._id });
    const setAsDefault = isDefault || existingAddressesCount === 0;

    if (setAsDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      label: label || 'Home',
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state: state || '',
      postalCode,
      country: country || 'Pakistan',
      isDefault: setAsDefault,
    });

    await logActivity(req.user, 'CREATE_ADDRESS', `Added new shipping address: ${address.label} (${address.city})`, {
      addressId: address._id,
    });

    res.status(201).json({
      success: true,
      address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/users/me/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    const { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: address._id } }, { isDefault: false });
      address.isDefault = true;
    } else if (isDefault === false && address.isDefault) {
      // If unsetting default, make another address default if available
      const otherAddress = await Address.findOne({ user: req.user._id, _id: { $ne: address._id } });
      if (otherAddress) {
        otherAddress.isDefault = true;
        await otherAddress.save();
      }
      address.isDefault = false;
    }

    if (label !== undefined) address.label = label;
    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (country !== undefined) address.country = country;

    const updatedAddress = await address.save();

    await logActivity(req.user, 'UPDATE_ADDRESS', `Updated shipping address: ${updatedAddress.label}`, {
      addressId: updatedAddress._id,
    });

    res.json({
      success: true,
      address: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/users/me/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    if (wasDefault) {
      const remainingAddress = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }

    await logActivity(req.user, 'DELETE_ADDRESS', `Deleted shipping address (${address.label})`, {
      addressId: req.params.id,
    });

    res.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set default address
// @route   PATCH /api/users/me/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    const updatedAddress = await address.save();

    await logActivity(req.user, 'SET_DEFAULT_ADDRESS', `Set ${updatedAddress.label} as default address`, {
      addressId: updatedAddress._id,
    });

    res.json({
      success: true,
      address: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
