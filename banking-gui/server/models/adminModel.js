const oracledb = require("oracledb");
const dbConfig = require("../config/db");

// Get dashboard stats
exports.getDashboardStats = async () => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Total bank liquidity
    const liquidityResult = await connection.execute(
      `SELECT NVL(SUM(balance), 0) AS TOTAL
      FROM account`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Total active customers
    const customersResult = await connection.execute(
      `SELECT COUNT(*) AS TOTAL
      FROM customer`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Pending loans
    const approvalsResult = await connection.execute(
      `SELECT COUNT(*) AS TOTAL
      FROM loan
      WHERE status = 'Pending'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return {
      liquidity: liquidityResult.rows[0].TOTAL,
      activeUsers: customersResult.rows[0].TOTAL,
      pendingApprovals: approvalsResult.rows[0].TOTAL
    };
  } finally {
    if (connection) await connection.close();
  }
};

// Get recent activity
exports.getRecentActivity = async () => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT *
      FROM (
        SELECT
          transaction_id,
          transaction_type,
          amount,
          transaction_time
        FROM bank_transaction
        ORDER BY transaction_time DESC
      )
      WHERE ROWNUM <= 5`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};

// Get pending loan approvals
exports.getPendingLoanApprovals = async () => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT
  l.loan_id,
  l.customer_id,
  l.loan_amount,
  l.loan_term,
  l.interest_rate,
  l.status,
  c.first_name || ' ' || c.last_name AS customer_name
FROM loan l
JOIN customer c
  ON l.customer_id = c.customer_id
WHERE l.status = 'Pending'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};

// Update loan status
exports.updateLoanStatus = async (loanId, status) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `UPDATE loan
      SET status = :status
      WHERE loan_id = :loanId`,
      { status, loanId },
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
};
