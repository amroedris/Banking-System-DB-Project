const customerModel = require('../models/customerModel');

// Get customer information
exports.getCustomerInfo = async (req, res, next) => {
  const customerId = req.params.customerId;

  try {
    const customer = await customerModel.getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Update customer information
exports.updateCustomerInfo = async (req, res, next) => {
  const customerId = req.params.customerId;
  const { firstName, lastName, email, phone, street, city, governorate } = req.body;

  try {
    // Check if phone belongs to another customer
    if (phone && String(phone).trim() !== '') {
      const isDuplicate = await customerModel.isPhoneDuplicate(phone, customerId);
      
      if (isDuplicate) {
        return res.status(400).json({ 
          message: "Phone number already used by another customer" 
        });
      }
    }

    // Update customer information
    await customerModel.updateCustomer(customerId, {
      firstName,
      lastName,
      email,
      street,
      city,
      governorate,
      phone
    });

    res.json({ message: "Customer information updated" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Update customer password
exports.updateCustomerPassword = async (req, res, next) => {
  const customerId = req.params.customerId;
  const { currentPassword, newPassword } = req.body;

  try {
    const customer = await customerModel.getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Verify current password
    const isPasswordValid = await customerModel.verifyPassword(customerId, currentPassword);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    await customerModel.updatePassword(customerId, newPassword);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
