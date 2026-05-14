const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Get customer information
router.get('/customer/:customerId', customerController.getCustomerInfo);

// Update customer information
router.put('/customer/:customerId', customerController.updateCustomerInfo);

// Update customer password
router.put('/customer-password/:customerId', customerController.updateCustomerPassword);

module.exports = router;
