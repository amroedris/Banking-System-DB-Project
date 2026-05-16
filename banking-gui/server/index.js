const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const oracledb = require("oracledb");
const { initDatabase } = require("./database-init");
require("dotenv").config();

const app = express();

// Utility function to calculate age from DOB
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

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
      `SELECT
          c.customer_id,
          c.first_name,
          c.last_name,
          c.password,
          NVL(SUM(a.balance), 0) AS total_balance
       FROM customer c
       LEFT JOIN customer_account ca
         ON c.customer_id = ca.customer_id
       LEFT JOIN account a
         ON ca.account_number = a.account_number
       WHERE c.username = :us
       GROUP BY
         c.customer_id,
         c.first_name,
         c.last_name,
         c.password`,
      { us },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const user = result.rows[0];

    // Compare entered password with hash
    const passwordMatch = await bcrypt.compare(
      pass,
      user.PASSWORD
    );

    if (!passwordMatch) {
      return res.json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Remove password before sending response
    delete user.PASSWORD;

    res.json({
      success: true,
      user
    });

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
      `SELECT * FROM (
        SELECT DISTINCT
            bt.transaction_id,
            bt.transaction_type,
            bt.amount,
            bt.transaction_time,
            bt.sender_account_number,
            bt.receiver_account_number,
            bt.status
        FROM bank_transaction bt
        JOIN customer_account ca
          ON (bt.sender_account_number = ca.account_number OR bt.receiver_account_number = ca.account_number)
        WHERE ca.customer_id = :id
        ORDER BY bt.transaction_time DESC
      ) WHERE ROWNUM <= 5`,
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
      AND loan_state = 'ACTIVE' AND status IN ('Approved', 'Pending')
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
app.post("/loans/apply", async (req, res) => {
  const { customerId, amount, term, interestRate } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // --- RULE 1: AGE CHECK (Must be 18+) ---
    const customerRes = await connection.execute(
      `SELECT dob FROM customer WHERE customer_id = :cid`,
      { cid: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (customerRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const dob = customerRes.rows[0].DOB;
    if (dob) {
      const age = calculateAge(dob);
      if (age < 18) {
        return res.status(400).json({
          success: false,
          message: "Application Denied: You must be at least 18 years old to apply for a loan."
        });
      }
    }

    // --- RULE 2: MUST HAVE AN ACTIVE ACCOUNT ---
    const accountCheck = await connection.execute(
      `SELECT COUNT(*) AS active_count 
       FROM customer_account ca
       JOIN account a ON ca.account_number = a.account_number
       WHERE ca.customer_id = :cid AND a.status = 'Active'`,
      { cid: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (accountCheck.rows[0].ACTIVE_COUNT === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Application Denied: You must have at least one active bank account to receive loan funds." 
      });
    }



    // --- ALL CHECKS PASSED: PROCESS THE LOAN ---
    
    // Total amount INCLUDING interest
    const totalAmount = Number(amount) + (Number(amount) * Number(interestRate) / 100);

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
      message: "Loan application submitted successfully! It is now pending staff review."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Database Error: " + err.message
    });
  } finally {
    if (connection) await connection.close();
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
          c.governorate
      FROM customer c
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

    // Fetch phone numbers separately
    const phoneResult = await connection.execute(
      `SELECT customer_phone FROM customer_phone WHERE customer_id = :id`,
      [customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const customerData = result.rows[0];
    const phones = phoneResult.rows.map(row => String(row.CUSTOMER_PHONE));

    res.json({
      ...customerData,
      PHONE: phones.length > 0 ? phones[0] : '',
      PHONES: phones
    });

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

    // Handle phone numbers - delete old ones and insert new ones
    // Frontend sends `phones` array or `phone` singular for backward compatibility
    const phonesInput = req.body.phones || (req.body.phone ? [req.body.phone] : null);
    
    if (phonesInput && Array.isArray(phonesInput)) {
      const validPhones = phonesInput.filter(p => p && String(p).trim() !== '');
      
      if (validPhones.length > 0) {
        // Check for duplicates across other customers
        for (const phone of validPhones) {
          const dupCheck = await connection.execute(
            `SELECT customer_id FROM customer_phone WHERE customer_phone = :phone AND customer_id != :customerId`,
            { phone: String(phone).trim(), customerId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );
          if (dupCheck.rows.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: `Phone number ${String(phone).trim()} is already used by another customer.` });
          }
        }
        
        // Delete old phone entries
        await connection.execute(
          `DELETE FROM CUSTOMER_PHONE WHERE CUSTOMER_ID = :customerId`,
          { customerId }
        );
        
        // Insert new phone numbers
        for (const phone of validPhones) {
          await connection.execute(
            `INSERT INTO CUSTOMER_PHONE (CUSTOMER_ID, CUSTOMER_PHONE) VALUES (:customerId, :phone)`,
            { customerId, phone: String(phone).trim() }
          );
        }
      }
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

    // Get stored hashed password
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

    const storedHash = check.rows[0].PASSWORD;

    // Compare entered current password with stored hash
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      storedHash
    );

    if (!passwordMatches) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // Save hashed password
    await connection.execute(
      `UPDATE customer
       SET password = :newPassword
       WHERE customer_id = :id`,
      {
        newPassword: hashedNewPassword,
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

    // Get user by username only
    const result = await connection.execute(
      `
      SELECT
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.branch_id,
        e.job_id,
        e.dep_id,
        e.username,
        e.password,
        j.job_title
      FROM employees e
      LEFT JOIN jobs j ON e.job_id = j.job_id
      WHERE e.username = :us
      `,
      { us },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {

      return res.json({
        success: false,
        message: "Invalid staff credentials"
      });

    }

    const user = result.rows[0];

    // Compare entered password with stored hash
    const passwordMatches = await bcrypt.compare(
      pass,
      user.PASSWORD
    );

    if (!passwordMatches) {

      return res.json({
        success: false,
        message: "Invalid staff credentials"
      });

    }

    // Remove password before sending to frontend
    delete user.PASSWORD;

    res.json({
      success: true,
      user
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

// ADMIN DASHBOARD STATS
app.get("/admin/stats", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const liquidityResult = await connection.execute(
      `SELECT balance AS TOTAL FROM account WHERE account_number = 0`,
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

    // 1. Pending loans
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

    // 2. Pending cards
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

    // 3. Count total loans requested today
    const loanCountResult = await connection.execute(
      `SELECT COUNT(*) AS TOTAL FROM loan 
       WHERE status = 'Pending'`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // 4. Count total cards requested today
    const cardCountResult = await connection.execute(
      `SELECT COUNT(*) AS TOTAL FROM card 
       WHERE card_status = 'Pending'`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );


    res.json({
      requests: [...loansResult.rows, ...cardsResult.rows],
      totalLoans: loanCountResult.rows[0].TOTAL,
      totalCards: cardCountResult.rows[0].TOTAL
    });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// ==========================================
// PROCESS LOAN APPROVAL / REJECTION
// ==========================================
app.put("/approvals/:loanId", async (req, res) => {
  const { loanId } = req.params;
  const { action } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const newStatus = action === "approve" ? "Approved" : "Rejected";

    // 1. Get the loan amount and the customer who applied
    const loanResult = await connection.execute(
      `SELECT customer_id, loan_amount FROM loan WHERE loan_id = :loanId`,
      { loanId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (loanResult.rows.length === 0) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const { CUSTOMER_ID, LOAN_AMOUNT } = loanResult.rows[0];

    // --- IF REJECTED ---
    if (newStatus === "Rejected") {
      await connection.execute(
        `UPDATE loan SET status = 'Rejected' WHERE loan_id = :loanId`,
        { loanId }
      );
      await connection.commit();
      return res.json({ success: true, message: "Loan Rejected" });
    }

    // --- IF APPROVED ---
    if (newStatus === "Approved") {
      
      // 2. CHECK BANK LIQUIDITY FIRST (Account 0)
      const reserveResult = await connection.execute(
        `SELECT balance FROM account WHERE account_number = 0`,
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (reserveResult.rows.length === 0) {
        return res.status(500).json({ message: "CRITICAL: Bank Reserve account not found." });
      }

      const reserveBalance = reserveResult.rows[0].BALANCE;
      
      // Prevent approval if the bank is broke!
      if (reserveBalance < LOAN_AMOUNT) {
        return res.status(400).json({ 
          message: `Insufficient Bank Liquidity! Vault has $${reserveBalance.toLocaleString()}, but loan requires $${LOAN_AMOUNT.toLocaleString()}.` 
        });
      }

      // 3. Find one of the customer's active accounts to deposit into
      const accountResult = await connection.execute(
        `SELECT a.account_number 
         FROM customer_account ca
         JOIN account a ON ca.account_number = a.account_number
         WHERE ca.customer_id = :customerId AND a.status = 'Active'
         AND ROWNUM = 1`, 
        { customerId: CUSTOMER_ID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (accountResult.rows.length === 0) {
        return res.status(400).json({ message: "Customer has no active accounts to receive the loan funds." });
      }
      
      const targetAccount = accountResult.rows[0].ACCOUNT_NUMBER;

      // 4. Update the loan status to Approved
      await connection.execute(
        `UPDATE loan SET status = 'Approved' WHERE loan_id = :loanId`,
        { loanId }
      );

      // 5. Deduct funds from the Bank Vault
      await connection.execute(
        `UPDATE account SET balance = balance - :amount WHERE account_number = 0`,
        { amount: LOAN_AMOUNT }
      );

      // 6. Deposit funds to the Customer Account
      await connection.execute(
        `UPDATE account SET balance = balance + :amount WHERE account_number = :accNum`,
        { amount: LOAN_AMOUNT, accNum: targetAccount }
      );

      // 7. Log the official Bank Transfer
      await connection.execute(
        `INSERT INTO bank_transaction (
            transaction_id, transaction_type, amount, transaction_time,
            sender_account_number, receiver_account_number, status
         ) VALUES (
            transaction_seq.NEXTVAL, 'Transfer', :amount, SYSDATE, 0, :accNum, 'Completed'
         )`,
        { amount: LOAN_AMOUNT, accNum: targetAccount }
      );
    }

    // 8. Save all changes permanently
    await connection.commit();

    res.json({
      success: true,
      message: `Loan Approved. Funds transferred from vault.`
    });

  } catch (err) {
    console.error(err);
    // Safety Net: Roll back all money movements if any query fails!
    if (connection) await connection.rollback();
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

app.put("/approvals/card/:cardId", async (req, res) => {
  const { cardId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    if (action === "reject") {
      // Fully delete the card request from the database upon rejection
      await connection.execute(
        `DELETE FROM card WHERE card_id = :cardId`,
        { cardId },
        { autoCommit: true }
      );
      res.json({ success: true, message: "Card request deleted (rejected)" });
    } else {
      // Approve — set status to Active
      await connection.execute(
        `UPDATE card SET card_status = 'Active' WHERE card_id = :cardId`,
        { cardId },
        { autoCommit: true }
      );
      res.json({ success: true, message: "Card Approved" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// GET ALL STAFF (optionally filtered by supervisorId)
app.get("/staff", async (req, res) => {
  const { supervisorId, departmentName, jobTitle } = req.query;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // Get requester's job_id, branch_id based on the employee_id provided
    let requesterJobId = null;
    let requesterBranchId = null;
    if (supervisorId) {
      const requesterResult = await connection.execute(
        `SELECT job_id, branch_id FROM employees WHERE employee_id = :empId`,
        { empId: supervisorId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (requesterResult.rows.length > 0) {
        requesterJobId = requesterResult.rows[0].JOB_ID;
        requesterBranchId = requesterResult.rows[0].BRANCH_ID;
      }
    }

    // PERMISSION LOGIC:
    // JOB_ID = 3 (IT_System_Administrator): God view — see all staff
    // JOB_ID = 1 (RB_Department_Manager): see their subordinates + themselves
    // JOB_ID = 2 (RB_Teller): return empty array — page template renders access denied UI
    // JOB_ID = 4 (RB_Branch_Manager): see only staff in their branch

    // Teller: return empty array instead of 403
    if (requesterJobId === 2) {
      return res.json([]);
    }

    let query = `
      SELECT
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.supervisor_id,
        e.salary,
        e.dep_id,
        e.username,
        e.branch_id,
        e.job_id,
        j.job_title,
        j.min_salary,
        j.max_salary,
        d.dep_name
      FROM employees e
      JOIN jobs j ON e.job_id = j.job_id
      LEFT JOIN department d ON e.dep_id = d.dep_id
    `;

    const conditions = [];
    const params = {};

    // Department Supervisor (JOB_ID = 1): only their subordinates + themselves
    if (requesterJobId === 1) {
      const supervisorCheckResult = await connection.execute(
        `SELECT COUNT(*) AS sup_count FROM employees WHERE supervisor_id = :empId`,
        { empId: supervisorId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const supervisorCount = supervisorCheckResult.rows[0].SUP_COUNT;
      if (supervisorCount === 0) {
        return res.status(403).json({ message: "You don't supervise any employees" });
      }

      conditions.push(`(e.supervisor_id = :supervisorId OR e.employee_id = :supervisorId)`);
      params.supervisorId = supervisorId;
    }
    // Branch Manager (JOB_ID = 4): only staff in their branch
    else if (requesterJobId === 4) {
      conditions.push(`e.branch_id = :branchId`);
      params.branchId = requesterBranchId;
    }
    // System Administrator (JOB_ID = 3): no scope restriction, but can filter
    else if (requesterJobId === 3) {
      // Admin — apply optional filters
      if (departmentName) {
        conditions.push(`LOWER(d.dep_name) LIKE LOWER(:depNamePattern)`);
        params.depNamePattern = `%${departmentName}%`;
      }
      if (jobTitle) {
        conditions.push(`LOWER(j.job_title) LIKE LOWER(:jobTitlePattern)`);
        params.jobTitlePattern = `%${jobTitle}%`;
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY e.employee_id`;

    const result = await connection.execute(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    // Fetch phone numbers for all returned employees
    const staffRows = result.rows;
    if (staffRows.length > 0) {
      const empIds = staffRows.map(r => r.EMPLOYEE_ID);
      const bindParams = {};
      empIds.forEach((id, idx) => { bindParams[idx + 1] = id; });
      const phoneResult = await connection.execute(
        `SELECT employee_id, employee_phone FROM employee_phone WHERE employee_id IN (${empIds.map((_, i) => ':' + (i + 1)).join(',')}) ORDER BY employee_id`,
        bindParams,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // Group phones by employee_id
      const phoneMap = {};
      for (const row of phoneResult.rows) {
        const eid = row.EMPLOYEE_ID;
        if (!phoneMap[eid]) phoneMap[eid] = [];
        phoneMap[eid].push(row.EMPLOYEE_PHONE);
      }

      // Attach PHONES array and PHONE (first) to each staff row
      for (const row of staffRows) {
        const phones = phoneMap[row.EMPLOYEE_ID] || [];
        row.PHONES = phones;
        row.PHONE = phones.length > 0 ? phones[0] : null;
      }
    }

    res.json(staffRows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET ALL JOBS AND THEIR SALARY RANGES
app.get("/jobs", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT job_id, job_title, min_salary, max_salary FROM jobs`,
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

// GET ALL DEPARTMENTS
app.get("/departments", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT dep_id, dep_name FROM department ORDER BY dep_name`,
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


// CREATE NEW STAFF MEMBER
app.post("/staff", async (req, res) => {
  const { firstName, middleName, lastName, email, salary, username, password, role, depId, supervisorId, phones } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. Resolve role name AND fetch salary constraints
    const jobResult = await connection.execute(
      `SELECT job_id, min_salary, max_salary FROM jobs WHERE job_title = :role`,
            { role: role || 'RB_Teller' },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (jobResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: `Role "${role}" not found in Jobs table.` });
    }

    const { JOB_ID, MIN_SALARY, MAX_SALARY } = jobResult.rows[0];

    // 2. VALIDATE THE SALARY
    if (salary < MIN_SALARY || salary > MAX_SALARY) {
      return res.status(400).json({ 
        success: false, 
        message: `Salary violation: For a ${role}, salary must be between $${MIN_SALARY.toLocaleString()} and $${MAX_SALARY.toLocaleString()}.` 
      });
    }

    // 3. Generate new Employee ID
    const maxResult = await connection.execute(
      `SELECT NVL(MAX(employee_id), 1000) + 1 AS next_id FROM employees`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newEmployeeId = maxResult.rows[0].NEXT_ID;

    // 4. Inherit department if needed
    let departmentId = depId;
    if (!departmentId && supervisorId) {
      const supervisorResult = await connection.execute(
        `SELECT dep_id FROM employees WHERE employee_id = :empId`,
        { empId: supervisorId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      departmentId = (supervisorResult.rows.length > 0 && supervisorResult.rows[0].DEP_ID) ? supervisorResult.rows[0].DEP_ID : 10;
    } else if (!departmentId) {
      departmentId = 10;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Insert the employee
    await connection.execute(
      `INSERT INTO employees (
        employee_id, first_name, middle_name, last_name, email,
        salary, hire_date, username, password,
        branch_id, job_id, dep_id, supervisor_id
      ) VALUES (
        :employeeId, :firstName, :middleName, :lastName, :email,
        :salary, SYSDATE, :username, :password,
        101, :jobId, :depId, :supervisorId
      )`,
      {
        employeeId: newEmployeeId,
        firstName,
        middleName: middleName || null,
        lastName,
        email,
        salary,
        username,
        password: hashedPassword,
        jobId: JOB_ID,
        depId: departmentId,
        supervisorId: supervisorId || null
      }
    );

    // 6. Insert phones
    if (phones && phones.length > 0) {
      for (const phone of phones) {
        if (phone && String(phone).trim() !== '') {
          await connection.execute(
            `INSERT INTO employee_phone (employee_id, employee_phone) VALUES (:empId, :phone)`,
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

// ==========================================
// UPDATE STAFF MEMBER (With Salary Check)
// ==========================================
app.put("/staff/:employeeId", async (req, res) => {
  const { employeeId } = req.params;
  const { firstName, lastName, email, role, salary, password, phones, depId } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. Fetch salary constraints for the (possibly new) role
    const jobResult = await connection.execute(
      `SELECT job_id, min_salary, max_salary FROM jobs WHERE job_title = :role`,
      { role },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (jobResult.rows.length === 0) {
      return res.status(400).json({ message: `Role "${role}" not found in Jobs table.` });
    }

    const { JOB_ID, MIN_SALARY, MAX_SALARY } = jobResult.rows[0];

    // 2. Validate salary against range
    if (salary < MIN_SALARY || salary > MAX_SALARY) {
      return res.status(400).json({ 
        message: `Salary violation: For a ${role}, salary must be between $${MIN_SALARY.toLocaleString()} and $${MAX_SALARY.toLocaleString()}.` 
      });
    }

    // 3. Build update SQL dynamically to include dep_id if provided
    let updateSql;
    let params;

    if (depId !== undefined && depId !== null && depId !== '') {
      // Include dep_id in the update
            const hashedPassword = await bcrypt.hash(password, 10);
      if (password && String(password).trim() !== '') {
        updateSql = `UPDATE employees e SET e.first_name = :firstName, e.last_name = :lastName, e.email = :email, e.job_id = :jobId, e.salary = :salary, e.dep_id = :depId, e.password = :password WHERE e.employee_id = :employeeId`;
        params = { firstName, lastName, email, jobId: JOB_ID, salary, depId: Number(depId), password: hashedPassword , employeeId };
      } else {
        updateSql = `UPDATE employees e SET e.first_name = :firstName, e.last_name = :lastName, e.email = :email, e.job_id = :jobId, e.salary = :salary, e.dep_id = :depId WHERE e.employee_id = :employeeId`;
        params = { firstName, lastName, email, jobId: JOB_ID, salary, depId: Number(depId), employeeId };
      }
    } else {
      // No department change
      const hashedPassword = await bcrypt.hash(password, 10);
      if (password && String(password).trim() !== '') {
        updateSql = `UPDATE employees e SET e.first_name = :firstName, e.last_name = :lastName, e.email = :email, e.job_id = :jobId, e.salary = :salary, e.password = :password WHERE e.employee_id = :employeeId`;
        params = { firstName, lastName, email, jobId: JOB_ID, salary, employeeId, password: hashedPassword };
      } else {
        updateSql = `UPDATE employees e SET e.first_name = :firstName, e.last_name = :lastName, e.email = :email, e.job_id = :jobId, e.salary = :salary WHERE e.employee_id = :employeeId`;
        params = { firstName, lastName, email, jobId: JOB_ID, salary, employeeId };
      }
    }

    await connection.execute(updateSql, params, { autoCommit: false });

    // 4. Update phones
    if (phones && Array.isArray(phones)) {
      await connection.execute(`DELETE FROM employee_phone WHERE employee_id = :empId`, { empId: employeeId });
      for (const phone of phones) {
        if (phone && String(phone).trim() !== '') {
          await connection.execute(
            `INSERT INTO employee_phone (employee_id, employee_phone) VALUES (:empId, :phone)`,
            { empId: employeeId, phone: String(phone).trim() }
          );
        }
      }
    }

    await connection.commit();
    res.json({ success: true, message: "Staff information updated successfully." });

  } catch (err) {
    console.error("Update error:", err);
    if (connection) await connection.rollback();
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

// GET STAFF PHONE NUMBERS
app.get("/staff/:employeeId/phones", async (req, res) => {
  const { employeeId } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT employee_phone FROM employee_phone WHERE employee_id = :empId`,
      { empId: employeeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const phones = result.rows.map(row => String(row.EMPLOYEE_PHONE));
    res.json(phones);
  } catch (err) {
    console.error(err);
    res.json([]);
  } finally {
    if (connection) await connection.close();
  }
});

// GET STAFF DETAILS (with department name)
app.get("/staff/:employeeId/details", async (req, res) => {
  const { employeeId } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT e.employee_id, e.first_name, e.middle_name, e.last_name, e.email, e.salary, e.hire_date, e.username, e.branch_id, e.dep_id, e.supervisor_id,
              j.job_title, j.job_id,
              d.dep_name
       FROM employees e
       JOIN jobs j ON e.job_id = j.job_id
       LEFT JOIN department d ON e.dep_id = d.dep_id
       WHERE e.employee_id = :empId`,
      { empId: employeeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const staffData = result.rows[0];

    // Fetch phones
    const phoneResult = await connection.execute(
      `SELECT employee_phone FROM employee_phone WHERE employee_id = :empId`,
      { empId: employeeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const phones = phoneResult.rows.map(row => String(row.EMPLOYEE_PHONE));
    staffData.PHONES = phones;
    staffData.PHONE = phones.length > 0 ? phones[0] : null;

    // Fetch supervisor name
    if (staffData.SUPERVISOR_ID) {
      const supResult = await connection.execute(
        `SELECT first_name, last_name FROM employees WHERE employee_id = :supId`,
        { supId: staffData.SUPERVISOR_ID },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (supResult.rows.length > 0) {
        staffData.SUPERVISOR_NAME = supResult.rows[0].FIRST_NAME + ' ' + supResult.rows[0].LAST_NAME;
      }
    }

    res.json(staffData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET STAFF DEPENDANTS
app.get("/staff/:employeeId/dependants", async (req, res) => {
  const { employeeId } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT national_id, first_name, middle_name, last_name, relationship
       FROM dependants
       WHERE employee_id = :empId
       ORDER BY first_name`,
      { empId: employeeId },
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

// ADD STAFF DEPENDANT
app.post("/staff/:employeeId/dependants", async (req, res) => {
  const { employeeId } = req.params;
  const { nationalId, firstName, middleName, lastName, relationship } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // Check if dependant count is already 4
    const countResult = await connection.execute(
      `SELECT COUNT(*) AS cnt FROM dependants WHERE employee_id = :empId`,
      { empId: employeeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (countResult.rows[0].CNT >= 4) {
      return res.status(400).json({ success: false, message: "Maximum of 4 dependants allowed." });
    }

    await connection.execute(
      `INSERT INTO dependants (employee_id, national_id, first_name, middle_name, last_name, relationship)
       VALUES (:empId, :nationalId, :firstName, :middleName, :lastName, :relationship)`,
      {
        empId: employeeId,
        nationalId: nationalId,
        firstName: firstName,
        middleName: middleName || null,
        lastName: lastName,
        relationship: relationship
      },
      { autoCommit: true }
    );

    res.json({ success: true, message: "Dependant added successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE STAFF DEPENDANT
app.delete("/staff/:employeeId/dependants/:nationalId", async (req, res) => {
  const { employeeId, nationalId } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `DELETE FROM dependants WHERE employee_id = :empId AND national_id = :nationalId`,
      { empId: employeeId, nationalId: nationalId },
      { autoCommit: true }
    );

    res.json({ success: true, message: "Dependant removed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
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
    // CUSTOMER INFO (without phone - fetch separately)
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
        c.dob
      FROM customer c
      WHERE c.customer_id = :id
      `,
      { id: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Fetch phone numbers separately
    const phoneResult = await connection.execute(
      `SELECT customer_phone FROM customer_phone WHERE customer_id = :id`,
      { id: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (customerResult.rows.length > 0) {
      const phones = phoneResult.rows.map(row => String(row.CUSTOMER_PHONE));
      customerResult.rows[0].CUSTOMER_PHONE = phones.length > 0 ? phones[0] : null;
      customerResult.rows[0].PHONES = phones;
    }

    // CUSTOMER ACCOUNTS
    const accountsResult = await connection.execute(
      `
      SELECT
        a.account_number,
        a.account_type,
        a.balance,
        a.status,
        a.branch_id
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

    // Add this query inside the route, alongside the existing ones:
const loansResult = await connection.execute(
  `SELECT
    loan_id,
    loan_amount,
    interest_rate,
    due_date,
    loan_term,
    monthly_payment,
    total_paid_off,
    start_date
   FROM loan
   WHERE customer_id = :id
   AND loan_state = 'ACTIVE'
   AND status = 'Approved'
   ORDER BY start_date DESC`,
  { id: customerId },
  { outFormat: oracledb.OUT_FORMAT_OBJECT }
);

    res.json({
      customer: customerResult.rows[0],
      accounts: accountsResult.rows,
      transactions: transactionsResult.rows,
      loans: loansResult.rows
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
    UPPER(
      CASE
        WHEN MAX(CASE WHEN a.status = 'Active'   THEN 2 ELSE 0 END) = 2 THEN 'Active'
        WHEN MAX(CASE WHEN a.status = 'Inactive' THEN 1 ELSE 0 END) = 1 THEN 'Inactive'
        ELSE 'Closed'
      END
    ) AS status
  FROM customer c
  LEFT JOIN customer_account ca ON c.customer_id = ca.customer_id
  LEFT JOIN account a ON ca.account_number = a.account_number
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

    // 1. Fetch customer DOB to check age
    const customerCheck = await connection.execute(
      `SELECT dob FROM customer WHERE customer_id = :cid`,
      { cid: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const dob = customerCheck.rows[0].DOB;
    const age = calculateAge(dob);

    // 2. Age validation: Must be 16+
    if (age < 16) {
      return res.status(400).json({ message: "Customer must be at least 16 years old to create an account." });
    }

    // 3. Account type validation: Under 18 can only have Student accounts
    if (age < 18 && accountType !== 'Student') {
      return res.status(400).json({ message: "Customers under 18 can only create Student accounts." });
    }

    // 4. Generate new account number
    const maxResult = await connection.execute(
      `SELECT NVL(MAX(account_number), 100000000000) + 1 AS next_num FROM account`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newAccountNumber = maxResult.rows[0].NEXT_NUM;

    // 5. Create the account
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

    // 6. Link account to the customer
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

    // --- RULE: MUST BE 16 OR OLDER TO BE A CUSTOMER ---
    const age = calculateAge(customerData.dob);
    if (age < 16) {
      return res.status(400).json({ message: "Registration Denied: Customer must be at least 16 years old." });
    }

    // 1. Generate a new sequential Customer ID
    const maxCustResult = await connection.execute(
      `SELECT NVL(MAX(customer_id), 1000) + 1 AS next_id FROM customer`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newCustomerId = maxCustResult.rows[0].NEXT_ID;

    // 2. Insert into main CUSTOMER table 
    // (Note: TO_DATE is used to safely convert the React HTML date string for Oracle)
const hashedPassword = await bcrypt.hash(customerData.password, 10);

await connection.execute(
  `INSERT INTO customer (
    customer_id, first_name, middle_name, last_name,
    email, street, city, governorate,
    national_id, dob, username, password
  ) VALUES (
    :customerId, :firstName, :middleName, :lastName,
    :email, :street, :city, :governorate,
    :nationalId, TO_DATE(:dob, 'YYYY-MM-DD'),
    :username, :password
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
    password: hashedPassword
  }
);

    // 3. Insert into CUSTOMER_PHONE table if they provided phone numbers
    if (customerData.phones && Array.isArray(customerData.phones)) {
      for (const phone of customerData.phones) {
        if (phone && String(phone).trim() !== '') {
          await connection.execute(
            `INSERT INTO customer_phone (customer_id, customer_phone)
             VALUES (:customerId, :phone)`,
            { customerId: newCustomerId, phone: String(phone).trim() }
          );
        }
      }
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