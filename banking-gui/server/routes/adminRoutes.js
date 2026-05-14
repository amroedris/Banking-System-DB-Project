const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Get admin dashboard stats
router.get('/stats', adminController.getStats);

// Get recent system activity
router.get('/recent-activity', adminController.getRecentActivity);

// Get pending loan approvals
router.get('/approvals', adminController.getPendingApprovals);

// Approve or reject a loan
router.put('/approvals/:loanId', adminController.updateLoanApproval);

module.exports = router;
