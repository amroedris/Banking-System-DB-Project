const oracledb = require("oracledb");
const dbConfig = require("../config/db");

// Get loans by customer ID
exports.getLoansByCustomerId = async (customerId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT *
      FROM loan
      WHERE customer_id = :id
      AND loan_state = 'ACTIVE' AND status = 'Approved'
      ORDER BY start_date DESC`,
      [customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};

// Get loan by ID
exports.getLoanById = async (loanId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT
          loan_amount,
          interest_rate,
          total_paid_off
       FROM loan
       WHERE loan_id = :lid`,
      { lid: loanId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    if (connection) await connection.close();
  }
};

// Create a new loan
exports.createLoan = async (loanData) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `INSERT INTO loan (
        loan_id,
        customer_id,
        loan_amount,
        interest_rate,
        due_date,
        status,
        loan_term,
        total_paid_off,
        loan_state,
        start_date,
        monthly_payment
      ) VALUES (
        loan_seq.NEXTVAL,
        :cid,
        :amt,
        :rate,
        ADD_MONTHS(SYSDATE, :term),
        'Pending',
        :term,
        0,
        'ACTIVE',
        SYSDATE,
        :monthly
      )`,
      {
        cid: loanData.customerId,
        amt: loanData.amount,
        rate: loanData.interestRate,
        term: loanData.term,
        monthly: loanData.monthlyPayment
      },
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
};

// Process loan payment
exports.processLoanPayment = async (loanId, accountNumber, amount, alreadyPaid, totalLoanWithInterest) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Deduct from account
    await connection.execute(
      `UPDATE account
       SET balance = balance - :amount
       WHERE account_number = :acc`,
      { amount, acc: accountNumber }
    );

    // Calculate new total paid
    const newTotalPaid = alreadyPaid + Number(amount);

    // Update loan
    await connection.execute(
      `UPDATE loan
       SET total_paid_off = :newTotalPaid
       WHERE loan_id = :lid`,
      { newTotalPaid, lid: loanId }
    );

    // Mark as PAID if complete
    if (newTotalPaid >= totalLoanWithInterest) {
      await connection.execute(
        `UPDATE loan
         SET loan_state = 'PAID'
         WHERE loan_id = :lid`,
        { lid: loanId }
      );
    }

    // Log the loan payment as a bank transaction
    await connection.execute(
      `INSERT INTO bank_transaction (
          transaction_id, transaction_type, amount, transaction_time,
          sender_account_number, status
       ) VALUES (
          transaction_seq.NEXTVAL, 'Payment', :amount, SYSDATE, :acc, 'Completed'
       )`,
      { amount, acc: accountNumber }
    );

    // Commit changes
    await connection.commit();

    return newTotalPaid;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.close();
  }
};
