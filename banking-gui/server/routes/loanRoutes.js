const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Get loans for a customer
router.get('/loans/:customerId', loanController.getCustomerLoans);

// Apply for a new loan
router.post('/loans/apply', loanController.applyForLoan);

// Make a loan payment
router.post('/loans/pay', loanController.makeLoanPayment);

module.exports = router;
