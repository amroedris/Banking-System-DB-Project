const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Get customer details (for staff view)
router.get('/staff/customer/:id', staffController.getCustomerDetails);

// Get all customers (for staff view)
router.get('/staff/customers', staffController.getAllCustomers);

// Freeze/Unfreeze customer accounts
router.put('/staff/customer/:id/freeze', staffController.freezeCustomerAccounts);

// Freeze/Unfreeze specific account
router.put('/staff/account/:accountNumber/freeze', staffController.freezeAccount);

// Create a new customer only (no account)
router.post('/staff/customers', staffController.addCustomerOnly);

// Create account for existing customer
router.post('/staff/accounts', staffController.createAccount);

// Full customer onboarding (create customer + first account)
router.post('/staff/customer-onboard', staffController.customerOnboard);

// Get all staff members
router.get('/staff', staffController.getAllStaff);

// Create new staff member
router.post('/staff', staffController.addStaffMember);

// Update staff member
router.put('/staff/:id', staffController.updateStaffMemberData);

// Delete staff member
router.delete('/staff/:id', staffController.removeStaffMember);

// Get all transactions (for transaction log)
router.get('/staff/transactions', staffController.getTransactionLogs);

// Get audit logs
router.get('/staff/audit-logs', staffController.getAuditTrail);

module.exports = router;
