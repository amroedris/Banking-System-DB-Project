const oracledb = require("oracledb");
const dbConfig = require("../config/db");

// Get customer full details
exports.getCustomerFullDetails = async (customerId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Customer info
    const customerResult = await connection.execute(
      `SELECT
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
      WHERE c.customer_id = :id`,
      { id: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Customer accounts
    const accountsResult = await connection.execute(
      `SELECT
        a.account_number,
        a.account_type,
        a.balance,
        a.status
      FROM customer_account ca
      JOIN account a
        ON ca.account_number = a.account_number
      WHERE ca.customer_id = :id`,
      { id: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Recent transactions
    const transactionsResult = await connection.execute(
      `SELECT *
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
      WHERE ROWNUM <= 10`,
      { id: customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return {
      customer: customerResult.rows[0],
      accounts: accountsResult.rows,
      transactions: transactionsResult.rows
    };
  } finally {
    if (connection) await connection.close();
  }
};

// Get all customers
exports.getAllCustomers = async () => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT
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
      ORDER BY c.customer_id`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};

// Update customer accounts status
exports.updateCustomerAccountsStatus = async (customerId, status) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `UPDATE account
      SET status = :status
      WHERE account_number IN (
        SELECT account_number 
        FROM customer_account 
        WHERE customer_id = :id
      )`,
      { status, id: customerId },
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
};

// Update account status
exports.updateAccountStatus = async (accountNumber, status) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `UPDATE account
      SET status = :status
      WHERE account_number = :accountNumber`,
      { status, accountNumber },
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
};

// Create a new account for a customer
exports.createAccountForCustomer = async (customerId, accountType, initialDeposit, branchId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Generate new account number
    const maxResult = await connection.execute(
      `SELECT NVL(MAX(account_number), 100000000000) + 1 AS next_num FROM account`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newAccountNumber = maxResult.rows[0].NEXT_NUM;

    // Create the account
    await connection.execute(
      `INSERT INTO account (account_number, account_type, balance, status, branch_id)
       VALUES (:accountNumber, :accountType, :balance, 'Active', :branchId)`,
      {
        accountNumber: newAccountNumber,
        accountType,
        balance: initialDeposit,
        branchId: branchId || 101
      }
    );

    // Link to customer
    await connection.execute(
      `INSERT INTO customer_account (customer_id, account_number)
       VALUES (:customerId, :accountNumber)`,
      { customerId, accountNumber: newAccountNumber }
    );

    await connection.commit();

    return { accountNumber: newAccountNumber };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.close();
  }
};

// Create a new customer with their first account
exports.createCustomerOnboard = async (customerData) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Generate new customer ID
    const maxCustResult = await connection.execute(
      `SELECT NVL(MAX(customer_id), 1000) + 1 AS next_id FROM customer`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newCustomerId = maxCustResult.rows[0].NEXT_ID;

    // Generate new account number
    const maxAccResult = await connection.execute(
      `SELECT NVL(MAX(account_number), 100000000000) + 1 AS next_num FROM account`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newAccountNumber = maxAccResult.rows[0].NEXT_NUM;

    // 1. CREATE CUSTOMER (All explicit attributes mapped, no defaults overriding input)
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
        middleName: customerData.middleName || null, // Handles optional middle name
        lastName: customerData.lastName,
        email: customerData.email,
        street: customerData.street,
        city: customerData.city,
        governorate: customerData.governorate,
        nationalId: customerData.nationalId,
        dob: customerData.dob, 
        username: customerData.username,
        password: customerData.password
      }
    );

    // Create phone if provided
    if (customerData.phone) {
      await connection.execute(
        `INSERT INTO customer_phone (customer_id, customer_phone)
         VALUES (:customerId, :phone)`,
        { customerId: newCustomerId, phone: customerData.phone }
      );
    }

    // Create account
    await connection.execute(
      `INSERT INTO account (account_number, account_type, balance, status, branch_id)
       VALUES (:accountNumber, :accountType, :balance, 'Active', :branchId)`,
      {
        accountNumber: newAccountNumber,
        accountType: customerData.accountType || 'Savings',
        balance: customerData.initialDeposit || 0,
        branchId: customerData.branchId || 101
      }
    );

    // Link customer to account
    await connection.execute(
      `INSERT INTO customer_account (customer_id, account_number)
       VALUES (:customerId, :accountNumber)`,
      { customerId: newCustomerId, accountNumber: newAccountNumber }
    );

    await connection.commit();

    return { customerId: newCustomerId, accountNumber: newAccountNumber };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.close();
  }
};


// Create a new customer only (no account)
exports.createCustomerOnly = async (customerData) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Generate new customer ID
    const maxCustResult = await connection.execute(
      `SELECT NVL(MAX(customer_id), 1000) + 1 AS next_id FROM customer`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newCustomerId = maxCustResult.rows[0].NEXT_ID;

    // Insert the Customer safely
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
        password: customerData.password
      }
    );

    // Create phone if provided
    if (customerData.phone) {
      await connection.execute(
        `INSERT INTO customer_phone (customer_id, customer_phone)
         VALUES (:customerId, :phone)`,
        { customerId: newCustomerId, phone: customerData.phone }
      );
    }

    await connection.commit();

    return { customerId: newCustomerId };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.close();
  }
};


// Get all staff members
exports.getStaffMembers = async (supervisorId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    let query, binds;
    if (supervisorId) {
      query = `SELECT
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.salary,
        j.job_title,
        d.dep_name,
        b.branch_name,
        e.hire_date
      FROM employees e
      JOIN jobs j ON e.job_id = j.job_id
      JOIN department d ON e.dep_id = d.dep_id
      JOIN branch b ON e.branch_id = b.branch_id
      WHERE (e.supervisor_id = :supervisorId OR e.employee_id = :supervisorId2)
      ORDER BY e.employee_id`;
      binds = { supervisorId, supervisorId2: supervisorId };
    } else {
      query = `SELECT
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.salary,
        j.job_title,
        d.dep_name,
        b.branch_name,
        e.hire_date
      FROM employees e
      JOIN jobs j ON e.job_id = j.job_id
      JOIN department d ON e.dep_id = d.dep_id
      JOIN branch b ON e.branch_id = b.branch_id
      ORDER BY e.employee_id`;
      binds = [];
    }

    const result = await connection.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};

// Create a new staff member
exports.createStaffMember = async (staffData, supervisorId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Get max employee ID
    const maxResult = await connection.execute(
      `SELECT NVL(MAX(employee_id), 100) + 1 AS next_id FROM employees`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const newId = maxResult.rows[0].NEXT_ID;

    // Map role to job_id (1=Branch Manager, 2=Teller) and dep_id (10=Retail Banking, 20=IT Support)
    let jobId, depId;
    if (staffData.role === 'Manager') { jobId = 1; depId = 10; }
    else if (staffData.role === 'Analyst') { jobId = 2; depId = 20; }
    else { jobId = 2; depId = 10; } // Teller

    await connection.execute(
      `INSERT INTO employees (
        employee_id, first_name, last_name, email, salary,
        hire_date, username, password, branch_id, job_id, dep_id, supervisor_id
      ) VALUES (
        :id, :firstName, :lastName, :email, :salary,
        SYSDATE, :username, :password, :branchId, :jobId, :depId, :supervisorId
      )`,
      {
        id: newId,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        salary: staffData.salary || 5000,
        username: staffData.username || staffData.email.split('@')[0],
        password: staffData.password || 'password123',
        branchId: staffData.branchId || 101,
        jobId,
        depId,
        supervisorId: supervisorId || null
      },
      { autoCommit: true }
    );

    return { employeeId: newId };
  } finally {
    if (connection) await connection.close();
  }
};

// Update staff member
exports.updateStaffMember = async (employeeId, staffData) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Map role to job_id (1=Branch Manager, 2=Teller)
    let jobId;
    if (staffData.role === 'Manager') jobId = 1;
    else if (staffData.role === 'Analyst') jobId = 2;
    else jobId = 2;

    await connection.execute(
      `UPDATE employees
       SET first_name = :firstName,
           last_name = :lastName,
           email = :email,
           job_id = :jobId
       WHERE employee_id = :id`,
      {
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        jobId,
        id: employeeId
      },
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
};

// Delete staff member
exports.deleteStaffMember = async (employeeId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `DELETE FROM employees WHERE employee_id = :id`,
      { id: employeeId },
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
};

// Get all transactions (for staff transaction log)
exports.getAllTransactions = async () => {
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
          bt.status,
          s.first_name || ' ' || s.last_name AS sender_name,
          r.first_name || ' ' || r.last_name AS receiver_name
        FROM bank_transaction bt
        LEFT JOIN customer_account sca ON bt.sender_account_number = sca.account_number
        LEFT JOIN customer s ON sca.customer_id = s.customer_id
        LEFT JOIN customer_account rca ON bt.receiver_account_number = rca.account_number
        LEFT JOIN customer r ON rca.customer_id = r.customer_id
        ORDER BY bt.transaction_time DESC
      )
      WHERE ROWNUM <= 100`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};

// Get audit logs
exports.getAuditLogs = async () => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT *
      FROM (
        SELECT
          bt.transaction_id,
          bt.transaction_type AS action,
          bt.amount,
          bt.transaction_time AS action_time,
          bt.status,
          bt.sender_account_number,
          bt.receiver_account_number
        FROM bank_transaction bt
        ORDER BY bt.transaction_time DESC
      )
      WHERE ROWNUM <= 100`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  } finally {
    if (connection) await connection.close();
  }
};
