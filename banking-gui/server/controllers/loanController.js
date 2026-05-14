const loanModel = require('../models/loanModel');
const accountModel = require('../models/accountModel');

// Get loans for a customer
exports.getCustomerLoans = async (req, res, next) => {
  try {
    const loans = await loanModel.getLoansByCustomerId(req.params.customerId);
    res.json(loans);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Apply for a new loan
exports.applyForLoan = async (req, res, next) => {
  const { customerId, amount, term, interestRate } = req.body;

  try {
    // Calculate total amount including interest
    const totalAmount = Number(amount) + (Number(amount) * Number(interestRate) / 100);
    
    // Calculate monthly installment
    const monthlyPayment = totalAmount / Number(term);

    await loanModel.createLoan({
      customerId,
      amount,
      interestRate,
      term,
      monthlyPayment
    });

    res.json({ success: true, message: "Loan approved!" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Make a loan payment
exports.makeLoanPayment = async (req, res, next) => {
  const { loanId, accountNumber, amount } = req.body;

  try {
    // Get account balance
    const account = await accountModel.getAccountByNumber(accountNumber);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const currentBalance = Number(account.BALANCE);

    if (currentBalance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Get loan data
    const loan = await loanModel.getLoanById(loanId);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const totalLoanWithInterest = 
      Number(loan.LOAN_AMOUNT) + 
      (Number(loan.LOAN_AMOUNT) * Number(loan.INTEREST_RATE) / 100);

    const alreadyPaid = Number(loan.TOTAL_PAID_OFF || 0);
    const remaining = totalLoanWithInterest - alreadyPaid;

    // Prevent overpayment
    if (Number(amount) > remaining) {
      return res.status(400).json({
        message: `Payment exceeds remaining balance ($${remaining.toFixed(2)})`
      });
    }

    // Process the payment
    const newTotalPaid = await loanModel.processLoanPayment(
      loanId, 
      accountNumber, 
      amount, 
      alreadyPaid,
      totalLoanWithInterest
    );

    res.json({
      success: true,
      message: "Payment successful",
      newTotalPaid,
      remainingBalance: totalLoanWithInterest - newTotalPaid
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
