const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');
const dbConfig = require('./config/db');

const REQUIRED_TABLES = [
  'CUSTOMER',
  'BRANCH',
  'DEPARTMENT',
  'JOBS',
  'EMPLOYEES',
  'ACCOUNT',
  'LOAN',
  'CARD',
  'BANK_TRANSACTION',
  'DEPENDANTS',
  'CUSTOMER_PHONE',
  'EMPLOYEE_PHONE',
  'CUSTOMER_ACCOUNT',
  'DEPARTMENT_MANAGERS'
];

const dropAllTables = async (connection) => {
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

  console.log('\n🗑️  Rolling back: Dropping all tables...\n');

  for (const table of tablesToDrop) {
    try {
      await connection.execute(`DROP TABLE ${table}`);
      console.log(`  ✓ Dropped ${table}`);
    } catch (err) {
      if (!err.message.includes('ORA-00942')) {
        console.log(`  - ${table} doesn't exist`);
      }
    }
  }

  const sequencesToDrop = ['TRANSACTION_SEQ', 'LOAN_SEQ'];

  console.log('\n  Dropping sequences...\n');

  for (const seq of sequencesToDrop) {
    try {
      await connection.execute(`DROP SEQUENCE ${seq}`);
      console.log(`  ✓ Dropped ${seq}`);
    } catch (err) {
      if (!err.message.includes('ORA-02289')) {
        console.log(`  - ${seq} doesn't exist`);
      }
    }
  }
};

const initDatabase = async () => {
  let connection;
  try {
    console.log('\n🔍 Checking database schema...');
    connection = await oracledb.getConnection(dbConfig);

    const checkTablesResult = await connection.execute(
      `SELECT table_name FROM user_tables
       WHERE table_name IN ('${REQUIRED_TABLES.join("','")}')
       ORDER BY table_name`
    );

    const existingTables = checkTablesResult.rows.map(row => row[0]);
    const missingTables = REQUIRED_TABLES.filter(t => !existingTables.includes(t));

    console.log(`\n📊 Database Status:`);
    console.log(`   Found ${existingTables.length}/${REQUIRED_TABLES.length} required tables`);

    if (existingTables.length > 0) {
      console.log(`   ✓ Existing: ${existingTables.join(', ')}`);
    }

    if (missingTables.length === 0) {
      console.log('\n✅ All tables exist. Database already initialized. Skipping...');
      return;
    }

    console.log(`   ✗ Missing: ${missingTables.join(', ')}`);
    console.log('\n📝 Running full initialization...\n');

    // ===== SCHEMA CREATION =====
    const bankingSqlPath = path.join(__dirname, '../..', 'database', 'Banking.sql');
    const bankingSql = fs.readFileSync(bankingSqlPath, 'utf8');

    const schemaStatements = bankingSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📋 Creating ${schemaStatements.length} schema objects...\n`);

    for (let i = 0; i < schemaStatements.length; i++) {
      const statement = schemaStatements[i];
      try {
        await connection.execute(statement);
        const tableName = statement.match(/CREATE TABLE (\w+)/i)?.[1] || 'object';
        console.log(`  ✓ [${i + 1}/${schemaStatements.length}] Created ${tableName}`);
      } catch (err) {
        console.error(`\n  ✗ [${i + 1}/${schemaStatements.length}] Schema creation failed!`);
        console.error(`     Statement: ${statement.substring(0, 100)}...`);
        console.error(`     Error: ${err.message}\n`);

        // Rollback on error
        await dropAllTables(connection);
        throw err;
      }
    }

    // ===== CREATE SEQUENCES =====
    const sequences = [
      { name: 'transaction_seq', start: 1000 },
      { name: 'loan_seq', start: 500 }
    ];

    console.log(`\n🔄 Creating sequences...\n`);

    for (const seq of sequences) {
      try {
        await connection.execute(
          `CREATE SEQUENCE ${seq.name} START WITH ${seq.start} INCREMENT BY 1`
        );
        console.log(`  ✓ Created sequence: ${seq.name}`);
      } catch (err) {
        if (err.message.includes('ORA-00955')) {
          console.log(`  ✓ Sequence ${seq.name} already exists`);
        } else {
          console.error(`\n  ✗ Failed to create sequence ${seq.name}`);
          console.error(`     Error: ${err.message}\n`);
          await dropAllTables(connection);
          throw err;
        }
      }
    }

    // ===== DATA INSERTION =====
    const dataSqlPath = path.join(__dirname, '../..', 'database', 'Data.sql');
    let dataSql = fs.readFileSync(dataSqlPath, 'utf8'); // <--- Changed to 'let'

    dataSql = dataSql.replace(/--.*$/gm, '');

    const dataStatements = dataSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && stmt.toUpperCase() !== 'COMMIT');

    console.log(`\n📊 Parsed ${dataStatements.length} sample data statements:\n`);
    dataStatements.forEach((stmt, idx) => {
      const match = stmt.match(/INSERT INTO (\w+)/i);
      const table = match ? match[1] : 'UNKNOWN';
      const preview = stmt.substring(0, 60).replace(/\n/g, ' ');
      console.log(`   [${String(idx + 1).padStart(2, '0')}] TABLE: ${table.padEnd(20)} -> ${preview}...`);
    });
    console.log(`\n⏳ Now executing...\n`);

    for (let i = 0; i < dataStatements.length; i++) {
      const statement = dataStatements[i];
      const shortStmt = statement.substring(0, 70).replace(/\n/g, ' ');

      try {
        console.log(`  ⏳ [${String(i + 1).padStart(2, '0')}/${dataStatements.length}] Executing: ${shortStmt}...`);
        await connection.execute(statement, [], { autoCommit: true });
        console.log(`     ✅ Success\n`);
      } catch (err) {
        console.error(`\n${'='.repeat(80)}`);
        console.error(`❌ ERROR AT STATEMENT ${i + 1} OF ${dataStatements.length}`);
        console.error(`${'='.repeat(80)}`);
        console.error(`\n📄 FULL SQL STATEMENT:\n`);
        console.error(statement);
        console.error(`\n⚠️  ERROR DETAILS:\n`);
        console.error(`   Message: ${err.message}`);
        console.error(`   Code: ${err.code}`);
        console.error(`   Error Number: ${err.errorNum}`);
        console.error(`${'='.repeat(80)}\n`);

        // Rollback on error
        console.log('\n🔄 Rolling back changes and cleaning up...');
        try {
          await connection.rollback();
        } catch (rollbackErr) {
          console.log('  (rollback not needed)');
        }

        await dropAllTables(connection);
        throw err;
      }
    }

    // Final commit
    await connection.commit();
    console.log('\n✅ Database initialization completed successfully!\n');

  } catch (err) {
    console.error('\n❌ Database initialization failed:', err.message, '\n');
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

module.exports = { initDatabase };
