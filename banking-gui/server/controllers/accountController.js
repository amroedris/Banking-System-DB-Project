const accountModel = require('../models/accountModel');

// Get accounts for a customer
exports.getCustomerAccounts = async (req, res, next) => {
  const customerId = req.params.customerId;

  try {
    const accounts = await accountModel.getAccountsByCustomerId(customerId);
    res.json(accounts);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get account details
exports.getAccountDetails = async (req, res, next) => {
  const accountNumber = req.params.accountNumber;

  try {
    const account = await accountModel.getAccountByNumber(accountNumber);
    
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    res.json(account);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
