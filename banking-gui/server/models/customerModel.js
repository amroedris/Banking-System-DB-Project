const oracledb = require("oracledb");
const dbConfig = require("../config/db");

// Get customer by ID
exports.getCustomerById = async (customerId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT
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
      WHERE c.customer_id = :id`,
      [customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    if (connection) await connection.close();
  }
};

// Check if phone is duplicate
exports.isPhoneDuplicate = async (phone, customerId) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT CUSTOMER_ID FROM CUSTOMER_PHONE
       WHERE CUSTOMER_PHONE = :phone AND CUSTOMER_ID != :customerId`,
      { phone, customerId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.length > 0;
  } finally {
    if (connection) await connection.close();
  }
};

// Update customer information
exports.updateCustomer = async (customerId, customerData) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Update customer table
    await connection.execute(
      `UPDATE Customer
      SET
        First_Name = :firstName,
        Last_Name = :lastName,
        Email = :email,
        Street = :street,
        City = :city,
        Governorate = :governorate
      WHERE Customer_ID = :customerId`,
      {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        street: customerData.street,
        city: customerData.city,
        governorate: customerData.governorate,
        customerId
      }
    );

    // Update phone if provided
    if (customerData.phone && String(customerData.phone).trim() !== '') {
      // Delete old entry
      await connection.execute(
        `DELETE FROM CUSTOMER_PHONE WHERE CUSTOMER_ID = :customerId`,
        { customerId }
      );

      // Insert new entry
      await connection.execute(
        `INSERT INTO CUSTOMER_PHONE (CUSTOMER_ID, CUSTOMER_PHONE) VALUES (:customerId, :phone)`,
        { customerId, phone: customerData.phone }
      );
    }

    await connection.commit();
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.close();
  }
};

// Verify password
exports.verifyPassword = async (customerId, password) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT password
       FROM customer
       WHERE customer_id = :id`,
      [customerId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0].PASSWORD === password;
  } finally {
    if (connection) await connection.close();
  }
};

// Update password
exports.updatePassword = async (customerId, newPassword) => {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `UPDATE customer
       SET password = :newPassword
       WHERE customer_id = :id`,
      { newPassword, id: customerId },
      { autoCommit: true }
    );
  } finally {
    if (connection) await connection.close();
  }
};
