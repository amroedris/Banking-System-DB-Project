const oracledb = require("oracledb");
const dbConfig = require("../config/db");

// Authenticate customer
exports.authenticateCustomer = async (username, password) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT c.customer_id,
              c.first_name,
              c.last_name,
              NVL(SUM(a.balance), 0) AS total_balance
       FROM customer c
       LEFT JOIN customer_account ca ON c.customer_id = ca.customer_id
       LEFT JOIN account a ON ca.account_number = a.account_number
       WHERE c.username = :us
       AND c.password = :pass
       GROUP BY c.customer_id, c.first_name, c.last_name`,
      [username, password],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    if (connection) await connection.close();
  }
};

// Authenticate staff
exports.authenticateStaff = async (username, password) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT
        employee_id,
        first_name,
        last_name,
        email,
        branch_id,
        job_id,
        dep_id,
        username
      FROM employees
      WHERE username = :us
      AND password = :pass`,
      { us: username, pass: password },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    if (connection) await connection.close();
  }
};
