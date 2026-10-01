const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getMyRegistrations } = require('../controllers/registrationController');

router.get('/mine', authenticate, requireRole('student'), getMyRegistrations);

module.exports = router;
