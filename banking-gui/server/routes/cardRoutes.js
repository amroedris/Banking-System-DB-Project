const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// Get all cards for a customer
router.get('/cards/:customerId', cardController.getCustomerCards);

// Update card status (Freeze/Unfreeze/Cancel)
router.post('/cards/status', cardController.updateCardStatus);

// Get cards by account number
router.get('/accounts/:accountNumber/cards', cardController.getAccountCards);

// Create a new card
router.post('/cards/create', cardController.createCard);

module.exports = router;
