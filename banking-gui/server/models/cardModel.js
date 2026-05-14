const oracledb = require("oracledb");
const dbConfig = require("../config/db");

// Get cards by customer ID
exports.getCardsByCustomerId = async (customerId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT 
          c.CARD_ID, 
          c.CARD_TYPE, 
          c.CARD_NUMBER, 
          c.EXPIRY_DATE, 
          c.CVV, 
          c.CARD_STATUS, 
          c.ACCOUNT_NUMBER,
          cust.FIRST_NAME || ' ' || cust.LAST_NAME as CARDHOLDER
       FROM CARD c
       JOIN CUSTOMER_ACCOUNT ca ON c.ACCOUNT_NUMBER = ca.ACCOUNT_NUMBER
       JOIN CUSTOMER cust ON ca.CUSTOMER_ID = cust.CUSTOMER_ID
       WHERE ca.CUSTOMER_ID = :id`,
      [customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};

// Get card status
exports.getCardStatus = async (cardId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT CARD_STATUS FROM CARD WHERE CARD_ID = :id`,
      [cardId]
    );

    return result.rows.length > 0 ? result.rows[0][0] : null;
  } finally {
    if (connection) await connection.close();
  }
};

// Update card status
exports.updateCardStatus = async (cardId, status) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `UPDATE CARD SET CARD_STATUS = :status WHERE CARD_ID = :id`,
      { status, id: cardId },
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
};

// Get cards by account number
exports.getCardsByAccountNumber = async (accountNumber) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT 
          c.CARD_ID, 
          c.CARD_TYPE, 
          c.CARD_NUMBER, 
          c.EXPIRY_DATE, 
          c.CVV, 
          c.CARD_STATUS, 
          c.CARD_LIMIT,
          c.ACCOUNT_NUMBER,
          cust.FIRST_NAME || ' ' || cust.LAST_NAME as CARDHOLDER
       FROM CARD c
       JOIN CUSTOMER_ACCOUNT ca ON c.ACCOUNT_NUMBER = ca.ACCOUNT_NUMBER
       JOIN CUSTOMER cust ON ca.CUSTOMER_ID = cust.CUSTOMER_ID
       WHERE c.ACCOUNT_NUMBER = :acc`,
      [accountNumber],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};

// Create a new card for an account
exports.createCardForAccount = async (accountNumber, cardType, cardLimit) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Generate new card ID
    const maxIdResult = await connection.execute(
      `SELECT NVL(MAX(card_id), 1000) + 1 AS next_id FROM card`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newCardId = maxIdResult.rows[0].NEXT_ID;

    // Generate random card number (16 digits) - use string to avoid JS precision loss
    let cardNumber = '';
    for (let i = 0; i < 16; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    const cvv = Math.floor(100 + Math.random() * 900).toString();

    // Expiry: 4 years from now
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 4);

    await connection.execute(
      `INSERT INTO card (card_id, account_number, card_type, expiry_date, issue_date, card_status, card_limit, card_number, cvv)
       VALUES (:cardId, :accountNumber, :cardType, :expiryDate, SYSDATE, 'Active', :cardLimit, :cardNumber, :cvv)`,
      {
        cardId: newCardId,
        accountNumber,
        cardType,
        expiryDate,
        cardLimit: cardType === 'Credit' ? (cardLimit || 5000) : null,
        cardNumber,
        cvv
      },
      { autoCommit: true }
    );

    return {
      cardId: newCardId,
      cardNumber,
      cvv,
      expiryDate
    };
  } finally {
    if (connection) await connection.close();
  }
};
