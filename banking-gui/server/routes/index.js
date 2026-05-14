const express = require('express');
const router = express.Router();

// Import all route modules
const testRoutes = require('./testRoutes');
const authRoutes = require('./authRoutes');
const accountRoutes = require('./accountRoutes');
const transactionRoutes = require('./transactionRoutes');
const cardRoutes = require('./cardRoutes');
const loanRoutes = require('./loanRoutes');
const customerRoutes = require('./customerRoutes');
const adminRoutes = require('./adminRoutes');
const staffRoutes = require('./staffRoutes');

// Use route modules
router.use('/', testRoutes);
router.use('/', authRoutes);
router.use('/', accountRoutes);
router.use('/', transactionRoutes);
router.use('/', cardRoutes);
router.use('/', loanRoutes);
router.use('/', customerRoutes);
router.use('/', adminRoutes);
router.use('/', staffRoutes);

module.exports = router;
