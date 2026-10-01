const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/posters');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer config: disk storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG or WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// ---------------------------------------------------------------------------
// POST /api/uploads/poster  (organizer only)
// ---------------------------------------------------------------------------
const uploadPoster = [
  upload.single('poster'),
  (req, res, next) => {
    // multer file-type rejection lands here via err argument if we use a custom cb
    // If fileFilter called cb(err), multer passes it to next()
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Poster file is required' });
    }

    // Build the public URL for the uploaded file
    const host = `${req.protocol}://${req.get('host')}`;
    const posterUrl = `${host}/uploads/posters/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      message: 'Poster uploaded successfully',
      posterUrl,
    });
  },
];

// Multer "wrong file type" error middleware (called when fileFilter rejects)
const handleUploadError = (err, req, res, next) => {
  if (err && err.message === 'Only JPEG, PNG or WebP images are allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
};

module.exports = { uploadPoster, handleUploadError };
