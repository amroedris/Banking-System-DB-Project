const transactionModel = require('../models/transactionModel');
const accountModel = require('../models/accountModel');

// Transfer money
exports.transfer = async (req, res, next) => {
  const { fromAccount, toAccount, amount } = req.body;

  try {
    // 1. Check sender account exists and has enough balance
    const senderAccount = await accountModel.getAccountByNumber(fromAccount);
    
    if (!senderAccount) {
      return res.status(404).json({ success: false, message: "Source account not found" });
    }

    if (senderAccount.BALANCE < amount) {
      return res.status(400).json({ success: false, message: "Insufficient funds" });
    }

    // 2. Check receiver account exists
    const receiverAccount = await accountModel.getAccountByNumber(toAccount);
    
    if (!receiverAccount) {
      return res.status(404).json({ success: false, message: "Recipient account not found" });
    }

    // 3. Perform the transfer
    await transactionModel.performTransfer(fromAccount, toAccount, amount);

    res.json({ success: true, message: "Transfer successful!" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get recent transactions for a customer
exports.getRecentTransactions = async (req, res, next) => {
  const customerId = req.params.customerId;

  try {
    const transactions = await transactionModel.getRecentTransactionsByCustomerId(customerId);
    res.json(transactions);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get transaction history for an account
exports.getTransactionHistory = async (req, res, next) => {
  const accountNumber = req.params.accountNumber;

  try {
    const transactions = await transactionModel.getTransactionsByAccountNumber(accountNumber);
    res.json(transactions);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
