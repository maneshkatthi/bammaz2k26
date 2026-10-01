const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../db/db');

// ---------------------------------------------------------------------------
// Helper: format a DB user row into the standard API user object
// ---------------------------------------------------------------------------
const formatUser = (row) => ({
  id: row.id,
  name: row.name,
  rollNumber: row.roll_number,
  year: row.year,
  email: row.email,
  role: row.role,
});

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------
const signup = async (req, res, next) => {
  try {
    const { name, rollNumber, year, email, password } = req.body;

    // --- Validation ---
    const errors = {};
    if (!name || name.length < 1 || name.length > 100)
      errors.name = 'Name must be 1–100 characters';
    if (!rollNumber || rollNumber.length < 1 || rollNumber.length > 20)
      errors.rollNumber = 'Roll number must be 1–20 characters';
    if (!year || !Number.isInteger(Number(year)) || year < 1 || year > 4)
      errors.year = 'Year must be an integer between 1 and 4';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Invalid email address';
    if (!password || password.length < 8)
      errors.password = 'Password must be at least 8 characters';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    // --- Hash password ---
    const passwordHash = await bcrypt.hash(password, 12);

    // --- Insert user ---
    const result = await query(
      `INSERT INTO users (name, roll_number, year, email, password_hash)
       VALUES ($1, upper($2), $3, lower($4), $5)
       RETURNING id, name, roll_number, year, email, role`,
      [name, rollNumber, Number(year), email, passwordHash]
    );

    const user = formatUser(result.rows[0]);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
    });
  } catch (err) {
    // Duplicate email
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    next(err);
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/signin
// ---------------------------------------------------------------------------
const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
    }

    // --- Look up user ---
    const result = await query(
      `SELECT id, name, roll_number, year, email, role, password_hash
       FROM users WHERE email = lower($1)`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const row = result.rows[0];

    // --- Verify password ---
    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // --- Issue JWT ---
    const token = jwt.sign(
      { id: row.id, role: row.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const user = formatUser(row);

    return res.status(200).json({ success: true, message: 'Login successful', token, user });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
const me = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, roll_number, year, email, role FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    return res.status(200).json({ success: true, user: formatUser(result.rows[0]) });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, signin, me };
