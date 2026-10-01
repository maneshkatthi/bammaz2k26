/**
 * Seed an organizer account.
 *
 * Usage: npm run seed:organizer
 *
 * Reads credentials from .env:
 *   ORGANIZER_NAME
 *   ORGANIZER_EMAIL
 *   ORGANIZER_PASSWORD
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, pool } = require('../db/db');

async function seed() {
  const name = process.env.ORGANIZER_NAME;
  const email = process.env.ORGANIZER_EMAIL;
  const password = process.env.ORGANIZER_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      '❌  Missing ORGANIZER_NAME, ORGANIZER_EMAIL or ORGANIZER_PASSWORD in .env'
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, lower($2), $3, 'organizer')
     ON CONFLICT (email) DO NOTHING`,
    [name, email, passwordHash]
  );

  console.log(`✅  Organizer seeded: ${email}`);
  await pool.end();
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  pool.end();
  process.exit(1);
});
