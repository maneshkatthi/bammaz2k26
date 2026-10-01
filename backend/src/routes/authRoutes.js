const router = require('express').Router();
const { signup, signin, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', authenticate, me);

module.exports = router;
