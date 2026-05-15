const oracledb = require('oracledb');

require('dotenv').config();
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING
};

// This script drops all banking system tables to reset the database
const resetDatabase = async () => {
  let connection;
  try {
    console.log('\n⚠️  WARNING: This will DELETE all banking system tables!\n');

    connection = await oracledb.getConnection(dbConfig);

    // Tables to drop (in reverse dependency order)
    const tablesToDrop = [
      'DEPARTMENT_MANAGERS',
      'EMPLOYEE_PHONE',
      'CUSTOMER_PHONE',
      'DEPENDANTS',
      'CUSTOMER_ACCOUNT',
      'BANK_TRANSACTION',
      'CARD',
      'LOAN',
      'ACCOUNT',
      'EMPLOYEES',
      'CUSTOMER',
      'JOBS',
      'DEPARTMENT',
      'BRANCH'
    ];

    console.log('🗑️  Dropping tables...\n');

    for (const table of tablesToDrop) {
      try {
        await connection.execute(`DROP TABLE ${table}`);
        console.log(`  ✓ Dropped ${table}`);
      } catch (err) {
        if (err.message.includes('ORA-00942')) {
          console.log(`  - ${table} doesn't exist (skipped)`);
        } else {
          console.error(`  ✗ Error dropping ${table}: ${err.message}`);
        }
      }
    }

    // Drop sequences
    const sequencesToDrop = ['TRANSACTION_SEQ', 'LOAN_SEQ'];

    console.log('\n🔄 Dropping sequences...\n');

    for (const seq of sequencesToDrop) {
      try {
        await connection.execute(`DROP SEQUENCE ${seq}`);
        console.log(`  ✓ Dropped ${seq}`);
      } catch (err) {
        if (err.message.includes('ORA-02289')) {
          console.log(`  - ${seq} doesn't exist (skipped)`);
        } else {
          console.error(`  ✗ Error dropping ${seq}: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Database reset complete. You can now run the backend to reinitialize.\n');

  } catch (err) {
    console.error('\n❌ Error resetting database:', err.message, '\n');
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

resetDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
