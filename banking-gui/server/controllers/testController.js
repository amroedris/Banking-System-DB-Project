const oracledb = require("oracledb");
const dbConfig = require("../config/db");

// Test database connection
exports.testConnection = async (req, res, next) => {
  let connection;
  
  try {
    console.log("Attempting to connect to:", dbConfig.connectString);
    connection = await oracledb.getConnection(dbConfig);
    console.log("Connected successfully!");
    
    const result = await connection.execute(
      `SELECT * FROM v$version WHERE ROWNUM = 1`
    );
    
    res.json({ 
      success: true, 
      message: "Database connection successful!", 
      version: result.rows 
    });
  } catch (err) {
    console.error("Connection error:", err);
    next(err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};
