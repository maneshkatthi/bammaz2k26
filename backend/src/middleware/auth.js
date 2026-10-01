const jwt = require('jsonwebtoken');

/**
 * Middleware: verify JWT and attach user payload to req.user.
 * Returns 401 if token is missing, malformed, invalid or expired.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
};

/**
 * Middleware factory: require a specific role.
 * Must be used after authenticate().
 * @param {string} role - 'student' | 'organizer'
 */
const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  }
  next();
};

module.exports = { authenticate, requireRole };
