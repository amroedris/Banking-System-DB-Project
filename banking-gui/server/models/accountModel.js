const oracledb = require("oracledb");
const dbConfig = require("../config/db");

// Get accounts by customer ID
exports.getAccountsByCustomerId = async (customerId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT
          a.account_number,
          a.account_type,
          a.balance,
          a.status
       FROM customer_account ca
       JOIN account a ON ca.account_number = a.account_number
       WHERE ca.customer_id = :id`,
      [customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};

// Get account by account number
exports.getAccountByNumber = async (accountNumber) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT
          account_number,
          account_type,
          balance,
          status,
          branch_id
       FROM account
       WHERE account_number = :acc`,
      [accountNumber],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    if (connection) await connection.close();
  }
};
