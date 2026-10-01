require('dotenv').config();
const app = require('./app');
const { pool } = require('../db/db');

const PORT = process.env.PORT || 5000;

// Test DB connection before starting
pool.query('SELECT 1')
  .then(() => {
    console.log('✅  Database connected');
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌  Database connection failed:', err.message);
    process.exit(1);
  });
