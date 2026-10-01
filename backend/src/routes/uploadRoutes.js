const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { uploadPoster, handleUploadError } = require('../controllers/uploadController');

router.post('/poster', authenticate, requireRole('organizer'), ...uploadPoster, handleUploadError);

module.exports = router;
