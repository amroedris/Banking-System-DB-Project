const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Test database connection
router.get('/test', testController.testConnection);

module.exports = router;
