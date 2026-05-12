const express = require("express");
const cors = require("cors");
const oracledb = require("oracledb");

const app = express();

app.use(cors());
app.use(express.json());

const dbConfig = {
  user: "system",
  password: "btob",
  connectString: "localhost/XEPDB1"
};

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// TRANSFER ROUTE
app.post("/transfer", async (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. Check sender account exists and has enough balance
    const balanceResult = await connection.execute(
      `SELECT balance FROM account WHERE account_number = :acc`,
      { acc: fromAccount },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (balanceResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Source account not found" });
    }

    const currentBalance = balanceResult.rows[0].BALANCE;

    if (currentBalance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient funds" });
    }

    // 2. Check receiver account exists
    const receiverResult = await connection.execute(
      `SELECT account_number FROM account WHERE account_number = :acc`,
      { acc: toAccount },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (receiverResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Recipient account not found" });
    }

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
          cust.FIRST_NAME || ' ' || cust.LAST_NAME as CARDHOLDER
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

// UPDATE CARD STATUS (Freeze / Unfreeze / Cancel)
app.post('/cards/status', async (req, res) => {
    const { cardId, newStatus } = req.body;

    // 1. Map Frontend terms to your specific DB Constraints
    let dbStatus;
    if (newStatus === 'Frozen') dbStatus = 'Blocked';
    else if (newStatus === 'Active') dbStatus = 'Active';
    else if (newStatus === 'Cancelled') dbStatus = 'Suspended';
    else dbStatus = newStatus; 

    try {
        const connection = await oracledb.getConnection(dbConfig);
        
        // 2. Fetch current status to enforce "Cancelled stays Cancelled" rule
        const checkResult = await connection.execute(
            `SELECT CARD_STATUS FROM CARD WHERE CARD_ID = :id`,
            [cardId]
        );

        const currentStatus = checkResult.rows[0][0];

        if (currentStatus === 'Suspended') {
            return res.status(400).json({ error: "This card is permanently suspended and cannot be changed." });
        }

        // 3. Execute the update with the valid constraint value
        await connection.execute(
            `UPDATE CARD SET CARD_STATUS = :status WHERE CARD_ID = :id`,
            { status: dbStatus, id: cardId },
            { autoCommit: true }
        );

        await connection.close();
        res.status(200).send("Status updated successfully");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

app.get("/loans/:customerId", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM loan WHERE customer_id = :id AND loan_state = 'ACTIVE'`,
      [req.params.customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows[0] || null); // Return first active loan or null
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    if (connection) await connection.close();
  }
});

// APPLY FOR NEW LOAN
app.post("/loans/apply", async (req, res) => {
  const { customerId, amount, term, interestRate } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `INSERT INTO loan (
        loan_id, customer_id, loan_amount, interest_rate, 
        due_date, status, loan_term, total_paid_off, loan_state
      ) VALUES (
        loan_seq.NEXTVAL, :cid, :amt, :rate, 
        ADD_MONTHS(SYSDATE, 1), 'Personal', :term, 0, 'ACTIVE'
      )`,
      { cid: customerId, amt: amount, rate: interestRate, term: term },
      { autoCommit: true }
    );
    res.json({ success: true, message: "Loan approved!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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

    // 1. Deduct from bank account
    await connection.execute(
      `UPDATE account SET balance = balance - :amount WHERE account_number = :acc`,
      { amount, acc: accountNumber }
    );

    // 2. Update loan table
    await connection.execute(
      `UPDATE loan 
       SET total_paid_off = total_paid_off + :amount 
       WHERE loan_id = :lid`,
      { amount, lid: loanId }
    );

    // 3. Check if fully paid and update state
    await connection.execute(
      `UPDATE loan 
       SET loan_state = 'PAID' 
       WHERE loan_id = :lid AND total_paid_off >= loan_amount`,
      { lid: loanId }
    );

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});