const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Transfer money
router.post('/transfer', transactionController.transfer);

// Get recent transactions for a customer
router.get('/recent-transactions/:customerId', transactionController.getRecentTransactions);

// Get transaction history for an account
router.get('/transactions/:accountNumber', transactionController.getTransactionHistory);

module.exports = router;
