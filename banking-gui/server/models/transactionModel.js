const oracledb = require("oracledb");
const dbConfig = require("../config/db");

// Perform transfer between accounts
exports.performTransfer = async (fromAccount, toAccount, amount) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Deduct from sender
    await connection.execute(
      `UPDATE account SET balance = balance - :amount WHERE account_number = :fromAcc`,
      { amount, fromAcc: fromAccount }
    );

    // Add to receiver
    await connection.execute(
      `UPDATE account SET balance = balance + :amount WHERE account_number = :toAcc`,
      { amount, toAcc: toAccount }
    );

    // Log the transaction
    await connection.execute(
      `INSERT INTO bank_transaction (
          transaction_id, transaction_type, amount, transaction_time,
          sender_account_number, receiver_account_number, status
       ) VALUES (
          transaction_seq.NEXTVAL, 'Transfer', :amount, SYSDATE, :fromAcc, :toAcc, 'Completed'
       )`,
      { amount, fromAcc: fromAccount, toAcc: toAccount }
    );

    // Commit the transaction
    await connection.commit();
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.close();
  }
};

// Get recent transactions by customer ID
exports.getRecentTransactionsByCustomerId = async (customerId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT *
       FROM (
            SELECT
                bt.transaction_id,
                bt.transaction_type,
                bt.amount,
                bt.transaction_time,
                bt.sender_account_number,
                bt.receiver_account_number,
                bt.status
            FROM bank_transaction bt
            JOIN customer_account ca
              ON bt.sender_account_number = ca.account_number
              OR bt.receiver_account_number = ca.account_number
            WHERE ca.customer_id = :id
            ORDER BY bt.transaction_time DESC
       )
       WHERE ROWNUM <= 5`,
      [customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};

// Get transactions by account number
exports.getTransactionsByAccountNumber = async (accountNumber) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT
          transaction_id,
          transaction_type,
          amount,
          transaction_time,
          sender_account_number,
          receiver_account_number,
          status
       FROM bank_transaction
       WHERE sender_account_number = :acc
          OR receiver_account_number = :acc
       ORDER BY transaction_time DESC`,
      { acc: accountNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};
