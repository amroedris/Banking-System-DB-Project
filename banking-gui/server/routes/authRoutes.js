const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Customer login
router.post('/login', authController.customerLogin);

// Staff login
router.post('/staff-login', authController.staffLogin);

module.exports = router;
