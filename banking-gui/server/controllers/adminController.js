const adminModel = require('../models/adminModel');

// Get admin dashboard stats
exports.getStats = async (req, res, next) => {
  try {
    const stats = await adminModel.getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get recent system activity
exports.getRecentActivity = async (req, res, next) => {
  try {
    const activity = await adminModel.getRecentActivity();
    res.json(activity);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Get pending loan approvals
exports.getPendingApprovals = async (req, res, next) => {
  try {
    const approvals = await adminModel.getPendingLoanApprovals();
    res.json(approvals);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Approve or reject a loan
exports.updateLoanApproval = async (req, res, next) => {
  const { loanId } = req.params;
  const { action } = req.body;

  try {
    const newStatus = action === "approve" ? "Approved" : "Rejected";
    
    await adminModel.updateLoanStatus(loanId, newStatus);

    res.json({ success: true, message: `Loan ${newStatus}` });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
