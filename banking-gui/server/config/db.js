const oracledb = require('oracledb');
require('dotenv').config(); // Ensure this is here to read your .env file

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING
};

// Simplified initialization for modern Thin Mode
// You only need initOracleClient if you have Oracle Instant Client installed 
// and specifically want to use "Thick Mode" features.
/*
try {
  oracledb.initOracleClient(); 
} catch (err) {
  // Silent catch for re-initialization errors
}
*/

module.exports = dbConfig;