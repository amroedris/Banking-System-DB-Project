const staffModel = require('../models/staffModel');

// Get customer details (for staff view)
exports.getCustomerDetails = async (req, res, next) => {
  const customerId = req.params.id;

  try {
    const details = await staffModel.getCustomerFullDetails(customerId);
    res.json(details);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get all customers (for staff view)
exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await staffModel.getAllCustomers();
    res.json(customers);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Freeze/Unfreeze customer accounts
exports.freezeCustomerAccounts = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  // Transform frontend labels to database values
  const mappedStatus = status === "FROZEN" ? "Inactive" : "Active";

  try {
    await staffModel.updateCustomerAccountsStatus(id, mappedStatus);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Freeze/Unfreeze specific account
exports.freezeAccount = async (req, res, next) => {
  const { accountNumber } = req.params;
  const { status } = req.body;

  try {
    await staffModel.updateAccountStatus(accountNumber, status);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Create a new account for an existing customer
exports.createAccount = async (req, res, next) => {
  const { customerId, accountType, initialDeposit, branchId } = req.body;

  try {
    const result = await staffModel.createAccountForCustomer(customerId, accountType, initialDeposit || 0, branchId);
    res.json({ success: true, accountNumber: result.accountNumber });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Full customer onboarding (create customer + account)
exports.customerOnboard = async (req, res, next) => {
  const { firstName, lastName, nationalId, email, phone, accountType, initialDeposit } = req.body;

  try {
    const result = await staffModel.createCustomerOnboard({
      firstName,
      lastName,
      nationalId,
      email,
      phone,
      accountType,
      initialDeposit
    });
    res.json({ success: true, customerId: result.customerId, accountNumber: result.accountNumber });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Create a new customer only (no account)
// Create a new customer only (no account)
exports.addCustomerOnly = async (req, res, next) => {
  const { 
    firstName, middleName, lastName, dob, 
    street, city, governorate, 
    nationalId, email, phone, 
    username, password 
  } = req.body;

  try {
    const result = await staffModel.createCustomerOnly({
      firstName, middleName, lastName, dob, 
      street, city, governorate, 
      nationalId, email, phone, 
      username, password
    });
    
    res.json({ success: true, customerId: result.customerId });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get staff members (optionally filtered by supervisor)
exports.getAllStaff = async (req, res, next) => {
  const supervisorId = req.query.supervisorId || null;
  
  try {
    const staff = await staffModel.getStaffMembers(supervisorId);
    res.json(staff);
  } catch (err) {
    console.error(err);
    next(err);
  }
};


// Create a new staff member
exports.addStaffMember = async (req, res, next) => {
  const { firstName, lastName, email, role, salary, supervisorId } = req.body;

  try {
    const result = await staffModel.createStaffMember({ firstName, lastName, email, role, salary }, supervisorId);
    res.json({ success: true, employeeId: result.employeeId });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Update staff member
exports.updateStaffMemberData = async (req, res, next) => {
  const { id } = req.params;
  const { firstName, lastName, email, role } = req.body;

  try {
    await staffModel.updateStaffMember(id, { firstName, lastName, email, role });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Delete staff member
exports.removeStaffMember = async (req, res, next) => {
  const { id } = req.params;

  try {
    await staffModel.deleteStaffMember(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get transaction logs
exports.getTransactionLogs = async (req, res, next) => {
  try {
    const transactions = await staffModel.getAllTransactions();
    res.json(transactions);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get audit trail
exports.getAuditTrail = async (req, res, next) => {
  try {
    const logs = await staffModel.getAuditLogs();
    res.json(logs);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
