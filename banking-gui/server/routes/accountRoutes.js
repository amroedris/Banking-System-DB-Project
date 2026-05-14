const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// Get accounts for a customer
router.get('/accounts/:customerId', accountController.getCustomerAccounts);

// Get account details
router.get('/account-details/:accountNumber', accountController.getAccountDetails);

module.exports = router;
