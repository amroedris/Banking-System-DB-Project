const express = require("express");
const cors = require("cors");
const oracledb = require("oracledb");
const { initDatabase } = require("./database-init");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING
};

const PORT = 3000;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database. Server not started:", err);
    process.exit(1);
  });



// TRANSFER ROUTE
// TRANSFER ROUTE (Updated)
app.post("/transfer", async (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. Check sender account exists, balance, AND STATUS
    const balanceResult = await connection.execute(
      `SELECT balance, status FROM account WHERE account_number = :acc`, // Added status
      { acc: fromAccount },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (balanceResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Source account not found" });
    }

    const accountData = balanceResult.rows[0];
    
    // NEW STATUS CHECK
    if (accountData.STATUS !== 'Active') {
      return res.status(400).json({ 
        success: false, 
        message: `Transfer failed: Source account is currently ${accountData.STATUS}.` 
      });
    }

    const currentBalance = accountData.BALANCE;

    if (currentBalance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient funds" });
    }

    // 2. Check receiver account exists AND STATUS
    const receiverResult = await connection.execute(
      `SELECT status FROM account WHERE account_number = :acc`,
      { acc: toAccount },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (receiverResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Recipient account not found" });
    }
    
    // Optional: Prevent transfers to inactive/closed accounts
    if (receiverResult.rows[0].STATUS !== 'Active') {
        return res.status(400).json({ success: false, message: "Recipient account is inactive/closed." });
    }

    // ... (rest of the logic: Step 3, 4, 5, 6 remain the same)
    // 3. Deduct from sender
    await connection.execute(
        `UPDATE account SET balance = balance - :amount WHERE account_number = :fromAcc`,
        { amount, fromAcc: fromAccount }
      );
  
      // 4. Add to receiver
      await connection.execute(
        `UPDATE account SET balance = balance + :amount WHERE account_number = :toAcc`,
        { amount, toAcc: toAccount }
      );
  
      // 5. Log the transaction
      await connection.execute(
        `INSERT INTO bank_transaction (
            transaction_id, transaction_type, amount, transaction_time,
            sender_account_number, receiver_account_number, status
         ) VALUES (
            transaction_seq.NEXTVAL, 'Transfer', :amount, SYSDATE, :fromAcc, :toAcc, 'Completed'
         )`,
        { amount, fromAcc: fromAccount, toAcc: toAccount }
      );
  
      // 6. Commit
      await connection.commit();
  
      res.json({ success: true, message: "Transfer successful!" });

  } catch (err) {
    console.error(err);
    if (connection) await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// LOGIN ROUTE
app.post("/login", async (req, res) => {
  const { us, pass } = req.body;
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
      [us, pass],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// ACCOUNTS ROUTE
app.get("/accounts/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
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

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// RECENT TRANSACTIONS ROUTE
app.get("/recent-transactions/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
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

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// ACCOUNT DETAILS ROUTE
app.get("/account-details/:accountNumber", async (req, res) => {
  const accountNumber = req.params.accountNumber;
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

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// TRANSACTION HISTORY ROUTE
app.get("/transactions/:accountNumber", async (req, res) => {
  const accountNumber = req.params.accountNumber;
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

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// FETCH ALL CARDS FOR A CUSTOMER
app.get("/cards/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
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
          c.CARD_LIMIT,
          cust.FIRST_NAME || ' ' || cust.LAST_NAME AS CARDHOLDER
       FROM CARD c
       JOIN CUSTOMER_ACCOUNT ca ON c.ACCOUNT_NUMBER = ca.ACCOUNT_NUMBER
       JOIN CUSTOMER cust ON ca.CUSTOMER_ID = cust.CUSTOMER_ID
       WHERE ca.CUSTOMER_ID = :id`,
      [customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

app.post('/cards/status', async (req, res) => {
    const { cardId, newStatus } = req.body;
    let connection;

    let dbStatus;
    if (newStatus === 'Frozen') dbStatus = 'Blocked';
    else if (newStatus === 'Active') dbStatus = 'Active';
    else if (newStatus === 'Cancelled') dbStatus = 'Suspended';
    else dbStatus = newStatus; 

    try {
        connection = await oracledb.getConnection(dbConfig);
        
        const checkResult = await connection.execute(
            `SELECT CARD_STATUS FROM CARD WHERE CARD_ID = :id`,
            [cardId]
        );

        // SAFETY CHECK: If no card found, return error instead of crashing
        if (!checkResult.rows || checkResult.rows.length === 0) {
            return res.status(404).json({ error: "Card not found" });
        }

        const currentStatus = checkResult.rows[0][0]; // Using default array format

        if (currentStatus === 'Suspended') {
            return res.status(400).json({ error: "This card is permanently suspended." });
        }

        await connection.execute(
            `UPDATE CARD SET CARD_STATUS = :status WHERE CARD_ID = :id`,
            { status: dbStatus, id: cardId },
            { autoCommit: true }
        );

        res.status(200).send("Status updated successfully");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (connection) await connection.close(); // Always close in finally
    }
});

// ADD THIS ROUTE TO index.js
app.get("/cards/account/:accountNumber", async (req, res) => {
  const accountNumber = req.params.accountNumber;
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
          c.CARD_LIMIT,
          cust.FIRST_NAME || ' ' || cust.LAST_NAME as CARDHOLDER
       FROM CARD c
       JOIN CUSTOMER_ACCOUNT ca ON c.ACCOUNT_NUMBER = ca.ACCOUNT_NUMBER
       JOIN CUSTOMER cust ON ca.CUSTOMER_ID = cust.CUSTOMER_ID
       WHERE c.ACCOUNT_NUMBER = :acc`,
      [accountNumber],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

app.post("/cards/apply", async (req, res) => {
  const { accountNumber, cardType } = req.body;
  let connection;
 
  // Only Debit and Credit are allowed via self-service
  if (!['Debit', 'Credit'].includes(cardType)) {
    return res.status(400).json({ success: false, message: "Invalid card type." });
  }
 
  try {
    connection = await oracledb.getConnection(dbConfig);
 
    // 1. Verify the account exists
    const accountCheck = await connection.execute(
      `SELECT account_number FROM account WHERE account_number = :acc`,
      { acc: accountNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }
 
    // 2. Prevent duplicate pending/active cards of the same type on the same account
    const duplicateCheck = await connection.execute(
      `SELECT card_id FROM card
       WHERE account_number = :acc
         AND card_type = :type
         AND card_status IN ('Active', 'Pending')`,
      { acc: accountNumber, type: cardType },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `You already have an active or pending ${cardType} card on this account.`
      });
    }
 
    // 3. Get next Card ID
    const maxResult = await connection.execute(
      `SELECT NVL(MAX(card_id), 5000) + 1 AS next_id FROM card`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newCardId = maxResult.rows[0].NEXT_ID;
 
    // 4. Auto-generate card number (16 digits, starts with 4) and CVV
    const cardNumber = '4' + Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
    const cvv = Math.floor(100 + Math.random() * 900).toString();
 
    // 5. Set card limit: NULL for Debit, 50000 for Credit
    const cardLimit = cardType === 'Credit' ? 50000 : null;
 
    // 6. Insert the card with Pending status
    await connection.execute(
      `INSERT INTO card (card_id, card_type, card_limit, card_number, issue_date, expiry_date, cvv, card_status, account_number)
       VALUES (:id, :type, :limit, :num, SYSDATE, ADD_MONTHS(SYSDATE, 48), :cvv, 'Pending', :accNum)`,
      {
        id:     newCardId,
        type:   cardType,
        limit:  cardLimit,
        num:    cardNumber,
        cvv:    cvv,
        accNum: accountNumber
      },
      { autoCommit: true }
    );
 
    res.json({ success: true, message: "Card application submitted! Pending approval." });
 
  } catch (err) {
    console.error("Error applying for card:", err);
    if (connection) await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.get("/loans/:customerId", async (req, res) => {

  let connection;

  try {

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT *
      FROM loan
      WHERE customer_id = :id
      AND loan_state = 'ACTIVE' AND status = 'Approved'
      ORDER BY start_date DESC`,
      [req.params.customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).send(err.message);

  } finally {

    if (connection)
      await connection.close();

  }

});
// APPLY FOR NEW LOAN
// APPLY FOR NEW LOAN
app.post("/loans/apply", async (req, res) => {
  const { customerId, amount, term, interestRate } = req.body;

  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // Total amount INCLUDING interest
    const totalAmount =
      Number(amount) +
      (Number(amount) * Number(interestRate) / 100);

    // Monthly installment
    const monthlyPayment = totalAmount / Number(term);

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
        cid: customerId,
        amt: amount,
        rate: interestRate,
        term: term,
        monthly: monthlyPayment
      },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: "Loan approved!"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  } finally {

    if (connection)
      await connection.close();

  }
});

// MAKE LOAN PAYMENT
app.post("/loans/pay", async (req, res) => {

  const { loanId, accountNumber, amount } = req.body;

  let connection;

  try {

    connection = await oracledb.getConnection(dbConfig);

    // ---------------------------
    // GET ACCOUNT BALANCE
    // ---------------------------
    const accountResult = await connection.execute(
      `SELECT balance
       FROM account
       WHERE account_number = :acc`,
      { acc: accountNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    const currentBalance =
      Number(accountResult.rows[0].BALANCE);

    if (currentBalance < amount) {
      return res.status(400).json({
        message: "Insufficient funds"
      });
    }

    // ---------------------------
    // GET LOAN DATA
    // ---------------------------
    const loanResult = await connection.execute(
      `SELECT
          loan_amount,
          interest_rate,
          total_paid_off
       FROM loan
       WHERE loan_id = :lid`,
      { lid: loanId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (loanResult.rows.length === 0) {
      return res.status(404).json({
        message: "Loan not found"
      });
    }

    const loan = loanResult.rows[0];

    const totalLoanWithInterest =
      Number(loan.LOAN_AMOUNT) +
      (
        Number(loan.LOAN_AMOUNT) *
        Number(loan.INTEREST_RATE) / 100
      );

    const alreadyPaid =
      Number(loan.TOTAL_PAID_OFF || 0);

    const remaining =
      totalLoanWithInterest - alreadyPaid;

    // ---------------------------
    // PREVENT OVERPAYMENT
    // ---------------------------
    if (Number(amount) > remaining) {
      return res.status(400).json({
        message:
          `Payment exceeds remaining balance ($${remaining.toFixed(2)})`
      });
    }

    // ---------------------------
    // DEDUCT FROM ACCOUNT
    // ---------------------------
    await connection.execute(
      `UPDATE account
       SET balance = balance - :amount
       WHERE account_number = :acc`,
      {
        amount,
        acc: accountNumber
      }
    );

    // ---------------------------
    // NEW TOTAL PAID
    // ---------------------------
    const newTotalPaid =
      alreadyPaid + Number(amount);

    // ---------------------------
    // UPDATE LOAN
    // ---------------------------
    await connection.execute(
      `UPDATE loan
       SET total_paid_off = :newTotalPaid
       WHERE loan_id = :lid`,
      {
        newTotalPaid,
        lid: loanId
      }
    );

    // ---------------------------
    // MARK AS PAID IF COMPLETE
    // ---------------------------
    if (newTotalPaid >= totalLoanWithInterest) {

      await connection.execute(
        `UPDATE loan
         SET loan_state = 'PAID'
         WHERE loan_id = :lid`,
        { lid: loanId }
      );

    }

    // ---------------------------
    // SAVE CHANGES
    // ---------------------------
    await connection.commit();

    res.json({
      success: true,
      message: "Payment successful",
      newTotalPaid,
      remainingBalance:
        totalLoanWithInterest - newTotalPaid
    });

  } catch (err) {

    console.error(err);

    if (connection)
      await connection.rollback();

    res.status(500).json({
      message: err.message
    });

  } finally {

    if (connection)
      await connection.close();

  }

});

app.get("/customer/:customerId", async (req, res) => {

  const customerId = req.params.customerId;

  let connection;

  try {

    connection = await oracledb.getConnection(dbConfig);

const result = await connection.execute(
  `
  SELECT
      c.first_name,
      c.last_name,
      c.email,
      c.street,
      c.city,
      c.governorate,
      cp.customer_phone AS phone
  FROM customer c
  LEFT JOIN customer_phone cp
    ON c.customer_id = cp.customer_id
  WHERE c.customer_id = :id
  `,
  [customerId],
  { outFormat: oracledb.OUT_FORMAT_OBJECT }
);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);
    res.status(500).send(err.message);

  } finally {

    if (connection)
      await connection.close();

  }

});

app.put("/customer/:customerId", async (req, res) => {

  const customerId = req.params.customerId;

  const {
    firstName,
    lastName,
    email,
    phone,
    street,
    city,
    governorate
  } = req.body;

  let connection;

  try {

    connection = await oracledb.getConnection(dbConfig);

    // UPDATE CUSTOMER TABLE
    await connection.execute(
      `
      UPDATE Customer
      SET
        First_Name = :firstName,
        Last_Name = :lastName,
        Email = :email,
        Street = :street,
        City = :city,
        Governorate = :governorate
      WHERE Customer_ID = :customerId
      `,
      {
        firstName,
        lastName,
        email,
        street,
        city,
        governorate,
        customerId
      }
    );

// Only touch CUSTOMER_PHONE if a phone value was actually provided
if (phone && String(phone).trim() !== '') {
  
  // Check if phone belongs to another customer
  const duplicatePhone = await connection.execute(
    `SELECT CUSTOMER_ID FROM CUSTOMER_PHONE
     WHERE CUSTOMER_PHONE = :phone AND CUSTOMER_ID != :customerId`,
    { phone, customerId },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (duplicatePhone.rows.length > 0) {
    await connection.rollback(); // ← rollback the Customer UPDATE too
    return res.status(400).json({ message: "Phone number already used by another customer" });
  }

  // Delete old entry (if any) then insert new one
  await connection.execute(
    `DELETE FROM CUSTOMER_PHONE WHERE CUSTOMER_ID = :customerId`,
    { customerId }
  );

  await connection.execute(
    `INSERT INTO CUSTOMER_PHONE (CUSTOMER_ID, CUSTOMER_PHONE) VALUES (:customerId, :phone)`,
    { customerId, phone }
  );
}

await connection.commit();

    res.json({
      message: "Customer information updated"
    });

  } catch (err) {

    console.error(err);

    if (connection)
      await connection.rollback();

    res.status(500).send(err.message);

  } finally {

    if (connection)
      await connection.close();

  }

});

app.put("/customer-password/:customerId", async (req, res) => {

  const customerId = req.params.customerId;

  const {
    currentPassword,
    newPassword
  } = req.body;

  let connection;

  try {

    connection = await oracledb.getConnection(dbConfig);

    const check = await connection.execute(
      `SELECT password
       FROM customer
       WHERE customer_id = :id`,
      [customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (
      check.rows.length === 0
    ) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    if (
      check.rows[0].PASSWORD !== currentPassword
    ) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    await connection.execute(
      `UPDATE customer
       SET password = :newPassword
       WHERE customer_id = :id`,
      {
        newPassword,
        id: customerId
      },
      { autoCommit: true }
    );

    res.json({
      message: "Password updated successfully"
    });

  } catch (err) {

    console.error(err);
    res.status(500).send(err.message);

  } finally {

    if (connection)
      await connection.close();

  }

});

app.post("/staff-login", async (req, res) => {

  const { us, pass } = req.body;

  let connection;

  try {

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `
      SELECT
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
      AND password = :pass
      `,
      { us, pass },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length > 0) {

      res.json({
        success: true,
        user: result.rows[0]   // IMPORTANT (match frontend)
      });

    } else {

      res.json({
        success: false,
        message: "Invalid staff credentials"
      });

    }

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  } finally {

    if (connection)
      await connection.close();

  }

});

// ADMIN DASHBOARD STATS
app.get("/admin/stats", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const liquidityResult = await connection.execute(
      `SELECT NVL(SUM(balance), 0) AS TOTAL FROM account`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const customersResult = await connection.execute(
      `SELECT COUNT(*) AS TOTAL FROM customer`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // ✅ NOW COUNTS BOTH pending loans AND pending cards
    const approvalsResult = await connection.execute(
      `SELECT 
        (SELECT COUNT(*) FROM loan WHERE status = 'Pending') +
        (SELECT COUNT(*) FROM card WHERE card_status = 'Pending') AS TOTAL
       FROM dual`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      liquidity: liquidityResult.rows[0].TOTAL,
      activeUsers: customersResult.rows[0].TOTAL,
      pendingApprovals: approvalsResult.rows[0].TOTAL
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// RECENT SYSTEM ACTIVITY
app.get("/admin/activity", async (req, res) => {

  let connection;

  try {

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `
      SELECT *
      FROM (
        SELECT
          transaction_id,
          transaction_type,
          amount,
          transaction_time
        FROM bank_transaction
        ORDER BY transaction_time DESC
      )
      WHERE ROWNUM <= 5
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  } finally {

    if (connection)
      await connection.close();

  }

});

// GET PENDING LOAN APPROVALS
app.get("/approvals", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Pending loans
    const loansResult = await connection.execute(
      `SELECT
        l.loan_id   AS ID,
        l.loan_amount,
        l.loan_term,
        c.first_name || ' ' || c.last_name AS customer_name,
        'loan' AS request_type
       FROM loan l
       JOIN customer c ON l.customer_id = c.customer_id
       WHERE l.status = 'Pending'`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Pending cards
    const cardsResult = await connection.execute(
      `SELECT
        cd.card_id   AS ID,
        cd.card_type,
        cd.card_limit,
        c.first_name || ' ' || c.last_name AS customer_name,
        'card' AS request_type
       FROM card cd
       JOIN customer_account ca ON cd.account_number = ca.account_number
       JOIN customer c ON ca.customer_id = c.customer_id
       WHERE cd.card_status = 'Pending'`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Total loans applied today (unchanged)
    const countResult = await connection.execute(
      `SELECT COUNT(*) AS TOTAL FROM loan WHERE TRUNC(start_date) = TRUNC(SYSDATE)`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      requests: [...loansResult.rows, ...cardsResult.rows],
      totalToday: countResult.rows[0].TOTAL
    });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

app.put("/approvals/:loanId", async (req, res) => {

  const { loanId } = req.params;

  const { action } = req.body;

  let connection;

  try {

    connection = await oracledb.getConnection(dbConfig);

    let newStatus;

    if (action === "approve") {
      newStatus = "Approved";
    } else {
      newStatus = "Rejected";
    }

    await connection.execute(
      `
      UPDATE loan
      SET status = :status
      WHERE loan_id = :loanId
      `,
      {
        status: newStatus,
        loanId
      },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: `Loan ${newStatus}`
    });

  } catch (err) {

    console.error(err);

    res.status(500).send(err.message);

  } finally {

    if (connection)
      await connection.close();

  }

});

app.put("/approvals/card/:cardId", async (req, res) => {
  const { cardId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const newStatus = action === "approve" ? "Active" : "Suspended";

    await connection.execute(
      `UPDATE card SET card_status = :status WHERE card_id = :cardId`,
      { status: newStatus, cardId },
      { autoCommit: true }
    );

    res.json({ success: true, message: `Card ${newStatus}` });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// GET ALL STAFF (optionally filtered by supervisorId)
app.get("/staff", async (req, res) => {
  const { supervisorId } = req.query;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    let query = `
      SELECT
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.supervisor_id,
        j.job_title
      FROM employees e
      JOIN jobs j ON e.job_id = j.job_id
    `;

    const params = {};

    if (supervisorId) {
      query += ` WHERE e.supervisor_id = :supervisorId OR e.employee_id = :supervisorId`;
      params.supervisorId = supervisorId;
    }

    query += ` ORDER BY e.employee_id`;

    const result = await connection.execute(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// CREATE NEW STAFF MEMBER
app.post("/staff", async (req, res) => {
  const { firstName, middleName, lastName, email, salary, username, password, role, depId, supervisorId, phones } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. Generate new Employee ID
    const maxResult = await connection.execute(
      `SELECT NVL(MAX(employee_id), 1000) + 1 AS next_id FROM employees`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newEmployeeId = maxResult.rows[0].NEXT_ID;

    // 2. Resolve role name → job_id
    const jobIdResult = await connection.execute(
      `SELECT job_id FROM jobs WHERE job_title = :role`,
      { role: role || 'Teller' },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (jobIdResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: `Role "${role}" not found in Jobs table.` });
    }
    const resolvedJobId = jobIdResult.rows[0].JOB_ID;

    // 3. Insert the employee
    await connection.execute(
      `INSERT INTO employees (
        employee_id, first_name, middle_name, last_name, email,
        salary, hire_date, username, password,
        branch_id, job_id, dep_id, supervisor_id
      ) VALUES (
        :employeeId, :firstName, :middleName, :lastName, :email,
        :salary, SYSDATE, :username, :password,
        :branchId, :jobId, :depId, :supervisorId
      )`,
      {
        employeeId:   newEmployeeId,
        firstName,
        middleName:   middleName   || null,
        lastName,
        email,
        salary:       salary       || 0,
        username,
        password,
        branchId:     101,
        jobId:        resolvedJobId,
        depId:        depId        || 10,
        supervisorId: supervisorId || null
      }
    );

    // 4. Insert phone numbers if provided
    if (phones && phones.length > 0) {
      for (const phone of phones) {
        if (phone && String(phone).trim() !== '') {
          await connection.execute(
            `INSERT INTO employee_phone (employee_id, employee_phone)
             VALUES (:empId, :phone)`,
            { empId: newEmployeeId, phone: String(phone).trim() }
          );
        }
      }
    }

    await connection.commit();
    res.json({ success: true, employeeId: newEmployeeId });

  } catch (err) {
    console.error("Error creating staff:", err);
    if (connection) await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// UPDATE STAFF MEMBER
app.put("/staff/:employeeId", async (req, res) => {
  const { employeeId } = req.params;
  const { firstName, lastName, email, role } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `UPDATE employees e
       SET e.first_name = :firstName,
           e.last_name  = :lastName,
           e.email      = :email,
           e.job_id     = (SELECT job_id FROM jobs WHERE job_title = :role)
       WHERE e.employee_id = :employeeId`,
      { firstName, lastName, email, role, employeeId },
      { autoCommit: true }
    );

    res.json({ success: true, message: "Staff updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE STAFF MEMBER
app.delete("/staff/:employeeId", async (req, res) => {
  const { employeeId } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `DELETE FROM employees WHERE employee_id = :employeeId`,
      { employeeId },
      { autoCommit: true }
    );

    res.json({ success: true, message: "Staff removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.get("/staff/customer/:id", async (req, res) => {
  const customerId = req.params.id;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // CUSTOMER INFO
    const customerResult = await connection.execute(
      `
      SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        c.street,
        c.city,
        c.governorate,
        cp.customer_phone
      FROM customer c
      LEFT JOIN customer_phone cp
        ON c.customer_id = cp.customer_id
      WHERE c.customer_id = :id
      `,
      { id: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // CUSTOMER ACCOUNTS
    const accountsResult = await connection.execute(
      `
      SELECT
        a.account_number,
        a.account_type,
        a.balance,
        a.status
      FROM customer_account ca
      JOIN account a
        ON ca.account_number = a.account_number
      WHERE ca.customer_id = :id
      `,
      { id: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // RECENT TRANSACTIONS
    const transactionsResult = await connection.execute(
      `
      SELECT *
      FROM (
        SELECT
          transaction_id,
          transaction_type,
          amount,
          transaction_time,
          status
        FROM bank_transaction bt
        WHERE bt.sender_account_number IN (
          SELECT account_number
          FROM customer_account
          WHERE customer_id = :id
        )
        OR bt.receiver_account_number IN (
          SELECT account_number
          FROM customer_account
          WHERE customer_id = :id
        )
        ORDER BY transaction_time DESC
      )
      WHERE ROWNUM <= 10
      `,
      { id: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      customer: customerResult.rows[0],
      accounts: accountsResult.rows,
      transactions: transactionsResult.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.get("/staff/customers", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `
      SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        c.national_id,
        NVL(SUM(a.balance), 0) AS balance,
        UPPER(NVL(MAX(a.status), 'Inactive')) AS status
      FROM customer c
      LEFT JOIN customer_account ca
        ON c.customer_id = ca.customer_id
      LEFT JOIN account a
        ON ca.account_number = a.account_number
      GROUP BY c.customer_id, c.first_name, c.last_name, c.national_id
      ORDER BY c.customer_id
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.put("/staff/customer/:id/freeze", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Transform frontend labels ('FROZEN'/'ACTIVE') to database valid syntax values ('Inactive'/'Active')
  const mappedStatus = status === "FROZEN" ? "Inactive" : "Active";

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `
      UPDATE account
      SET status = :status
      WHERE account_number IN (
        SELECT account_number 
        FROM customer_account 
        WHERE customer_id = :id
      )
      `,
      {
        status: mappedStatus,
        id: id
      },
      { autoCommit: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.put("/staff/account/:accountNumber/freeze", async (req, res) => {
  const { accountNumber } = req.params;
  const { status } = req.body; // Expects values normalized to Check Constraints: 'Active' or 'Inactive'

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `
      UPDATE account
      SET status = :status
      WHERE account_number = :accountNumber
      `,
      {
        status: status,
        accountNumber: accountNumber
      },
      { autoCommit: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// CLOSE AN ACCOUNT
app.put("/staff/account/:accountNumber/close", async (req, res) => {
  const { accountNumber } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // Safety check: prevent closing an account with remaining balance
    const balanceCheck = await connection.execute(
      `SELECT balance FROM account WHERE account_number = :acc`,
      { acc: accountNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (balanceCheck.rows.length === 0)
      return res.status(404).json({ message: "Account not found" });

    if (Number(balanceCheck.rows[0].BALANCE) > 0)
      return res.status(400).json({ message: "Cannot close an account with a remaining balance." });

    await connection.execute(
      `UPDATE account SET status = 'Closed' WHERE account_number = :acc`,
      { acc: accountNumber },
      { autoCommit: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// CREATE NEW ACCOUNT FOR EXISTING CUSTOMER
app.post("/staff/customer/:id/accounts", async (req, res) => {
  const customerId = req.params.id;
  const { accountType, initialDeposit, branchId } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    
    // 1. Generate new account number
    const maxResult = await connection.execute(
      `SELECT NVL(MAX(account_number), 100000000000) + 1 AS next_num FROM account`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newAccountNumber = maxResult.rows[0].NEXT_NUM;

    // 2. Create the account
    await connection.execute(
      `INSERT INTO account (account_number, account_type, balance, status, branch_id)
       VALUES (:accountNumber, :accountType, :balance, 'Active', :branchId)`,
      {
        accountNumber: newAccountNumber,
        accountType: accountType || 'Savings',
        balance: initialDeposit || 0,
        branchId: branchId || 101
      }
    );

    // 3. Link account to the customer
    await connection.execute(
      `INSERT INTO customer_account (customer_id, account_number)
       VALUES (:customerId, :accountNumber)`,
      { customerId, accountNumber: newAccountNumber }
    );

    await connection.commit();
    res.json({ success: true, accountNumber: newAccountNumber });
  } catch (err) {
    console.error(err);
    if (connection) await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ISSUE NEW CARD TO A SPECIFIC ACCOUNT
// ISSUE NEW CARD TO A SPECIFIC ACCOUNT
// ISSUE NEW CARD TO A SPECIFIC ACCOUNT
app.post("/staff/account/:accountNumber/cards", async (req, res) => {
  const { accountNumber } = req.params;
  const { cardType, cardLimit } = req.body; // <-- Now capturing cardLimit
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. Get next Card ID
    const maxResult = await connection.execute(
      `SELECT NVL(MAX(card_id), 5000) + 1 AS next_id FROM card`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newCardId = maxResult.rows[0].NEXT_ID;

    // 2. Generate Bank Data (16 digit number, 3 digit CVV)
    const cardNumber = '4' + Math.floor(100000000000000 + Math.random() * 900000000000000).toString();
    const cvv = Math.floor(100 + Math.random() * 900).toString();

    // 3. Insert into database (ADDED card_limit)
    await connection.execute(
      `INSERT INTO card (card_id, card_type, card_limit, card_number, issue_date, expiry_date, cvv, card_status, account_number)
       VALUES (:id, :type, :limit, :num, SYSDATE, ADD_MONTHS(SYSDATE, 48), :cvv, 'Active', :accNum)`,
      {
        id: newCardId,
        type: cardType || 'Debit',
        limit: cardLimit || null, // <-- Sends limit for Credit, NULL for Debit
        num: cardNumber,
        cvv: cvv,
        accNum: accountNumber
      },
      { autoCommit: true }
    );

    res.json({ success: true, message: "Card issued successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// UPDATE CREDIT CARD LIMIT
app.put("/staff/cards/:cardId/limit", async (req, res) => {
  const { cardId } = req.params;
  const { newLimit } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `UPDATE card SET card_limit = :newLimit WHERE card_id = :cardId`,
      { newLimit, cardId },
      { autoCommit: true }
    );
    res.json({ success: true, message: "Limit updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// ==========================================
// FULL TRANSACTION LOGS FOR STAFF DASHBOARD
// ==========================================
app.get("/staff/transactions", async (req, res) => {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // Double LEFT JOIN: 
    // 1st gets the Sender's name by linking their account to the customer table
    // 2nd gets the Receiver's name by linking their account to the customer table
    const result = await connection.execute(
      `SELECT
          bt.transaction_id,
          bt.transaction_type,
          bt.amount,
          bt.transaction_time,
          bt.status,
          bt.sender_account_number,
          bt.receiver_account_number,
          c_sender.first_name || ' ' || c_sender.last_name AS sender_name,
          c_receiver.first_name || ' ' || c_receiver.last_name AS receiver_name
       FROM bank_transaction bt
       LEFT JOIN customer_account ca_sender 
         ON bt.sender_account_number = ca_sender.account_number
       LEFT JOIN customer c_sender 
         ON ca_sender.customer_id = c_sender.customer_id
       LEFT JOIN customer_account ca_receiver 
         ON bt.receiver_account_number = ca_receiver.account_number
       LEFT JOIN customer c_receiver 
         ON ca_receiver.customer_id = c_receiver.customer_id
       ORDER BY bt.transaction_time DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// ==========================================
// CREATE NEW CUSTOMER (ONBOARDING)
// ==========================================
app.post("/staff/customers", async (req, res) => {
  const customerData = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. Generate a new sequential Customer ID
    const maxCustResult = await connection.execute(
      `SELECT NVL(MAX(customer_id), 1000) + 1 AS next_id FROM customer`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newCustomerId = maxCustResult.rows[0].NEXT_ID;

    // 2. Insert into main CUSTOMER table 
    // (Note: TO_DATE is used to safely convert the React HTML date string for Oracle)
    await connection.execute(
      `INSERT INTO customer (
        customer_id, first_name, middle_name, last_name, email, street, city, governorate,
        national_id, dob, username, password
      ) VALUES (
        :customerId, :firstName, :middleName, :lastName, :email, :street, :city, :governorate,
        :nationalId, TO_DATE(:dob, 'YYYY-MM-DD'), :username, :password
      )`,
      {
        customerId: newCustomerId,
        firstName: customerData.firstName,
        middleName: customerData.middleName || null,
        lastName: customerData.lastName,
        email: customerData.email,
        street: customerData.street,
        city: customerData.city,
        governorate: customerData.governorate,
        nationalId: customerData.nationalId,
        dob: customerData.dob,
        username: customerData.username,
        password: customerData.password,
      }
    );

    // 3. Insert into CUSTOMER_PHONE table if they provided a phone number
    if (customerData.phone && customerData.phone.trim() !== "") {
      await connection.execute(
        `INSERT INTO customer_phone (customer_id, customer_phone)
         VALUES (:customerId, :phone)`,
        { customerId: newCustomerId, phone: customerData.phone }
      );
    }

    // 4. Save all changes permanently
    await connection.commit();
    
    // 5. Send the new ID back to React so it can display the success screen
    res.json({ success: true, customerId: newCustomerId });

  } catch (err) {
    console.error("Error creating customer:", err);
    if (connection) await connection.rollback(); // Undo everything if it fails
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});