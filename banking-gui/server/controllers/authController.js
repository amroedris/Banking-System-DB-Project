const authModel = require('../models/authModel');

// Customer login
exports.customerLogin = async (req, res, next) => {
  const { us, pass } = req.body;

  try {
    const user = await authModel.authenticateCustomer(us, pass);
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Staff login
exports.staffLogin = async (req, res, next) => {
  const { us, pass } = req.body;

  try {
    const user = await authModel.authenticateStaff(us, pass);
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: "Invalid staff credentials" });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};
