
/**
 * Centralized error handler.
 * Must be registered as the last middleware in Express.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error internally, never expose stack traces to the client
  console.error('[ERROR]', err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'Poster must be 2 MB or smaller' });
  }

  return res.status(500).json({ success: false, message: 'Internal server error' });
};

module.exports = errorHandler;
