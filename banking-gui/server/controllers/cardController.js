const cardModel = require('../models/cardModel');

// Get all cards for a customer
exports.getCustomerCards = async (req, res, next) => {
  const customerId = req.params.customerId;

  try {
    const cards = await cardModel.getCardsByCustomerId(customerId);
    res.json(cards);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Update card status (Freeze/Unfreeze/Cancel)
exports.updateCardStatus = async (req, res, next) => {
  const { cardId, newStatus } = req.body;

  // Map Frontend terms to database constraints
  let dbStatus;
  if (newStatus === 'Frozen') dbStatus = 'Blocked';
  else if (newStatus === 'Active') dbStatus = 'Active';
  else if (newStatus === 'Cancelled') dbStatus = 'Suspended';
  else dbStatus = newStatus;

  try {
    // Check current status to enforce "Cancelled stays Cancelled" rule
    const currentStatus = await cardModel.getCardStatus(cardId);

    if (currentStatus === 'Suspended') {
      return res.status(400).json({ 
        error: "This card is permanently suspended and cannot be changed." 
      });
    }

    // Update the card status
    await cardModel.updateCardStatus(cardId, dbStatus);

    res.status(200).send("Status updated successfully");
  } catch (err) {
    console.error("Database Error:", err);
    next(err);
  }
};

// Get cards by account number
exports.getAccountCards = async (req, res, next) => {
  const { accountNumber } = req.params;

  try {
    const cards = await cardModel.getCardsByAccountNumber(accountNumber);
    res.json(cards);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Create a new card for an account
exports.createCard = async (req, res, next) => {
  const { accountNumber, cardType, cardLimit } = req.body;

  try {
    const result = await cardModel.createCardForAccount(accountNumber, cardType, cardLimit);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
