const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Run a parameterized query.
 * @param {string} text - SQL query string with $1, $2, ... placeholders
 * @param {Array}  params - query parameters
 * @returns {Promise<pg.QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };
